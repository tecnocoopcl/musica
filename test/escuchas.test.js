import assert from 'node:assert/strict';
import test from 'node:test';
import { seguimiento, umbral } from '../src/player/escuchas.js';

// Simula `timeupdate` cada 0,25 s desde `desde` hasta `hasta`.
function sonar(s, desde, hasta, duracion) {
  const r = [];
  for (let t = desde; t <= hasta + 1e-9; t += 0.25) r.push(s.avanzar(t, duracion));
  return r;
}

test('el umbral es 30 s o el 80 %, lo que llegue antes', () => {
  assert.equal(umbral(200), 30);
  assert.equal(umbral(20), 16);
  assert.equal(umbral(0), 30);
  assert.equal(umbral(Number.NaN), 30);
});

test('una canción cuenta a los 30 s, una sola vez', () => {
  const s = seguimiento();
  s.desde(0);
  const r = sonar(s, 0, 60, 200);
  assert.equal(r.filter(Boolean).length, 1);
  assert.ok(Math.abs(r.indexOf(true) * 0.25 - 30) <= 0.25);
});

test('un intro corto cuenta al 80 %', () => {
  const s = seguimiento();
  s.desde(0);
  assert.equal(sonar(s, 0, 20, 20).filter(Boolean).length, 1);
  assert.ok(s.oido >= 16);
});

test('adelantar no suma', () => {
  const s = seguimiento();
  s.desde(0);
  sonar(s, 0, 5, 200);
  assert.equal(s.avanzar(150, 200), false);
  assert.ok(s.oido < 6);
  assert.equal(s.contada, false);
});

test('retomar donde iba no cuenta lo anterior', () => {
  const s = seguimiento();
  s.desde(120);
  assert.equal(s.avanzar(120.25, 200), false);
  assert.ok(s.oido <= 0.25);
});
