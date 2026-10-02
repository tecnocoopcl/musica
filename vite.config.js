import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base absoluta: la app también se sirve en /artista/<slug>, y con
// rutas relativas los assets se buscarían en /artista/assets.
export default defineConfig({
  base: '/',
  plugins: [react()],
})
