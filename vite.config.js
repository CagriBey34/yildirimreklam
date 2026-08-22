import { copyFile, mkdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const require = createRequire(import.meta.url)
const projectRoot = path.dirname(fileURLToPath(import.meta.url))

// PDF.js worker'ını public/ altına .js uzantısıyla kopyalar.
//
// Neden: pdfjs-dist v5 worker'ı yalnızca .mjs olarak yayınlıyor. Pek çok
// sunucu (Apache/nginx varsayılanları dahil) .mjs uzantısını tanımıyor ve
// dosyayı application/octet-stream olarak gönderiyor. Tarayıcı, modül
// script'lerinde katı MIME denetimi uyguladığı için worker'ı reddediyor;
// PDF.js "fake worker"a düşüyor, o da aynı sebeple yüklenemeyince PDF hiç
// açılmıyor ("Katalog yüklenemedi"). Yerelde ve `vite preview`de MIME doğru
// verildiği için sorun sadece canlıda görünüyordu.
//
// .js uzantısı hemen her sunucuda text/javascript olarak servis edildiğinden
// dosyayı bu uzantıyla kopyalıyoruz — sunucuda hiçbir ayar değişikliği
// gerekmiyor. Kopyalama build/dev başında otomatik çalışıyor, böylece
// pdfjs-dist güncellendiğinde worker'ın sürümü de kendiliğinden eşleşiyor.
function copyPdfWorker() {
  return {
    name: 'copy-pdf-worker-as-js',
    async buildStart() {
      const source = require.resolve('pdfjs-dist/build/pdf.worker.min.mjs')
      const target = path.join(projectRoot, 'public', 'pdf.worker.min.js')

      await mkdir(path.dirname(target), { recursive: true })
      await copyFile(source, target)
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    copyPdfWorker(),
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
