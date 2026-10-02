import { useMusica } from './contexto';
import { Link } from './ruta';
import { IconPlay } from './player/icons';

function tituloAlbum(proyecto) {
  return proyecto.album || proyecto.sencillo || proyecto.titulo;
}

function plural(n, uno, varios) {
  return `${n} ${n === 1 ? uno : varios}`;
}

function BotonPlay({ etiqueta, onClick }) {
  return (
    <button className="tarjeta-play" type="button" aria-label={etiqueta} onClick={onClick}>
      <IconPlay />
    </button>
  );
}

export function AlbumCard({ proyecto }) {
  const { player } = useMusica();
  const titulo = tituloAlbum(proyecto);
  return (
    <div className="tarjeta">
      <div className="tarjeta-portada">
        <img src={proyecto.portada} alt="" loading="lazy" />
        {proyecto.canciones.length > 0 && (
          <BotonPlay etiqueta={`Reproducir ${titulo}`} onClick={() => player.playAlbum(proyecto.slug)} />
        )}
      </div>
      <Link className="tarjeta-titulo" href={`/artista/${proyecto.artistaSlug}#${proyecto.slug}`}>
        {titulo}
      </Link>
      <p className="tarjeta-sub">
        {proyecto.album ? 'Álbum' : 'Sencillo'} • <Link href={`/artista/${proyecto.artistaSlug}`}>{proyecto.titulo}</Link>
      </p>
    </div>
  );
}

export function ArtistaCard({ artista }) {
  const { biblioteca } = useMusica();
  return (
    <div className="tarjeta tarjeta--artista">
      <Link className="tarjeta-portada" href={`/artista/${artista.slug}`} tabIndex={-1} aria-hidden="true">
        {artista.portada ? <img src={artista.portada} alt="" loading="lazy" /> : <span>{artista.nombre.slice(0, 1)}</span>}
      </Link>
      <Link className="tarjeta-titulo" href={`/artista/${artista.slug}`}>
        {artista.nombre}
      </Link>
      <p className="tarjeta-sub">
        {biblioteca.esFavorito(artista.slug) ? 'Favorito • ' : 'Artista • '}
        {plural(artista.lanzamientos, 'lanzamiento', 'lanzamientos')}
      </p>
    </div>
  );
}

// Mosaico con las portadas de las primeras canciones distintas.
export function PortadaPlaylist({ playlist }) {
  const { tracksPorSrc } = useMusica();
  const portadas = [...new Set(playlist.canciones.map((c) => tracksPorSrc.get(c.src)?.portada).filter(Boolean))];
  if (portadas.length === 0) return <div className="mosaico mosaico--vacio" aria-hidden="true">♪</div>;
  const usadas = portadas.length >= 4 ? portadas.slice(0, 4) : portadas.slice(0, 1);
  return (
    <div className={`mosaico mosaico--${usadas.length}`} aria-hidden="true">
      {usadas.map((src) => (
        <img key={src} src={src} alt="" loading="lazy" />
      ))}
    </div>
  );
}

export function PlaylistCard({ playlist }) {
  const { player } = useMusica();
  return (
    <div className="tarjeta">
      <div className="tarjeta-portada">
        <PortadaPlaylist playlist={playlist} />
        {playlist.canciones.length > 0 && (
          <BotonPlay
            etiqueta={`Reproducir ${playlist.nombre}`}
            onClick={() => player.playQueue(playlist.canciones.map((c) => c.src))}
          />
        )}
      </div>
      <Link className="tarjeta-titulo" href={`/playlist/${playlist.id}`}>
        {playlist.nombre}
      </Link>
      <p className="tarjeta-sub">Playlist • {plural(playlist.canciones.length, 'canción', 'canciones')}</p>
    </div>
  );
}
