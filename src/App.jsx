import { artistas } from './config/artistas';

function App() {
  return (
    <main className="musica-app">
      <h1>Música</h1>
      <p>Catálogo leído desde Solid Pods — en construcción.</p>
      <ul>
        {artistas.map((artista) => (
          <li key={artista.nombre}>{artista.nombre}</li>
        ))}
      </ul>
    </main>
  );
}

export default App;
