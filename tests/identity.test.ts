import { from } from "../identity";
import { fileURLToPath } from "url";
import { join } from "path";

describe("Identity", () => {
  test("map", () => {
    const file = from("file:///").map(fileURLToPath).map(join, "etc", "hosts").unwrap();

    expect(file).toBe("/etc/hosts");
  });
});
