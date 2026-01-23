import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { cleanupChromiumLocks } from './cleanup';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('Cleanup Service', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanup-test-'));
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('should remove SingletonLock file', () => {
    const lockFile = path.join(testDir, 'SingletonLock');
    fs.writeFileSync(lockFile, '');

    expect(fs.existsSync(lockFile)).toBe(true);

    cleanupChromiumLocks(testDir);

    expect(fs.existsSync(lockFile)).toBe(false);
  });

  it('should remove SingletonCookie file', () => {
    const lockFile = path.join(testDir, 'SingletonCookie');
    fs.writeFileSync(lockFile, '');

    cleanupChromiumLocks(testDir);

    expect(fs.existsSync(lockFile)).toBe(false);
  });

  it('should remove SingletonSocket file', () => {
    const lockFile = path.join(testDir, 'SingletonSocket');
    fs.writeFileSync(lockFile, '');

    cleanupChromiumLocks(testDir);

    expect(fs.existsSync(lockFile)).toBe(false);
  });

  it('should recursively clean nested directories', () => {
    const nestedDir = path.join(testDir, 'nested', 'deep');
    fs.mkdirSync(nestedDir, { recursive: true });

    const lockFile = path.join(nestedDir, 'SingletonLock');
    fs.writeFileSync(lockFile, '');

    cleanupChromiumLocks(testDir);

    expect(fs.existsSync(lockFile)).toBe(false);
  });

  it('should not remove other files', () => {
    const otherFile = path.join(testDir, 'important.txt');
    fs.writeFileSync(otherFile, 'data');

    cleanupChromiumLocks(testDir);

    expect(fs.existsSync(otherFile)).toBe(true);
  });

  it('should handle non-existent directory', () => {
    expect(() => {
      cleanupChromiumLocks('/non/existent/path');
    }).not.toThrow();
  });
});
