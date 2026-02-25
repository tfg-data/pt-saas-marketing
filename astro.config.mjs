// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

import react from '@astrojs/react';

// GitHub Pages では /pt-saas-marketing/ にデプロイされるため base を設定
const base = process.env.DEPLOY_BASE ?? '/';

// https://astro.build/config
export default defineConfig({
  site: 'https://tfg-data.github.io',
  base,
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [sitemap(), react()]
});
