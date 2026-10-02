import { useEffect, useState } from 'react';
import { API_URL } from '../config/api';

// Sin artistaSlug trae el catálogo completo de la cooperativa; con él, solo
// ese artista. `noEncontrado` distingue un artista que no existe de un
// backend caído.
export function useCatalogo(artistaSlug) {
  const [estado, setEstado] = useState({ cargando: true, artistas: [], error: null, noEncontrado: false });

  useEffect(() => {
    let vigente = true;
    const url = artistaSlug
      ? `${API_URL}/musica/artists/${encodeURIComponent(artistaSlug)}`
      : `${API_URL}/musica/artists`;

    fetch(url, { headers: { Accept: 'application/json' } })
      .then(async (res) => {
        if (res.status === 404 && artistaSlug) return { artistas: [], noEncontrado: true };
        if (!res.ok) throw new Error(`${url} respondió ${res.status}`);
        const body = await res.json();
        return { artistas: artistaSlug ? [body] : body.artists, noEncontrado: false };
      })
      .then(
        ({ artistas, noEncontrado }) => {
          if (vigente) setEstado({ cargando: false, artistas, error: null, noEncontrado });
        },
        (err) => {
          console.warn(`No se pudo cargar el catálogo: ${err.message}`);
          if (vigente) setEstado({ cargando: false, artistas: [], error: err.message, noEncontrado: false });
        }
      );

    return () => {
      vigente = false;
    };
  }, [artistaSlug]);

  return estado;
}
