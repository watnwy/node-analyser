import { yarnLockedVersions } from "@analyser/packages";

test("correctly find packages locked with yarn", async () => {
  const packages = await yarnLockedVersions("./__tests__/assets/yarn/yarn.lock");
  expect(packages['react@^17.0.2']).toBe('17.0.2');
});
