import { useMusica } from '../contexto';
import { Fila } from '../Fila';
import { AlbumCard, ArtistaCard } from '../Tarjetas';
import { ListaCanciones } from '../ListaCanciones';
import { AgregarAPlaylist } from '../AgregarAPlaylist';

// "Canción" encuentra "cancion" y al revés.
function normalizar(texto) {
  return (texto || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

export function Busqueda({ q, artistas, catalogo }) {
  const { player } = useMusica();
  const termino = normalizar(q.trim());
  const coincide = (...textos) => textos.some((t) => normalizar(t).includes(termino));

  const artistasEncontrados = artistas.filter((a) => coincide(a.nombre));
  const discos = catalogo.filter((p) => coincide(p.album, p.sencillo, p.titulo, p.genero));
  const canciones = catalogo.flatMap((p) =>
    p.canciones
      .filter((c) => coincide(c.titulo))
      .map((c) => ({ src: c.archivos[0].url, titulo: c.titulo, artista: p.titulo }))
  );

  if (artistasEncontrados.length + discos.length + canciones.length === 0) {
    return <p className="musica-estado">No encontramos nada para “{q.trim()}”.</p>;
  }

  return (
    <>
      <h1 className="vista-titulo">Resultados para “{q.trim()}”</h1>
      {canciones.length > 0 && (
        <section className="seccion" aria-label="Canciones">
          <h2>Canciones</h2>
          <ListaCanciones
            canciones={canciones}
            onPlay={(i) => player.playTrackByIndex(player.trackIndexBySrc(canciones[i].src))}
            accion={(c) => <AgregarAPlaylist cancion={c} />}
          />
        </section>
      )}
      {artistasEncontrados.length > 0 && (
        <Fila titulo="Artistas">
          {artistasEncontrados.map((a) => (
            <ArtistaCard key={a.slug} artista={a} />
          ))}
        </Fila>
      )}
      {discos.length > 0 && (
        <Fila titulo="Álbumes y sencillos">
          {discos.map((p) => (
            <AlbumCard key={p.slug} proyecto={p} />
          ))}
        </Fila>
      )}
    </>
  );
}
