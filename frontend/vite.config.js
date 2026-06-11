import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',  // Слушаем все интерфейсы
        port: 3000,
        strictPort: true,
        cors: true,
        allowedHosts: ['10.12.248.94', 'localhost', '0.0.0.0']
    }
})