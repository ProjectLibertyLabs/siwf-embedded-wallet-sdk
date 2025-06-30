import { describe, it, expect } from "vitest";
import { startSiwf } from "./index.js";
import { mockGatewayFetchFactory } from "./tests/mockGatewayFetchFn";
import {
  mockNewUserAccountResponse,
  mockNewUserGatewaySiwfResponse,
  mockProviderAccountResponse,
  mockProviderEncodedRequest,
  mockRetunringUserGatewaySiwfResponse,
  mockReturningUserAccountResponse,
  mockUserAddress,
} from "./tests/consts";
import { decodeSignedRequest } from "@projectlibertylabs/siwf";

const providerControlKey = decodeSignedRequest(mockProviderEncodedRequest)
  .requestedSignatures.publicKey.encodedValue;

describe("Basic startSiwf test", () => {
  it("Can login", async () => {
    const resp = await startSiwf(
      mockUserAddress,
      async () => "0xdef0",
      mockGatewayFetchFactory(
        mockReturningUserAccountResponse,
        mockProviderAccountResponse,
        mockRetunringUserGatewaySiwfResponse,
        providerControlKey,
      ),
      mockProviderEncodedRequest,
      "JohnDoe",
      "john.doe@example.com",
      () => {},
    );
    expect(resp.controlKey).toEqual(mockUserAddress);
    expect(resp.msaId).toEqual(mockRetunringUserGatewaySiwfResponse.msaId);
    expect(resp).toMatchSnapshot();
  });

  it("Throws if provider account not found", async () => {
    await expect(
      startSiwf(
        mockUserAddress,
        async () => "0xdef0",
        mockGatewayFetchFactory(
          mockReturningUserAccountResponse,
          null,
          mockRetunringUserGatewaySiwfResponse,
          providerControlKey,
        ),
        mockProviderEncodedRequest,
        "JohnDoe",
        "john.doe@example.com",
        () => {},
      ),
    ).rejects.toThrow("Unable to find provider account!");
  });

  it("If new user, throws if no signUpHandle", async () => {
    await expect(
      startSiwf(
        mockUserAddress,
        async () => "0xdef0",
        mockGatewayFetchFactory(
          mockNewUserAccountResponse,
          mockProviderAccountResponse,
          mockNewUserGatewaySiwfResponse,
          providerControlKey,
        ),
        mockProviderEncodedRequest,
        null,
        "john.doe@example.com",
        () => {},
      ),
    ).rejects.toThrow("signUpHandle missing for non-existent account.");
  });

  it("If new user, throws if no signUpEmail", async () => {
    await expect(
      startSiwf(
        mockUserAddress,
        async () => "0xdef0",
        mockGatewayFetchFactory(
          mockNewUserAccountResponse,
          mockProviderAccountResponse,
          mockNewUserGatewaySiwfResponse,
          providerControlKey,
        ),
        mockProviderEncodedRequest,
        "JohnDoe",
        null,
        () => {},
      ),
    ).rejects.toThrow("signUpEmail missing for non-existent account.");
  });

  it("Can sign up", async () => {
    const resp = await startSiwf(
      mockUserAddress,
      async () => "0xdef0",
      mockGatewayFetchFactory(
        mockNewUserAccountResponse,
        mockProviderAccountResponse,
        mockNewUserGatewaySiwfResponse,
        providerControlKey,
      ),
      mockProviderEncodedRequest,
      "JohnDoe",
      "john.doe@example.com",
    );

    expect(resp.controlKey).toEqual(mockUserAddress);
    expect(resp.msaId).toEqual(mockNewUserGatewaySiwfResponse.msaId);
    expect(resp).toMatchSnapshot();
  });
});
