import {
  login,
  logout,
  handleIncomingRedirect,
  getDefaultSession,
  fetch as solidFetch,
} from '@inrupt/solid-client-authn-browser';
import { getPodUrlAll, getSolidDataset, getThing, getUrlAll } from '@inrupt/solid-client';

// Sesión Solid propia de esta app (solid-client-authn-browser), igual que
// por-hacer suelta. Sin sesión la app funciona igual: la biblioteca queda en
// el navegador.

export const PROVEEDOR_POR_DEFECTO = 'https://pods-rpi-tc.aebn.cl';

const SOLID_OIDC_ISSUER = 'http://www.w3.org/ns/solid/terms#oidcIssuer';
const VOLVER_KEY = 'musica-volver-a';

// Dónde queda la biblioteca dentro del pod. No va en apps/estudio/data/:
// eso es el catálogo público del artista, y esto es de quien escucha.
const BIBLIOTECA_PATH = 'apps/musica/biblioteca.json';

export function sesionActual() {
  const { info } = getDefaultSession();
  return { conectada: info.isLoggedIn, webId: info.isLoggedIn ? info.webId : null };
}

// Se llama una vez antes de montar la app: completa el login si volvemos del
// proveedor, o restaura la sesión anterior.
export async function iniciarSesion() {
  try {
    await handleIncomingRedirect({
      restorePreviousSession: true,
      onSessionRestore: (url) => volverA(new URL(url).pathname),
    });
  } catch (err) {
    console.warn(`No se pudo restaurar la sesión Solid: ${err.message}`);
  }
  const pendiente = sessionStorage.getItem(VOLVER_KEY);
  if (pendiente) {
    sessionStorage.removeItem(VOLVER_KEY);
    volverA(pendiente);
  }
  return sesionActual();
}

function volverA(pathname) {
  if (pathname && pathname !== window.location.pathname) window.history.replaceState(null, '', pathname);
}

// Acepta un WebID (https://…/profile/card#me) o directamente la URL del
// proveedor. Con un WebID, el proveedor sale de solid:oidcIssuer del perfil.
export async function resolverProveedor(entrada) {
  const valor = entrada.trim();
  const url = new URL(valor.includes('://') ? valor : `https://${valor}`);
  if (!url.hash) return url.origin;

  const perfil = await getSolidDataset(url.href);
  const yo = getThing(perfil, url.href);
  const [proveedor] = yo ? getUrlAll(yo, SOLID_OIDC_ISSUER) : [];
  if (!proveedor) throw new Error('Ese WebID no declara un proveedor de identidad (solid:oidcIssuer).');
  return proveedor;
}

export async function conectar(oidcIssuer) {
  // Siempre se vuelve a la raíz (es index.html en GitHub Pages) y desde ahí a
  // la página en que estaba, para no depender de 404.html en el callback.
  sessionStorage.setItem(VOLVER_KEY, window.location.pathname);
  await login({
    oidcIssuer,
    redirectUrl: `${window.location.origin}/`,
    clientName: 'Música',
  });
}

export async function desconectar() {
  await logout();
}

// El pod se resuelve por pim:storage del perfil: el WebID no siempre vive
// dentro del pod.
export async function bibliotecaUrl(webId) {
  const [pod] = await getPodUrlAll(webId, { fetch: solidFetch });
  if (!pod) {
    throw new Error(`El perfil ${webId} no declara pim:storage; no se sabe dónde está tu pod.`);
  }
  return (pod.endsWith('/') ? pod : `${pod}/`) + BIBLIOTECA_PATH;
}

export class ConflictoPod extends Error {
  constructor() {
    super('La biblioteca cambió en el pod desde la última lectura.');
    this.name = 'ConflictoPod';
  }
}

// Devuelve { datos, etag }, o { datos: null } si todavía no existe.
export async function leerJson(url) {
  const res = await solidFetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' });
  if (res.status === 404) return { datos: null, etag: null };
  if (!res.ok) throw new Error(`${url} respondió ${res.status}`);
  return { datos: await res.json(), etag: res.headers.get('ETag') };
}

// Escritura condicional: con el ETag de la última lectura (If-Match), o
// exigiendo que no exista (If-None-Match) si es la primera vez. Así otro
// dispositivo no se pisa en silencio. Si el servidor no expone ETag, se
// escribe sin condición. Las carpetas intermedias las crea el servidor.
// Devuelve el ETag nuevo.
export async function guardarJson(url, datos, { etag, existe }) {
  const condicion = etag ? { 'If-Match': etag } : existe ? {} : { 'If-None-Match': '*' };
  const res = await solidFetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...condicion },
    body: JSON.stringify(datos, null, 2),
  });
  if (res.status === 412) throw new ConflictoPod();
  if (!res.ok) throw new Error(`${url} respondió ${res.status}`);
  const nuevo = res.headers.get('ETag');
  if (nuevo) return nuevo;
  const head = await solidFetch(url, { method: 'HEAD', cache: 'no-store' });
  return head.headers.get('ETag');
}
