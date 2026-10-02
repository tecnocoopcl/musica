// biblioteca.json en el pod usa keys en inglés, como catalogo.json; la
// interfaz trabaja en castellano. Aquí se traduce en ambos sentidos.
//
// {
//   "playlists": [
//     { "id": "…", "name": "Para el viaje",
//       "tracks": [{ "url": "https://…/naguara.mp3", "title": "naguará", "artist": "male" }] }
//   ],
//   "favoriteArtists": ["male", "siniestra"],
//   "updated": "2026-10-02T12:00:00.000Z"
// }
//
// Cada canción guarda título y artista además de la URL del audio, para que
// la playlist se pueda leer aunque el catálogo cambie.

export const BIBLIOTECA_VACIA = { playlists: [], artistasFavoritos: [] };

export function desdePod(doc) {
  return {
    playlists: (doc?.playlists || []).map((p) => ({
      id: p.id,
      nombre: p.name || 'Sin nombre',
      canciones: (p.tracks || []).map((t) => ({ src: t.url, titulo: t.title, artista: t.artist })),
    })),
    artistasFavoritos: doc?.favoriteArtists || [],
  };
}

export function haciaPod(biblioteca) {
  return {
    playlists: biblioteca.playlists.map((p) => ({
      id: p.id,
      name: p.nombre,
      tracks: p.canciones.map((c) => ({ url: c.src, title: c.titulo, artist: c.artista })),
    })),
    favoriteArtists: biblioteca.artistasFavoritos,
    updated: new Date().toISOString(),
  };
}

export function estaVacia(biblioteca) {
  return biblioteca.playlists.length === 0 && biblioteca.artistasFavoritos.length === 0;
}
