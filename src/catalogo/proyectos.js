// El backend entrega artistas → álbumes → tracks, con keys en inglés (el
// formato de catalogo.json en el pod). La interfaz trabaja con "proyectos",
// la forma que usan Disco, AlbumGrid y el reproductor: un proyecto por álbum.

const ESTILOS = { acoustic: 'acustico', ambient: 'ambiental' };

function cancion(track) {
  return {
    slug: track.slug,
    titulo: track.title,
    archivos: (track.files || []).map((f) => ({ formato: f.format, etiqueta: f.label, url: f.url })),
    ...(track.video && { video: track.video }),
    ...(track.premiere && { estreno: true }),
  };
}

function proyecto(artista, album) {
  return {
    // Único en la página: dos artistas pueden tener álbumes con el mismo slug.
    slug: `${artista.slug}-${album.slug}`,
    artistaSlug: artista.slug,
    titulo: artista.name,
    ...(album.type === 'album' && { album: album.title }),
    ...(album.type === 'single' && { sencillo: album.title }),
    genero: album.genre,
    anio: album.year,
    descripcion: album.description,
    tipo: ESTILOS[album.style] || album.style,
    portada: album.cover,
    streaming: (album.streaming || []).map((s) => ({ nombre: s.name, url: s.url })),
    canciones: (album.tracks || []).map(cancion).filter((c) => c.archivos.length > 0),
  };
}

export function aProyectos(artistas) {
  return artistas.flatMap((a) => (a.albums || []).map((al) => proyecto(a, al)));
}
