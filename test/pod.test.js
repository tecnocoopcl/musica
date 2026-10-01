import assert from 'node:assert/strict';
import { test } from 'node:test';
import { borrarArchivo, hacerPublico, slugUnico, slugify, subirArchivo } from '../src/estudio/pod.js';

function podFalso() {
  const pedidos = [];
  return {
    pedidos,
    paths: { app: (p) => 'https://pod.example/u/musica/' + p },
    fetch: async (url, init = {}) => {
      pedidos.push({ url, ...init });
      if (init.method === 'HEAD') return new Response(null, { status: 200, headers: { Link: '<.acl>; rel="acl"' } });
      if (init.method === 'DELETE') return new Response(null, { status: url.includes('no-existe') ? 404 : 205 });
      return new Response(null, { status: 201 });
    },
  };
}

test('los slugs salen del título, sin tildes ni símbolos', () => {
  assert.equal(slugify('Exploraciones ambientales (EP)'), 'exploraciones-ambientales-ep');
  assert.equal(slugify('naguará'), 'naguara');
  assert.equal(slugify('¡¿?!'), 'sin-titulo');
});

test('un slug repetido recibe un número', () => {
  assert.equal(slugUnico('Demo', ['demo', 'demo-2']), 'demo-3');
  assert.equal(slugUnico('Demo', []), 'demo');
});

test('subir un archivo lo deja en publico/ con su tipo', async () => {
  const espacio = podFalso();
  const ruta = await subirArchivo(espacio, 'audios/male/naguara.mp3', new File(['x'], 'naguará.mp3'));
  assert.equal(ruta, 'audios/male/naguara.mp3');
  assert.equal(espacio.pedidos[0].url, 'https://pod.example/u/musica/publico/audios/male/naguara.mp3');
  assert.equal(espacio.pedidos[0].headers['Content-Type'], 'audio/mpeg');
});

test('borrar algo que ya no está no es un error, y nunca borra URLs externas', async () => {
  const espacio = podFalso();
  await borrarArchivo(espacio, 'audios/no-existe.mp3');
  await borrarArchivo(espacio, 'https://otro.example/a.mp3');
  assert.equal(espacio.pedidos.length, 1);
});

test('hacer público escribe el ACL que anuncia el pod y conserva Control del dueño', async () => {
  const espacio = podFalso();
  await hacerPublico(espacio, 'https://pod.example/u/profile/card#me');
  const put = espacio.pedidos.find((p) => p.method === 'PUT');
  assert.equal(put.url, 'https://pod.example/u/musica/publico/.acl');
  assert.match(put.body, /acl:agent <https:\/\/pod\.example\/u\/profile\/card#me>;[\s\S]*acl:Control/);
  assert.match(put.body, /acl:agentClass foaf:Agent;[\s\S]*acl:default <\.\/>;\s*acl:mode acl:Read\./);
});
