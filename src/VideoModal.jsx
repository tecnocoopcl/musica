export function VideoModal({ video, titulo, onClose }) {
  return (
    <div className="video-modal">
      <div className="video-modal-backdrop" onClick={onClose} />
      <div className="video-modal-content">
        <button className="video-modal-close" aria-label="Cerrar video" onClick={onClose}>
          &times;
        </button>
        <p className="video-modal-titulo">{titulo}</p>
        <video src={video} controls autoPlay />
      </div>
    </div>
  );
}
