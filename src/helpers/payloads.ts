import {
  getEip712BrowserRequestAddProvider,
  getEip712BrowserRequestClaimHandlePayload,
  getEip712BrowserRequestItemizedSignaturePayloadV2,
  getEip712BrowserRequestSiwfSignedRequestPayload,
  ItemizedAction,
} from "@frequency-chain/ethereum-utils";
import { EIP712Document, SignatureFn } from "../types";
import {
  AddProviderPayloadArguments,
  ClaimHandlePayloadArguments,
  CreateSignedLogInPayloadArguments,
  ItemActionsPayloadArguments,
  SiwfResponsePayloadAddProvider,
  SiwfResponsePayloadClaimHandle,
  SiwfResponsePayloadItemActions,
} from "src/siwf-types";
import { isHexString } from "./utils";
import { mockCaip122 } from "../signature-requests";

export async function createSignedAddProviderPayload(
  userAddress: string,
  signatureFn: SignatureFn,
  payloadArguments: AddProviderPayloadArguments,
  extrinsic:
    | "createSponsoredAccountWithDelegation"
    | "grantDelegation" = "createSponsoredAccountWithDelegation",
): Promise<SiwfResponsePayloadAddProvider> {
  const addProviderEip712 = getEip712BrowserRequestAddProvider(
    payloadArguments.authorizedMsaId,
    payloadArguments.schemaIds,
    payloadArguments.expiration,
  ) as EIP712Document;
  const signature = await signatureFn({
    method: "eth_signTypedData_v4",
    params: [userAddress, addProviderEip712],
  });

  return {
    signature: {
      algo: "SECP256K1",
      encoding: "base16",
      encodedValue: signature,
    },
    endpoint: {
      pallet: "msa",
      extrinsic,
    },
    type: "addProvider",
    payload: payloadArguments,
  };
}

export async function createSignedClaimHandlePayload(
  userAddress: string,
  signatureFn: SignatureFn,
  payloadArguments: ClaimHandlePayloadArguments,
): Promise<SiwfResponsePayloadClaimHandle> {
  const claimHandleEip712 = getEip712BrowserRequestClaimHandlePayload(
    payloadArguments.baseHandle,
    payloadArguments.expiration,
  ) as EIP712Document;
  const signature = await signatureFn({
    method: "eth_signTypedData_v4",
    params: [userAddress, claimHandleEip712],
  });

  return {
    signature: {
      algo: "SECP256K1",
      encoding: "base16",
      encodedValue: signature,
    },
    endpoint: {
      pallet: "handles",
      extrinsic: "claimHandle",
    },
    type: "claimHandle",
    payload: payloadArguments,
  };
}
export async function createSignedGraphKeyPayload(
  userAddress: string,
  signatureFn: SignatureFn,
  payloadArguments: ItemActionsPayloadArguments,
): Promise<SiwfResponsePayloadItemActions> {
  const actions: ItemizedAction[] = payloadArguments.actions.map(
    ({ payloadHex }) => {
      if (isHexString(payloadHex)) {
        return {
          actionType: "Add",
          data: payloadHex,
          index: 0,
        };
      } else throw new Error(`Expected HexString: ${payloadHex}`);
    },
  );
  const addItemsEip712 = getEip712BrowserRequestItemizedSignaturePayloadV2(
    payloadArguments.schemaId,
    payloadArguments.targetHash,
    payloadArguments.expiration,
    actions,
  ) as EIP712Document;
  const signature = await signatureFn({
    method: "eth_signTypedData_v4",
    params: [userAddress, addItemsEip712],
  });

  return {
    signature: {
      algo: "SECP256K1",
      encoding: "base16",
      encodedValue: signature,
    },
    endpoint: {
      pallet: "statefulStorage",
      extrinsic: "applyItemActionsWithSignatureV2",
    },
    type: "itemActions",
    payload: payloadArguments,
  };
}

export async function createSignedLogInPayload(
  userAddress: string,
  signatureFn: SignatureFn,
  payloadArguments: CreateSignedLogInPayloadArguments,
): Promise<any> {
  const loginCaip122 = `text
    ${payloadArguments.domain} wants you to sign in with your Frequency account:${userAddress}
    
    URI: ${payloadArguments.uri}
    Version: ${payloadArguments.version}
    Nonce: ${payloadArguments.nonce}
    Chain ID: frequency:${payloadArguments.chainId}
    Issued At: ${payloadArguments.issuedAt}
  `;
  const signature = await signatureFn({
    method: "personal_sign",
    params: [userAddress, loginCaip122],
  });

  return {
    signature: {
      algo: "SECP256K1",
      encoding: "base16",
      encodedValue: signature,
    },
    type: "login",
    payload: {
      message: loginCaip122,
    },
  };
}
