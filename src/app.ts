import express from "express";
import path from "path";
import process from "process";
import { readdir, readFile, stat, pathExists } from "fs-extra";
import { parse as parseYarnLockFile } from "@yarnpkg/lockfile";
import "express-async-errors";

import type { Request, ErrorRequestHandler } from "express";
import type { PerformAnalysisRequest, AnalysisEcoSystemResult } from "./models";

process.on("SIGINT", () => {
  console.info("Interrupted");
  process.exit(0);
});

var app = express();

app.use(express.json());

app.get("/_/health", async (req, res) => {
  res.send({ status: "healthy" });
});

app.get("/_/ready", async (req, res) => {
  res.send({ status: "ready" });
});

const IGNORE_FOLDERS = ["node_modules"];

async function findFiles(path: string, file: string): Promise<string[]> {
  return (
    await Promise.all(
      (
        await readdir(path)
      )
        .filter((entry) => !entry.startsWith("."))
        .map((entry) => ({
          path: path,
          entry: entry,
          full_path: `${path}/${entry}`,
        }))
        .map(async ({ full_path: fullPath, entry }) => {
          if (
            (await stat(fullPath)).isDirectory() &&
            !IGNORE_FOLDERS.includes(entry)
          ) {
            return await findFiles(fullPath, file);
          } else if (entry === file) {
            return [fullPath];
          } else {
            return [];
          }
        })
    )
  ).flat();
}

async function yarnLockedVersions(yarnLockFile: string) {
  const parsedYarnLockFile = parseYarnLockFile(
    await readFile(yarnLockFile, "utf-8")
  );
  return Object.fromEntries(
    Object.entries<{ version: string }>(parsedYarnLockFile.object).map(
      ([pack, { version }]) => [pack, version]
    )
  );
}

app.post(
  "/analysis",
  async (
    req: Request<unknown, AnalysisEcoSystemResult[], PerformAnalysisRequest>,
    res
  ) => {
    const packages = await Promise.all(
      (
        await findFiles(req.body.path, "package.json")
      ).map(async (packageFile) => {
        const packageContent = JSON.parse(await readFile(packageFile, "utf-8"));
        return await Promise.all(
          Object.entries(packageContent.dependencies).map(
            async ([pack, versionPattern]) => {
              const dirname = path.dirname(packageFile);
              const yarnLockFile = `${dirname}/yarn.lock`;
              if (await pathExists(yarnLockFile)) {
                const lockedVersions = await yarnLockedVersions(yarnLockFile);
                return [
                  pack,
                  lockedVersions[`${pack}@${versionPattern}`] ?? null,
                ];
              }
              // Todo: handle package-lock files
              return [pack, null];
            }
          )
        );
      })
    );

    res.send(
      packages
        .filter((packagePackages) => packagePackages.length > 0)
        .map((packagePackages) => ({
          name: "node",
          objects: packagePackages.map(([pack, version]) => ({
            name: pack!,
            versions: [version],
          })),
        }))
    );
  }
);

app.use(((err, req, res, next) => {
  res.status(500).send({ detail: err.message, traceback: err.stack });
}) as ErrorRequestHandler);

app.listen(3000);
