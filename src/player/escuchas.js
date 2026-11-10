// Cuándo una canción cuenta como escuchada (ADR-032 de espacio): a los 30 s
// oídos o al 80 % de la pista, lo que llegue antes. Solo suma lo que de
// verdad sonó: adelantar o saltar no cuenta, y en pausa no avanza.
//
// Es la misma lógica que audioteca.aebn.cl (src/escuchas.js) con otro umbral:
// allá una charla cuenta al 80 % o a los 5 min.
//
// Sin React ni DOM, para probarlo con `node --test`.

export const MINIMO_SEGUNDOS = 30;
export const FRACCION = 0.8;
// Entre dos `timeupdate` seguidos pasan ~0,25 s (hasta ~1 s con la pestaña
// en segundo plano); más que esto es un salto.
const MAX_PASO = 2;

// Segundos que hay que oír para que cuente. Sin duración conocida, 30 s.
export function umbral(duracion) {
  if (!Number.isFinite(duracion) || duracion <= 0) return MINIMO_SEGUNDOS;
  return Math.min(FRACCION * duracion, MINIMO_SEGUNDOS);
}

// Lleva lo oído de una pista. `avanzar(t, duracion)` recibe la posición en
// cada `timeupdate` y devuelve true una sola vez, al cruzar el umbral.
// `desde(t)` fija la posición sin sumar (al empezar, reanudar o adelantar).
export function seguimiento() {
  let ultima = null;
  let oido = 0;
  let contada = false;

  return {
    get oido() {
      return oido;
    },
    get contada() {
      return contada;
    },
    desde(t) {
      ultima = t;
    },
    avanzar(t, duracion) {
      const paso = ultima === null ? 0 : t - ultima;
      ultima = t;
      if (paso > 0 && paso <= MAX_PASO) oido += paso;
      if (contada || oido < umbral(duracion)) return false;
      contada = true;
      return true;
    },
  };
}
