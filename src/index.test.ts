import { describe, it, expect } from "vitest";
import { startSiwf } from "./index.js";

describe("Basic startSiwf test", () => {
  it("Can do a thing", async () => {
    const resp = await startSiwf(
      "0xabcd",
      async () => "0xdef0",
      async () => ({ ok: true, status: 200, json: async () => ({ "msaId": "290" }) }) as Response,
      "",
      "handle-here",
      "email@example.com",
      () => { },
    );
    expect(resp).toMatchSnapshot();
  });
});
