import { defineConfig } from 'vite';

export default defineConfig({
    root: 'public',
    base: '/Translation/',
    build: {
        outDir: '../dist',
        emptyOutDir: true
    }
});
