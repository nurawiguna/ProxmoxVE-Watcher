import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isDemoMode = env.VITE_DEMO_MODE === 'true'
  
  return {
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: env.PORT || 3000,
    open: true,
    cors: true,
    // Only add proxy if not in demo mode
    ...(isDemoMode ? {} : {
      proxy: {
        '/api': {
          target: env.API_BASE_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    }),
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia', 'axios'],
        },
      },
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
  }
})
