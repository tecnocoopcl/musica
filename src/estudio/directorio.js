// Cliente del directorio de música (tecno-cooperativa-backend). El
// directorio decide quién es músico; la música sigue en el pod.
import { DIRECTORIO_URL as BASE } from '../config/directorio';

async function json(res) {
  const body = await res.json().catch(() => ({}));
  return { status: res.status, ...body };
}

// null si el WebID no está habilitado como músico.
export async function fichaDeMusico(webId) {
  const res = await fetch(`${BASE}/musica/musico?webid=${encodeURIComponent(webId)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`El directorio respondió ${res.status}`);
  return json(res);
}

// Pide al directorio que vuelva a leer el catálogo del pod. Devuelve la ficha
// con `publicado` y, si no, el motivo en `error`.
export async function avisarAlDirectorio(webId) {
  const res = await fetch(`${BASE}/musica/ping`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ webid: webId }),
  });
  if (res.status === 429) throw new Error('Espera unos segundos antes de volver a publicar');
  if (res.status === 404) throw new Error('Tu cuenta no está habilitada como músico');
  if (!res.ok && res.status !== 422) throw new Error(`El directorio respondió ${res.status}`);
  return json(res);
}
