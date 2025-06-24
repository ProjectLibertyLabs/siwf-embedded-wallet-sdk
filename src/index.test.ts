import { describe, it, expect } from "vitest";
import { GatewayFetchFn, getGatewayAccount, startSiwf } from "./index.js";
import { AccountResponse } from "./gateway-types.js";
import { GatewayFetchError } from "./error-types.js";

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

describe("getGatewayAccount", () => {
  it("returns info for an existing user", async () => {
    const body: AccountResponse = { msaId: "2" }
    const fetchFn: GatewayFetchFn = async (_method, _path) => {
      return new Response(JSON.stringify(body), { status: 200 })
    }
    const address = "0x1234"

    const result = await getGatewayAccount(fetchFn, address);

    expect(result).toStrictEqual(body)
  });
  it("returns `null` when user not found", async () => {
    const fetchFn: GatewayFetchFn = async (_method, _path) => {
      return new Response(null, { status: 404 })
    }
    const address = "0x1234"

    const result = await getGatewayAccount(fetchFn, address);

    expect(result).toStrictEqual(null)
  });
  it("throws when request is malformed", async () => {
    const fetchFn: GatewayFetchFn = async (_method, _path) => {
      return new Response(null, { status: 405 })
    }
    const address = "#@41i9=/?&8"

    try {
      await getGatewayAccount(fetchFn, address);
      expect.fail("No error thrown")
    } catch (err) {
      expect(err).toBeInstanceOf(GatewayFetchError);
      expect((err as GatewayFetchError).response.status).toBe(405);
    }
  });
  it("throws when server encounters an error", async () => {
    const fetchFn: GatewayFetchFn = async (_method, _path) => {
      return new Response("{stacktrace: '...'}", { status: 500 })
    }
    const address = "0x1234"

    try {
      await getGatewayAccount(fetchFn, address);
      expect.fail("No error thrown")
    } catch (err) {
      expect(err).toBeInstanceOf(GatewayFetchError);
      expect((err as GatewayFetchError).response.status).toBe(500);
    }
  });
});
