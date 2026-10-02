import { useMusica } from '../contexto';
import { ArtistaCard, PlaylistCard } from '../Tarjetas';

export function Biblioteca({ artistas, sesion }) {
  const { biblioteca } = useMusica();
  const favoritos = artistas.filter((a) => biblioteca.esFavorito(a.slug));

  return (
    <>
      <h1 className="vista-titulo">Biblioteca</h1>
      {!sesion.conectada && (
        <p className="aviso">
          Tu biblioteca está guardada solo en este navegador. Usa <strong>Conectar con WebID</strong> para guardarla
          en tu Solid Pod y tenerla en todos tus dispositivos.
        </p>
      )}

      <section className="seccion" aria-label="Playlists">
        <h2>Playlists</h2>
        {biblioteca.playlists.length === 0 ? (
          <p className="musica-estado">Aún no tienes playlists. Crea una con “Nueva playlist”.</p>
        ) : (
          <div className="rejilla">
            {biblioteca.playlists.map((p) => (
              <PlaylistCard key={p.id} playlist={p} />
            ))}
          </div>
        )}
      </section>

      <section className="seccion" aria-label="Artistas favoritos">
        <h2>Artistas favoritos</h2>
        {favoritos.length === 0 ? (
          <p className="musica-estado">Marca artistas como favoritos desde su página.</p>
        ) : (
          <div className="rejilla">
            {favoritos.map((a) => (
              <ArtistaCard key={a.slug} artista={a} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
