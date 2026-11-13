import { useEffect, useMemo, useRef, useState } from 'react';
import { anotarEscucha } from './anotarEscucha';
import { seguimiento } from './escuchas';
import { metadatosDe } from './sesionMultimedia';

const STORAGE_KEY = 'musica-player-state';

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadSavedState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}

// tracks: array de { src, titulo, proyectoTitulo, disco, proyectoSlug, portada,
// cuenta, artistaSlug, discoSlug, pistaSlug }
export function usePlayer(tracks) {
  const audioRef = useRef(null);
  if (!audioRef.current) audioRef.current = new Audio();
  const audio = audioRef.current;

  const saved = useMemo(loadSavedState, []);

  const [order, setOrder] = useState(() => tracks.map((_, i) => i));
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [shuffle, setShuffle] = useState(() => Boolean(saved?.shuffle));
  const [repeatMode, setRepeatMode] = useState(() => saved?.repeatMode || 'off');
  const [volume, setVolume] = useState(() => (typeof saved?.volume === 'number' ? saved.volume : 1));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [durations, setDurations] = useState({});
  // Sube cada vez que se pide reproducir algo, aunque currentIndex no cambie
  // (p. ej. empezar otra playlist desde la posición 0).
  const [carga, setCarga] = useState(0);
  // Pistas de la cola actual: null es el catálogo completo; una playlist la
  // reemplaza por sus canciones.
  const queueBase = useRef(null);

  const currentTrackIdx = currentIndex !== -1 ? order[currentIndex] : -1;

  // Duración de cada pista (probe silencioso, igual que el original)
  useEffect(() => {
    const probes = tracks.map((t) => {
      const probe = new Audio(t.src);
      const onMeta = () => setDurations((d) => ({ ...d, [t.src]: probe.duration }));
      probe.addEventListener('loadedmetadata', onMeta);
      return { probe, onMeta };
    });
    return () => probes.forEach(({ probe, onMeta }) => probe.removeEventListener('loadedmetadata', onMeta));
  }, [tracks]);

  useEffect(() => {
    audio.volume = volume;
  }, [audio, volume]);

  useEffect(() => {
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTime = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
    };
    const onEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
        return;
      }
      setCurrentIndex((idx) => {
        if (idx !== -1 && idx < order.length - 1) {
          return idx + 1;
        }
        if (repeatMode === 'all' && order.length > 0) return 0;
        return idx;
      });
    };
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audio, order, repeatMode]);

  // Escuchas (ADR-032 de espacio): cada pista cuenta una vez al oír 30 s o el
  // 80 %, sin sumar los saltos. Se sigue con sus propios oyentes del audio
  // para no tocar los de la reproducción. Al repetir la misma pista (repeat
  // one) vuelve a contar: el backend ya descarta repeticiones seguidas.
  const pistaSonando = useRef(null);
  const oido = useRef(seguimiento());
  useEffect(() => {
    const desde = () => oido.current.desde(audio.currentTime);
    const alAvanzar = () => {
      if (oido.current.avanzar(audio.currentTime, audio.duration)) anotarEscucha(pistaSonando.current);
    };
    const alTerminar = () => {
      oido.current = seguimiento();
      oido.current.desde(0);
    };
    audio.addEventListener('play', desde);
    audio.addEventListener('seeked', desde);
    audio.addEventListener('timeupdate', alAvanzar);
    audio.addEventListener('ended', alTerminar);
    return () => {
      audio.removeEventListener('play', desde);
      audio.removeEventListener('seeked', desde);
      audio.removeEventListener('timeupdate', alAvanzar);
      audio.removeEventListener('ended', alTerminar);
    };
  }, [audio]);

  // Carga la pista cuando cambia currentIndex, y avanza al siguiente track
  // tras el `ended` de arriba (que solo actualiza el índice).
  const lastLoadedIndex = useRef(-1);
  useEffect(() => {
    if (currentIndex === -1 || currentIndex === lastLoadedIndex.current) return;
    const trackIdx = order[currentIndex];
    const track = tracks[trackIdx];
    if (!track) return;
    lastLoadedIndex.current = currentIndex;
    pistaSonando.current = track;
    oido.current = seguimiento();
    oido.current.desde(0);
    audio.src = track.src;
    setCurrentTime(0);
    setDuration(0);
    audio.play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, carga]);

  // Pantalla bloqueada y centro de control: título, artista, disco y
  // portada de lo que suena (las portadas del pod se leen sin sesión, así que
  // el sistema las puede bajar por su cuenta).
  const pistaActual = currentTrackIdx !== -1 ? tracks[currentTrackIdx] : null;
  useEffect(() => {
    if (!('mediaSession' in navigator) || typeof MediaMetadata === 'undefined') return;
    const datos = metadatosDe(pistaActual, location.href);
    navigator.mediaSession.metadata = datos ? new MediaMetadata(datos) : null;
  }, [pistaActual]);

  // Sus controles. Se rehacen en cada render: prev y next dependen de la cola.
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    const acciones = {
      play: () => audio.play(),
      pause: () => audio.pause(),
      previoustrack: prev,
      nexttrack: next,
      seekto: (e) => {
        if (Number.isFinite(e.seekTime)) audio.currentTime = e.seekTime;
      },
    };
    for (const [accion, fn] of Object.entries(acciones)) {
      try {
        navigator.mediaSession.setActionHandler(accion, fn);
      } catch {
        // Acción no soportada en este navegador.
      }
    }
  });

  useEffect(() => {
    const handler = () => saveState();
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  function saveState() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          // Por src y no por índice: la lista cambia entre el catálogo y la
          // página de cada artista.
          src: currentTrackIdx !== -1 ? tracks[currentTrackIdx].src : null,
          time: audio.currentTime || 0,
          volume: audio.volume,
          shuffle,
          repeatMode,
        })
      );
    } catch {
      /* localStorage puede no estar disponible */
    }
  }

  function rebuildOrder(keepCurrent, nextShuffle) {
    const useShuffle = nextShuffle ?? shuffle;
    const base = queueBase.current || tracks.map((_, i) => i);
    let nextOrder = useShuffle ? shuffleArray(base) : base;
    let nextIndex = currentIndex;
    if (keepCurrent && currentTrackIdx !== -1) {
      const pos = nextOrder.indexOf(currentTrackIdx);
      nextOrder.splice(pos, 1);
      nextOrder.unshift(currentTrackIdx);
      nextIndex = 0;
    }
    setOrder(nextOrder);
    setCurrentIndex(nextIndex);
    return nextOrder;
  }

  // Orden inicial + restaurar pista guardada
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current || tracks.length === 0) return;
    initialized.current = true;
    const initialOrder = rebuildOrder(false, shuffle);
    const savedIdx = saved?.src ? tracks.findIndex((t) => t.src === saved.src) : -1;
    if (savedIdx !== -1) {
      const orderIndex = initialOrder.indexOf(savedIdx);
      const track = tracks[savedIdx];
      lastLoadedIndex.current = orderIndex;
      pistaSonando.current = track;
      oido.current = seguimiento();
      audio.src = track.src;
      audio.currentTime = saved.time || 0;
      setCurrentIndex(orderIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks]);

  function irA(orderIndex) {
    lastLoadedIndex.current = -1;
    setCurrentIndex(orderIndex);
    setCarga((c) => c + 1);
  }

  // Vuelve a la cola del catálogo completo si la actual es una playlist.
  function ordenDelCatalogo() {
    if (!queueBase.current) return order;
    queueBase.current = null;
    return rebuildOrder(false);
  }

  function playTrackByIndex(trackIdx) {
    if (trackIdx === -1) return;
    if (trackIdx === currentTrackIdx) {
      if (audio.paused) audio.play();
      else audio.pause();
      return;
    }
    let activeOrder = order;
    if (!activeOrder.includes(trackIdx)) activeOrder = ordenDelCatalogo();
    irA(activeOrder.indexOf(trackIdx));
  }

  function playAlbum(proyectoSlug) {
    const firstTrackIdx = tracks.findIndex((t) => t.proyectoSlug === proyectoSlug);
    if (firstTrackIdx === -1) return;
    let activeOrder = ordenDelCatalogo();
    if (shuffle) activeOrder = rebuildOrder(false, true);
    irA(activeOrder.indexOf(firstTrackIdx));
  }

  // Reproduce una lista de pistas (por src) como cola propia, empezando en
  // `desde`. Las que ya no están en el catálogo se saltan.
  function playQueue(srcs, desde = 0) {
    const idxs = srcs.map((src) => tracks.findIndex((t) => t.src === src));
    const primera = idxs[desde] ?? -1;
    const base = idxs.filter((i) => i !== -1);
    if (base.length === 0) return;
    const inicio = primera !== -1 ? primera : base[0];
    queueBase.current = base;
    const nextOrder = shuffle ? [inicio, ...shuffleArray(base.filter((i) => i !== inicio))] : base;
    setOrder(nextOrder);
    irA(nextOrder.indexOf(inicio));
  }

  function toggle() {
    if (currentIndex === -1) return;
    if (audio.paused) audio.play();
    else audio.pause();
  }

  function prev() {
    if (currentIndex > 0) irA(currentIndex - 1);
    else if (currentIndex === 0 && repeatMode === 'all') irA(order.length - 1);
  }

  function next() {
    if (currentIndex !== -1 && currentIndex < order.length - 1) irA(currentIndex + 1);
    else if (currentIndex !== -1 && repeatMode === 'all') irA(0);
  }

  function toggleShuffle() {
    const next = !shuffle;
    setShuffle(next);
    rebuildOrder(true, next);
  }

  function cycleRepeat() {
    setRepeatMode((m) => (m === 'off' ? 'all' : m === 'all' ? 'one' : 'off'));
  }

  function seekToRatio(ratio) {
    if (currentIndex === -1 || !audio.duration) return;
    audio.currentTime = Math.min(Math.max(ratio, 0), 1) * audio.duration;
  }

  function trackIndexBySrc(src) {
    return tracks.findIndex((t) => t.src === src);
  }

  return {
    currentTrackIdx,
    currentTrack: currentTrackIdx !== -1 ? tracks[currentTrackIdx] : null,
    trackIndexBySrc,
    isPlaying,
    shuffle,
    repeatMode,
    volume,
    currentTime,
    duration,
    durations,
    setVolume,
    playTrackByIndex,
    playAlbum,
    playQueue,
    toggle,
    prev,
    next,
    toggleShuffle,
    cycleRepeat,
    seekToRatio,
  };
}
