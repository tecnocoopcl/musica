// Lo que el Estudio hace en el pod del músico. Todo pasa por el `fetch` que
// presta espacio, acotado a <pod>/musica/: aquí no hay login ni tokens.

export const CATALOGO = 'publico/catalogo.jsonld';

const TIPOS = {
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  ogg: 'audio/ogg',
  opus: 'audio/ogg',
  flac: 'audio/flac',
  wav: 'audio/wav',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  mp4: 'video/mp4',
  webm: 'video/webm',
  jsonld: 'application/ld+json',
};

function tipoDe(nombre, tipoDelNavegador) {
  const ext = nombre.split('.').pop().toLowerCase();
  return TIPOS[ext] || tipoDelNavegador || 'application/octet-stream';
}

async function exigirOk(res, que) {
  if (!res.ok) throw new Error(`${que}: el pod respondió ${res.status}`);
  return res;
}

// El catálogo tal como está en el pod, o null si todavía no hay.
export async function leerDelPod(espacio) {
  const url = espacio.paths.app(CATALOGO);
  const res = await espacio.fetch(url, { headers: { Accept: 'application/ld+json' } });
  if (res.status === 404) return null;
  await exigirOk(res, 'Leer el catálogo');
  return { url, doc: await res.json() };
}

export async function guardarEnPod(espacio, doc) {
  const res = await espacio.fetch(espacio.paths.app(CATALOGO), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/ld+json' },
    body: JSON.stringify(doc, null, 2),
  });
  await exigirOk(res, 'Guardar el catálogo');
}

export function slugify(texto) {
  return (
    texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'sin-titulo'
  );
}

// slug que no choca con los que ya existen: "demo", "demo-2", "demo-3"…
export function slugUnico(texto, existentes) {
  const base = slugify(texto);
  let slug = base;
  for (let n = 2; existentes.includes(slug); n++) slug = `${base}-${n}`;
  return slug;
}

export function extension(nombre) {
  const i = nombre.lastIndexOf('.');
  return i > 0 ? nombre.slice(i + 1).toLowerCase() : '';
}

// Sube un archivo a publico/<ruta>. La ruta queda relativa al catálogo, que
// es como el catálogo la guarda.
export async function subirArchivo(espacio, ruta, file) {
  const res = await espacio.fetch(espacio.paths.app('publico/' + ruta), {
    method: 'PUT',
    headers: { 'Content-Type': tipoDe(file.name, file.type) },
    body: await file.arrayBuffer(),
  });
  await exigirOk(res, `Subir ${file.name}`);
  return ruta;
}

// Borra un archivo de publico/. Que ya no exista no es un error.
export async function borrarArchivo(espacio, ruta) {
  if (!ruta || /^[a-z][a-z0-9+.-]*:/i.test(ruta)) return;
  const res = await espacio.fetch(espacio.paths.app('publico/' + ruta), { method: 'DELETE' });
  if (res.status !== 404) await exigirOk(res, `Borrar ${ruta}`);
}

function aclDe(res, contenedor) {
  const link = res.headers.get('Link') || '';
  const m = link.match(/<([^>]+)>\s*;\s*rel="?acl"?/);
  return m ? new URL(m[1], contenedor).href : new URL('.acl', contenedor).href;
}

// Deja publico/ legible por cualquiera, y lo que se suba después también
// (acl:default). El dueño conserva Control: un ACL sin él no se puede
// arreglar desde ninguna app (ver ADR-009 de espacio).
export async function hacerPublico(espacio, webId) {
  const contenedor = espacio.paths.app('publico/');
  const head = await exigirOk(await espacio.fetch(contenedor, { method: 'HEAD' }), 'Leer la carpeta pública');
  const acl = aclDe(head, contenedor);
  const turtle = `@prefix acl: <http://www.w3.org/ns/auth/acl#>.
@prefix foaf: <http://xmlns.com/foaf/0.1/>.

<#dueno> a acl:Authorization;
  acl:agent <${webId}>;
  acl:accessTo <./>;
  acl:default <./>;
  acl:mode acl:Read, acl:Write, acl:Control.

<#publico> a acl:Authorization;
  acl:agentClass foaf:Agent;
  acl:accessTo <./>;
  acl:default <./>;
  acl:mode acl:Read.
`;
  const res = await espacio.fetch(acl, {
    method: 'PUT',
    headers: { 'Content-Type': 'text/turtle' },
    body: turtle,
  });
  await exigirOk(res, 'Hacer pública la carpeta');
}

// Las portadas no se pueden mostrar con <img src> mientras la carpeta no sea
// pública: se leen con la sesión y se muestran como blob.
export async function blobUrl(espacio, url) {
  const res = await espacio.fetch(url);
  if (!res.ok) return null;
  return URL.createObjectURL(await res.blob());
}
