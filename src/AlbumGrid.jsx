import { IconPlay } from './player/icons';

function tituloAlbum(proyecto) {
  return proyecto.album || proyecto.sencillo || proyecto.titulo;
}

export function AlbumGrid({ catalogo, onSelect, onPlayAlbum }) {
  return (
    <section className="album-grid" aria-label="Álbumes">
      {catalogo.map((proyecto) => (
        <div key={proyecto.slug} className="album-card">
          <div className="album-card-cover">
            <img src={proyecto.portada} alt={`Portada de ${proyecto.titulo}`} />
            <button
              className="album-card-play"
              type="button"
              aria-label={`Reproducir ${proyecto.titulo}`}
              onClick={() => onPlayAlbum(proyecto.slug)}
            >
              <IconPlay />
            </button>
          </div>
          <button className="album-card-select" type="button" onClick={() => onSelect(proyecto.slug)}>
            <p className="album-card-titulo">{tituloAlbum(proyecto)}</p>
            <p className="album-card-sub">{proyecto.titulo}</p>
          </button>
        </div>
      ))}
    </section>
  );
}
