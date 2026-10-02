import { useMusica } from './contexto';
import { Link } from './ruta';
import { formatTime } from './player/format';
import { IconPlay, IconPause } from './player/icons';

// Lista de canciones sueltas, de distintos discos: una playlist o los
// resultados de una búsqueda. Usa el mismo tracklist que Disco, con portada y
// artista en cada fila.
//
// canciones: [{ src, titulo, artista }]; `accion(cancion)` dibuja el botón de
// la derecha (quitar de la playlist, agregar a una).
export function ListaCanciones({ canciones, onPlay, accion }) {
  const { player, tracksPorSrc } = useMusica();

  return (
    <ul className="tracklist tracklist--suelta">
      {canciones.map((cancion, i) => {
        const track = tracksPorSrc.get(cancion.src);
        const isActive = player.currentTrack?.src === cancion.src;
        const isPlayingThis = isActive && player.isPlaying;
        return (
          <li
            key={cancion.src}
            className={`track${isActive ? ' active' : ''}${track ? '' : ' track--no-disponible'}`}
            aria-current={isActive ? 'true' : undefined}
          >
            <span className="track-indicator">
              {track?.portada ? (
                <img className="track-portada" src={track.portada} alt="" loading="lazy" />
              ) : (
                <span className="track-num" aria-hidden="true">
                  {i + 1}
                </span>
              )}
              {track && (
                <button
                  type="button"
                  className={`track-play${isPlayingThis ? ' is-playing' : ''}`}
                  aria-label={`${isPlayingThis ? 'Pausar' : 'Reproducir'} ${cancion.titulo}`}
                  aria-pressed={isPlayingThis}
                  onClick={() => (isActive ? player.toggle() : onPlay(i))}
                >
                  <IconPlay className="icon-play" />
                  <IconPause className="icon-pause" />
                </button>
              )}
            </span>
            <span className="track-titulo">
              {cancion.titulo}
              <span className="track-artista">
                {track ? <Link href={`/artista/${track.artistaSlug}`}>{cancion.artista}</Link> : cancion.artista}
                {!track && ' • ya no está publicada'}
              </span>
            </span>
            <span className="track-actions">{accion?.(cancion)}</span>
            <span className="track-duracion">{track ? formatTime(player.durations[cancion.src]) : ''}</span>
          </li>
        );
      })}
    </ul>
  );
}
