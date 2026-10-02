import { useEffect, useState } from 'react';
import { API_URL } from '../config/api';

// Trae el catálogo completo de la cooperativa una sola vez. Las páginas de
// artista filtran de aquí, así navegar entre ellas no vuelve a pedirlo ni
// corta el reproductor.
export function useCatalogo() {
  const [estado, setEstado] = useState({ cargando: true, artistas: [], error: null });

  useEffect(() => {
    let vigente = true;
    const url = `${API_URL}/musica/artists`;

    fetch(url, { headers: { Accept: 'application/json' } })
      .then(async (res) => {
        if (!res.ok) throw new Error(`${url} respondió ${res.status}`);
        return (await res.json()).artists || [];
      })
      .then(
        (artistas) => {
          if (vigente) setEstado({ cargando: false, artistas, error: null });
        },
        (err) => {
          console.warn(`No se pudo cargar el catálogo: ${err.message}`);
          if (vigente) setEstado({ cargando: false, artistas: [], error: err.message });
        }
      );

    return () => {
      vigente = false;
    };
  }, []);

  return estado;
}
