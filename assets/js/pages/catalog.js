import { loadJson, joinList } from "../core/data-service.js";
import {
  clearNode,
  el,
  renderEmpty,
  renderError,
  renderFeature,
  renderMeta,
} from "../core/renderer.js";

const contentNode = document.querySelector("#catalog-content");
const catalogPath = document.body.dataset.catalog;

init();

async function init() {
  contentNode.appendChild(renderEmpty("Cargando contenido..."));

  try {
    const catalog = await loadJson(catalogPath);
    renderCatalog(catalog);
  } catch (error) {
    clearNode(contentNode);
    contentNode.appendChild(renderError(error.message));
  }
}

function renderCatalog(catalog) {
  clearNode(contentNode);

  contentNode.appendChild(el("header", { className: "entity-header" }, [
    el("div", {}, [
      el("p", { className: "eyebrow", text: catalog.system || "D&D 5e 2024" }),
      el("h2", { text: catalog.title }),
      el("p", { text: catalog.description }),
    ]),
    renderMeta([
      { label: "Categoria", value: catalog.category || "Compendio" },
      { label: "Entradas", value: String((catalog.entries || []).length) },
      { label: "Estado", value: catalog.status || "Base preparada" },
      { label: "Fuente", value: joinList(catalog.sources) },
    ]),
  ]));

  const stack = el("div", { className: "content-stack" });
  const entries = catalog.entries || [];

  if (!entries.length) {
    stack.appendChild(renderEmpty("Todavia no hay entradas. Puedes empezar anadiendo objetos al array entries de este JSON."));
  } else {
    stack.appendChild(el("section", { className: "rules-section" }, [
      el("h3", { text: "Entradas" }),
      el("div", { className: "catalog-grid" }, entries.map((entry) => renderFeature(toFeature(entry)))),
    ]));
  }

  contentNode.appendChild(stack);
}

function toFeature(entry) {
  return {
    name: entry.name,
    level: entry.level,
    category: entry.type || entry.category,
    summary: entry.summary,
    mechanics: entry.mechanics || buildMechanics(entry),
    entries: entry.entries,
  };
}

function buildMechanics(entry) {
  return [
    entry.school ? { label: "Escuela", value: entry.school } : null,
    entry.rarity ? { label: "Rareza", value: entry.rarity } : null,
    entry.prerequisite ? { label: "Requisito", value: entry.prerequisite } : null,
    entry.action ? { label: "Accion", value: entry.action } : null,
  ].filter(Boolean);
}
