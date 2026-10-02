import { useEffect, useState } from 'react';

// Router mínimo, sin dependencias. Navegar con pushState y no con recargas
// importa en un reproductor: una recarga corta la canción que suena.
//
//   /                  portada
//   /artista/<slug>    página de un artista
//   /biblioteca        playlists y artistas favoritos
//   /playlist/<id>     una playlist
//
// En GitHub Pages cualquier ruta llega aquí gracias a 404.html (copia de
// index.html). Una ruta desconocida muestra la portada.
export function parseRuta(pathname) {
  const [seccion, param] = pathname.split('/').filter(Boolean).map(decodeURIComponent);
  if (seccion === 'artista' && param) return { vista: 'artista', slug: param };
  if (seccion === 'playlist' && param) return { vista: 'playlist', id: param };
  if (seccion === 'biblioteca') return { vista: 'biblioteca' };
  return { vista: 'inicio' };
}

export function navegar(href) {
  const url = new URL(href, window.location.origin);
  if (url.pathname + url.hash === window.location.pathname + window.location.hash) return;
  window.history.pushState(null, '', url.pathname + url.hash);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function useRuta() {
  const [ruta, setRuta] = useState(() => parseRuta(window.location.pathname));

  useEffect(() => {
    function onPop() {
      setRuta(parseRuta(window.location.pathname));
      const id = window.location.hash.slice(1);
      // Espera al render de la vista nueva antes de buscar el ancla.
      requestAnimationFrame(() => {
        const destino = id && document.getElementById(decodeURIComponent(id));
        if (destino) destino.scrollIntoView({ behavior: 'smooth' });
        else window.scrollTo(0, 0);
      });
    }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return ruta;
}

// <a> que navega sin recargar. Ctrl/Cmd+clic y clic central siguen abriendo
// una pestaña nueva, como cualquier enlace.
export function Link({ href, onClick, ...props }) {
  function handleClick(e) {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navegar(href);
  }
  return <a href={href} onClick={handleClick} {...props} />;
}
