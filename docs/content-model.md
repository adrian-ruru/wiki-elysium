# Modelo de contenido

Este proyecto separa interfaz y reglas. Las paginas leen JSON desde `data/` y renderizan el contenido sin tocar el HTML.

## Clases

Cada clase vive en `data/classes/<id>/` con dos archivos:

- `class.json`: identidad de la clase, dado de golpe, atributos, competencias, progresion, rasgos y `subclassIds`.
- `subclasses.json`: lista de subclases disponibles para esa clase.

Campos importantes de un rasgo:

```json
{
  "id": "feature-id",
  "name": "Nombre del rasgo",
  "level": 1,
  "category": "classFeature",
  "summary": "Resumen corto",
  "mechanics": [
    { "label": "Accion", "value": "Accion adicional" },
    { "label": "Recurso", "value": "Competencia por descanso largo" }
  ],
  "entries": [
    { "type": "paragraph", "text": "Texto del rasgo." },
    { "type": "list", "items": ["Opcion A", "Opcion B"] }
  ]
}
```

`subclassIds` debe coincidir con los `id` de `subclasses.json`. Al seleccionar otra clase, la pagina reinicia las subclases activas y renderiza solo la nueva clase.

## Especies

Las especies se cargan desde:

- `data/species/index.json`: listado ligero para el selector.
- `data/species/species.json`: contenido completo.

Cada especie puede tener `traits` y `variants`. Las variantes sirven para subespecies, linajes, ascendencias o elecciones equivalentes.

## Catalogos

Hechizos, dotes, objetos, trasfondos y reglas comparten este patron:

```json
{
  "schemaVersion": 1,
  "system": "D&D 5e 2024",
  "title": "Hechizos",
  "description": "Descripcion del catalogo",
  "entries": []
}
```

Cada entrada puede usar `mechanics` y `entries` como las clases. Si una seccion necesita filtros avanzados mas adelante, anade campos especificos al JSON y extiende `assets/js/pages/catalog.js`.

## Nota de contenido

Los JSON actuales son plantillas. Estan pensados para que Elysium agregue sus textos aprobados, reglas caseras y referencias internas sin copiar material oficial completo directamente en la maqueta.
