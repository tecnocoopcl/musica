// Lo que el sistema muestra de la pista que suena (pantalla bloqueada, centro
// de control, auriculares): Media Session API. Sin portada, iOS deja el
// recuadro vacío.
//
// Sin React ni DOM, para probarlo con `node --test`.

const TIPOS = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

// Datos para `new MediaMetadata(...)`, o null si no suena nada. `base` sirve
// para volver absoluta una portada relativa.
export function metadatosDe(pista, base) {
  if (!pista) return null;
  return {
    title: pista.titulo || '',
    artist: pista.proyectoTitulo || '',
    album: pista.disco || '',
    artwork: portada(pista.portada, base),
  };
}

function portada(url, base) {
  if (!url) return [];
  let src;
  try {
    src = new URL(url, base).href;
  } catch {
    return [];
  }
  const ext = new URL(src).pathname.split('.').pop().toLowerCase();
  const tipo = TIPOS[ext];
  return [{ src, ...(tipo && { type: tipo }) }];
}
