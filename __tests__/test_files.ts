import { findFiles } from "@analyser/files";

test("correctly find files", async () => {
  const packagesJson = await findFiles("./__tests__/assets", "package.json");
  console.log(packagesJson)
  expect(packagesJson).toContain('./__tests__/assets/package.json');
});
