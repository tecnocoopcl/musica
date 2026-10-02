import { useMusica } from '../contexto';
import { Disco } from '../Disco';
import { IconHeart, IconPlay } from '../player/icons';

export function Artista({ artista, proyectos, onVideo }) {
  const { player, biblioteca } = useMusica();
  const srcs = proyectos.flatMap((p) => p.canciones.map((c) => c.archivos[0].url));
  const favorito = biblioteca.esFavorito(artista.slug);

  return (
    <>
      <header className="cabecera">
        <div className="cabecera-portada cabecera-portada--redonda">
          {artista.portada && <img src={artista.portada} alt="" />}
        </div>
        <div className="cabecera-info">
          <span className="disco-eyebrow">Artista</span>
          <h1>{artista.nombre}</h1>
          <div className="disco-acciones">
            {srcs.length > 0 && (
              <button
                type="button"
                className="disco-play"
                aria-label={`Reproducir todo de ${artista.nombre}`}
                onClick={() => player.playQueue(srcs)}
              >
                <IconPlay />
              </button>
            )}
            <button
              type="button"
              className={`escucha-en-directo boton-favorito${favorito ? ' is-active' : ''}`}
              aria-pressed={favorito}
              onClick={() => biblioteca.alternarFavorito(artista.slug)}
            >
              <IconHeart filled={favorito} />
              {favorito ? 'En tus favoritos' : 'Agregar a favoritos'}
            </button>
          </div>
        </div>
      </header>

      {proyectos.map((proyecto) => (
        <Disco key={proyecto.slug} proyecto={proyecto} player={player} onVideo={onVideo} enlazarArtista={false} />
      ))}
    </>
  );
}
