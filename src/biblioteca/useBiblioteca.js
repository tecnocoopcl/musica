import { useEffect, useRef, useState } from 'react';
import { bibliotecaUrl, ConflictoPod, guardarJson, leerJson } from '../pod/solid';
import { BIBLIOTECA_VACIA, desdePod, estaVacia, haciaPod } from './formato';

const STORAGE_KEY = 'musica-biblioteca';

function cargarLocal() {
  try {
    const guardada = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return guardada ? { ...BIBLIOTECA_VACIA, ...guardada } : BIBLIOTECA_VACIA;
  } catch {
    return BIBLIOTECA_VACIA;
  }
}

function guardarLocal(biblioteca) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(biblioteca));
  } catch {
    /* localStorage puede no estar disponible */
  }
}

// Playlists y artistas favoritos de quien escucha.
//
// Sin sesión viven en el navegador. Con sesión, el pod manda: al conectar se
// lee <pod>/Aplicaciones/musica/biblioteca.json (si no existe, se sube lo que había en
// el navegador) y cada cambio se escribe ahí. El navegador queda como copia.
//
// sync: 'local' | 'cargando' | 'sincronizada' | 'guardando' | 'conflicto' | 'error'
export function useBiblioteca(webId) {
  const [biblioteca, setBiblioteca] = useState(cargarLocal);
  const [sync, setSync] = useState(webId ? 'cargando' : 'local');
  const pod = useRef({ url: null, etag: null, existe: false, listo: false, cola: Promise.resolve() });
  // El último cambio vino del pod: no hay que volver a escribirlo.
  const vinoDelPod = useRef(false);

  function aplicarDelPod(datos, etag) {
    Object.assign(pod.current, { etag, existe: true });
    vinoDelPod.current = true;
    setBiblioteca(desdePod(datos));
  }

  async function subir(bib) {
    const p = pod.current;
    try {
      p.etag = await guardarJson(p.url, haciaPod(bib), p);
      p.existe = true;
      setSync('sincronizada');
    } catch (err) {
      if (!(err instanceof ConflictoPod)) {
        console.warn(`No se pudo guardar la biblioteca en el pod: ${err.message}`);
        setSync('error');
        return;
      }
      // Otro dispositivo escribió antes: gana el pod y se avisa.
      const { datos, etag } = await leerJson(p.url);
      aplicarDelPod(datos, etag);
      setSync('conflicto');
    }
  }

  function encolar(bib) {
    pod.current.cola = pod.current.cola.then(() => subir(bib));
  }

  useEffect(() => {
    pod.current.listo = false;
    if (!webId) {
      setSync('local');
      return;
    }
    let vigente = true;
    setSync('cargando');
    (async () => {
      const url = await bibliotecaUrl(webId);
      const { datos, etag } = await leerJson(url);
      if (!vigente) return;
      Object.assign(pod.current, { url, etag, existe: Boolean(datos), listo: true });
      if (datos) {
        aplicarDelPod(datos, etag);
        setSync('sincronizada');
      } else if (!estaVacia(cargarLocal())) {
        setSync('guardando');
        encolar(cargarLocal());
      } else {
        setSync('sincronizada');
      }
    })().catch((err) => {
      console.warn(`No se pudo leer la biblioteca del pod: ${err.message}`);
      if (vigente) setSync('error');
    });
    return () => {
      vigente = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webId]);

  useEffect(() => {
    guardarLocal(biblioteca);
    if (vinoDelPod.current) {
      vinoDelPod.current = false;
      return;
    }
    if (!pod.current.listo) return;
    setSync('guardando');
    const t = setTimeout(() => encolar(biblioteca), 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [biblioteca]);

  function cambiarPlaylist(id, fn) {
    setBiblioteca((b) => ({ ...b, playlists: b.playlists.map((p) => (p.id === id ? fn(p) : p)) }));
  }

  return {
    ...biblioteca,
    sync,
    crearPlaylist(nombre, canciones = []) {
      const id = crypto.randomUUID().slice(0, 8);
      setBiblioteca((b) => ({ ...b, playlists: [...b.playlists, { id, nombre, canciones }] }));
      return id;
    },
    renombrarPlaylist(id, nombre) {
      cambiarPlaylist(id, (p) => ({ ...p, nombre }));
    },
    borrarPlaylist(id) {
      setBiblioteca((b) => ({ ...b, playlists: b.playlists.filter((p) => p.id !== id) }));
    },
    agregarAPlaylist(id, cancion) {
      cambiarPlaylist(id, (p) =>
        p.canciones.some((c) => c.src === cancion.src) ? p : { ...p, canciones: [...p.canciones, cancion] }
      );
    },
    quitarDePlaylist(id, src) {
      cambiarPlaylist(id, (p) => ({ ...p, canciones: p.canciones.filter((c) => c.src !== src) }));
    },
    esFavorito(slug) {
      return biblioteca.artistasFavoritos.includes(slug);
    },
    alternarFavorito(slug) {
      setBiblioteca((b) => ({
        ...b,
        artistasFavoritos: b.artistasFavoritos.includes(slug)
          ? b.artistasFavoritos.filter((s) => s !== slug)
          : [...b.artistasFavoritos, slug],
      }));
    },
  };
}
