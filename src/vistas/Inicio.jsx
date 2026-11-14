import { useMemo, useState } from 'react';
import { useMusica } from '../contexto';
import { Fila } from '../Fila';
import { AlbumCard, ArtistaCard, PlaylistCard } from '../Tarjetas';
import { generosParaFiltrar, tieneGenero } from '../catalogo/generos';

// El mismo saludo clásico de Inicio en espacio, según la hora del equipo.
function saludo(hora = new Date().getHours()) {
  if (hora >= 6 && hora < 12) return 'Buenos días';
  if (hora >= 12 && hora < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

export function Inicio({ artistas, catalogo }) {
  const { biblioteca } = useMusica();
  const [genero, setGenero] = useState(null);
  const [titulo] = useState(saludo);

  const generos = useMemo(() => generosParaFiltrar(catalogo), [catalogo]);
  const discos = genero ? catalogo.filter((p) => tieneGenero(p, genero)) : catalogo;
  // Los favoritos primero, el resto en el orden del catálogo.
  const artistasOrdenados = [
    ...artistas.filter((a) => biblioteca.esFavorito(a.slug)),
    ...artistas.filter((a) => !biblioteca.esFavorito(a.slug)),
  ];

  return (
    <>
      <header className="portada-cabecera">
        <h1>{titulo}</h1>
        <p className="portada-lede">La música que publican los artistas de la cooperativa desde su propio Pod.</p>
        {generos.length > 0 && (
          <div className="chips" role="group" aria-label="Filtrar por género">
            <span className="chips-etiqueta" aria-hidden="true">Géneros</span>
            {generos.map((g) => (
              <button
                key={g}
                type="button"
                className="chip"
                aria-pressed={genero === g}
                onClick={() => setGenero(genero === g ? null : g)}
              >
                {g}
              </button>
            ))}
          </div>
        )}
      </header>

      {!genero && biblioteca.playlists.length > 0 && (
        <Fila titulo="Tus playlists">
          {biblioteca.playlists.map((p) => (
            <PlaylistCard key={p.id} playlist={p} />
          ))}
        </Fila>
      )}

      {!genero && artistas.length > 0 && (
        <Fila titulo="Artistas de la cooperativa">
          {artistasOrdenados.map((a) => (
            <ArtistaCard key={a.slug} artista={a} />
          ))}
        </Fila>
      )}

      {discos.length > 0 && (
        <Fila titulo={genero ? genero : 'Álbumes y sencillos'}>
          {discos.map((p) => (
            <AlbumCard key={p.slug} proyecto={p} />
          ))}
        </Fila>
      )}
    </>
  );
}
