import { readFileSync } from 'fs';
import path from 'path';

export interface VersionInfo {
  gitShortSha: string;
  buildTime: string;
}

/**
 * Reads and parses version information from src/version.ts
 *
 * Expected format in version.ts:
 * export const VERSION_INFO = {
 *   "gitShortSha": "abc1234",
 *   "buildTime": "2024-01-01T00:00:00Z"
 * } as const;
 *
 * @param baseDir - The base directory (typically __dirname from the config file)
 * @returns Version info or null if not found or invalid
 */
export function getVersionInfo(baseDir: string): VersionInfo | null {
  try {
    const versionFile = path.resolve(baseDir, 'src/version.ts');
    const versionContent = readFileSync(versionFile, 'utf-8');
    const versionMatch = versionContent.match(/export const VERSION_INFO = ({[\s\S]*?}) as const;/);

    if (versionMatch) {
      const parsed = JSON.parse(versionMatch[1]);
      // Validate the parsed object has the expected structure
      if (
        parsed &&
        typeof parsed === 'object' &&
        typeof parsed.gitShortSha === 'string' &&
        typeof parsed.buildTime === 'string'
      ) {
        return parsed as VersionInfo;
      }
      console.warn('Warning: Parsed version info has unexpected structure');
      return null;
    }
    return null;
  } catch (error) {
    console.warn('Warning: Could not read version info from src/version.ts:', error);
    return null;
  }
}
