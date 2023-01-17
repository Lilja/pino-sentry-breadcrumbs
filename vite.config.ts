import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'index',
      // the proper extensions will be added
      fileName: 'index',
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['@sentry/utils', '@sentry/core'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          '@sentry/core': '@sentry/core',
          '@sentry/utils': '@sentry/utils',
        },
      },
    },
  }
  
})