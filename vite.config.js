import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
	plugins: [react()],
	base: command === 'build' ? '/helper/' : '/',
	server: {
		proxy: {
			'/vs-api': {
				target: 'https://marketplace.visualstudio.com/_apis/public/gallery',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/vs-api/, ''),
			},
		},
	},
}));
