import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// Dos páginas en el mismo sitio: index.html es Escuchar (el reproductor
// público) y estudio.html es el Estudio, el panel del músico que se abre
// dentro de espacio.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        escuchar: resolve(import.meta.dirname, 'index.html'),
        estudio: resolve(import.meta.dirname, 'estudio.html'),
      },
    },
  },
})
