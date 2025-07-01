import { SignatureFn } from "../types";
import { SiwfResponsePayload, SiwfResponse } from "@projectlibertylabs/siwf";
import { encodedValueToSignature, accountIdToPublicKey } from "./utils";

export interface CreateLoginSiwfResponseArguments
  extends Record<string, unknown> {
  domain: string;
  uri: string;
  version: string;
  chainId: string;
  nonce?: string;
  issuedAt?: string;
}

export async function createLoginSiwfResponse(
  accountId: string,
  signatureFn: SignatureFn,
  payloadArguments: CreateLoginSiwfResponseArguments,
): Promise<SiwfResponse> {
  const loginCaip122 = `${payloadArguments.domain} wants you to sign in with your Frequency account:
    frequency:${payloadArguments.chainId}:${accountId}
    
    URI: ${payloadArguments.uri}
    Version: ${payloadArguments.version}
    Nonce: ${payloadArguments.nonce}
    Chain ID: frequency:${payloadArguments.chainId}
    Issued At: ${payloadArguments.issuedAt}`;

  const encodedValue = await signatureFn({
    method: "personal_sign",
    params: [accountId, loginCaip122],
  });

  const userPublicKey = accountIdToPublicKey(accountId);

  const signature = encodedValueToSignature(encodedValue);

  return {
    userPublicKey,
    payloads: [
      {
        signature,
        type: "login",
        payload: {
          message: loginCaip122,
        },
      },
    ],
    credentials: [],
  };
}

export async function createSignInSiwfResponse(
  accountId: string,
  payloads: SiwfResponsePayload[],
): Promise<SiwfResponse> {
  const userPublicKey = accountIdToPublicKey(accountId);
  return {
    userPublicKey,
    payloads,
    credentials: [],
  };
}
