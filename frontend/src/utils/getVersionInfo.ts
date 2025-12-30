import { readFileSync } from 'fs';
import path from 'path';

export interface VersionInfo {
  gitShortSha: string;
  buildTime: string;
}

/**
 * Reads and parses version information from src/version.ts
 * @param baseDir - The base directory (typically __dirname from the config file)
 * @returns Version info or null if not found
 */
export function getVersionInfo(baseDir: string): VersionInfo | null {
  try {
    const versionFile = path.resolve(baseDir, 'src/version.ts');
    const versionContent = readFileSync(versionFile, 'utf-8');
    const versionMatch = versionContent.match(/export const VERSION_INFO = ({[\s\S]*?}) as const;/);

    if (versionMatch) {
      const versionInfo = JSON.parse(versionMatch[1]) as VersionInfo;
      return versionInfo;
    }
    return null;
  } catch (error) {
    console.warn('Warning: Could not read version info from src/version.ts:', error);
    return null;
  }
}
