import fs from 'fs';
import path from 'path';

const LOCK_FILES = ['SingletonLock', 'SingletonCookie', 'SingletonSocket'];

/**
 * Recursively cleanup Chromium lock files
 * Prevents "Profile in use" errors on Railway redeployments
 */
export function cleanupChromiumLocks(dir: string): void {
  if (!fs.existsSync(dir)) return;

  try {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);

      if (fs.lstatSync(fullPath).isDirectory()) {
        cleanupChromiumLocks(fullPath);
      } else if (LOCK_FILES.includes(file)) {
        try {
          fs.unlinkSync(fullPath);
          console.log(`Lock removed: ${fullPath}`);
        } catch (e) {
          const error = e as Error;
          console.warn(`Could not remove ${file}: ${error.message}`);
        }
      }
    }
  } catch (err) {
    const error = err as Error;
    console.error(`Error scanning directories: ${error.message}`);
  }
}
