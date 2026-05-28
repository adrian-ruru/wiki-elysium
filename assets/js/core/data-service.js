const cache = new Map();

export async function loadJson(path) {
  if (cache.has(path)) {
    return cache.get(path);
  }

  const request = fetch(path).then(async (response) => {
    if (!response.ok) {
      throw new Error(`No se pudo cargar ${path} (${response.status})`);
    }

    return response.json();
  });

  cache.set(path, request);
  return request;
}

export function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function joinList(values, fallback = "Por definir") {
  if (!Array.isArray(values) || values.length === 0) {
    return fallback;
  }

  return values.join(", ");
}
