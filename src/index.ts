import { GatewaySiwfResponse } from "./gateway-types.js";
import {
  ClaimHandlePayloadArguments,
  CreateLoginSiwfResponseArguments,
  ItemActionsPayloadArguments,
  SignInPayloads,
} from "./siwf-types.js";
import {
  createSignedAddProviderPayload,
  createSignedClaimHandlePayload,
  createSignedGraphKeyPayload,
} from "./helpers/payloads.js";
import { decodeSignedRequest } from "@projectlibertylabs/siwf";
import {
  getGatewayAccount,
  pollForAccount,
  postGatewaySiwf,
} from "./helpers/gateway.js";
import { GatewayFetchFn, MsaCreationCallbackFn, SignatureFn } from "./types.js";
import { generateGraphKeyPair } from "./helpers/crypto.js";
import { convertSS58AddressToEthereum } from "./helpers/utils.js";
import { v4 as generateRandomUuid } from "uuid";
import {
  createLoginSiwfResponse,
  createSignInSiwfResponse,
} from "./helpers/siwf";

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
    const expiration = 100; // TODO: Calculate correctly based on chain state
    const graphKeyPair = generateGraphKeyPair();
    // Generate Recovery Key

    // Sign AddProvider
    const requestedPermissions =
      decodedSiwfSignedRequest.requestedSignatures.payload.permissions;
    const addProviderArguments = {
      authorizedMsaId: providerAccount.msaId,
      schemaIds: requestedPermissions,
      expiration,
    };
    const addProviderPayload = await createSignedAddProviderPayload(
      userAddress,
      signatureFn,
      addProviderArguments,
    );

    // Sign Handle
    const claimHandleArguments: ClaimHandlePayloadArguments = {
      baseHandle: signUpHandle,
      expiration,
    };
    const claimHandlePayload = await createSignedClaimHandlePayload(
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
    const addGraphKeyPayload = await createSignedGraphKeyPayload(
      userAddress,
      signatureFn,
      addGraphKeyArguments,
    );
    // Sign Recovery Key
    // const _ignoreForMockSetRecoveryHashSignature = await signatureFn({
    //   method: "eth_signTypedData_v4",
    //   params: [userAddress, addRecoveryHash712],
    // });

    const payloads: SignInPayloads = [
      addProviderPayload,
      addGraphKeyPayload,
      claimHandlePayload,
    ];

    const siwfResponse = await createSignInSiwfResponse(userAddress, payloads);

    // Submit to Gateway
    const gatewaySiwfResponse = await postGatewaySiwf(
      gatewayFetchFn,
      siwfResponse,
    );

    // Kick off the msaCallback
    // Don't wait the pollForAccount. Let it complete after the return.
    if (msaCreationCallbackFn) {
       
      pollForAccount(gatewayFetchFn, userAddress, msaCreationCallbackFn);
    }

    return convertSS58AddressToEthereum(gatewaySiwfResponse);
  } else {
    // Process Login
    const loginPayloadArguments: CreateLoginSiwfResponseArguments = {
      domain: new URL(
        decodedSiwfSignedRequest.requestedSignatures.payload.callback,
      ).hostname,
      uri: decodedSiwfSignedRequest.requestedSignatures.payload.callback,
      version: "1",
      nonce: generateRandomUuid(),
      chainId:
        "0x4a587bf17a404e3572747add7aab7bbe56e805a5479c6c436f07f36fcc8d3ae1", //hardcoded mainnet
      // when we implement get Block Info, the genesis will be in that object. use that value here.
      issuedAt: JSON.stringify(new Date()),
    };
    const signedLoginSiwfResponse = await createLoginSiwfResponse(
      userAddress,
      signatureFn,
      loginPayloadArguments,
    );

    const gatewaySiwfResponse = await postGatewaySiwf(
      gatewayFetchFn,
      signedLoginSiwfResponse,
    );

    return convertSS58AddressToEthereum(gatewaySiwfResponse);
  }
}
