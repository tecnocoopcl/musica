import { createContext, useContext } from 'react';

// Lo que casi todas las vistas necesitan: el reproductor, la biblioteca de
// quien escucha y las pistas del catálogo indexadas por src.
export const MusicaContext = createContext(null);

export function useMusica() {
  return useContext(MusicaContext);
}
