import { defineConfig } from 'vite';

const base = process.env.VITE_BASE_PATH || '/';

export default defineConfig({
    root: 'public',
    base,
    build: {
        outDir: '../dist',
        emptyOutDir: true
    }
});
