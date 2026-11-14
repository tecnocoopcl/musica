import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generosDe, generosParaFiltrar, tieneGenero } from '../src/catalogo/generos.js';

const disco = (genero) => ({ genero });

test('separa el género libre por comas y barras', () => {
  assert.deepEqual(generosDe(disco('rock, psicodelico')), ['rock', 'psicodelico']);
  assert.deepEqual(generosDe(disco('folk / ambient')), ['folk', 'ambient']);
  assert.deepEqual(generosDe(disco(undefined)), []);
});

test('un solo disco con género no muestra el filtro', () => {
  assert.deepEqual(generosParaFiltrar([disco('rock, psicodelico'), disco(undefined), disco('')]), []);
});

test('dos discos con el mismo género no muestran el filtro', () => {
  assert.deepEqual(generosParaFiltrar([disco('Rock'), disco('rock')]), []);
});

test('géneros repartidos en varios discos sí lo muestran, sin repetir', () => {
  assert.deepEqual(generosParaFiltrar([disco('rock, psicodelico'), disco('Ambient'), disco('ROCK')]), ['Ambient', 'psicodelico', 'rock']);
});

test('filtrar por un género encuentra los discos que lo incluyen', () => {
  assert.equal(tieneGenero(disco('rock, psicodelico'), 'Psicodelico'), true);
  assert.equal(tieneGenero(disco('ambient'), 'rock'), false);
});
