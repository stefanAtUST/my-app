import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './vitest.setup.ts',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            exclude: [
                'node_modules/',
                'dist/',
                '.next/',
                '**/*.config.*',
                '**/types/index.ts',
            ],
            statements: 70,
            branches: 70,
            functions: 70,
            lines: 70,
        },
    },
    resolve: {
        alias: {
            '@': process.cwd(),
        },
    },
});
