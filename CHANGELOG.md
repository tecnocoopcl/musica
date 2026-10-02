# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Unreleased]

## [0.3.0] — 2026-10-02

### Added

- **Conectar con WebID**: login Solid para guardar playlists y artistas
  favoritos en el pod de quien escucha (`<pod>/apps/musica/biblioteca.json`).
  Sin sesión se guardan en el navegador. Acepta un WebID o la URL del
  proveedor.
- **Playlists**: crear, renombrar, borrar, agregar canciones desde cualquier
  disco o búsqueda, y reproducirlas como cola propia.
- **Artistas favoritos**, desde la página de cada artista.
- **Buscador** de canciones, álbumes y artistas.
- `/biblioteca` y `/playlist/<id>`.

### Changed

- Nuevo layout: barra lateral con la marca **Música** («Integrada con
  tecnocoop», enlazado a tecnocoop.aebn.cl), navegación y playlists; barra
  superior con buscador y cuenta. Reemplaza el header de AEBN.
- La portada muestra filas de artistas, álbumes y tus playlists, con filtro
  por género cuando el catálogo los trae.
- Navegación sin recargar la página: la música sigue sonando al cambiar de
  vista. El catálogo se pide una sola vez y la página de artista lo filtra.
- Los modales se montan en `<body>`.

## [0.2.0] — 2026-10-01

### Added

- `musica.aebn.cl` muestra el **catálogo completo de la cooperativa**. Ya no
  vive en este repo: lo arma `tecno-cooperativa-backend`
  (`GET /musica/artists`) a partir del `catalogo.json` que cada cuenta publica
  en su pod (`<pod>/apps/estudio/data/`). Si el backend no responde, la página
  lo dice en vez de quedar en blanco.
- **Página de cada artista** en `/artista/<slug>` (por ejemplo
  `/artista/male`), con enlace de vuelta al catálogo. En el catálogo, el nombre
  del artista en cada álbum lleva a su página.

### Changed

- El reproductor recuerda la última canción por su URL y no por su posición,
  así sobrevive al cambio entre el catálogo y la página de un artista.
- Los assets se sirven con rutas absolutas (`base: '/'`) y el deploy publica
  `404.html` para que GitHub Pages cargue la app en `/artista/<slug>`.

### Removed

- **Aportes y pagos** (aporte mensual/único, precios, links de Mercado Pago):
  el MVP es solo música. Se mantienen la descarga en zip, los videos y los
  enlaces para escuchar en otras plataformas.
- El catálogo local (`src/data/catalogo.js`) y los audios y portadas de
  `public/`: ahora están en el pod.

## [0.1.0]

### Added

- Reproductor de música portado de newale.github.io a React, con navegación
  mínima hacia aebn.cl y accesibilidad de teclado y lector de pantalla.

