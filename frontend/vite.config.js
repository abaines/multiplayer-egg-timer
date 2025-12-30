import { defineConfig } from 'vite';
import path from 'path';
import { getVersionInfo } from './src/utils/getVersionInfo.js';
function versionInjectorPlugin() {
    return {
        name: 'version-injector',
        transformIndexHtml(html) {
            const versionInfo = getVersionInfo(__dirname);
            if (versionInfo) {
                html = html.replace('__VERSION__', versionInfo.gitShortSha);
                html = html.replace('__BUILD_TIME__', versionInfo.buildTime);
            }
            else {
                html = html.replace('__VERSION__', 'unknown');
                html = html.replace('__BUILD_TIME__', 'unknown');
            }
            return html;
        },
    };
}
export default defineConfig({
    plugins: [versionInjectorPlugin()],
    resolve: {
        alias: {
            shared: path.resolve(__dirname, '../shared/src'),
        },
    },
    build: {
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'index.html'),
                lobby: path.resolve(__dirname, 'lobby.html'),
            },
        },
    },
});
