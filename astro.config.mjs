// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { storyblok } from '@storyblok/astro';
import { loadEnv } from 'vite';

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
			},
		}),
	],
});
