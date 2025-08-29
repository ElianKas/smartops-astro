// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { storyblok } from '@storyblok/astro';
import { loadEnv } from 'vite';

import vercel from '@astrojs/vercel';

const env = loadEnv('', process.cwd(), 'STORYBLOK');
const { STORYBLOK_DELIVERY_API_TOKEN } = loadEnv(import.meta.env.MODE, process.cwd(), '');

// https://astro.build/config
export default defineConfig({
  vite: {
      plugins: [tailwindcss()],
	},

  integrations: [
      storyblok({
          accessToken: env.STORYBLOK_DELIVERY_API_TOKEN,
          apiOptions: {
              region: 'eu',
          },
          components: {
              smartops_project: 'storyblok/smartops_project',
              smartops_page: 'storyblok/smartops_page',
              page_section_text: 'storyblok/page_section_text',
              page_section_hero: 'storyblok/page_section_hero',
              page_section_features: 'storyblok/page_section_features',
              page_section_carousel: 'storyblok/page_section_carousel',
              page_section_sparring_info: 'storyblok/page_section_sparring_info',
              page_section_project_references: 'storyblok/page_section_project_references',
          },
      }),
	],

  adapter: vercel(),
});