// rsbuild.config.ts
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    title: 'Art Portfolio | Valentin Mardoukhaev',
    favicon: './public/favicon.png', // Point this to your sketchbook SVG
  },
  output: {
    assetPrefix: '/',
  },
});