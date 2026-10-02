import { useState } from 'react';
import { Modal } from './Modal';
import { conectar, resolverProveedor, PROVEEDOR_POR_DEFECTO } from './pod/solid';

export function ConectarModal({ onClose }) {
  const [entrada, setEntrada] = useState(PROVEEDOR_POR_DEFECTO);
  const [estado, setEstado] = useState({ enviando: false, error: null });

  async function handleSubmit(e) {
    e.preventDefault();
    setEstado({ enviando: true, error: null });
    try {
      await conectar(await resolverProveedor(entrada));
      // login() redirige al proveedor; si vuelve aquí, algo falló.
    } catch (err) {
      setEstado({ enviando: false, error: err.message || 'No se pudo conectar.' });
    }
  }

  return (
    <Modal
      wrapperClassName="about-modal"
      backdropClassName="about-modal-backdrop"
      contentClassName="about-modal-content"
      titleId="conectar-modal-title"
      onClose={onClose}
    >
      <button type="button" className="about-modal-close" aria-label="Cerrar" onClick={onClose}>
        <span aria-hidden="true">&times;</span>
      </button>
      <h2 id="conectar-modal-title">Conectar con WebID</h2>
      <p>
        Tus playlists y artistas favoritos se guardan en <strong>tu propio Solid Pod</strong>, no en
        este sitio. Así los tienes en cualquier dispositivo y siguen siendo tuyos.
      </p>
      <form className="conectar-form" onSubmit={handleSubmit}>
        <label htmlFor="conectar-entrada">Tu WebID o proveedor de identidad</label>
        <input
          id="conectar-entrada"
          type="text"
          inputMode="url"
          autoComplete="url"
          spellCheck="false"
          required
          value={entrada}
          onChange={(e) => setEntrada(e.target.value)}
        />
        {estado.error && (
          <p className="conectar-error" role="alert">
            {estado.error}
          </p>
        )}
        <button type="submit" className="conectar-enviar" disabled={estado.enviando}>
          {estado.enviando ? 'Conectando…' : 'Conectar'}
        </button>
      </form>
    </Modal>
  );
}
