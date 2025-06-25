import { GatewaySiwfResponse } from "./gateway-types.js";
import { ItemActionsPayloadArguments } from "./siwf-types.js";
import { mockNewUserResponse } from "./static-mocks/response-new-user.js";
import { mockLoginResponse } from "./static-mocks/response-login.js";
import { mockGatewayNewUserResponse } from "./static-mocks/gateway-new-user.js";
import { mockGatewayLoginResponse } from "./static-mocks/gateway-login.js";
import { claimHandle712, mockCaip122 } from "./signature-requests.js";
import { createSignedAddProviderPayload, createSignedGraphKeyPayload } from "./helpers/payloads.js";
import { decodeSignedRequest } from "@projectlibertylabs/siwf";
import { getGatewayAccount, pollForAccount, postGatewaySiwf } from "./helpers/gateway.js";
import { GatewayFetchFn, MsaCreationCallbackFn, SignatureFn } from "./types.js";
import { generateGraphKeyPair } from "./helpers/crypto.js";

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

  const decodedSiwfSignedRequest = decodeSignedRequest(
    encodedSiwfSignedRequest,
  );
  const providerAccount = await getGatewayAccount(
    gatewayFetchFn,
    decodedSiwfSignedRequest.requestedSignatures.publicKey.encodedValue,
  );

  if (providerAccount === null) {
    throw new Error("Unable to find provider account!")
  }

  if (!hasAccount) {
    // Validate incoming values
    if (!signUpEmail)
      throw new Error("signUpEmail missing for non-existent account.");
    if (!signUpHandle)
      throw new Error("signUpHandle missing for non-existent account.");

    // Generate Graph Key
    const expiration = 100; // TODO: Calculate correctly based on chain state
    const graphKeyPair = generateGraphKeyPair()
    // Generate Recovery Key

    // Sign AddProvider
    const requestedPermissions = decodedSiwfSignedRequest.requestedSignatures.payload.permissions
    const addProviderArguments = {
      authorizedMsaId: providerAccount.msaId,
      schemaIds: requestedPermissions,
      expiration,
    }
    const _addProviderPayload = await createSignedAddProviderPayload(
      userAddress,
      signatureFn,
      addProviderArguments,
    )
    // Sign Handle
    const _ignoreForMockSetHandleSignature = await signatureFn({
      method: "eth_signTypedData_v4",
      params: [userAddress, claimHandle712],
    });
    // Sign Graph Key Add
    const addGraphKeyArguments: ItemActionsPayloadArguments = {
      schemaId: 7,
      targetHash: 0,
      expiration,
      actions: [
        {
          type: "addItem",
          payloadHex: graphKeyPair.publicKey,
        },
      ],
    }
    const _addGraphKeyPayload = await createSignedGraphKeyPayload(
      userAddress,
      signatureFn,
      addGraphKeyArguments
    )
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
