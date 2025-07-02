import { GatewayFetchFn, SignatureFn } from "./types";
import { SiwfSignedRequest } from "@projectlibertylabs/siwf";
import { ChainInfoResponse, GatewaySiwfResponse } from "./gateway-types";
import {
  createLoginSiwfResponse,
  CreateLoginSiwfResponseArguments,
} from "./helpers/siwf";
import { v4 as generateRandomUuid } from "uuid";
import { postGatewaySiwf } from "./helpers/gateway";
import { convertSS58AddressToEthereum } from "./helpers/utils";

export async function processLogin(
  accountId: string,
  signatureFn: SignatureFn,
  gatewayFetchFn: GatewayFetchFn,
  callBackUri: string,
  chainInfo: ChainInfoResponse,
): Promise<GatewaySiwfResponse> {
  const chainId = chainInfo.genesis;
  const loginPayloadArguments: CreateLoginSiwfResponseArguments = {
    domain: new URL(callBackUri).hostname,
    uri: callBackUri,
    version: "1",
    nonce: generateRandomUuid(),
    chainId,
    issuedAt: JSON.stringify(new Date()),
  };
  const signedLoginSiwfResponse = await createLoginSiwfResponse(
    accountId,
    signatureFn,
    loginPayloadArguments,
  );

  const gatewaySiwfResponse = await postGatewaySiwf(
    gatewayFetchFn,
    signedLoginSiwfResponse,
  );

  return convertSS58AddressToEthereum(gatewaySiwfResponse);
}
