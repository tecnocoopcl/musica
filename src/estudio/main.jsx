import React from 'react';
import ReactDOM from 'react-dom/client';
import { connect } from '../vendor/espacio-sdk/index.js';

import '../index.css';
import { Estudio } from './Estudio';

// El saludo con espacio se hace una sola vez, antes de montar React: en
// StrictMode los efectos corren dos veces y un segundo saludo quedaría sin
// respuesta. Fuera de espacio, connect() devuelve null.
const espacio = await connect().catch(() => null);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Estudio espacio={espacio} />
  </React.StrictMode>
);
