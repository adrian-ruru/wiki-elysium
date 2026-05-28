import { loadJson, normalizeText, joinList } from "../core/data-service.js";
import {
  clearNode,
  el,
  renderEmpty,
  renderError,
  renderFeatureSection,
  renderMeta,
  renderProgressionTable,
} from "../core/renderer.js";

const DATA_ROOT = "../data/classes";
const listNode = document.querySelector("#class-list");
const searchNode = document.querySelector("#class-search");
const contentNode = document.querySelector("#class-content");

let classIndex = [];
let activeClassId = "";
let activeSubclasses = new Set();

init();

async function init() {
  contentNode.appendChild(renderEmpty("Cargando clases..."));

  try {
    const index = await loadJson(`${DATA_ROOT}/index.json`);
    classIndex = index.classes || [];
    activeClassId = getInitialClassId();
    renderClassList();
    await selectClass(activeClassId || classIndex[0]?.id);
  } catch (error) {
    clearNode(contentNode);
    contentNode.appendChild(renderError(error.message));
  }

  searchNode.addEventListener("input", renderClassList);
  window.addEventListener("hashchange", async () => {
    const id = getInitialClassId();
    if (id && id !== activeClassId) {
      await selectClass(id, false);
    }
  });
}

function getInitialClassId() {
  return window.location.hash.replace("#", "");
}

function renderClassList() {
  const query = normalizeText(searchNode.value);
  clearNode(listNode);

  classIndex
    .filter((item) => {
      const haystack = normalizeText(`${item.name} ${item.role} ${item.summary}`);
      return !query || haystack.includes(query);
    })
    .forEach((item) => {
      const button = el("button", {
        className: `selector-item${item.id === activeClassId ? " is-active" : ""}`,
        attrs: { type: "button" },
      }, [
        el("strong", { text: item.name }),
        el("small", { text: item.summary }),
      ]);

      button.addEventListener("click", () => selectClass(item.id));
      listNode.appendChild(button);
    });
}

async function selectClass(id, updateHash = true) {
  const indexEntry = classIndex.find((item) => item.id === id);
  if (!indexEntry) return;

  activeClassId = id;
  activeSubclasses = new Set();
  renderClassList();
  clearNode(contentNode);
  contentNode.appendChild(renderEmpty(`Cargando ${indexEntry.name}...`));

  if (updateHash) {
    history.replaceState(null, "", `#${id}`);
  }

  try {
    const [classData, subclassesData] = await Promise.all([
      loadJson(`${DATA_ROOT}/${indexEntry.folder}/class.json`),
      loadJson(`${DATA_ROOT}/${indexEntry.folder}/subclasses.json`),
    ]);

    renderClassContent(classData, subclassesData.subclasses || []);
  } catch (error) {
    clearNode(contentNode);
    contentNode.appendChild(renderError(error.message));
  }
}

function renderClassContent(classData, subclasses) {
  clearNode(contentNode);

  const header = el("header", { className: "entity-header" }, [
    el("div", {}, [
      el("p", { className: "eyebrow", text: classData.source?.system || "D&D 5e 2024" }),
      el("h2", { text: classData.name }),
      el("p", { text: classData.description }),
    ]),
    renderMeta([
      { label: "Dado de golpe", value: classData.hitDie },
      { label: "Atributos", value: joinList(classData.primaryAbilities) },
      { label: "Tiradas", value: joinList(classData.savingThrows) },
      { label: "Subclase", value: classData.subclassSelectionLevel ? `Nivel ${classData.subclassSelectionLevel}` : "Por definir" },
    ]),
  ]);

  const stack = el("div", { className: "content-stack" }, [
    renderFeatureSection("Rasgos de clase", classData.features, "No hay rasgos de clase cargados todavia."),
    renderSubclassControls(subclasses),
    renderProgressionSection(classData.progression),
  ]);

  contentNode.append(header, stack);
}

function renderProgressionSection(progression) {
  return el("section", { className: "rules-section" }, [
    el("h3", { text: "Progresion" }),
    renderProgressionTable(progression),
  ]);
}

function renderSubclassControls(subclasses) {
  const section = el("section", { className: "rules-section" }, [el("h3", { text: "Subclases" })]);

  if (!subclasses.length) {
    section.appendChild(renderEmpty("No hay subclases asociadas todavia."));
    return section;
  }

  const toggleRow = el("div", { className: "toggle-row" });
  const output = el("div", { className: "feature-stack", attrs: { id: "subclass-output" } });

  subclasses.forEach((subclass) => {
    const button = el("button", {
      className: "chip",
      text: subclass.name,
      attrs: { type: "button", "aria-pressed": "false" },
    });

    button.addEventListener("click", () => {
      if (activeSubclasses.has(subclass.id)) {
        activeSubclasses.delete(subclass.id);
      } else {
        activeSubclasses.add(subclass.id);
      }

      button.classList.toggle("is-active", activeSubclasses.has(subclass.id));
      button.setAttribute("aria-pressed", String(activeSubclasses.has(subclass.id)));
      renderSelectedSubclasses(subclasses, output);
    });

    toggleRow.appendChild(button);
  });

  output.appendChild(renderEmpty("Activa una o varias subclases para mostrar sus rasgos."));
  section.append(toggleRow, output);
  return section;
}

function renderSelectedSubclasses(subclasses, output) {
  clearNode(output);
  const selected = subclasses.filter((subclass) => activeSubclasses.has(subclass.id));

  if (!selected.length) {
    output.appendChild(renderEmpty("Activa una o varias subclases para mostrar sus rasgos."));
    return;
  }

  selected.forEach((subclass) => {
    output.appendChild(renderFeatureSection(subclass.name, subclass.features, "No hay rasgos de subclase cargados todavia."));
  });
}
