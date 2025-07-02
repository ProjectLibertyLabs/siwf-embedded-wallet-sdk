import { GatewayFetchFn, SignatureFn } from "../types/param-types";
import {
  ChainInfoResponse,
  GatewaySiwfResponse,
} from "../types/response-types";
import {
  createLoginSiwfResponse,
  CreateLoginSiwfResponseArguments,
} from "./siwf";
import { v4 as generateRandomUuid } from "uuid";
import { postGatewaySiwf } from "./gateway";
import { convertSS58AddressToEthereum } from "./utils";

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
