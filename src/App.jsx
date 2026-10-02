import { useEffect, useMemo, useState } from 'react';
import { useCatalogo } from './catalogo/useCatalogo';
import { aProyectos } from './catalogo/proyectos';
import { usePlayer } from './player/usePlayer';
import { Nav } from './Nav';
import { AlbumGrid } from './AlbumGrid';
import { Disco } from './Disco';
import { PlayerBar } from './PlayerBar';
import { AboutModal } from './AboutModal';
import { VideoModal } from './VideoModal';
import './musica.css';

function buildTracks(catalogo) {
  return catalogo.flatMap((proyecto) =>
    proyecto.canciones.map((cancion) => ({
      src: cancion.archivos[0].url,
      titulo: cancion.titulo,
      proyectoSlug: proyecto.slug,
      proyectoTitulo: proyecto.titulo,
      portada: proyecto.portada,
    }))
  );
}

function mensajeDeEstado({ cargando, error, noEncontrado }, vacio) {
  if (cargando) return 'Cargando música…';
  if (error) return 'No se pudo cargar la música. Intenta de nuevo en un rato.';
  if (noEncontrado) return 'No encontramos a este artista.';
  if (vacio) return 'Aún no hay música publicada.';
  return null;
}

// Sin artistaSlug es el catálogo completo de la cooperativa (/); con él, la
// página de ese artista (/artista/male, /artista/siniestra).
function App({ artistaSlug }) {
  const estado = useCatalogo(artistaSlug);
  const catalogo = useMemo(() => aProyectos(estado.artistas), [estado.artistas]);
  const tracks = useMemo(() => buildTracks(catalogo), [catalogo]);
  const player = usePlayer(tracks);

  const [aboutOpen, setAboutOpen] = useState(false);
  const [video, setVideo] = useState(null);

  const titulo = artistaSlug ? estado.artistas[0]?.name || artistaSlug : 'Música';
  const mensaje = mensajeDeEstado(estado, catalogo.length === 0);

  useEffect(() => {
    document.title = artistaSlug ? `${titulo} · Música` : 'Música';
  }, [artistaSlug, titulo]);

  function scrollToDisco(slug) {
    document.getElementById(slug)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      <Nav />
      <div className="musica-app">
      {artistaSlug && (
        <a className="musica-volver" href="/">
          ← Catálogo
        </a>
      )}
      <div className="musica-titulo-row">
        <h1 className="musica-titulo">{titulo}</h1>
        <button type="button" className="musica-titulo-info" onClick={() => setAboutOpen(true)}>
          ¿Qué es esto?
        </button>
      </div>

      {mensaje && <p className="musica-estado">{mensaje}</p>}

      <AlbumGrid
        catalogo={catalogo}
        onSelect={scrollToDisco}
        onPlayAlbum={player.playAlbum}
        enlazarArtista={!artistaSlug}
      />

      {catalogo.map((proyecto) => (
        <Disco
          key={proyecto.slug}
          proyecto={proyecto}
          player={player}
          onVideo={(src, titulo) => setVideo({ src, titulo })}
          enlazarArtista={!artistaSlug}
        />
      ))}

      <PlayerBar player={player} />

      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
      {video && <VideoModal video={video.src} titulo={video.titulo} onClose={() => setVideo(null)} />}
      </div>
    </>
  );
}

export default App;
