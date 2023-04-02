import * as fc from "fast-check";
import { from } from "@sweet-monads/identity";
import { join } from "path";
import { fileURLToPath } from "url";

describe("Identity", () => {
  test("map", () => {
    const file = from("file://")
      .map(fileURLToPath)
      .map(x => join("etc", "hosts"));

    expect(file.unwrap()).toBe("etc/hosts");
  });
  test("toString", () => {
    expect(from(1).toString()).toBe("[object Identity]");
  });
});
