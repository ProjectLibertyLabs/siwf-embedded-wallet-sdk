import { describe, it, expect } from "vitest";
import { startSiwf } from "./index.js";
import { GatewaySiwfResponse } from "../dist/gateway-types";
import { mockGatewayFetch } from "./tests/mockGatewayFetchFn";
import {
  mockNewUserControlKey,
  mockNewUserEncodedRequest,
  mockReturningUserControlKey,
  mockReturningUserEncodedRequest,
} from "./tests/consts";

describe("Basic startSiwf test", () => {
  it("Can login", async () => {
    const resp = await startSiwf(
      mockReturningUserControlKey,
      async () => "0xdef0",
      mockGatewayFetch,
      mockReturningUserEncodedRequest,
      "handle-here",
      "email@example.com",
      () => {},
    );
    expect(resp).toMatchSnapshot();
  });
  it("Can sign up", async () => {
    const resp = await startSiwf(
      mockNewUserControlKey,
      async () => "0xdef0",
      async () => mockGatewayFetch,
      mockNewUserEncodedRequest,
      "handle-here",
      "email@example.com",
      () => {},
    );
    expect(resp).toMatchSnapshot();
  });
});
