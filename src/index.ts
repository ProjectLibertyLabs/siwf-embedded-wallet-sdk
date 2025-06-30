import { GatewaySiwfResponse } from "./gateway-types.js";
import {
  ClaimHandlePayloadArguments,
  CreateSignedLogInPayloadArguments,
  ItemActionsPayloadArguments,
} from "./siwf-types.js";
import { mockNewUserResponse } from "./static-mocks/response-new-user.js";
import { mockLoginResponse } from "./static-mocks/response-login.js";
import { mockGatewayNewUserResponse } from "./static-mocks/gateway-new-user.js";
import { mockGatewayLoginResponse } from "./static-mocks/gateway-login.js";
import {
  createSignedAddProviderPayload,
  createSignedClaimHandlePayload,
  createSignedGraphKeyPayload,
  createSignedLogInPayload,
} from "./helpers/payloads.js";
import { decodeSignedRequest } from "@projectlibertylabs/siwf";
import {
  getGatewayAccount,
  getGatewayChainInfo,
  pollForAccount,
  postGatewaySiwf,
} from "./helpers/gateway.js";
import { GatewayFetchFn, MsaCreationCallbackFn, SignatureFn } from "./types.js";
import { generateGraphKeyPair } from "./helpers/crypto.js";
import { convertSS58AddressToEthereum } from "./helpers/utils.js";
import { v4 as generateRandomUuid } from "uuid";

const PAYLOAD_EXPIRATION_DELTA = 90; // Matches frequency access config

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
    throw new Error("Unable to find provider account!");
  }

  if (!hasAccount) {
    // Validate incoming values
    if (!signUpEmail)
      throw new Error("signUpEmail missing for non-existent account.");
    if (!signUpHandle)
      throw new Error("signUpHandle missing for non-existent account.");

    // Generate Graph Key
    const graphKeyPair = generateGraphKeyPair();
    // Generate Recovery Key

    // Determine expiration
    const currentBlock = (await getGatewayChainInfo(gatewayFetchFn)).blocknumber;
    const expiration = currentBlock + PAYLOAD_EXPIRATION_DELTA;

    // Sign AddProvider
    const requestedPermissions =
      decodedSiwfSignedRequest.requestedSignatures.payload.permissions;
    const addProviderArguments = {
      authorizedMsaId: providerAccount.msaId,
      schemaIds: requestedPermissions,
      expiration,
    };
    const _addProviderPayload = await createSignedAddProviderPayload(
      userAddress,
      signatureFn,
      addProviderArguments,
    );

    // Sign Handle
    const claimHandleArguments: ClaimHandlePayloadArguments = {
      baseHandle: signUpHandle,
      expiration,
    };
    const _claimHandlePayload = await createSignedClaimHandlePayload(
      userAddress,
      signatureFn,
      claimHandleArguments,
    );

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
    };
    const _addGraphKeyPayload = await createSignedGraphKeyPayload(
      userAddress,
      signatureFn,
      addGraphKeyArguments,
    );
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
    return convertSS58AddressToEthereum(mockGatewayNewUserResponse());
  } else {
    // Process Login
    const chainId = (await getGatewayChainInfo(gatewayFetchFn)).genesis;
    const loginPayloadArguments: CreateSignedLogInPayloadArguments = {
      domain: new URL(
        decodedSiwfSignedRequest.requestedSignatures.payload.callback,
      ).hostname,
      uri: decodedSiwfSignedRequest.requestedSignatures.payload.callback,
      version: "1",
      nonce: generateRandomUuid(),
      chainId,
      issuedAt: JSON.stringify(new Date()),
    };
    const _signedLoginSiwfResponse = createSignedLogInPayload(
      userAddress,
      signatureFn,
      loginPayloadArguments,
    );

    // TODO: Build the mock siwfResponse
    const siwfResponse = mockLoginResponse();

    const _ignoreForMockGatewaySiwfResponse = await postGatewaySiwf(
      gatewayFetchFn,
      siwfResponse,
    );

    // Actual:
    // return _ignoreForMockGatewaySiwfResponse;
    // Return Mock
    return convertSS58AddressToEthereum(mockGatewayLoginResponse());
  }
}
