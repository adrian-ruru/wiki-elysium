import { loadJson, normalizeText, joinList } from "../core/data-service.js";
import {
  clearNode,
  el,
  renderEmpty,
  renderError,
  renderFeatureSection,
  renderMeta,
} from "../core/renderer.js";

const DATA_ROOT = "../data/species";
const listNode = document.querySelector("#species-list");
const searchNode = document.querySelector("#species-search");
const contentNode = document.querySelector("#species-content");

let speciesIndex = [];
let speciesData = [];
let activeSpeciesId = "";
let activeVariants = new Set();

init();

async function init() {
  contentNode.appendChild(renderEmpty("Cargando especies..."));

  try {
    const index = await loadJson(`${DATA_ROOT}/index.json`);
    const payload = await loadJson(`${DATA_ROOT}/${index.speciesFile}`);
    speciesIndex = index.species || [];
    speciesData = payload.species || [];
    activeSpeciesId = getInitialSpeciesId();
    renderSpeciesList();
    selectSpecies(activeSpeciesId || speciesIndex[0]?.id);
  } catch (error) {
    clearNode(contentNode);
    contentNode.appendChild(renderError(error.message));
  }

  searchNode.addEventListener("input", renderSpeciesList);
  window.addEventListener("hashchange", () => {
    const id = getInitialSpeciesId();
    if (id && id !== activeSpeciesId) {
      selectSpecies(id, false);
    }
  });
}

function getInitialSpeciesId() {
  return window.location.hash.replace("#", "");
}

function renderSpeciesList() {
  const query = normalizeText(searchNode.value);
  clearNode(listNode);

  speciesIndex
    .filter((item) => {
      const haystack = normalizeText(`${item.name} ${item.summary}`);
      return !query || haystack.includes(query);
    })
    .forEach((item) => {
      const button = el("button", {
        className: `selector-item${item.id === activeSpeciesId ? " is-active" : ""}`,
        attrs: { type: "button" },
      }, [
        el("strong", { text: item.name }),
        el("small", { text: item.summary }),
      ]);

      button.addEventListener("click", () => selectSpecies(item.id));
      listNode.appendChild(button);
    });
}

function selectSpecies(id, updateHash = true) {
  const species = speciesData.find((item) => item.id === id);
  if (!species) return;

  activeSpeciesId = id;
  activeVariants = new Set();
  renderSpeciesList();
  renderSpeciesContent(species);

  if (updateHash) {
    history.replaceState(null, "", `#${id}`);
  }
}

function renderSpeciesContent(species) {
  clearNode(contentNode);

  const header = el("header", { className: "entity-header" }, [
    el("div", {}, [
      el("p", { className: "eyebrow", text: species.source?.system || "D&D 5e 2024" }),
      el("h2", { text: species.name }),
      el("p", { text: species.description }),
    ]),
    renderMeta([
      { label: "Tamano", value: joinList(species.size) },
      { label: "Velocidad", value: species.speed ? `${species.speed.walk} pies` : "Por definir" },
      { label: "Tipo", value: species.creatureType || "Humanoide" },
      { label: "Variantes", value: species.variants?.length ? `${species.variants.length}` : "Sin variantes" },
    ]),
  ]);

  const stack = el("div", { className: "content-stack" }, [
    renderFeatureSection("Rasgos de especie", species.traits, "No hay rasgos de especie cargados todavia."),
    renderVariantControls(species.variants || []),
  ]);

  contentNode.append(header, stack);
}

function renderVariantControls(variants) {
  const section = el("section", { className: "rules-section" }, [el("h3", { text: "Subespecies y variantes" })]);

  if (!variants.length) {
    section.appendChild(renderEmpty("Esta especie no tiene subespecies o variantes configuradas."));
    return section;
  }

  const toggleRow = el("div", { className: "toggle-row" });
  const output = el("div", { className: "feature-stack" });

  variants.forEach((variant) => {
    const button = el("button", {
      className: "chip",
      text: variant.name,
      attrs: { type: "button", "aria-pressed": "false" },
    });

    button.addEventListener("click", () => {
      if (activeVariants.has(variant.id)) {
        activeVariants.delete(variant.id);
      } else {
        activeVariants.add(variant.id);
      }

      button.classList.toggle("is-active", activeVariants.has(variant.id));
      button.setAttribute("aria-pressed", String(activeVariants.has(variant.id)));
      renderSelectedVariants(variants, output);
    });

    toggleRow.appendChild(button);
  });

  output.appendChild(renderEmpty("Activa una variante para mostrar sus rasgos especificos."));
  section.append(toggleRow, output);
  return section;
}

function renderSelectedVariants(variants, output) {
  clearNode(output);
  const selected = variants.filter((variant) => activeVariants.has(variant.id));

  if (!selected.length) {
    output.appendChild(renderEmpty("Activa una variante para mostrar sus rasgos especificos."));
    return;
  }

  selected.forEach((variant) => {
    output.appendChild(renderFeatureSection(variant.name, variant.traits, "No hay rasgos de variante cargados todavia."));
  });
}
