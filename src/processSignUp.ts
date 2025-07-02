import { GatewayFetchFn, MsaCreationCallbackFn, SignatureFn } from "./types";
import {
  SiwfResponsePayload,
  SiwfResponsePayloadClaimHandle,
  SiwfResponsePayloadItemActions,
  SiwfSignedRequest,
} from "@projectlibertylabs/siwf";
import {
  AccountResponse,
  ChainInfoResponse,
  GatewaySiwfResponse,
} from "./gateway-types";
import {
  createSignedAddProviderPayload,
  createSignedClaimHandlePayload,
  createSignedGraphKeyPayload,
} from "./helpers/payloads";
import {
  convertSS58AddressToEthereum,
  requestContainsCredentialType,
} from "./helpers/utils";
import { createSignInSiwfResponse } from "./helpers/siwf";
import { pollForAccount, postGatewaySiwf } from "./helpers/gateway";
import { generateGraphKeyPair } from "./helpers/crypto";

const PAYLOAD_EXPIRATION_DELTA = 90; // Matches frequency access config

async function generateAndSignGraphKeyPayload(
  accountId: string,
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
    accountId,
    signatureFn,
    addGraphKeyArguments,
  );
}

export async function processSignUp(
  accountId: string,
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
    accountId,
    signatureFn,
    addProviderArguments,
  );

  // Sign Handle
  const claimHandleArguments: SiwfResponsePayloadClaimHandle["payload"] = {
    baseHandle: signUpHandle,
    expiration,
  };
  const claimHandlePayload = await createSignedClaimHandlePayload(
    accountId,
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
      await generateAndSignGraphKeyPayload(accountId, expiration, signatureFn),
    );
  }

  // Sign Recovery Key
  // const _ignoreForMockSetRecoveryHashSignature = await signatureFn({
  //   method: "eth_signTypedData_v4",
  //   params: [accountId, addRecoveryHash712],
  // });

  const payloads: SiwfResponsePayload[] = optionalPayloads.concat([
    addProviderPayload,
    claimHandlePayload,
  ]);

  const siwfResponse = await createSignInSiwfResponse(accountId, payloads);

  // Submit to Gateway
  const gatewaySiwfResponse = await postGatewaySiwf(
    gatewayFetchFn,
    siwfResponse,
  );

  // Kick off the msaCallback
  // Don't wait the pollForAccount. Let it complete after the return.
  if (msaCreationCallbackFn) {
    pollForAccount(gatewayFetchFn, accountId, msaCreationCallbackFn);
  }

  return convertSS58AddressToEthereum(gatewaySiwfResponse);
}
