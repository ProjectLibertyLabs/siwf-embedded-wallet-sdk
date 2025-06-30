import { describe, it, expect } from "vitest";
import { startSiwf } from "./index.js";
import {
  mockGatewayFetch,
  mockGatewayFetchFactory,
} from "./tests/mockGatewayFetchFn";
import {
  mockNewUserControlKey,
  mockNewUserEncodedRequest,
  mockNewUserGatewaySiwfResponse,
  mockProviderAccountResponse,
  mockProviderControlKey,
  mockReturningUserControlKey,
  mockReturningUserEncodedRequest,
} from "./tests/consts";
import { AccountResponse, GatewaySiwfResponse } from "./gateway-types";
import { SiwfResponse } from "./siwf-types";
import { decodeSignedRequest } from "@projectlibertylabs/siwf";

describe("Basic startSiwf test", () => {
  // it("Can login", async () => {
  //   const resp = await startSiwf(
  //     mockReturningUserControlKey,
  //     async () => "0xdef0",
  //     mockGatewayFetch,
  //     mockReturningUserEncodedRequest,
  //     "handle-here",
  //     "email@example.com",
  //     () => {},
  //   );
  //   expect(resp).toMatchSnapshot();
  // });
  it("Can sign up", async () => {
    const providerControlKey = decodeSignedRequest(mockNewUserEncodedRequest)
      .requestedSignatures.publicKey.encodedValue;

    const resp = await startSiwf(
      mockNewUserControlKey,
      async () => "0xdef0",
      mockGatewayFetchFactory(
        null,
        mockProviderAccountResponse,
        mockNewUserGatewaySiwfResponse,
        providerControlKey,
      ),
      mockNewUserEncodedRequest,
      "handle-here",
      "email@example.com",
    );
    expect(resp).toMatchSnapshot();
  });
});
