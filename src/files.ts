import { readdir, stat } from 'fs-extra';

const IGNORED_FOLDERS = ['node_modules'];

export async function findFiles(path: string, file: string): Promise<string[]> {
  return (
    await Promise.all(
      (
        await readdir(path)
      )
        .filter(entry => !entry.startsWith('.'))
        .map(entry => ({
          path: path,
          entry: entry,
          full_path: `${path}/${entry}`,
        }))
        .map(async ({ full_path: fullPath, entry }) => {
          if ((await stat(fullPath)).isDirectory() && !IGNORED_FOLDERS.includes(entry)) {
            return await findFiles(fullPath, file);
          } else if (entry === file) {
            return [fullPath];
          } else {
            return [];
          }
        }),
    )
  ).flat();
}
