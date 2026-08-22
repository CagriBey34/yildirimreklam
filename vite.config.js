import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    // react-pdf ve react-pageflip kendi React'lerini import ediyor. Vite'ın
    // bağımlılık önbelleği bayatladığında (ör. sunucu açıkken yeni paket
    // kurulduğunda) bunlar ayrı bir React kopyasına bağlanabiliyor ve
    // "Invalid hook call / useReducer of null" hatasıyla sayfa komple boş
    // kalıyor. dedupe tek bir React örneğini garanti ediyor.
    dedupe: ['react', 'react-dom'],
  },

  optimizeDeps: {
    // Bu üçünü baştan optimize et: sonradan keşfedilip yeniden optimize
    // edilmeleri, yukarıdaki çift-React durumunu tetikleyen asıl senaryo.
    include: ['react-pdf', 'react-pageflip', 'pdfjs-dist'],
  },
})
