import { useState } from 'react';
import { IconPlay, IconPause, IconVideo } from './player/icons';
import { formatTime } from './player/format';
import { descargarZip } from './zipDownload';

export function Disco({ proyecto, player, onDonar, onVideo }) {
  const [zipState, setZipState] = useState('idle'); // idle | preparando | error
  const tieneCanciones = proyecto.canciones.length > 0;

  async function handleZip() {
    const urls = proyecto.canciones.flatMap((c) => c.archivos.map((a) => a.url));
    if (urls.length === 0) return;
    setZipState('preparando');
    try {
      await descargarZip(urls, proyecto.album || proyecto.titulo);
      setZipState('idle');
    } catch {
      setZipState('error');
      setTimeout(() => setZipState('idle'), 2500);
    }
  }

  return (
    <article className="disco" id={proyecto.slug} data-tipo={proyecto.tipo}>
      <div className="disco-hero">
        <img className="disco-portada" src={proyecto.portada} alt={`Portada de ${proyecto.titulo}`} />
        <div className="disco-info">
          {proyecto.album ? (
            <>
              <span className="disco-eyebrow">
                Álbum{proyecto.anio ? ` · ${proyecto.anio}` : ''}
              </span>
              <h2>{proyecto.album}</h2>
              <p className="disco-artista">{proyecto.titulo}</p>
            </>
          ) : proyecto.sencillo ? (
            <>
              <span className="disco-eyebrow">
                Sencillo{proyecto.anio ? ` · ${proyecto.anio}` : ''}
              </span>
              <h2>{proyecto.sencillo}</h2>
              <p className="disco-artista">{proyecto.titulo}</p>
            </>
          ) : (
            <>
              <span className="disco-eyebrow">
                Proyecto{proyecto.anio ? ` · ${proyecto.anio}` : ''}
              </span>
              <h2>{proyecto.titulo}</h2>
            </>
          )}

          {proyecto.genero && <span className="disco-genero">{proyecto.genero}</span>}
          <p className="disco-descripcion">{proyecto.descripcion}</p>

          <div className="disco-acciones">
            {tieneCanciones && (
              <button
                className="disco-play"
                type="button"
                aria-label={`Reproducir ${proyecto.titulo}`}
                onClick={() => player.playAlbum(proyecto.slug)}
              >
                <IconPlay />
              </button>
            )}

            {(proyecto.streaming || []).map((s) => (
              <a
                key={s.nombre}
                className="escucha-en-directo pill-escucha"
                href={s.url}
                target="_blank"
                rel="noopener"
              >
                Escucha en {s.nombre}
              </a>
            ))}

            {tieneCanciones && (
              <button
                type="button"
                className="escucha-en-directo pill-escucha disco-descargar-zip"
                disabled={zipState === 'preparando'}
                onClick={handleZip}
              >
                {zipState === 'preparando'
                  ? 'Preparando…'
                  : zipState === 'error'
                    ? 'Error al preparar el zip'
                    : 'Descargar todo (.zip)'}
              </button>
            )}
          </div>

          {proyecto.apoyo && (
            <div className="disco-apoyo-linea">
              <span className="disco-apoyo-pregunta">¿Te gusta lo que escuchas?</span>
              {proyecto.apoyo.mensual ? (
                <a className="escucha-en-directo pill-apoyo" href={proyecto.apoyo.mensual} target="_blank" rel="noopener">
                  Aporte mensual
                </a>
              ) : (
                <span className="escucha-en-directo pill-apoyo escucha-en-directo--pronto" aria-disabled="true">
                  Aporte mensual
                </span>
              )}

              {proyecto.apoyo.unico ? (
                <button
                  type="button"
                  className="escucha-en-directo pill-apoyo"
                  onClick={() => onDonar(proyecto.apoyo.unico)}
                >
                  Aporte único
                </button>
              ) : (
                <span className="escucha-en-directo pill-apoyo escucha-en-directo--pronto" aria-disabled="true">
                  Aporte único
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {tieneCanciones ? (
        <>
          <div className="tracklist-header">
            <span className="tracklist-header-num">#</span>
            <span>Título</span>
            <span className="tracklist-header-duracion">Duración</span>
          </div>
          <ul className="tracklist">
            {proyecto.canciones.map((cancion, i) => {
              const src = cancion.archivos[0].url;
              const trackIdx = player.trackIndexBySrc(src);
              const isActive = player.currentTrack?.src === src;
              const isPlayingThis = isActive && player.isPlaying;
              return (
                <li
                  key={cancion.slug}
                  className={`track${isActive ? ' active' : ''}`}
                  aria-current={isActive ? 'true' : undefined}
                >
                  <span className="track-indicator">
                    <span className="track-num" aria-hidden="true">
                      {i + 1}
                    </span>
                    <button
                      type="button"
                      className={`track-play${isPlayingThis ? ' is-playing' : ''}`}
                      aria-label={`${isPlayingThis ? 'Pausar' : 'Reproducir'} ${cancion.titulo}`}
                      aria-pressed={isPlayingThis}
                      onClick={() => player.playTrackByIndex(trackIdx)}
                    >
                      <IconPlay className="icon-play" />
                      <IconPause className="icon-pause" />
                    </button>
                  </span>
                  <span className="track-titulo">
                    {cancion.titulo}
                    {cancion.estreno && <span className="track-chip track-chip--estreno">Estreno</span>}
                  </span>

                  {cancion.video && (
                    <span className="track-actions">
                      <button
                        className="track-video"
                        type="button"
                        aria-label={`Ver video de ${cancion.titulo}`}
                        onClick={() => onVideo(cancion.video, cancion.titulo)}
                      >
                        <IconVideo />
                      </button>
                    </span>
                  )}

                  <span className="track-duracion">{formatTime(player.durations[src])}</span>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p className="tracklist-vacia">Aún no hay canciones publicadas para este proyecto.</p>
      )}
    </article>
  );
}
