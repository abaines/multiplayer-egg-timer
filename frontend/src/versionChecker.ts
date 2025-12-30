import { VERSION_INFO } from 'shared';

export async function checkVersions(): Promise<void> {
  try {
    // Get frontend version from data attributes
    const frontendVersion: string = document.body.dataset.version || 'unknown';
    const frontendBuildTime: string = document.body.dataset.buildTime || 'unknown';

    console.group('🔍 Version Information');
    console.log('%c Frontend', 'font-weight: bold; color: #0066cc');
    console.log('  Version:', frontendVersion);
    console.log('  Build Time:', frontendBuildTime);
    console.log('  Git SHA:', VERSION_INFO.gitSha);
    console.log('  Branch:', VERSION_INFO.gitBranch);

    // Fetch backend version
    const response: Response = await fetch('/health');
    if (response.ok) {
      const healthData = await response.json() as unknown;
      if (!healthData || typeof healthData !== 'object' || !('version' in healthData) || !('status' in healthData)) {
        console.error('Invalid health response format');
        console.groupEnd();
        return;
      }
      const typedHealthData = healthData as { status: string; version: typeof VERSION_INFO };
      console.log('%c Backend', 'font-weight: bold; color: #009933');
      console.log('  Version:', typedHealthData.version.gitShortSha);
      console.log('  Build Time:', typedHealthData.version.buildTime);
      console.log('  Git SHA:', typedHealthData.version.gitSha);
      console.log('  Branch:', typedHealthData.version.gitBranch);
      console.log('  Status:', typedHealthData.status);

      // Check if versions match
      if (typedHealthData.version.gitSha !== VERSION_INFO.gitSha) {
        console.warn('%c⚠️ Version Mismatch', 'font-weight: bold; color: #ff9900');
        console.warn('  Frontend and backend are running different versions!');
      } else {
        console.log('%c✓ Versions match', 'color: #009933');
      }
    }
    console.groupEnd();
  } catch (error) {
    console.error('Failed to check backend version:', error);
  }
}
