import {
  SiwfResponsePayload,
  SiwfSignedRequest,
} from "@projectlibertylabs/siwf";
import { SiwfResponseCredential } from "@projectlibertylabs/siwf/types/credential";
import {
  AccountResponse,
  ChainInfoResponse,
  GatewaySiwfResponse,
} from "../types/response-types";
import {
  createSignedAddProviderPayload,
  createSignedClaimHandlePayload,
} from "../helpers/payloads";
import { requestContainsCredentialType } from "../helpers/utils";
import { generateAndSignGraphKeyPayload } from "./generateAndSignGraphKeyPayload";
import { Address, SignatureFn } from "../types/param-types";
import { handleGenerateRecoverySecret } from "./handleGenerateRecoverySecret";

const PAYLOAD_EXPIRATION_DELTA = 90; // Matches frequency access config

export async function createSignUpPayloads(
  chainInfo: ChainInfoResponse,
  accountId: Address,
  signatureFn: SignatureFn,
  providerAccount: AccountResponse,
  decodedSiwfSignedRequest: SiwfSignedRequest,
  signUpHandle: string,
  signUpEmail: string,
): Promise<{
  payloads: SiwfResponsePayload[];
  rawCredentials: SiwfResponseCredential[];
  graphKey?: GatewaySiwfResponse["graphKey"];
  recoverySecret?: string;
}> {
  const payloads: SiwfResponsePayload[] = [];
  const rawCredentials: SiwfResponseCredential[] = [];
  let graphKey: GatewaySiwfResponse["graphKey"] | undefined = undefined;
  let recoverySecret: string | undefined = undefined;

  // Determine expiration
  const finalizedBlock = chainInfo.finalized_blocknumber;
  const expiration = finalizedBlock + PAYLOAD_EXPIRATION_DELTA;

  // Sign AddProvider
  const addProviderPayload = await createSignedAddProviderPayload(
    accountId,
    signatureFn,
    {
      authorizedMsaId: Number(providerAccount.msaId),
      schemaIds:
        decodedSiwfSignedRequest.requestedSignatures.payload.permissions,
      expiration,
    },
  );
  payloads.push(addProviderPayload);

  // Sign Handle
  const claimHandlePayload = await createSignedClaimHandlePayload(
    accountId,
    signatureFn,
    { baseHandle: signUpHandle, expiration },
  );
  payloads.push(claimHandlePayload);

  // Figure out if graph key was requested
  const graphKeyRequested = requestContainsCredentialType(
    decodedSiwfSignedRequest,
    "VerifiedGraphKeyCredential",
  );
  if (graphKeyRequested) {
    const { graphKeyCredential, graphKeyPayload } =
      await generateAndSignGraphKeyPayload(accountId, expiration, signatureFn);
    payloads.push(graphKeyPayload);
    rawCredentials.push(graphKeyCredential);
    graphKey = graphKeyCredential.credentialSubject;
  }

  // Sign Recovery Key
  const recoverySecretResponse = await handleGenerateRecoverySecret(
    signUpEmail,
    decodedSiwfSignedRequest,
    expiration,
    accountId,
    signatureFn,
  );
  if (recoverySecretResponse !== null) {
    const {
      recoverySecretCredential,
      recoverySecretPayload,
      recoverySecret: secret,
    } = recoverySecretResponse;
    payloads.push(recoverySecretPayload);
    rawCredentials.push(recoverySecretCredential);
    recoverySecret = secret;
  }

  return { payloads, rawCredentials, graphKey, recoverySecret };
}
