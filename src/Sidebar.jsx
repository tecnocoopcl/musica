import { useMusica } from './contexto';
import { Link, navegar } from './ruta';
import { IconHome, IconLibrary, IconPlus } from './player/icons';

const TEXTO_SYNC = {
  local: 'Guardado en este navegador',
  cargando: 'Leyendo tu pod…',
  guardando: 'Guardando en tu pod…',
  sincronizada: 'Guardado en tu pod',
  conflicto: 'Se cargó la versión más nueva de tu pod',
  error: 'No se pudo sincronizar con tu pod',
};

export function Sidebar({ ruta, abierta, onCerrar, onAbout }) {
  const { biblioteca } = useMusica();

  function nuevaPlaylist() {
    const id = biblioteca.crearPlaylist(`Mi playlist #${biblioteca.playlists.length + 1}`);
    navegar(`/playlist/${id}`);
    onCerrar();
  }

  const navItem = (href, activo, icono, texto) => (
    <li>
      <Link href={href} className="sidebar-nav-item" aria-current={activo ? 'page' : undefined} onClick={onCerrar}>
        {icono}
        {texto}
      </Link>
    </li>
  );

  return (
    <>
      {abierta && <div className="sidebar-backdrop" onClick={onCerrar} />}
      <aside className={`sidebar${abierta ? ' is-open' : ''}`} id="sidebar">
        <div className="marca">
          <Link href="/" className="marca-nombre" onClick={onCerrar}>
            Música
          </Link>
          <p className="marca-leyenda">
            Integrada con{' '}
            <a href="https://tecnocoop.aebn.cl" target="_blank" rel="noopener">
              tecnocoop
            </a>
          </p>
        </div>

        <nav aria-label="Principal">
          <ul className="sidebar-nav">
            {navItem('/', ruta.vista === 'inicio', <IconHome />, 'Principal')}
            {navItem('/biblioteca', ruta.vista === 'biblioteca', <IconLibrary />, 'Biblioteca')}
          </ul>
        </nav>

        <hr className="sidebar-sep" />

        <button type="button" className="sidebar-nueva" onClick={nuevaPlaylist}>
          <IconPlus />
          Nueva playlist
        </button>

        <ul className="sidebar-playlists" aria-label="Tus playlists">
          {biblioteca.playlists.map((p) => (
            <li key={p.id}>
              <Link
                href={`/playlist/${p.id}`}
                className="sidebar-playlist"
                aria-current={ruta.vista === 'playlist' && ruta.id === p.id ? 'page' : undefined}
                onClick={onCerrar}
              >
                <span className="sidebar-playlist-nombre">{p.nombre}</span>
                <span className="sidebar-playlist-sub">
                  {p.canciones.length} {p.canciones.length === 1 ? 'canción' : 'canciones'}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="sidebar-pie">
          <p className={`sidebar-sync sidebar-sync--${biblioteca.sync}`} role="status">
            {TEXTO_SYNC[biblioteca.sync]}
          </p>
          <button type="button" className="sidebar-about" onClick={onAbout}>
            ¿Qué es esto?
          </button>
        </div>
      </aside>
    </>
  );
}
