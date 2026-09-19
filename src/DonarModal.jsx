import { Modal } from './Modal';

export function DonarModal({ href, onClose }) {
  return (
    <Modal
      wrapperClassName="donar-modal"
      backdropClassName="donar-modal-backdrop"
      contentClassName="donar-modal-content"
      titleId="donar-modal-title"
      onClose={onClose}
    >
      <button className="donar-modal-close" aria-label="Cerrar" onClick={onClose}>
        <span aria-hidden="true">&times;</span>
      </button>
      <h2 id="donar-modal-title">¡Gracias de antemano!</h2>
      <p>
        Cualquier aporte ayuda a que este proyecto siga vivo — tú eliges el monto en Mercado
        Pago. Vas a salir de este sitio para completar la donación.
      </p>
      <a className="donar-modal-link" href={href} target="_blank" rel="noopener">
        Ir a Mercado Pago
      </a>
      <p className="donar-modal-volver">Cuando termines, puedes volver a esta página cuando quieras.</p>
    </Modal>
  );
}
