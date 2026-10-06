import {
  login,
  logout,
  handleIncomingRedirect,
  getDefaultSession,
  fetch as solidFetch,
} from '@inrupt/solid-client-authn-browser';
import { getPodUrlAll, getSolidDataset, getThing, getUrlAll } from '@inrupt/solid-client';

// Dos formas de tener sesión, como por-hacer:
//
// - **Suelta** (musica.aebn.cl): sesión Solid propia con
//   solid-client-authn-browser. Sin sesión la app funciona igual: la
//   biblioteca queda en el navegador.
// - **Dentro de espacio**: el escritorio ya tiene la sesión del socio y presta
//   un fetch acotado a <pod>/Aplicaciones/musica/ (main.jsx deja la conexión en
//   window.__espacio). No hay login propio: el redirect al proveedor ni
//   siquiera podría cargarse en el iframe.

export const PROVEEDOR_POR_DEFECTO = 'https://pods-rpi-tc.aebn.cl';

const SOLID_OIDC_ISSUER = 'http://www.w3.org/ns/solid/terms#oidcIssuer';
const VOLVER_KEY = 'musica-volver-a';

// Dónde queda la biblioteca dentro del pod, según la convención de carpetas
// de espacio. No va con el catálogo de Estudio (Aplicaciones/estudio/data/):
// eso es lo público del artista, y esto es de quien escucha.
const BIBLIOTECA_PATH = 'Aplicaciones/musica/biblioteca.json';
// Donde estaba antes de esa convención.
const BIBLIOTECA_PATH_VIEJA = 'apps/musica/biblioteca.json';

const espacio = () => window.__espacio ?? null;

export function enEspacio() {
  return Boolean(espacio());
}

// Fuera del contenedor de la app, el fetch de espacio responde 403: por eso
// dentro de espacio solo se usa para la biblioteca, y lo público (catálogo,
// audios, portadas) se sigue leyendo sin sesión.
const podFetch = (...args) => (espacio() ? espacio().fetch(...args) : solidFetch(...args));

export function sesionActual() {
  if (espacio()) {
    const webId = espacio().session?.webId ?? null;
    return { conectada: Boolean(webId), webId, embebida: true };
  }
  const { info } = getDefaultSession();
  return { conectada: info.isLoggedIn, webId: info.isLoggedIn ? info.webId : null, embebida: false };
}

// window.confirm no funciona en el iframe de espacio (no tiene allow-modals):
// devuelve null sin avisar, que es peor que un error.
export async function confirmar(message) {
  if (espacio()) return espacio().ui.confirm({ message, danger: true });
  return window.confirm(message);
}

// Se llama una vez antes de montar la app: completa el login si volvemos del
// proveedor, o restaura la sesión anterior.
export async function iniciarSesion() {
  if (espacio()) return sesionActual();
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
  // Dentro de espacio la ruta la decide el escritorio, desde el pim:storage
  // real del socio; leer el perfil quedaría fuera del alcance permitido.
  if (espacio()) return espacio().paths.app('biblioteca.json');
  // El perfil se lee aquí y se le pasa ya leído: getPodUrlAll de
  // solid-client 1.23 lo pide con el fetch de cross-fetch, que en el
  // navegador es window.fetch sin su `this`, y revienta con "Can only call
  // Window.fetch on instances of Window" (Safari) o "Illegal invocation".
  const webIdProfile = await getSolidDataset(webId, { fetch: solidFetch });
  const [pod] = await getPodUrlAll(webId, { fetch: solidFetch, webIdProfile });
  if (!pod) {
    throw new Error(`El perfil ${webId} no declara pim:storage; no se sabe dónde está tu pod.`);
  }
  const raiz = pod.endsWith('/') ? pod : `${pod}/`;
  // Antes de devolver la URL nueva: si ahí no hay nada, quien la usa sube lo
  // del navegador, y eso pisaría la biblioteca que estaba en la carpeta vieja.
  await migrarBiblioteca(raiz + BIBLIOTECA_PATH_VIEJA, raiz + BIBLIOTECA_PATH);
  return raiz + BIBLIOTECA_PATH;
}

// Copia la biblioteca de la carpeta vieja a la nueva, una vez. Dentro de
// espacio lo hace el escritorio; suelta, la app. Copia y no mueve, y nunca
// pisa la nueva si ya existe (If-None-Match).
async function migrarBiblioteca(vieja, nueva) {
  try {
    if ((await solidFetch(nueva, { method: 'HEAD', cache: 'no-store' })).ok) return;
    const res = await solidFetch(vieja, { headers: { Accept: 'application/json' }, cache: 'no-store' });
    if (!res.ok) return;
    await solidFetch(nueva, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'If-None-Match': '*' },
      body: await res.text(),
    });
  } catch (err) {
    console.warn(`No se pudo copiar la biblioteca a la carpeta nueva: ${err.message}`);
  }
}

export class ConflictoPod extends Error {
  constructor() {
    super('La biblioteca cambió en el pod desde la última lectura.');
    this.name = 'ConflictoPod';
  }
}

// Devuelve { datos, etag }, o { datos: null } si todavía no existe.
export async function leerJson(url) {
  const res = await podFetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' });
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
  const res = await podFetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...condicion },
    body: JSON.stringify(datos, null, 2),
  });
  if (res.status === 412) throw new ConflictoPod();
  if (!res.ok) throw new Error(`${url} respondió ${res.status}`);
  const nuevo = res.headers.get('ETag');
  if (nuevo) return nuevo;
  const head = await podFetch(url, { method: 'HEAD', cache: 'no-store' });
  return head.headers.get('ETag');
}
