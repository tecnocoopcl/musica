import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import App from './App';
import { iniciarSesion } from './pod/solid';
import { connect } from './vendor/espacio-sdk/index.js';

// Si la app está alojada en espacio, el escritorio le presta la sesión del
// socio y un fetch acotado a <pod>/apps/musica/. Fuera de espacio `connect`
// devuelve null y todo sigue como siempre.
window.__espacio = await connect().catch(() => null);
// La sesión se lee una vez al montar; si el socio entra o sale en espacio,
// se recarga para no seguir guardando en el pod de otra sesión.
window.__espacio?.on('session-changed', () => window.location.reload());

// La sesión Solid se resuelve antes de montar: al volver del proveedor de
// identidad la URL trae el código de login, y hay que procesarlo una sola vez.
// Las rutas (/, /artista/<slug>, /playlist/<id>…) las maneja ruta.jsx.
iniciarSesion().then((sesion) => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App sesion={sesion} />
    </React.StrictMode>
  );
});
