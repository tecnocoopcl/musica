export function DonarModal({ href, onClose }) {
  return (
    <div className="donar-modal">
      <div className="donar-modal-backdrop" onClick={onClose} />
      <div className="donar-modal-content">
        <button className="donar-modal-close" aria-label="Cerrar" onClick={onClose}>
          &times;
        </button>
        <h2>¡Gracias de antemano!</h2>
        <p>
          Cualquier aporte ayuda a que este proyecto siga vivo — tú eliges el monto en Mercado
          Pago. Vas a salir de este sitio para completar la donación.
        </p>
        <a className="donar-modal-link" href={href} target="_blank" rel="noopener">
          Ir a Mercado Pago
        </a>
        <p className="donar-modal-volver">Cuando termines, puedes volver a esta página cuando quieras.</p>
      </div>
    </div>
  );
}
