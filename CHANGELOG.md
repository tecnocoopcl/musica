# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Unreleased]

## [0.5.1] — 2026-10-06

### Fixed

- Con la sesión propia (fuera de espacio), leer y guardar la biblioteca
  fallaba con «Can only call Window.fetch on instances of Window»:
  `getPodUrlAll` de solid-client 1.23 pide el perfil con el `fetch` de
  cross-fetch, que en el navegador es `window.fetch` sin enlazar. Ahora el
  perfil se lee con el `fetch` de la sesión y se le pasa ya leído.

## [0.5.0] — 2026-10-06

### Changed

- La biblioteca pasa de `apps/musica/biblioteca.json` a
  `Aplicaciones/musica/biblioteca.json`, la convención de carpetas de
  espacio. Suelta, la app la copia la primera vez antes de leerla (así no la
  pisa lo guardado en el navegador); dentro de espacio la copia el
  escritorio. La carpeta vieja no se borra.
- El catálogo de Estudio ahora vive en `Aplicaciones/estudio/data/`; el
  backend lo busca ahí y, si no, en la ruta vieja.

## [0.4.0] — 2026-10-03

### Added

- **Integración con espacio**: abierta dentro del escritorio de la
  cooperativa, la app usa la SDK de espacio (vendorizada en
  `src/vendor/espacio-sdk/`, como en por-hacer). La biblioteca se guarda en
  el pod del socio con la sesión de espacio, sin login propio, en la misma
  ruta (`<pod>/apps/musica/biblioteca.json`). Suelta, en musica.aebn.cl, todo
  sigue igual.

### Changed

- Dentro de espacio no aparecen «Conectar» ni «Desconectar»: la sesión la
  gestiona el escritorio, y si cambia allí la app se recarga.
- Borrar una playlist pide confirmación con el diálogo de espacio cuando está
  embebida: `window.confirm` no funciona en su iframe.

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

