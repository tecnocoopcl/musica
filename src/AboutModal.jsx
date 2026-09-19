import { Modal } from './Modal';

export function AboutModal({ onClose }) {
  return (
    <Modal
      wrapperClassName="about-modal"
      backdropClassName="about-modal-backdrop"
      contentClassName="about-modal-content"
      titleId="about-modal-title"
      onClose={onClose}
    >
      <button className="about-modal-close" aria-label="Cerrar" onClick={onClose}>
        <span aria-hidden="true">&times;</span>
      </button>
      <h2 id="about-modal-title">¿Qué es esto?</h2>
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
    </Modal>
  );
}
