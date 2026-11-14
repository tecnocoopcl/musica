// Géneros del catálogo para el filtro de la portada. Estudio deja el género
// como texto libre ("rock, psicodelico"), así que se separa por comas y
// barras, y dos géneros que solo cambian en mayúsculas son el mismo.

const clave = (g) => g.toLocaleLowerCase('es');

export function generosDe(proyecto) {
  return (proyecto.genero || '')
    .split(/[,/]/)
    .map((g) => g.trim())
    .filter(Boolean);
}

export function tieneGenero(proyecto, genero) {
  return generosDe(proyecto).some((g) => clave(g) === clave(genero));
}

// El filtro solo aparece si sirve para algo: al menos dos géneros repartidos
// en al menos dos discos. Con un solo disco con género, sus chips mostrarían
// siempre lo mismo y quedarían como botones sueltos sin explicación.
export function generosParaFiltrar(catalogo) {
  const conGenero = catalogo.filter((p) => generosDe(p).length > 0);
  if (conGenero.length < 2) return [];
  const porClave = new Map();
  for (const p of conGenero) {
    for (const g of generosDe(p)) if (!porClave.has(clave(g))) porClave.set(clave(g), g);
  }
  if (porClave.size < 2) return [];
  return [...porClave.values()].sort((a, b) => a.localeCompare(b, 'es'));
}
