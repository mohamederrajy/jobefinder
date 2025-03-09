import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		fs: {
			allow: ['static']
		},
		proxy: {
			'/api': {
				target: 'http://localhost:5001',
				changeOrigin: true,
				secure: false,
			}
		}
	}
}); 