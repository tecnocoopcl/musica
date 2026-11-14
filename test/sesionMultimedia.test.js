import assert from 'node:assert/strict';
import test from 'node:test';
import { metadatosDe } from '../src/player/sesionMultimedia.js';

const BASE = 'https://musica.tecnocooperativa.cl/';

test('sin pista no hay metadatos', () => {
  assert.equal(metadatosDe(null, BASE), null);
});

test('título, artista, disco y portada con su tipo', () => {
  const m = metadatosDe(
    { titulo: 'male', proyectoTitulo: 'Ana', disco: 'Raíces', portada: 'https://pod.aebn.cl/ana/portadas/raices.jpg' },
    BASE
  );
  assert.deepEqual(m, {
    title: 'male',
    artist: 'Ana',
    album: 'Raíces',
    artwork: [{ src: 'https://pod.aebn.cl/ana/portadas/raices.jpg', type: 'image/jpeg' }],
  });
});

test('una portada relativa se vuelve absoluta', () => {
  const m = metadatosDe({ titulo: 'x', portada: '/portadas/a.png' }, BASE);
  assert.deepEqual(m.artwork, [{ src: 'https://musica.tecnocooperativa.cl/portadas/a.png', type: 'image/png' }]);
});

test('sin portada, artwork vacío', () => {
  assert.deepEqual(metadatosDe({ titulo: 'x' }, BASE).artwork, []);
});
