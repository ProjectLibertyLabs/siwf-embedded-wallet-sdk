import {
  getEip712BrowserRequestAddProvider,
  getEip712BrowserRequestClaimHandlePayload,
  getEip712BrowserRequestItemizedSignaturePayloadV2,
  ItemizedAction,
} from "@frequency-chain/ethereum-utils";
import { EIP712Document, SignatureFn } from "../types";
import {
  SiwfResponsePayloadAddProvider,
  SiwfResponsePayloadClaimHandle,
  SiwfResponsePayloadItemActions,
} from "@projectlibertylabs/siwf";
import { encodedValueToSignature, isHexString } from "./utils";

export async function createSignedAddProviderPayload(
  accountId: string,
  signatureFn: SignatureFn,
  payloadArguments: SiwfResponsePayloadAddProvider["payload"],
  extrinsic:
    | "createSponsoredAccountWithDelegation"
    | "grantDelegation" = "createSponsoredAccountWithDelegation",
): Promise<SiwfResponsePayloadAddProvider> {
  const addProviderEip712 = getEip712BrowserRequestAddProvider(
    BigInt(payloadArguments.authorizedMsaId),
    payloadArguments.schemaIds,
    payloadArguments.expiration,
  ) as EIP712Document;
  const encodedValue = await signatureFn({
    method: "eth_signTypedData_v4",
    params: [accountId, addProviderEip712],
  });

  const signature = encodedValueToSignature(encodedValue);

  return {
    signature,
    endpoint: {
      pallet: "msa",
      extrinsic,
    },
    type: "addProvider",
    payload: payloadArguments,
  };
}

export async function createSignedClaimHandlePayload(
  accountId: string,
  signatureFn: SignatureFn,
  payloadArguments: SiwfResponsePayloadClaimHandle["payload"],
): Promise<SiwfResponsePayloadClaimHandle> {
  const claimHandleEip712 = getEip712BrowserRequestClaimHandlePayload(
    payloadArguments.baseHandle,
    payloadArguments.expiration,
  ) as EIP712Document;
  const encodedValue = await signatureFn({
    method: "eth_signTypedData_v4",
    params: [accountId, claimHandleEip712],
  });

  const signature = encodedValueToSignature(encodedValue);

  return {
    signature,
    endpoint: {
      pallet: "handles",
      extrinsic: "claimHandle",
    },
    type: "claimHandle",
    payload: payloadArguments,
  };
}

export async function createSignedGraphKeyPayload(
  accountId: string,
  signatureFn: SignatureFn,
  payloadArguments: SiwfResponsePayloadItemActions["payload"],
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

  const encodedValue = await signatureFn({
    method: "eth_signTypedData_v4",
    params: [accountId, addItemsEip712],
  });

  const signature = encodedValueToSignature(encodedValue);

  return {
    signature,
    endpoint: {
      pallet: "statefulStorage",
      extrinsic: "applyItemActionsWithSignatureV2",
    },
    type: "itemActions",
    payload: payloadArguments,
  };
}
