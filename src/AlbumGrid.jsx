import { IconPlay } from './player/icons';

function tituloAlbum(proyecto) {
  return proyecto.album || proyecto.sencillo || proyecto.titulo;
}

export function AlbumGrid({ catalogo, onSelect, onPlayAlbum }) {
  return (
    <section className="album-grid" aria-label="Álbumes">
      {catalogo.map((proyecto) => (
        <button
          key={proyecto.slug}
          className="album-card"
          type="button"
          onClick={() => onSelect(proyecto.slug)}
        >
          <div className="album-card-cover">
            <img src={proyecto.portada} alt={`Portada de ${proyecto.titulo}`} />
            <span
              className="album-card-play"
              role="button"
              tabIndex={-1}
              aria-label={`Reproducir ${proyecto.titulo}`}
              onClick={(e) => {
                e.stopPropagation();
                onPlayAlbum(proyecto.slug);
              }}
            >
              <IconPlay />
            </span>
          </div>
          <p className="album-card-titulo">{tituloAlbum(proyecto)}</p>
          <p className="album-card-sub">{proyecto.titulo}</p>
        </button>
      ))}
    </section>
  );
}
