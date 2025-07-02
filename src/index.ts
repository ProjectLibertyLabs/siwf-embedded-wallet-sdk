import {
  AccountResponse,
  ChainInfoResponse,
  GatewaySiwfResponse,
} from "./gateway-types.js";
import {
  SiwfResponsePayloadClaimHandle,
  SiwfResponsePayloadItemActions,
  SiwfResponsePayload,
  decodeSignedRequest,
  SiwfSignedRequest,
} from "@projectlibertylabs/siwf";
import {
  createSignedAddProviderPayload,
  createSignedClaimHandlePayload,
  createSignedGraphKeyPayload,
} from "./helpers/payloads.js";
import {
  getGatewayAccount,
  getGatewayChainInfo,
  pollForAccount,
  postGatewaySiwf,
} from "./helpers/gateway.js";
import { GatewayFetchFn, MsaCreationCallbackFn, SignatureFn } from "./types.js";
import { generateGraphKeyPair } from "./helpers/crypto.js";
import {
  convertSS58AddressToEthereum,
  requestContainsCredentialType,
} from "./helpers/utils.js";
import { v4 as generateRandomUuid } from "uuid";
import {
  createLoginSiwfResponse,
  CreateLoginSiwfResponseArguments,
  createSignInSiwfResponse,
} from "./helpers/siwf";

const PAYLOAD_EXPIRATION_DELTA = 90; // Matches frequency access config

async function generateAndSignGraphKeyPayload(
  userAddress: string,
  expiration: number,
  signatureFn: SignatureFn,
): Promise<SiwfResponsePayloadItemActions> {
  // Generate Graph Key
  const graphKeyPair = generateGraphKeyPair();
  // Sign Graph Key Add
  const addGraphKeyArguments: SiwfResponsePayloadItemActions["payload"] = {
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

  return await createSignedGraphKeyPayload(
    userAddress,
    signatureFn,
    addGraphKeyArguments,
  );
}

async function processSignUp(
  userAddress: string,
  signatureFn: SignatureFn,
  gatewayFetchFn: GatewayFetchFn,
  decodedSiwfSignedRequest: SiwfSignedRequest,
  providerAccount: AccountResponse,
  chainInfo: ChainInfoResponse,
  signUpHandle: string,
  msaCreationCallbackFn?: MsaCreationCallbackFn,
): Promise<GatewaySiwfResponse> {
  // Determine expiration
  const finalizedBlock = chainInfo.finalized_blocknumber;
  const expiration = finalizedBlock + PAYLOAD_EXPIRATION_DELTA;

  // Sign AddProvider
  const requestedPermissions =
    decodedSiwfSignedRequest.requestedSignatures.payload.permissions;
  const addProviderArguments = {
    authorizedMsaId: Number(providerAccount.msaId),
    schemaIds: requestedPermissions,
    expiration,
  };
  const addProviderPayload = await createSignedAddProviderPayload(
    userAddress,
    signatureFn,
    addProviderArguments,
  );

  // Sign Handle
  const claimHandleArguments: SiwfResponsePayloadClaimHandle["payload"] = {
    baseHandle: signUpHandle,
    expiration,
  };
  const claimHandlePayload = await createSignedClaimHandlePayload(
    userAddress,
    signatureFn,
    claimHandleArguments,
  );

  // Figure out if graph key was requested
  const graphKeyRequested = requestContainsCredentialType(
    decodedSiwfSignedRequest,
    "VerifiedGraphKeyCredential",
  );
  const optionalPayloads: SiwfResponsePayload[] = [];

  if (graphKeyRequested) {
    optionalPayloads.push(
      await generateAndSignGraphKeyPayload(
        userAddress,
        expiration,
        signatureFn,
      ),
    );
  }

  // Sign Recovery Key
  // const _ignoreForMockSetRecoveryHashSignature = await signatureFn({
  //   method: "eth_signTypedData_v4",
  //   params: [userAddress, addRecoveryHash712],
  // });

  const payloads: SiwfResponsePayload[] = optionalPayloads.concat([
    addProviderPayload,
    claimHandlePayload,
  ]);

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
}

async function processLogin(
  userAddress: string,
  signatureFn: SignatureFn,
  gatewayFetchFn: GatewayFetchFn,
  decodedSiwfSignedRequest: SiwfSignedRequest,
  chainInfo: ChainInfoResponse,
): Promise<GatewaySiwfResponse> {
  const chainId = chainInfo.genesis;
  const loginPayloadArguments: CreateLoginSiwfResponseArguments = {
    domain: new URL(
      decodedSiwfSignedRequest.requestedSignatures.payload.callback,
    ).hostname,
    uri: decodedSiwfSignedRequest.requestedSignatures.payload.callback,
    version: "1",
    nonce: generateRandomUuid(),
    chainId,
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

export async function startSiwf(
  userAddress: string,
  signatureFn: SignatureFn,
  gatewayFetchFn: GatewayFetchFn,
  encodedSiwfSignedRequest: string,
  signUpHandle?: string,
  signUpEmail?: string,
  msaCreationCallbackFn?: MsaCreationCallbackFn,
): Promise<GatewaySiwfResponse> {
  const decodedSiwfSignedRequest = decodeSignedRequest(
    encodedSiwfSignedRequest,
  );
  const providerAddress =
    decodedSiwfSignedRequest.requestedSignatures.publicKey.encodedValue;

  const [userAccount, providerAccount, chainInfo] = await Promise.all([
    getGatewayAccount(gatewayFetchFn, userAddress),
    getGatewayAccount(gatewayFetchFn, providerAddress),
    getGatewayChainInfo(gatewayFetchFn),
  ]);

  if (providerAccount === null) {
    throw new Error("Unable to find provider account!");
  }

  if (!userAccount) {
    // Validate incoming values
    if (!signUpEmail)
      throw new Error("signUpEmail missing for non-existent account.");
    if (!signUpHandle)
      throw new Error("signUpHandle missing for non-existent account.");

    return await processSignUp(
      userAddress,
      signatureFn,
      gatewayFetchFn,
      decodedSiwfSignedRequest,
      providerAccount,
      chainInfo,
      signUpHandle,
      msaCreationCallbackFn,
    );
  } else {
    return await processLogin(
      userAddress,
      signatureFn,
      gatewayFetchFn,
      decodedSiwfSignedRequest,
      chainInfo,
    );
  }
}
