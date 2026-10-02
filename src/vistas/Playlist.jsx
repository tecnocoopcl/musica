import { useState } from 'react';
import { useMusica } from '../contexto';
import { navegar } from '../ruta';
import { confirmar } from '../pod/solid';
import { PortadaPlaylist } from '../Tarjetas';
import { ListaCanciones } from '../ListaCanciones';
import { IconClose, IconPlay, IconTrash } from '../player/icons';

function NombreEditable({ playlist }) {
  const { biblioteca } = useMusica();
  const [nombre, setNombre] = useState(playlist.nombre);

  function confirmar() {
    const limpio = nombre.trim();
    if (limpio && limpio !== playlist.nombre) biblioteca.renombrarPlaylist(playlist.id, limpio);
    else setNombre(playlist.nombre);
  }

  return (
    <input
      className="cabecera-nombre"
      aria-label="Nombre de la playlist"
      value={nombre}
      onChange={(e) => setNombre(e.target.value)}
      onBlur={confirmar}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur();
        if (e.key === 'Escape') {
          setNombre(playlist.nombre);
          requestAnimationFrame(() => e.target.blur());
        }
      }}
    />
  );
}

export function Playlist({ id }) {
  const { player, biblioteca } = useMusica();
  const playlist = biblioteca.playlists.find((p) => p.id === id);

  if (!playlist) {
    return (
      <p className="musica-estado">
        {biblioteca.sync === 'cargando' ? 'Cargando tu biblioteca…' : 'No encontramos esta playlist.'}
      </p>
    );
  }

  const srcs = playlist.canciones.map((c) => c.src);
  const n = playlist.canciones.length;

  async function borrar() {
    if (!(await confirmar(`¿Borrar la playlist “${playlist.nombre}”?`))) return;
    biblioteca.borrarPlaylist(playlist.id);
    navegar('/biblioteca');
  }

  return (
    <>
      <header className="cabecera">
        <div className="cabecera-portada">
          <PortadaPlaylist playlist={playlist} />
        </div>
        <div className="cabecera-info">
          <span className="disco-eyebrow">Playlist</span>
          {/* key: si cambia desde el pod, el input se rehace con el nombre nuevo */}
          <NombreEditable key={`${playlist.id}:${playlist.nombre}`} playlist={playlist} />
          <p className="disco-artista">
            {n} {n === 1 ? 'canción' : 'canciones'}
          </p>
          <div className="disco-acciones">
            {n > 0 && (
              <button
                type="button"
                className="disco-play"
                aria-label={`Reproducir ${playlist.nombre}`}
                onClick={() => player.playQueue(srcs)}
              >
                <IconPlay />
              </button>
            )}
            <button type="button" className="escucha-en-directo" onClick={borrar}>
              <IconTrash />
              Borrar playlist
            </button>
          </div>
        </div>
      </header>

      {n === 0 ? (
        <p className="musica-estado">
          Aún no tiene canciones. Agrégalas desde cualquier disco con el botón de playlist que aparece en cada canción.
        </p>
      ) : (
        <ListaCanciones
          canciones={playlist.canciones}
          onPlay={(i) => player.playQueue(srcs, i)}
          accion={(c) => (
            <button
              type="button"
              className="track-video"
              aria-label={`Quitar ${c.titulo} de la playlist`}
              onClick={() => biblioteca.quitarDePlaylist(playlist.id, c.src)}
            >
              <IconClose />
            </button>
          )}
        />
      )}
    </>
  );
}
