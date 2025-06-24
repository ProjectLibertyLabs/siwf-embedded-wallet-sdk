import { AccountResponse, GatewaySiwfResponse } from "./gateway-types.js";
export declare type SignatureFn = (
  address: string,
  standard: "eip712" | "caip122",
  payload: string,
) => Promise<string>;
interface GatewayFetchBody {
  authorizationPayload: string;
}
export declare type GatewayFetchFn = (
  method: "GET" | "POST" | "PUT",
  path: string,
  body?: GatewayFetchBody,
) => Promise<Response>;
export declare type MsaCreationCallbackFn = (account: AccountResponse) => void;
export declare function setMockForExistingGatewayAccount(
  mockValue: null | AccountResponse,
): void;
export declare function setMockForCreationGatewayAccount(
  mockValue: AccountResponse,
): void;
export declare function startSiwf(
  userAddress: string,
  signatureFn: SignatureFn,
  gatewayFetchFn: GatewayFetchFn,
  encodedSiwfSignedRequest?: string,
  signUpHandle?: string,
  signUpEmail?: string,
  msaCreationCallbackFn?: MsaCreationCallbackFn,
): Promise<GatewaySiwfResponse>;
export {};
