import { SiwfResponse } from "./siwf-types.js";
import { stringToBase64URL } from "./base64url.js";
import { AccountResponse, GatewaySiwfResponse } from "./gateway-types.js";
import { mockNewUserResponse } from "./static-mocks/response-new-user.js";
import { mockLoginResponse } from "./static-mocks/response-login.js";
import { mockGatewayNewUserResponse } from "./static-mocks/gateway-new-user.js";
import { mockGatewayLoginResponse } from "./static-mocks/gateway-login.js";
import {
  addDelegation712,
  addGraphKey712,
  claimHandle712,
  mockCaip122,
} from "./signature-requests.js";

type Address = string;

// https://chainagnostic.org/CAIPs/caip-122
interface CAIP122 {
  method: "personal_sign";
  params: [
    Address,
    string, // Signing Payload
  ];
}

// https://eips.ethereum.org/EIPS/eip-712#specification-of-the-eth_signtypeddata-json-rpc
interface EIP712 {
  method: "eth_signTypedData_v4";
  params: [
    Address,
    {
      types: {
        EIP712Domain: { name: string; type: string }[];
        [key: string]: { name: string; type: string }[];
      };
      primaryType: string;
      domain: {
        name: string;
        version: string;
        chainId: string;
        verifyingContract: string;
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      message: Record<string, any>;
    },
  ];
}

// Matches https://docs.metamask.io/wallet/reference/provider-api/#request
export type SignatureFn = (request: CAIP122 | EIP712) => Promise<string>;

interface GatewayFetchBody {
  authorizationPayload: string;
}

export type GatewayFetchPostSiwfFn = (
  method: "POST",
  path: "/v2/accounts/siwf",
  body: GatewayFetchBody,
) => Promise<Response>;

export type GatewayFetchGetAccountFn = (
  method: "GET",
  path: `/v1/accounts/account/${Address}`,
) => Promise<Response>;

export type GatewayFetchFn = (
  method: "GET" | "POST",
  path: `/v1/accounts/account/${Address}` | "/v2/accounts/siwf",
  body?: GatewayFetchBody,
) => Promise<Response>;

export type MsaCreationCallbackFn = (account: AccountResponse) => void;

// This is mocked as we only deal with converting one control key
function convertControlKeyToEthereum<T extends { controlKey: string }>(
  input: T,
): T {
  if (input.controlKey !== "f6d1YDa4agkaQ5Kqq8ZKwCf2Ew8UFz9ot2JNrBwHsFkhdtHEn")
    throw new Error(
      "Mock only supports f6d1YDa4agkaQ5Kqq8ZKwCf2Ew8UFz9ot2JNrBwHsFkhdtHEn",
    );
  return {
    ...input,
    controlKey: "0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac",
  };
}

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
    const _ignoreForMockAddDelegationSignature = await signatureFn({
      method: "eth_signTypedData_v4",
      params: [userAddress, addDelegation712],
    });
    // Sign Handle
    const _ignoreForMockSetHandleSignature = await signatureFn({
      method: "eth_signTypedData_v4",
      params: [userAddress, claimHandle712],
    });
    // Sign Graph Key Add
    const _ignoreForMockAddGraphKeySignature = await signatureFn({
      method: "eth_signTypedData_v4",
      params: [userAddress, addGraphKey712],
    });
    // Sign Recovery Key
    // const _ignoreForMockSetRecoveryHashSignature = await signatureFn({
    //   method: "eth_signTypedData_v4",
    //   params: [userAddress, addRecoveryHash712],
    // });

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
    return convertControlKeyToEthereum(mockGatewayNewUserResponse());
  } else {
    // Process Login

    // Request CAIP-122 Signature
    const _ignoreForMockCaip122Signature = await signatureFn({
      method: "personal_sign",
      params: [userAddress, mockCaip122],
    });

    // TODO: Build the mock siwfResponse
    const siwfResponse = mockLoginResponse();

    const _ignoreForMockGatewaySiwfResponse = await postGatewaySiwf(
      gatewayFetchFn,
      siwfResponse,
    );

    // Actual:
    // return _ignoreForMockGatewaySiwfResponse;
    // Return Mock
    return convertControlKeyToEthereum(mockGatewayLoginResponse());
  }
}
