import { defineConfig } from 'vite';
import path from 'path';
import { readFileSync } from 'fs';
function versionInjectorPlugin() {
    return {
        name: 'version-injector',
        transformIndexHtml(html) {
            try {
                const versionFile = path.resolve(__dirname, 'src/version.ts');
                const versionContent = readFileSync(versionFile, 'utf-8');
                const versionMatch = versionContent.match(/export const VERSION_INFO = ({[\s\S]*?}) as const;/);
                if (versionMatch) {
                    const versionInfo = JSON.parse(versionMatch[1]);
                    html = html.replace('__VERSION__', versionInfo.gitShortSha);
                    html = html.replace('__BUILD_TIME__', versionInfo.buildTime);
                }
            }
            catch (error) {
                console.warn('Warning: Could not inject version info into HTML:', error);
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
