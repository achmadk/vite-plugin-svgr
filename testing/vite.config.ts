import { resolve } from 'path'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from '../dist'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.tsx'),
      name: 'coreViews',
      fileName: 'core-views'
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react/jsx-runtime': 'JsxRuntime'
        }
      }
    }
  },
  plugins: [react(), svgr({
    exportAsDefault: true,
    esbuildOptions: {
      jsx: 'automatic'
    },
    svgrOptions: {
      jsxRuntime: 'automatic',
      jsxRuntimeImport: {
        source: 'react/jsx-runtime',
        specifiers: ['jsx']
      },
    }
  })],
})
