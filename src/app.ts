import express from 'express';
import path from 'path';
import process from 'process';
import { readFile, pathExists } from 'fs-extra';
import { clean } from 'semver';

import { findFiles } from '@analyser/files';
import { yarnLockedVersions } from '@analyser/packages';
import 'express-async-errors';

import type { Request, ErrorRequestHandler } from 'express';
import type { PerformAnalysisRequest, AnalysisEcoSystemResult } from './models';

process.on('SIGINT', () => {
  console.info('Interrupted');
  process.exit(0);
});

const app = express();

app.use(express.json());

app.get('/_/health', async (req, res) => {
  res.send({ status: 'healthy' });
});

app.get('/_/ready', async (req, res) => {
  res.send({ status: 'ready' });
});

app.post('/analysis', async (req: Request<unknown, AnalysisEcoSystemResult[], PerformAnalysisRequest>, res) => {
  const packages = await Promise.all(
    (
      await findFiles(req.body.path, 'package.json')
    ).map(async packageFile => {
      const packageContent = JSON.parse(await readFile(packageFile, 'utf-8'));
      return await Promise.all(
        [
          ...Object.entries(packageContent.dependencies ?? {}),
          ...Object.entries(packageContent.devDependencies ?? {}),
        ]
          .filter(([, versionPattern]) => !(versionPattern as string).startsWith('link:'))
          .filter(([pack]) => !pack.startsWith('@types/'))
          .map(async ([pack, versionPattern]) => {
            const fixedVersion = versionPattern ? clean(versionPattern as string) : undefined;
            if (fixedVersion) {
              return [pack, fixedVersion];
            } else {
              const dirname = path.dirname(packageFile);

              const yarnLockFile = `${dirname}/yarn.lock`;
              if (await pathExists(yarnLockFile)) {
                const lockedVersions = await yarnLockedVersions(yarnLockFile);
                return [pack, lockedVersions[`${pack}@${versionPattern}`] ?? null];
              }

              const packageLockFile = `${dirname}/package-lock.json`;
              if (await pathExists(packageLockFile)) {
                const lockedVersions = JSON.parse(await readFile(packageLockFile, 'utf-8'));
                return [pack, lockedVersions.dependencies[pack]?.version ?? null];
              }

              return [pack, null];
            }
          }),
      );
    }),
  );

  res.send(
    packages
      .filter(packagePackages => packagePackages.length > 0)
      .map(packagePackages => ({
        name: 'node',
        objects: packagePackages.map(([pack, version]) => ({
          name: pack!,
          versions: [version],
          versions_providers: [{
            type: 'NPMReleases',
            package_name: pack
          }]
        })),
      })),
  );
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use(((err, req, res, next) => {
  res.status(500).send({ detail: err.message, traceback: err.stack });
}) as ErrorRequestHandler);

app.listen(8080);
