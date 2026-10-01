import { useEffect, useState } from 'react';
import { DIRECTORIO_URL } from '../config/directorio';
import { leerCatalogo } from './formato';

async function json(url) {
  const res = await fetch(url, { headers: { Accept: 'application/ld+json, application/json' } });
  if (!res.ok) throw new Error(`${url} respondió ${res.status}`);
  return res.json();
}

// Los catálogos publicados, según el directorio de la cooperativa. Cada ficha
// trae el documento y la URL del pod contra la que se resuelven sus rutas.
async function desdeDirectorio() {
  const artistas = await json(`${DIRECTORIO_URL}/musica/artistas`);
  // Mientras nadie haya publicado, el sitio sigue mostrando la lista local
  // en vez de quedar vacío.
  if (artistas.length === 0) throw new Error('el directorio todavía no tiene artistas');
  return Promise.allSettled(
    artistas.map(async (a) => {
      const ficha = await json(`${DIRECTORIO_URL}/musica/artistas/${encodeURIComponent(a.slug)}`);
      return { usuario: a.slug, proyectos: leerCatalogo(ficha.documento, ficha.catalogo) };
    })
  );
}

// Respaldo mientras el directorio no está desplegado: la lista a mano.
async function desdeLista(artistas) {
  return Promise.allSettled(
    artistas.map(async (a) => {
      const url = new URL(a.catalogo, document.baseURI).href;
      return { usuario: a.usuario, proyectos: leerCatalogo(await json(url), url) };
    })
  );
}

// Si el catálogo de un artista no se puede leer, se muestran los demás: uno
// caído no debe dejar la página en blanco.
export function useCatalogo(artistas) {
  const [estado, setEstado] = useState({ cargando: true, proyectos: [], errores: [] });

  useEffect(() => {
    let vigente = true;
    desdeDirectorio()
      .catch((err) => {
        console.warn(`Directorio de música no disponible (${err.message}); se usa la lista local`);
        return desdeLista(artistas);
      })
      .then((resultados) => {
        if (!vigente) return;
        const proyectos = [];
        const errores = [];
        for (const r of resultados) {
          if (r.status === 'fulfilled') proyectos.push(...r.value.proyectos);
          else errores.push(r.reason.message);
        }
        errores.forEach((e) => console.warn(`No se pudo leer un catálogo: ${e}`));
        setEstado({ cargando: false, proyectos, errores });
      });
    return () => {
      vigente = false;
    };
  }, [artistas]);

  return estado;
}
