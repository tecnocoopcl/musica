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

## El catálogo: `catalogo.jsonld`

Cada artista publica en su pod `musica/publico/catalogo.jsonld`, con
vocabulario [schema.org](https://schema.org) (`MusicAlbum`, `MusicRecording`,
`Offer`, `ListenAction`, `DonateAction`). Las rutas de audio y portadas son
relativas al propio archivo, así la carpeta es portable:

```
<pod>/musica/publico/        ← compartida con "enlace público" desde espacio
  catalogo.jsonld
  audios/…
  portadas/…
```

Nadie lo escribe a mano: lo arma el **Estudio** (`estudio.html`), el panel
del músico que se abre dentro de espacio. Ahí se crean lanzamientos, se suben
portadas y canciones, y se publica. `src/catalogo/formato.js` traduce entre
ese JSON-LD y la forma que usa la interfaz.

Quién es músico lo decide la cooperativa en `musicos.json` de
`tecno-cooperativa-backend`, que además guarda la copia del catálogo que lee
Escuchar.

## Agregar un artista

Mientras no existe el directorio de la cooperativa, se agrega una entrada en
`src/config/artistas.js` con la URL de su `catalogo.jsonld`.

## Pruebas

```bash
npm test
```

## Deploy

GitHub Actions construye y publica en GitHub Pages automáticamente en cada
push a `main` (ver `.github/workflows/deploy.yml`).
