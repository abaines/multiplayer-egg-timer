#!/usr/bin/env node

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function getGitSha() {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
  } catch (error) {
    console.warn('Warning: Could not get git SHA, using "unknown"');
    return 'unknown';
  }
}

function getGitShortSha() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
  } catch (error) {
    console.warn('Warning: Could not get git short SHA, using "unknown"');
    return 'unknown';
  }
}

function getGitBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
  } catch (error) {
    console.warn('Warning: Could not get git branch, using "unknown"');
    return 'unknown';
  }
}

function generateVersionInfo() {
  const buildTime = new Date().toISOString();
  const gitSha = getGitSha();
  const gitShortSha = getGitShortSha();
  const gitBranch = getGitBranch();

  return {
    buildTime,
    gitSha,
    gitShortSha,
    gitBranch,
  };
}

// Generate for backend
const backendVersion = generateVersionInfo();
const backendOutput = `// Auto-generated file - do not edit manually
// Generated at build time by scripts/generate-version.js

export const VERSION_INFO = ${JSON.stringify(backendVersion, null, 2)} as const;
`;

writeFileSync(
  join(__dirname, '../backend/src/version.ts'),
  backendOutput,
  'utf-8'
);

// Generate for frontend
const frontendVersion = generateVersionInfo();
const frontendOutput = `// Auto-generated file - do not edit manually
// Generated at build time by scripts/generate-version.js

export const VERSION_INFO = ${JSON.stringify(frontendVersion, null, 2)} as const;
`;

writeFileSync(
  join(__dirname, '../frontend/src/version.ts'),
  frontendOutput,
  'utf-8'
);

console.log('✓ Version info generated successfully');
console.log(`  Git SHA: ${backendVersion.gitShortSha} (${backendVersion.gitBranch})`);
console.log(`  Build time: ${backendVersion.buildTime}`);
