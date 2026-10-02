import { useMemo, useState } from 'react';
import { useMusica } from '../contexto';
import { Fila } from '../Fila';
import { AlbumCard, ArtistaCard, PlaylistCard } from '../Tarjetas';

export function Inicio({ artistas, catalogo }) {
  const { biblioteca } = useMusica();
  const [genero, setGenero] = useState(null);

  const generos = useMemo(
    () => [...new Set(catalogo.map((p) => p.genero).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es')),
    [catalogo]
  );
  const discos = genero ? catalogo.filter((p) => p.genero === genero) : catalogo;
  // Los favoritos primero, el resto en el orden del catálogo.
  const artistasOrdenados = [
    ...artistas.filter((a) => biblioteca.esFavorito(a.slug)),
    ...artistas.filter((a) => !biblioteca.esFavorito(a.slug)),
  ];

  return (
    <>
      {generos.length > 0 && (
        <div className="chips" role="group" aria-label="Filtrar por género">
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
