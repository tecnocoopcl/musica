export const IconPlay = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
);

export const IconPause = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
  </svg>
);

export const IconPrev = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
  </svg>
);

export const IconNext = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M16 6h2v12h-2zM6 6l8.5 6L6 18z" />
  </svg>
);

export const IconShuffle = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17 4v2h1.59l-4.3 4.3 1.42 1.4L20 7.41V9h2V4zm-6.3 5.29L3 17l1.41 1.41 7.71-7.7zM17 20v-2h1.59l-2.3-2.3 1.42-1.4 2.29 2.29V15h2v5zM3 7l5.7 5.7 1.42-1.4L4.41 6H6V4H1v5h2z" />
  </svg>
);

export const IconRepeat = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 7h10v3l4-4-4-4v3H5v6h2zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2z" />
  </svg>
);

export const IconVolume = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2A4.5 4.5 0 0 0 14 7.97v8.05A4.48 4.48 0 0 0 16.5 12z" />
  </svg>
);

export const IconVideo = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11z" />
  </svg>
);

// Íconos de la interfaz (barra lateral, buscador, biblioteca). Mismos trazos
// de 24px que los del reproductor; toman el color del texto.

export const IconHome = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3 3 10.5V21h6.5v-6h5v6H21V10.5z" />
  </svg>
);

export const IconLibrary = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 3h12a1 1 0 0 1 1 1v17.2l-7-4.4-7 4.4V4a1 1 0 0 1 1-1zm1 2v12.6l5-3.1 5 3.1V5z" />
  </svg>
);

export const IconSearch = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M10 3a7 7 0 0 1 5.6 11.2l5.1 5.1-1.4 1.4-5.1-5.1A7 7 0 1 1 10 3zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" />
  </svg>
);

export const IconPlus = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" />
  </svg>
);

export const IconMenu = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
  </svg>
);

export const IconChevron = ({ direction = 'right' }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" style={direction === 'left' ? { transform: 'scaleX(-1)' } : undefined}>
    <path d="m9.4 5.6 1.4-1.4 7.8 7.8-7.8 7.8-1.4-1.4 6.4-6.4z" />
  </svg>
);

export const IconHeart = ({ filled }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 20s-7-4.3-9-8.6C1.7 8.2 3.6 5 6.9 5c2 0 3.4 1.1 5.1 3 1.7-1.9 3.1-3 5.1-3 3.3 0 5.2 3.2 3.9 6.4C19 15.7 12 20 12 20z"
      style={filled ? undefined : { fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}
    />
  </svg>
);

export const IconPlaylistAdd = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 6h12v2H3zm0 4h12v2H3zm0 4h8v2H3zm14 0v-4h2v4h4v2h-4v4h-2v-4h-4v-2z" />
  </svg>
);

export const IconTrash = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 3h6l1 2h4v2H4V5h4zM6 9h12l-1 12H7zm4 2v8h1.5v-8zm2.5 0v8H14v-8z" />
  </svg>
);

export const IconClose = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4z" />
  </svg>
);
