import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      // Template compilation options
      template: {
        compilerOptions: {
          // Remove comments in production

          comments: false,
        },
      },
      // Script setup options
      script: {
        defineModel: true,
        propsDestructure: true,
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Dependency optimization
  optimizeDeps: {
    // Exclude heavy dependencies that should be loaded dynamically
    exclude: [],
  },

  server: {
    // Hot module replacement
    hmr: {
      overlay: false, // Disable error overlay if needed
    },

    host: true,
    port: 7600,
    open: true, // auto open browser
  },

  preview: {
    port: 7800,
    strictPort: true,
  },

  // Worker configuration for web workers
  worker: {
    format: 'es',
    rollupOptions: {
      output: {
        entryFileNames: 'workers/[name]-[hash].js',
      },
    },
  },

  // Plugin configurations
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },

  build: {
    // Target modern browsers for better performance
    target: 'es2020',

    // Enable minification
    minify: 'esbuild',

    // Output directory
    outDir: 'dist',

    // Generate source maps for debugging (disable for smaller builds)
    sourcemap: false,

    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
  },
})
