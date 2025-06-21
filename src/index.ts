import { SiwfResponse } from "./siwf-types.js";
import { stringToBase64URL } from "./base64url.js";
import { AccountResponse, GatewaySiwfResponse } from "./gateway-types.js";
import { mockNewUserResponse } from "./static-mocks/response-new-user.js";
import { mockLoginResponse } from "./static-mocks/response-login.js";
import { mockGatewayNewUserResponse } from "./static-mocks/gateway-new-user.js";
import { mockGatewayLoginResponse } from "./static-mocks/gateway-login.js";

export type SignatureFn = (
  address: string,
  standard: "eip712" | "caip122",
  payload: string,
) => Promise<string>;

interface GatewayFetchBody {
  authorizationPayload: string;
}

export type GatewayFetchFn = (
  method: "GET" | "POST" | "PUT",
  path: string,
  body?: GatewayFetchBody,
) => Promise<Response>;

export type MsaCreationCallbackFn = (account: AccountResponse) => void;

// Mock so that the existing account is returned
let mockExistingGatewayAccount: null | AccountResponse = null;

export function setMockForExistingGatewayAccount(
  mockValue: null | AccountResponse,
) {
  mockExistingGatewayAccount = mockValue;
}

// Mock for post MSA Creation
let mockCreationGatewayAccount: AccountResponse = {
  msaId: "47",
  handle: {
    base_handle: "mock-siwf-ew",
    canonical_base: "m0ck-s1wf-ew",
    suffix: 0,
  },
};

export function setMockForCreationGatewayAccount(mockValue: AccountResponse) {
  mockCreationGatewayAccount = mockValue;
}

async function getGatewayAccount(
  gatewayFetchFn: GatewayFetchFn,
  userAddress: string,
): Promise<AccountResponse | null> {
  const response = await gatewayFetchFn(
    "GET",
    `/v1/accounts/account/${userAddress}`,
  );

  if (response.ok) {
    const _ignoredBody = response.json();
    return mockExistingGatewayAccount;
  }

  // TODO: These errors should be typed to match the real SDK
  throw new Error("Failed GatewayFetchFn for GET Account");
}

async function postGatewaySiwf(
  gatewayFetchFn: GatewayFetchFn,
  siwfResponse: SiwfResponse,
): Promise<GatewaySiwfResponse> {
  const response = await gatewayFetchFn("POST", "/v2/accounts/siwf", {
    authorizationPayload: stringToBase64URL(JSON.stringify(siwfResponse)),
  });

  if (response.ok) {
    const parsedResponse = response.json();
    return parsedResponse;
  }

  // TODO: These errors should be typed to match the real SDK
  throw new Error("Failed GatewayFetchFn for POST siwf");
}

async function pollForAccount(
  gatewayFetchFn: GatewayFetchFn,
  userAddress: string,
  msaCreationCallbackFn: MsaCreationCallbackFn,
) {
  // MOCK Timeout
  await new Promise((r) => setTimeout(r, 12000));
  const _ignoreForMock = await getGatewayAccount(gatewayFetchFn, userAddress);
  msaCreationCallbackFn(mockCreationGatewayAccount);
}

export async function startSiwf(
  userAddress: string,
  signatureFn: SignatureFn,
  gatewayFetchFn: GatewayFetchFn,
  encodedSiwfSignedRequest: string,
  signUpHandle?: string,
  signUpEmail?: string,
  msaCreationCallbackFn?: MsaCreationCallbackFn,
): Promise<GatewaySiwfResponse> {
  // Is address already an MSA?
  const hasAccount = await getGatewayAccount(gatewayFetchFn, userAddress);

  // TODO: Parse the encodedSiwfSignedRequest
  // - Extract the provider Id
  // - Extract the delegations
  // - Check requests, etc...

  if (!hasAccount) {
    // Validate incoming values
    if (!signUpEmail)
      throw new Error("signUpEmail missing for non-existent account.");
    if (!signUpHandle)
      throw new Error("signUpHandle missing for non-existent account.");

    // Generate Graph Key
    // Generate Recovery Key

    // Sign AddDelegation
    const _ignoreForMockAddDelegationSignature = await signatureFn(
      userAddress,
      "eip712",
      "",
    );
    // Sign Handle
    const _ignoreForMockSetHandleSignature = await signatureFn(
      userAddress,
      "eip712",
      "",
    );
    // Sign Graph Key Add
    const _ignoreForMockAddGraphKeySignature = await signatureFn(
      userAddress,
      "eip712",
      "",
    );
    // Sign Recovery Key
    // const _ignoreForMockSetRecoveryKeySignature = await signatureFn(userAddress, "eip712", "");

    const siwfResponse = mockNewUserResponse();

    // Submit to Gateway
    const _ignoreForMockGatewaySiwfResponse = await postGatewaySiwf(
      gatewayFetchFn,
      siwfResponse,
    );

    // Kick off the msaCallback
    if (msaCreationCallbackFn) {
      pollForAccount(gatewayFetchFn, userAddress, msaCreationCallbackFn);
    }

    // Actual:
    // return _ignoreForMockGatewaySiwfResponse;
    // Return Mock
    return mockGatewayNewUserResponse();
  } else {
    // Process Login

    // TODO: Build the mock siwfResponse
    const siwfResponse = mockLoginResponse();

    const _ignoreForMockGatewaySiwfResponse = await postGatewaySiwf(
      gatewayFetchFn,
      siwfResponse,
    );

    // Actual:
    // return _ignoreForMockGatewaySiwfResponse;
    // Return Mock
    return mockGatewayLoginResponse();
  }
}
