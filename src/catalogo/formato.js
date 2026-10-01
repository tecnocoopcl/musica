// Formato de catalogo.jsonld: el archivo que cada artista publica en su pod
// (<pod>/musica/publico/catalogo.jsonld). Usa vocabulario schema.org para que
// cualquier app Solid lo entienda, no solo esta.
//
// Las URLs de audio, portadas y videos pueden ser relativas: se resuelven
// contra la URL del propio catalogo.jsonld, así la carpeta se puede mover de
// pod (o de servidor) sin reescribir el archivo.
//
// La interfaz no trabaja con JSON-LD sino con "proyectos", la forma que usan
// Disco, AlbumGrid y el reproductor. Este módulo traduce en ambos sentidos.

const CONTEXT = 'https://schema.org';

function lista(v) {
  if (v === undefined || v === null) return [];
  return Array.isArray(v) ? v : [v];
}

function resolver(url, base) {
  if (!url) return url;
  return base ? new URL(url, base).href : url;
}

function propiedad(nodo, nombre) {
  return lista(nodo.additionalProperty).find((p) => p.name === nombre)?.value;
}

function acciones(nodo, tipo) {
  return lista(nodo.potentialAction).filter((a) => a['@type'] === tipo);
}

function leerCancion(nodo, base) {
  const cancion = {
    slug: nodo.identifier,
    titulo: nodo.name,
    archivos: lista(nodo.audio).map((a) => ({
      formato: a.identifier,
      etiqueta: a.name,
      url: resolver(a.contentUrl, base),
    })),
  };
  const oferta = lista(nodo.offers)[0];
  if (oferta) {
    cancion.precio = oferta.price;
    cancion.linkPago = oferta.url || '';
  }
  const video = lista(nodo.video)[0];
  if (video) cancion.video = resolver(video.contentUrl, base);
  if (propiedad(nodo, 'estreno')) cancion.estreno = true;
  return cancion;
}

function leerProyecto(nodo, base) {
  const proyecto = {
    slug: nodo.identifier,
    titulo: lista(nodo.byArtist)[0]?.name || nodo.name,
  };
  if (nodo.albumReleaseType === 'AlbumRelease') proyecto.album = nodo.name;
  if (nodo.albumReleaseType === 'SingleRelease') proyecto.sencillo = nodo.name;
  if (nodo.genre) proyecto.genero = nodo.genre;
  if (nodo.datePublished) proyecto.anio = Number(nodo.datePublished);
  if (nodo.description) proyecto.descripcion = nodo.description;
  const tipo = propiedad(nodo, 'tipo');
  if (tipo) proyecto.tipo = tipo;
  if (nodo.image) proyecto.portada = resolver(nodo.image, base);

  const streaming = acciones(nodo, 'ListenAction').map((a) => ({ nombre: a.name, url: a.target }));
  if (streaming.length) proyecto.streaming = streaming;

  const donaciones = acciones(nodo, 'DonateAction');
  if (donaciones.length) {
    proyecto.apoyo = {
      mensual: donaciones.find((a) => a.name === 'mensual')?.target || '',
      unico: donaciones.find((a) => a.name === 'unico')?.target || '',
    };
  }

  proyecto.canciones = lista(nodo.track).map((t) => leerCancion(t, base));
  return proyecto;
}

// doc: el JSON de catalogo.jsonld ya parseado. base: la URL desde donde se
// leyó, para resolver las rutas relativas.
export function leerCatalogo(doc, base) {
  if (!doc || !lista(doc.itemListElement).length) {
    throw new Error('catalogo.jsonld no tiene proyectos (itemListElement)');
  }
  return lista(doc.itemListElement).map((nodo) => leerProyecto(nodo, base));
}

function escribirCancion(c) {
  const nodo = {
    '@type': 'MusicRecording',
    identifier: c.slug,
    name: c.titulo,
    audio: c.archivos.map((a) => ({
      '@type': 'AudioObject',
      identifier: a.formato,
      name: a.etiqueta,
      contentUrl: a.url,
    })),
  };
  if (c.precio !== undefined) {
    nodo.offers = { '@type': 'Offer', price: c.precio, priceCurrency: 'CLP' };
    if (c.linkPago) nodo.offers.url = c.linkPago;
  }
  if (c.video) nodo.video = { '@type': 'VideoObject', contentUrl: c.video };
  if (c.estreno) nodo.additionalProperty = [{ '@type': 'PropertyValue', name: 'estreno', value: true }];
  return nodo;
}

function escribirProyecto(p) {
  const nodo = {
    '@type': 'MusicAlbum',
    identifier: p.slug,
    name: p.album || p.sencillo || p.titulo,
    byArtist: { '@type': 'MusicGroup', name: p.titulo },
  };
  // `!== undefined`: un álbum recién creado puede tener el nombre vacío
  // mientras se escribe, y no por eso deja de ser álbum.
  if (p.album !== undefined) nodo.albumReleaseType = 'AlbumRelease';
  else if (p.sencillo !== undefined) nodo.albumReleaseType = 'SingleRelease';
  if (p.genero) nodo.genre = p.genero;
  if (p.anio) nodo.datePublished = String(p.anio);
  if (p.descripcion) nodo.description = p.descripcion;
  if (p.portada) nodo.image = p.portada;
  if (p.tipo) nodo.additionalProperty = [{ '@type': 'PropertyValue', name: 'tipo', value: p.tipo }];

  const potentialAction = [
    ...(p.streaming || []).map((s) => ({ '@type': 'ListenAction', name: s.nombre, target: s.url })),
    ...['mensual', 'unico']
      .filter((k) => p.apoyo?.[k])
      .map((k) => ({ '@type': 'DonateAction', name: k, target: p.apoyo[k] })),
  ];
  if (potentialAction.length) nodo.potentialAction = potentialAction;

  nodo.track = p.canciones.map(escribirCancion);
  return nodo;
}

// Inverso de leerCatalogo. Las URLs se escriben tal cual vienen: quien llama
// decide si son relativas (lo normal, para que el catálogo sea portable).
export function escribirCatalogo(proyectos, { nombre } = {}) {
  return {
    '@context': CONTEXT,
    '@type': 'ItemList',
    ...(nombre ? { name: nombre } : {}),
    itemListElement: proyectos.map(escribirProyecto),
  };
}
