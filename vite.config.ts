import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	server: {
		proxy: {
			/// To verify the alpaca api keys before utilization
			'/alpaca/account': {
				target: 'https://paper-api.alpaca.markets',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/alpaca/, 'v2')
			}
		}
	}
});
