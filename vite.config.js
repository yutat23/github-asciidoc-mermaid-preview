import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

function copyExtensionAssets() {
  return {
    name: 'copy-extension-assets',
    closeBundle() {
      const dist = resolve(__dirname, 'dist');
      if (!existsSync(resolve(dist, 'icons'))) {
        mkdirSync(resolve(dist, 'icons'), { recursive: true });
      }
      copyFileSync(resolve(__dirname, 'manifest.json'), resolve(dist, 'manifest.json'));
      for (const size of ['']) {
        const src = resolve(__dirname, 'src/icons', `icon${size}.png`);
        if (existsSync(src)) {
          copyFileSync(src, resolve(dist, 'icons', `icon${size}.png`));
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [copyExtensionAssets()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'content/index': resolve(__dirname, 'src/content/index.js'),
        'options/index': resolve(__dirname, 'src/options/index.html'),
        'popup/index': resolve(__dirname, 'src/popup/index.html'),
        'src/renderer/index': resolve(__dirname, 'src/renderer/index.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
    minify: false,
    sourcemap: true,
  },
});
