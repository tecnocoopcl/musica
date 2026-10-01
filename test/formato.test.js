import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { escribirCatalogo, leerCatalogo } from '../src/catalogo/formato.js';

const doc = JSON.parse(readFileSync(new URL('../public/catalogo.jsonld', import.meta.url), 'utf8'));
const BASE = 'https://pods.example/alebustos/musica/publico/catalogo.jsonld';

test('las rutas relativas se resuelven contra la URL del catálogo', () => {
  const [male] = leerCatalogo(doc, BASE);
  assert.equal(male.portada, 'https://pods.example/alebustos/musica/publico/portadas/male-cover.jpg');
  assert.equal(male.canciones[0].archivos[0].url, 'https://pods.example/alebustos/musica/publico/audios/naguara.mp3');
});

test('sencillo, álbum, streaming y apoyo llegan a la forma que usa la interfaz', () => {
  const [male, siniestra] = leerCatalogo(doc, BASE);
  assert.equal(male.titulo, 'male');
  assert.equal(male.sencillo, 'naguará');
  assert.equal(male.album, undefined);
  assert.equal(male.anio, 2025);
  assert.equal(male.tipo, 'acustico');
  assert.deepEqual(male.apoyo, { mensual: 'https://mpago.la/26cXj8R', unico: 'https://link.mercadopago.cl/alejandrobstsnnz' });
  assert.equal(male.canciones[0].precio, 1000);

  assert.equal(siniestra.album, 'Exploraciones ambientales');
  assert.deepEqual(siniestra.streaming.map((s) => s.nombre), ['Apple Music', 'YouTube']);
  assert.equal(siniestra.canciones[2].archivos.length, 2);
  assert.equal(siniestra.canciones[2].linkPago, '');
});

test('leer y volver a escribir deja el mismo documento', () => {
  assert.deepEqual(escribirCatalogo(leerCatalogo(doc), { nombre: doc.name }), doc);
});

test('un documento sin proyectos es un error, no una página vacía', () => {
  assert.throws(() => leerCatalogo({ '@type': 'ItemList' }, BASE), /itemListElement/);
});
