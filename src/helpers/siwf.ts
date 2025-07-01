import { SignatureFn } from "../types";
import { SiwfResponsePayload, SiwfResponse } from "@projectlibertylabs/siwf";
import { encodedValueToSignature, userAddressToPublicKey } from "./utils";

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
  userAddress: string,
  signatureFn: SignatureFn,
  payloadArguments: CreateLoginSiwfResponseArguments,
): Promise<SiwfResponse> {
  const loginCaip122 = `${payloadArguments.domain} wants you to sign in with your Frequency account:
frequency:${payloadArguments.chainId}:${userAddress}

URI: ${payloadArguments.uri}
Version: ${payloadArguments.version}
Nonce: ${payloadArguments.nonce}
Chain ID: frequency:${payloadArguments.chainId}
Issued At: ${payloadArguments.issuedAt}`;

  const encodedValue = await signatureFn({
    method: "personal_sign",
    params: [userAddress, loginCaip122],
  });

  const userPublicKey = userAddressToPublicKey(userAddress);

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
  userAddress: string,
  payloads: SiwfResponsePayload[],
): Promise<SiwfResponse> {
  const userPublicKey = userAddressToPublicKey(userAddress);
  return {
    userPublicKey,
    payloads,
    credentials: [],
  };
}
