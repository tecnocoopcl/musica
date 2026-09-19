export function AboutModal({ onClose }) {
  return (
    <div className="about-modal">
      <div className="about-modal-backdrop" onClick={onClose} />
      <div className="about-modal-content">
        <button className="about-modal-close" aria-label="Cerrar" onClick={onClose}>
          &times;
        </button>
        <h2>¿Qué es esto?</h2>
        <p>
          Este es el reproductor de música de tecnocoop. Aquí se publican proyectos musicales de
          distintos artistas de la cooperativa — como <strong>male</strong> y <strong>siniestra</strong> —
          para que los puedas escuchar directamente, ver sus videos cuando existan, descargarlos
          en distintos formatos y, si te gusta lo que escuchas, apoyarlos.
        </p>
        <p>
          No es una plataforma de streaming ni un sello discográfico: cada artista mantiene su
          catálogo en su propio Solid Pod y decide qué compartir y cómo. Este sitio solo lo lee.
        </p>
      </div>
    </div>
  );
}
