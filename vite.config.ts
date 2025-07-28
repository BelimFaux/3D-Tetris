import { defineConfig, UserConfig } from 'vite';

export default defineConfig({
    build: {
        outDir: './dist',
        emptyOutDir: true,
        assetsDir: '.',
    },
}) satisfies UserConfig;
