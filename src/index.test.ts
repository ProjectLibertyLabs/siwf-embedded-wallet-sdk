import { describe, it, expect, vi } from "vitest";
import { getAccountForAccountId, startSiwf } from "./index.js";
import { mockGatewayFetchFactory } from "../test-mocks/mockGatewayFetchFn";
import {
  mockChainInfoResponse,
  mockNewUserAccountResponse,
  mockNewUserGatewaySiwfResponse,
  mockProviderAccountResponse,
  mockProviderEncodedRequest,
  mockProviderEncodedRequestWithoutGraphKey,
  mockRetunringUserGatewaySiwfResponse,
  mockReturningUserAccountResponse,
  mockAccountId,
} from "../test-mocks/consts";
import {
  decodeSignedRequest,
  SiwfResponseCredentialGraph,
} from "@projectlibertylabs/siwf";
import { AccountResponse } from "./types/response-types";
import { GatewayFetchFn } from "./types/param-types";
import { GatewayFetchError } from "./types/error-types";
import { CAIP122, EIP712 } from "./types/signed-document-types";
import { stripAddress } from "./helpers/utils";

const providerControlKey = decodeSignedRequest(mockProviderEncodedRequest)
  .requestedSignatures.publicKey.encodedValue;

describe("Basic startSiwf test", () => {
  it("Can login", async () => {
    const resp = await startSiwf(
      mockAccountId,
      async () => "0xdef0",
      mockGatewayFetchFactory(
        mockReturningUserAccountResponse,
        mockProviderAccountResponse,
        mockRetunringUserGatewaySiwfResponse,
        mockChainInfoResponse,
        providerControlKey,
      ),
      mockProviderEncodedRequest,
      "JohnDoe",
      "john.doe@example.com",
      () => {},
    );
    expect(resp.controlKey).toEqual(mockAccountId);
    expect(resp.msaId).toEqual(mockRetunringUserGatewaySiwfResponse.msaId);
    expect(resp).toMatchSnapshot();
  });

  it("Throws if provider account not found", async () => {
    await expect(
      startSiwf(
        mockAccountId,
        async () => "0xdef0",
        mockGatewayFetchFactory(
          mockReturningUserAccountResponse,
          null,
          mockRetunringUserGatewaySiwfResponse,
          mockChainInfoResponse,
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
        mockAccountId,
        async () => "0xdef0",
        mockGatewayFetchFactory(
          mockNewUserAccountResponse,
          mockProviderAccountResponse,
          mockNewUserGatewaySiwfResponse,
          mockChainInfoResponse,
          providerControlKey,
        ),
        mockProviderEncodedRequest,
        undefined,
        "john.doe@example.com",
        () => {},
      ),
    ).rejects.toThrow("signUpHandle missing for non-existent account.");
  });

  it("If new user, throws if no signUpEmail", async () => {
    await expect(
      startSiwf(
        mockAccountId,
        async () => "0xdef0",
        mockGatewayFetchFactory(
          mockNewUserAccountResponse,
          mockProviderAccountResponse,
          mockNewUserGatewaySiwfResponse,
          mockChainInfoResponse,
          providerControlKey,
        ),
        mockProviderEncodedRequest,
        "JohnDoe",
        undefined,
        () => {},
      ),
    ).rejects.toThrow("signUpEmail missing for non-existent account.");
  });

  it("Can sign up", async () => {
    const resp = await startSiwf(
      mockAccountId,
      async () => "0xdef0",
      mockGatewayFetchFactory(
        mockNewUserAccountResponse,
        mockProviderAccountResponse,
        mockNewUserGatewaySiwfResponse,
        mockChainInfoResponse,
        providerControlKey,
      ),
      mockProviderEncodedRequest,
      "JohnDoe",
      "john.doe@example.com",
    );

    expect(resp.controlKey).toEqual(mockAccountId);
    expect(resp.msaId).toEqual(mockNewUserGatewaySiwfResponse.msaId);
    expect(resp.email).toEqual("john.doe@example.com");
    expect(resp.signUpStatus).toEqual("waiting");

    expect(resp.graphKey).toMatchObject({
      encoding: "base16",
      format: "bare",
      type: "X25519",
      keyType: "dsnp.public-key-key-agreement",
    });

    expect(typeof resp.graphKey!.encodedPublicKeyValue).toBe("string");
    expect(typeof resp.graphKey!.encodedPrivateKeyValue).toBe("string");
    expect(resp.graphKey!.id).toMatch(/^did:ethr:/);

    // Validate rawCredentials[0] structure
    const credential = resp.rawCredentials![0] as SiwfResponseCredentialGraph;
    expect(credential).toMatchObject({
      type: ["VerifiedGraphKeyCredential", "VerifiableCredential"],
      credentialSchema: {
        type: "JsonSchema",
        id: expect.stringContaining("https://schemas.frequencyaccess.com"),
      },
      credentialSubject: expect.objectContaining({
        encoding: "base16",
        format: "bare",
        type: "X25519",
        keyType: "dsnp.public-key-key-agreement",
      }),
    });

    expect(credential.issuer).toEqual(credential.credentialSubject.id);
    expect(() => new Date(credential.validFrom!)).not.toThrow();
  });

  it("Can sign up without a graph key", async () => {
    const payloadsToSign: (CAIP122 | EIP712)[] = [];
    const resp = await startSiwf(
      mockAccountId,
      async (payload) => {
        payloadsToSign.push(payload);
        return "0xdef0";
      },
      mockGatewayFetchFactory(
        mockNewUserAccountResponse,
        mockProviderAccountResponse,
        mockNewUserGatewaySiwfResponse,
        mockChainInfoResponse,
        providerControlKey,
      ),
      mockProviderEncodedRequestWithoutGraphKey,
      "JohnDoe",
      "john.doe@example.com",
    );

    expect(resp.controlKey).toEqual(mockAccountId);
    expect(resp.msaId).toEqual(mockNewUserGatewaySiwfResponse.msaId);
    expect(payloadsToSign).toMatchSnapshot();
  });

  it("Successfully calls msaCreationCallbackFn", async () => {
    vi.useFakeTimers();
    const mockMsaCreationCallbackFn = vi.fn();

    // initial get account response - returns null because there is no account yet
    const mockFinalResponse: { response: AccountResponse | null } = {
      response: mockNewUserAccountResponse,
    };

    const resp = await startSiwf(
      mockAccountId,
      async () => "0xdef0",
      mockGatewayFetchFactory(
        mockFinalResponse.response,
        mockProviderAccountResponse,
        mockNewUserGatewaySiwfResponse,
        mockChainInfoResponse,
        providerControlKey,
        mockFinalResponse,
      ),
      mockProviderEncodedRequest,
      "JohnDoe",
      "john.doe@example.com",
      mockMsaCreationCallbackFn,
    );
    expect(resp).toBeDefined();
    // mutate the response to mock the get account call from within the polling function - returns a valid account
    mockFinalResponse.response = mockReturningUserAccountResponse;

    await vi.waitFor(() => {
      // wait for the poll function to execute
      vi.advanceTimersByTime(6000);
      expect(mockMsaCreationCallbackFn).toHaveBeenCalledWith(
        mockReturningUserAccountResponse,
      );
    });
  });
});

describe("getAccountForAccountId", () => {
  it("returns info for an existing user", async () => {
    const body: AccountResponse = { msaId: "2" };
    const fetchFn: GatewayFetchFn = async (_method, _path) => {
      return new Response(JSON.stringify(body), { status: 200 });
    };
    const address = "0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac";

    const result = await getAccountForAccountId(fetchFn, address);

    expect(result).toStrictEqual(body);
  });
  it("returns `null` when user not found", async () => {
    const fetchFn: GatewayFetchFn = async (_method, _path) => {
      return new Response(null, { status: 404 });
    };
    const address = "0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac";

    const result = await getAccountForAccountId(fetchFn, address);

    expect(result).toStrictEqual(null);
  });
  it("throws when request is malformed", async () => {
    const fetchFn: GatewayFetchFn = async (_method, _path) => {
      return new Response(null, { status: 405 });
    };
    const address = "#@41i9=/?&8";

    try {
      await getAccountForAccountId(fetchFn, address);
      expect.fail("No error thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(GatewayFetchError);
      expect((err as GatewayFetchError).response.status).toBe(405);
    }
  });
  it("throws when server encounters an error", async () => {
    const fetchFn: GatewayFetchFn = async (_method, _path) => {
      return new Response("{stacktrace: '...'}", { status: 500 });
    };
    const address = "0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac";

    try {
      await getAccountForAccountId(fetchFn, address);
      expect.fail("No error thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(GatewayFetchError);
      expect((err as GatewayFetchError).response.status).toBe(500);
    }
  });

  it("throws when accountId is not an ethereum address", async () => {
    await expect(
      startSiwf(
        stripAddress(mockAccountId),
        async () => "0xdef0",
        mockGatewayFetchFactory(
          mockNewUserAccountResponse,
          mockProviderAccountResponse,
          mockNewUserGatewaySiwfResponse,
          mockChainInfoResponse,
          providerControlKey,
        ),
        mockProviderEncodedRequest,
        "JohnDoe",
        "john.doe@example.com",
        () => {},
      ),
    ).rejects.toThrow(
      "accountId did not receive a 0x prefixed Ethereum Address",
    );
  });
});
