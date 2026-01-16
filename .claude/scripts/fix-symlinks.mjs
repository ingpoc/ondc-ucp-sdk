#!/usr/bin/env node

/**
 * Fix pnpm workspace symlinks for @ondc-website/shared
 *
 * Issue: pnpm incorrectly creates symlinks pointing to packages/shared
 * instead of packages/website/shared for @ondc-website/shared dependency.
 *
 * This script runs after pnpm install to correct the symlinks.
 */

import { existsSync, unlinkSync, symlinkSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { realpathSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
// Script is in .claude/scripts/, go up 3 levels to reach project root
const rootDir = dirname(dirname(dirname(__filename)));

const apps = ['buyer', 'seller'];

console.log('Fixing @ondc-website/shared symlinks...');

let fixedCount = 0;

for (const app of apps) {
  const appDir = resolve(rootDir, 'packages/website', app);
  const symlinkPath = resolve(appDir, 'node_modules/@ondc-website/shared');
  const expectedTargetPath = resolve(rootDir, 'packages/website/shared');

  // Check if the symlink exists
  if (existsSync(symlinkPath)) {
    try {
      // Use realpath to get the actual resolved target
      const currentTargetPath = realpathSync(symlinkPath);

      // Check if it points to the wrong directory
      if (currentTargetPath !== expectedTargetPath) {
        console.log(`  Fixing ${app}/node_modules/@ondc-website/shared`);
        console.log(`    Current target resolves to: ${currentTargetPath}`);
        console.log(`    Expected target: ${expectedTargetPath}`);

        // Remove old symlink
        unlinkSync(symlinkPath);

        // Create correct symlink
        symlinkSync(expectedTargetPath, symlinkPath);
        console.log(`    ✓ Fixed!`);
        fixedCount++;
      } else {
        console.log(`  ✓ ${app} symlink already correct`);
      }
    } catch (err) {
      console.error(`  ✗ Error fixing ${app}:`, err.message);
    }
  } else {
    console.log(`  ! ${app} symlink does not exist`);
  }
}

console.log(`\nFixed ${fixedCount} symlink(s)`);
