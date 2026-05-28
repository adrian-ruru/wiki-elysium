import { joinList } from "./data-service.js";

export function clearNode(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

export function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);

  if (options.className) node.className = options.className;
  if (options.text !== undefined) node.textContent = options.text;
  if (options.html !== undefined) node.innerHTML = options.html;
  if (options.attrs) {
    Object.entries(options.attrs).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        node.setAttribute(key, value);
      }
    });
  }

  children.filter(Boolean).forEach((child) => {
    node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
  });

  return node;
}

export function renderEmpty(message) {
  return el("div", { className: "empty-state", text: message });
}

export function renderError(message) {
  return el("div", { className: "error-state", text: message });
}

export function renderMeta(items) {
  return el(
    "div",
    { className: "meta-grid" },
    items.map((item) =>
      el("div", { className: "meta-item" }, [
        el("span", { text: item.label }),
        el("strong", { text: item.value || "Por definir" }),
      ]),
    ),
  );
}

export function renderMechanics(items = []) {
  if (!items.length) return null;

  return el(
    "div",
    { className: "mechanic-grid" },
    items.map((item) =>
      el("div", { className: "mechanic" }, [
        el("span", { text: item.label }),
        el("strong", { text: item.value }),
      ]),
    ),
  );
}

export function renderEntries(entries = []) {
  if (!entries.length) {
    return [el("p", { text: "Pendiente de redactar." })];
  }

  return entries.map((entry) => {
    if (typeof entry === "string") {
      return el("p", { text: entry });
    }

    if (entry.type === "list") {
      return el(
        "ul",
        {},
        (entry.items || []).map((item) => el("li", { text: item })),
      );
    }

    if (entry.type === "note") {
      return el("p", { className: "empty-state", text: entry.text });
    }

    return el("p", { text: entry.text || "Pendiente de redactar." });
  });
}

export function renderFeature(feature) {
  return el("article", { className: "feature-card" }, [
    el("header", {}, [
      el("div", {}, [
        el("h4", { text: feature.name }),
        feature.summary ? el("p", { text: feature.summary }) : null,
      ]),
      el("span", {
        className: "level-pill",
        text: getFeatureBadge(feature),
      }),
    ]),
    el("div", { className: "feature-body" }, [
      renderMechanics(feature.mechanics),
      ...renderEntries(feature.entries),
    ]),
  ]);
}

function getFeatureBadge(feature) {
  if (feature.level) {
    return `Nivel ${feature.level}`;
  }

  const labels = {
    classFeature: "Rasgo de clase",
    subclassFeature: "Rasgo de subclase",
    speciesTrait: "Rasgo",
    speciesVariant: "Variante",
  };

  return labels[feature.category] || feature.category || "Rasgo";
}

export function renderFeatureSection(title, features, emptyMessage) {
  const section = el("section", { className: "rules-section" }, [el("h3", { text: title })]);

  if (!features || features.length === 0) {
    section.appendChild(renderEmpty(emptyMessage));
    return section;
  }

  section.appendChild(el("div", { className: "feature-stack" }, features.map(renderFeature)));
  return section;
}

export function renderProgressionTable(progression = []) {
  if (!progression.length) {
    return renderEmpty("La tabla de progresion se completara cuando se vuelquen los niveles de la clase.");
  }

  const table = el("table", { className: "progression-table" }, [
    el("thead", {}, [
      el("tr", {}, [
        el("th", { text: "Nivel" }),
        el("th", { text: "Bonif." }),
        el("th", { text: "Rasgos" }),
      ]),
    ]),
  ]);

  const body = el(
    "tbody",
    {},
    progression.map((row) =>
      el("tr", {}, [
        el("td", { text: row.level }),
        el("td", { text: row.proficiencyBonus ? `+${row.proficiencyBonus}` : "-" }),
        el("td", { text: joinList(row.features) }),
      ]),
    ),
  );

  table.appendChild(body);
  return table;
}
