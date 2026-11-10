import { API_URL } from '../config/api';

// Suma una escucha de la pista al contador de la cooperativa (anónimo; ver
// ADR-032 de espacio). Es lo que Estudio le muestra a cada músico. Si la API
// no responde no pasa nada: la música sigue sonando.
export async function anotarEscucha(pista) {
  if (!pista?.cuenta || !pista.artistaSlug || !pista.discoSlug || !pista.pistaSlug) return;
  try {
    await fetch(`${API_URL}/musica/escuchas`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        cuenta: pista.cuenta,
        artista: pista.artistaSlug,
        disco: pista.discoSlug,
        pista: pista.pistaSlug,
      }),
      keepalive: true,
    });
  } catch {
    // Sin conexión: esta escucha no suma.
  }
}
