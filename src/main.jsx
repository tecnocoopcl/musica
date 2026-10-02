import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import App from './App';

// Sin router: "/" es el catálogo y "/artista/<slug>" la página de un
// artista. En GitHub Pages, /artista/<slug> llega aquí gracias a 404.html
// (copia de index.html). Cualquier otra ruta muestra el catálogo.
const [seccion, slug] = window.location.pathname.split('/').filter(Boolean);
const artistaSlug = seccion === 'artista' && slug ? decodeURIComponent(slug) : null;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App artistaSlug={artistaSlug} />
  </React.StrictMode>
);
