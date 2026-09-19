import { useEffect, useMemo, useRef, useState } from 'react';

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

// tracks: array de { src, titulo, proyectoTitulo, proyectoSlug, portada }
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

  // Carga la pista cuando cambia currentIndex, y avanza al siguiente track
  // tras el `ended` de arriba (que solo actualiza el índice).
  const lastLoadedIndex = useRef(-1);
  useEffect(() => {
    if (currentIndex === -1 || currentIndex === lastLoadedIndex.current) return;
    const trackIdx = order[currentIndex];
    const track = tracks[trackIdx];
    if (!track) return;
    lastLoadedIndex.current = currentIndex;
    audio.src = track.src;
    setCurrentTime(0);
    setDuration(0);
    audio.play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

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
          trackIdx: currentTrackIdx !== -1 ? currentTrackIdx : null,
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
    const base = tracks.map((_, i) => i);
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
    if (saved && saved.trackIdx !== null && saved.trackIdx !== undefined && tracks[saved.trackIdx]) {
      const orderIndex = initialOrder.indexOf(saved.trackIdx);
      const track = tracks[saved.trackIdx];
      lastLoadedIndex.current = orderIndex;
      audio.src = track.src;
      audio.currentTime = saved.time || 0;
      setCurrentIndex(orderIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks]);

  function playTrackByIndex(trackIdx) {
    const orderIndex = order.indexOf(trackIdx);
    if (orderIndex === currentIndex) {
      if (audio.paused) audio.play();
      else audio.pause();
      return;
    }
    lastLoadedIndex.current = -1;
    setCurrentIndex(orderIndex === -1 ? 0 : orderIndex);
  }

  function playAlbum(proyectoSlug) {
    const firstTrackIdx = tracks.findIndex((t) => t.proyectoSlug === proyectoSlug);
    if (firstTrackIdx === -1) return;
    let activeOrder = order;
    if (shuffle) activeOrder = rebuildOrder(false, true);
    const orderIndex = activeOrder.indexOf(firstTrackIdx);
    lastLoadedIndex.current = -1;
    setCurrentIndex(orderIndex);
  }

  function toggle() {
    if (currentIndex === -1) return;
    if (audio.paused) audio.play();
    else audio.pause();
  }

  function prev() {
    if (currentIndex > 0) {
      lastLoadedIndex.current = -1;
      setCurrentIndex(currentIndex - 1);
    } else if (currentIndex === 0 && repeatMode === 'all') {
      lastLoadedIndex.current = -1;
      setCurrentIndex(order.length - 1);
    }
  }

  function next() {
    if (currentIndex !== -1 && currentIndex < order.length - 1) {
      lastLoadedIndex.current = -1;
      setCurrentIndex(currentIndex + 1);
    } else if (currentIndex !== -1 && repeatMode === 'all') {
      lastLoadedIndex.current = -1;
      setCurrentIndex(0);
    }
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
    toggle,
    prev,
    next,
    toggleShuffle,
    cycleRepeat,
    seekToRatio,
  };
}
