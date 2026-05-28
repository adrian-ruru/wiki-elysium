# Wiki Elysium

Wiki estatica para organizar las reglas del servidor de rol Elysium usando D&D 5e 2024 como base.

El proyecto esta preparado para GitHub Pages: `index.html` vive en la raiz y todas las rutas internas son relativas.

## Estructura

```text
.
├── index.html
├── pages/
│   ├── classes.html
│   ├── species.html
│   ├── spells.html
│   ├── feats.html
│   ├── items.html
│   ├── backgrounds.html
│   └── rules.html
├── assets/
│   ├── css/
│   ├── img/
│   └── js/
├── data/
│   ├── classes/
│   ├── species/
│   ├── spells/
│   ├── feats/
│   ├── items/
│   ├── backgrounds/
│   └── rules/
└── docs/
```

## Contenido

- `data/classes/<clase>/class.json`: datos principales, rasgos, progresion e IDs de subclases.
- `data/classes/<clase>/subclasses.json`: subclases asociadas y sus rasgos activables.
- `data/species/species.json`: especies, rasgos base y variantes o subespecies.
- `data/spells`, `data/feats`, `data/items`, `data/backgrounds` y `data/rules`: catalogos preparados para crecer.

Consulta [docs/content-model.md](docs/content-model.md) para ver el contrato de datos.

## Desarrollo local

Como las paginas cargan JSON con `fetch`, usa un servidor local en vez de abrir los HTML directamente:

```bash
python -m http.server 8000
```

Luego abre `http://localhost:8000`.

## Despliegue en GitHub Pages

1. Sube el repositorio a GitHub.
2. En `Settings > Pages`, elige la rama y la carpeta raiz.
3. GitHub Pages servira `index.html` como entrada principal.

El archivo `.nojekyll` evita que GitHub Pages ignore carpetas o archivos que empiecen por guion bajo si se agregan en el futuro.
