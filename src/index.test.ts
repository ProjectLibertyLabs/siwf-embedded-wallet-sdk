import { describe, it, expect } from "vitest";
import { startSiwf } from "./index.js";

describe("Basic startSiwf test", () => {
  it("Can do a thing", async () => {
    const resp = await startSiwf(
      "0xabcd",
      () => "0xdef0",
      () => ({ ok: true, json: () => ({}) }),
      "",
      "handle-here",
      "email@example.com",
      () => {},
    );
    expect(resp).toMatchSnapshot();
  });
});
