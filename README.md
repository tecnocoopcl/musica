# música

Reproductor de música de tecnocoop. A diferencia de un agregador centralizado,
el catálogo no vive en este repo: cada artista lo publica en su propio
[Solid Pod](https://solidproject.org/), y esta app solo lo lee. El artista
mantiene el control de su música y decide qué compartir y cómo.

## Stack

Vite + React (JS plano, sin TypeScript), siguiendo el mismo patrón que
`por-hacer`, `hecho` y `escala-notas`.

## Desarrollo

```bash
npm install
npm run dev
```

## Agregar un artista

Editar `src/config/artistas.js` y agregar una entrada con el nombre del
artista y la URL de su `catalogo.jsonld`. No requiere tocar el código de la
interfaz.

## Deploy

GitHub Actions construye y publica en GitHub Pages automáticamente en cada
push a `main` (ver `.github/workflows/deploy.yml`).
