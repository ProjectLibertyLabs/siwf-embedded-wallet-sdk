import { stringToBase64URL } from "./base64url.js";
import { mockNewUserResponse } from "./static-mocks/response-new-user.js";
import { mockLoginResponse } from "./static-mocks/response-login.js";
import { mockGatewayNewUserResponse } from "./static-mocks/gateway-new-user.js";
import { mockGatewayLoginResponse } from "./static-mocks/gateway-login.js";
import { decodeSignedRequest } from "@projectlibertylabs/siwf";
// Mock so that the existing account is returned
let mockExistingGatewayAccount = null;
export function setMockForExistingGatewayAccount(mockValue) {
  mockExistingGatewayAccount = mockValue;
}
// Mock for post MSA Creation
let mockCreationGatewayAccount = {
  msaId: "47",
  handle: {
    base_handle: "mock-siwf-ew",
    canonical_base: "m0ck-s1wf-ew",
    suffix: 0,
  },
};
export function setMockForCreationGatewayAccount(mockValue) {
  mockCreationGatewayAccount = mockValue;
}
async function getGatewayAccount(gatewayFetchFn, userAddress) {
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
async function postGatewaySiwf(gatewayFetchFn, siwfResponse) {
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
  gatewayFetchFn,
  userAddress,
  msaCreationCallbackFn,
) {
  // MOCK Timeout
  await new Promise((r) => setTimeout(r, 12000));
  const _ignoreForMock = await getGatewayAccount(gatewayFetchFn, userAddress);
  msaCreationCallbackFn(mockCreationGatewayAccount);
}
export async function startSiwf(
  userAddress,
  signatureFn,
  gatewayFetchFn,
  encodedSiwfSignedRequest = "bciqe4qoczhftici4dzfvfbel7fo4h4sr5grco3oovwyk6y4ynf44tsi",
  signUpHandle,
  signUpEmail,
  msaCreationCallbackFn,
) {
  // Is address already an MSA?
  const hasAccount = await getGatewayAccount(gatewayFetchFn, userAddress);
  const decodedRequest = decodeSignedRequest(encodedSiwfSignedRequest);
  // const { requestedSignatures, requestedCredentials, applicationContext} = decodeSignedRequest(encodedSiwfSignedRequest);
  console.log("DECODED SIGNED REQUEST", decodedRequest);
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
