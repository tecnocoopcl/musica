import { Modal } from './Modal';

export function VideoModal({ video, titulo, onClose }) {
  return (
    <Modal
      wrapperClassName="video-modal"
      backdropClassName="video-modal-backdrop"
      contentClassName="video-modal-content"
      titleId="video-modal-title"
      onClose={onClose}
    >
      <button type="button" className="video-modal-close" aria-label="Cerrar video" onClick={onClose}>
        <span aria-hidden="true">&times;</span>
      </button>
      <p className="video-modal-titulo" id="video-modal-title">
        {titulo}
      </p>
      <video src={video} controls autoPlay />
    </Modal>
  );
}
