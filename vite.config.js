// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // ESTA ES LA LÍNEA CRÍTICA: Asegura que las rutas se construyan desde la raíz
  base: '/',
})