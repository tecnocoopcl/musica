# música

Reproductor de música de tecnocoop. A diferencia de un agregador centralizado,
la música no vive en este repo: cada cuenta la publica en su propio
[Solid Pod](https://solidproject.org/), y esta app solo la lee. El artista
mantiene el control de su música y decide qué compartir y cómo.

- `/` es la portada: buscador, artistas de la cooperativa, álbumes y tus
  playlists.
- `/artista/<slug>` (por ejemplo `/artista/male`, `/artista/siniestra`) es la
  página de un artista.
- `/biblioteca` y `/playlist/<id>`: lo de quien escucha (ver abajo).

Se navega sin recargar la página (`src/ruta.jsx`), así la música no se corta.

## Biblioteca de quien escucha

Playlists y artistas favoritos. Sin sesión se guardan en el navegador. Con
**Conectar con WebID** (login Solid con `@inrupt/solid-client-authn-browser`,
como por-hacer) se guardan en el pod de quien escucha:

```
<pod>/Aplicaciones/musica/biblioteca.json
```

```json
{
  "playlists": [
    {
      "id": "b5c09774",
      "name": "Para el viaje",
      "tracks": [{ "url": "https://…/naguara.mp3", "title": "naguará", "artist": "male" }]
    }
  ],
  "favoriteArtists": ["male"],
  "updated": "2026-10-02T12:00:00.000Z"
}
```

Al conectar, si el pod ya tiene `biblioteca.json` se usa ese; si no, se sube
lo que había en el navegador. Las escrituras son condicionales (ETag): si otro
dispositivo escribió antes, gana el pod y la barra lateral lo avisa. El archivo
hereda los permisos de la carpeta en el pod; la app no publica nada.

## De dónde sale el catálogo

```
pod de la cuenta                           tecno-cooperativa-backend           esta app
<pod>/Aplicaciones/estudio/data/catalogo.json  →   GET /musica/artists             →   /
                        audios/, portadas/  GET /musica/artists/{slug}      →   /artista/<slug>
```

- **Pod**: en `<pod>/Aplicaciones/estudio/data/` van
  `catalogo.json`, los audios y las portadas, con lectura pública (`.acl`).
  Las rutas dentro de `catalogo.json` son relativas a ese archivo. Lo escribe
  la app **Estudio** de espacio.
- **Backend**: `musica.json` lista las cuentas músicas. Estudio las da de alta
  (`POST /musica/musicos`); también se puede editar a mano, como `kwh.json`.
  El backend lee cada `catalogo.json` como anónimo, resuelve las rutas y
  sirve los artistas agregados.
- **Esta app**: pide el catálogo al backend (`src/config/api.js`). Si el
  backend no responde, muestra un mensaje de error.

Formato de `catalogo.json` (keys en inglés, datos en el idioma del artista):

```json
{
  "account": "usuario-aebn",
  "artists": [
    {
      "slug": "male",
      "name": "male",
      "albums": [
        {
          "slug": "naguara",
          "title": "naguará",
          "type": "single",
          "genre": "Folklore",
          "year": 2025,
          "description": "Canciones con guitarra de palo.",
          "style": "acoustic",
          "cover": "portadas/male-cover.jpg",
          "streaming": [{ "name": "YouTube", "url": "https://…" }],
          "tracks": [
            {
              "slug": "naguara",
              "title": "naguará",
              "files": [{ "format": "mp3", "label": "MP3", "url": "audios/naguara.mp3" }]
            }
          ]
        }
      ]
    }
  ]
}
```

`type` es `single` o `album`; `style` (`acoustic`, `ambient`) define los
colores del disco. Opcionales por track: `video` y `premiere`.

## Stack

Vite + React (JS plano, sin TypeScript), siguiendo el mismo patrón que
`por-hacer`, `hecho` y `escala-notas`.

## Desarrollo

```bash
npm install
npm run dev
```

En desarrollo la app usa el backend local (`.env.development`,
`http://localhost:8080`). Para levantarlo, desde `tecno-cooperativa-backend`:

```bash
ALLOWED_ORIGINS=http://localhost:5173 go run .
```

## Agregar una cuenta

Desde espacio: abrir **Estudio** y apretar "Activar estudio". Eso deja
`<pod>/Aplicaciones/estudio/data/` con lectura pública y pide el alta a la API; cada
guardado en Estudio se publica al momento.

A mano (cuentas anteriores a Estudio): subir `catalogo.json`, audios y
portadas al pod con lectura pública, y agregar
`{ "account": "…", "pod": "https://…/", "catalogo": "apps/musica/data/catalogo.json" }`
a `musica.json` en el backend. Se toma en el siguiente refresco (cada hora) o
al reiniciar.

## Deploy

GitHub Actions construye y publica en GitHub Pages automáticamente en cada
push a `main` (ver `.github/workflows/deploy.yml`). El build se copia también
como `404.html` para que `/artista/<slug>` cargue la app.
