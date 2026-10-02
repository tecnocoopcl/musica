import { useEffect, useRef, useState } from 'react';
import { IconChevron } from './player/icons';

// Sección con título y un carrusel horizontal, como las filas de la portada.
// Las flechas solo aparecen si hay más contenido hacia ese lado.
export function Fila({ titulo, acciones, children }) {
  const pista = useRef(null);
  const [bordes, setBordes] = useState({ inicio: true, fin: true });

  useEffect(() => {
    const el = pista.current;
    if (!el) return;
    function medir() {
      setBordes({
        inicio: el.scrollLeft <= 1,
        fin: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1,
      });
    }
    medir();
    el.addEventListener('scroll', medir, { passive: true });
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', medir);
      ro.disconnect();
    };
  }, [children]);

  function desplazar(sentido) {
    const el = pista.current;
    el.scrollBy({ left: sentido * el.clientWidth * 0.85, behavior: 'smooth' });
  }

  return (
    <section className="fila" aria-label={titulo}>
      <div className="fila-cabecera">
        <h2>{titulo}</h2>
        <div className="fila-acciones">
          {acciones}
          {!(bordes.inicio && bordes.fin) && (
            <>
              <button type="button" className="fila-flecha" aria-label="Anteriores" disabled={bordes.inicio} onClick={() => desplazar(-1)}>
                <IconChevron direction="left" />
              </button>
              <button type="button" className="fila-flecha" aria-label="Siguientes" disabled={bordes.fin} onClick={() => desplazar(1)}>
                <IconChevron />
              </button>
            </>
          )}
        </div>
      </div>
      <div className="fila-pista" ref={pista}>
        {children}
      </div>
    </section>
  );
}
