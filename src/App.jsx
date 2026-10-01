import { useMemo, useState } from 'react';
import { artistas } from './config/artistas';
import { useCatalogo } from './catalogo/useCatalogo';
import { usePlayer } from './player/usePlayer';
import { Nav } from './Nav';
import { AlbumGrid } from './AlbumGrid';
import { Disco } from './Disco';
import { PlayerBar } from './PlayerBar';
import { AboutModal } from './AboutModal';
import { DonarModal } from './DonarModal';
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

function App() {
  const { cargando, proyectos: catalogo, errores } = useCatalogo(artistas);
  const tracks = useMemo(() => buildTracks(catalogo), [catalogo]);
  const player = usePlayer(tracks);

  const [aboutOpen, setAboutOpen] = useState(false);
  const [donarHref, setDonarHref] = useState(null);
  const [video, setVideo] = useState(null);

  function scrollToDisco(slug) {
    document.getElementById(slug)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      <Nav />
      <div className="musica-app">
      <div className="musica-titulo-row">
        <h1 className="musica-titulo">Música</h1>
        <button type="button" className="musica-titulo-info" onClick={() => setAboutOpen(true)}>
          ¿Qué es esto?
        </button>
      </div>

      {cargando && <p className="musica-estado">Cargando música…</p>}
      {!cargando && catalogo.length === 0 && (
        <p className="musica-estado">
          {errores.length ? 'No se pudo cargar la música. Intenta de nuevo en un rato.' : 'Aún no hay música publicada.'}
        </p>
      )}

      <AlbumGrid catalogo={catalogo} onSelect={scrollToDisco} onPlayAlbum={player.playAlbum} />

      {catalogo.map((proyecto) => (
        <Disco
          key={proyecto.slug}
          proyecto={proyecto}
          player={player}
          onDonar={setDonarHref}
          onVideo={(src, titulo) => setVideo({ src, titulo })}
        />
      ))}

      <PlayerBar player={player} />

      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
      {donarHref && <DonarModal href={donarHref} onClose={() => setDonarHref(null)} />}
      {video && <VideoModal video={video.src} titulo={video.titulo} onClose={() => setVideo(null)} />}
      </div>
    </>
  );
}

export default App;
