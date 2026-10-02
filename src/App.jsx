import { useEffect, useMemo, useState } from 'react';
import { useCatalogo } from './catalogo/useCatalogo';
import { aProyectos } from './catalogo/proyectos';
import { usePlayer } from './player/usePlayer';
import { useBiblioteca } from './biblioteca/useBiblioteca';
import { MusicaContext } from './contexto';
import { useRuta } from './ruta';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { PlayerBar } from './PlayerBar';
import { AboutModal } from './AboutModal';
import { VideoModal } from './VideoModal';
import { Inicio } from './vistas/Inicio';
import { Busqueda } from './vistas/Busqueda';
import { Artista } from './vistas/Artista';
import { Playlist } from './vistas/Playlist';
import { Biblioteca } from './vistas/Biblioteca';
import './musica.css';

function buildTracks(catalogo) {
  return catalogo.flatMap((proyecto) =>
    proyecto.canciones.map((cancion) => ({
      src: cancion.archivos[0].url,
      titulo: cancion.titulo,
      proyectoSlug: proyecto.slug,
      proyectoTitulo: proyecto.titulo,
      artistaSlug: proyecto.artistaSlug,
      portada: proyecto.portada,
    }))
  );
}

function aArtistas(artistas) {
  return artistas.map((a) => ({
    slug: a.slug,
    nombre: a.name,
    portada: a.albums?.[0]?.cover,
    lanzamientos: (a.albums || []).length,
  }));
}

function mensajeDeEstado({ cargando, error }, vacio) {
  if (cargando) return 'Cargando música…';
  if (error) return 'No se pudo cargar la música. Intenta de nuevo en un rato.';
  if (vacio) return 'Aún no hay música publicada.';
  return null;
}

// sesion: { conectada, webId } de Solid, resuelta antes de montar (main.jsx).
function App({ sesion }) {
  const ruta = useRuta();
  const estado = useCatalogo();
  const catalogo = useMemo(() => aProyectos(estado.artistas), [estado.artistas]);
  const artistas = useMemo(() => aArtistas(estado.artistas), [estado.artistas]);
  const tracks = useMemo(() => buildTracks(catalogo), [catalogo]);
  const tracksPorSrc = useMemo(() => new Map(tracks.map((t) => [t.src, t])), [tracks]);
  const player = usePlayer(tracks);
  const biblioteca = useBiblioteca(sesion.webId);

  const [busqueda, setBusqueda] = useState('');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [video, setVideo] = useState(null);

  const artista = ruta.vista === 'artista' ? artistas.find((a) => a.slug === ruta.slug) : null;
  const playlist = ruta.vista === 'playlist' ? biblioteca.playlists.find((p) => p.id === ruta.id) : null;
  const mensaje = mensajeDeEstado(estado, catalogo.length === 0);

  // Al navegar se deja la búsqueda.
  useEffect(() => {
    setBusqueda('');
  }, [ruta]);

  useEffect(() => {
    const titulo = artista?.nombre || playlist?.nombre || (ruta.vista === 'biblioteca' && 'Biblioteca');
    document.title = titulo ? `${titulo} · Música` : 'Música';
  }, [artista, playlist, ruta]);

  // /artista/male#male-naguara: el disco aparece cuando llega el catálogo.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!estado.cargando && id) document.getElementById(decodeURIComponent(id))?.scrollIntoView();
  }, [estado.cargando]);

  function contenido() {
    if (busqueda.trim()) return <Busqueda q={busqueda} artistas={artistas} catalogo={catalogo} />;

    switch (ruta.vista) {
      case 'biblioteca':
        return <Biblioteca artistas={artistas} sesion={sesion} />;
      case 'playlist':
        return <Playlist key={ruta.id} id={ruta.id} />;
      case 'artista':
        if (estado.cargando || estado.error) return <p className="musica-estado">{mensaje}</p>;
        if (!artista) return <p className="musica-estado">No encontramos a este artista.</p>;
        return (
          <Artista
            artista={artista}
            proyectos={catalogo.filter((p) => p.artistaSlug === artista.slug)}
            onVideo={(src, titulo) => setVideo({ src, titulo })}
          />
        );
      default:
        return (
          <>
            {mensaje && <p className="musica-estado">{mensaje}</p>}
            <Inicio artistas={artistas} catalogo={catalogo} />
          </>
        );
    }
  }

  return (
    <MusicaContext.Provider value={{ player, biblioteca, tracksPorSrc }}>
      <div className={`musica-app${player.currentTrack ? ' con-player' : ''}`}>
        <Sidebar
          ruta={ruta}
          abierta={menuAbierto}
          onCerrar={() => setMenuAbierto(false)}
          onAbout={() => setAboutOpen(true)}
        />
        <div className="principal">
          <TopBar
            sesion={sesion}
            busqueda={busqueda}
            onBusqueda={setBusqueda}
            menuAbierto={menuAbierto}
            onMenu={() => setMenuAbierto((v) => !v)}
          />
          <main className="contenido">{contenido()}</main>
        </div>

        <PlayerBar player={player} />

        {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
        {video && <VideoModal video={video.src} titulo={video.titulo} onClose={() => setVideo(null)} />}
      </div>
    </MusicaContext.Provider>
  );
}

export default App;
