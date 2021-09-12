import { parse as parseYarnLockFile } from '@yarnpkg/lockfile';
import { readFile } from 'fs-extra';

export async function yarnLockedVersions(yarnLockFile: string): Promise<{
  [k: string]: string;
}> {
  const parsedYarnLockFile = parseYarnLockFile(await readFile(yarnLockFile, 'utf-8'));
  return Object.fromEntries(
    Object.entries<{ version: string }>(parsedYarnLockFile.object).map(([pack, { version }]) => [pack, version]),
  );
}
