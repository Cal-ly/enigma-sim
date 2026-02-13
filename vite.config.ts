/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  base: '/enigma-sim/',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/test-setup.ts', 'src/main.tsx', 'src/vite-env.d.ts'],
      thresholds: {
        branches: 40,
        functions: 40,
        lines: 40,
        statements: 40,
      },
    },
  },
})
