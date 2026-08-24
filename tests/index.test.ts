import { describe, expect, it } from "vitest";

import * as sdk from "../src/index.js";

describe("package entry point", () => {
  it("can be imported", () => {
    expect(sdk).toBeDefined();
  });
});
