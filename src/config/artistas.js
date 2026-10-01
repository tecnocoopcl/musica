// Respaldo de Escuchar cuando el directorio de la cooperativa
// (tecno-cooperativa-backend, /musica/artistas) no responde. Cuando esté
// desplegado, esta lista se puede borrar.
//
// Una URL relativa se resuelve contra el sitio: './catalogo.jsonld' es la
// copia en public/, útil mientras la música no está en el pod. Para leer del
// pod, apuntar a https://<servidor>/<usuario>/musica/publico/catalogo.jsonld.
export const artistas = [
  {
    usuario: 'alebustos',
    catalogo: './catalogo.jsonld',
  },
];
