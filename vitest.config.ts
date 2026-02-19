import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'backend/src/**/*.{ts,tsx}',
        'frontend/src/**/*.{ts,tsx}',
        'shared/src/**/*.{ts,tsx}',
      ],
      exclude: [
        'node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/types/**',
        'scripts/**',
        // Exclude type-only files and files with browser/server dependencies that can't be tested easily
        'shared/src/protocol.ts',
        'shared/src/index.ts',
        'shared/src/version.ts',
        'backend/src/server.ts',
        'backend/src/app.ts',
        'backend/src/roomManager.ts',
        'frontend/src/**/*',
      ],
      all: true,
      lines: 50,
      functions: 50,
      branches: 50,
      statements: 50,
      perFile: false,
      thresholds: {
        lines: 50,
        functions: 50,
        branches: 50,
        statements: 50,
        perFile: false,
      },
    },
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './shared/src'),
      '@frontend': path.resolve(__dirname, './frontend/src'),
      '@backend': path.resolve(__dirname, './backend/src'),
    },
  },
});
