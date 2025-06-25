import { getEip712BrowserRequestAddProvider, getEip712BrowserRequestItemizedSignaturePayloadV2, ItemizedAction } from "@frequency-chain/ethereum-utils"
import { EIP712Document, SignatureFn } from "../types";
import { AddProviderPayloadArguments, ItemActionsPayloadArguments, SiwfResponsePayloadAddProvider, SiwfResponsePayloadItemActions } from "src/siwf-types";
import { isHexString } from "./utils";


export async function createSignedAddProviderPayload(
  userAddress: string,
  signatureFn: SignatureFn,
  payloadArguments: AddProviderPayloadArguments,
  extrinsic: "createSponsoredAccountWithDelegation" | "grantDelegation" = "createSponsoredAccountWithDelegation"
): Promise<SiwfResponsePayloadAddProvider> {
  const addProviderEip712 = getEip712BrowserRequestAddProvider(
    payloadArguments.authorizedMsaId,
    payloadArguments.schemaIds,
    payloadArguments.expiration
  ) as EIP712Document
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
  }
}

export async function createSignedGraphKeyPayload(
  userAddress: string,
  signatureFn: SignatureFn,
  payloadArguments: ItemActionsPayloadArguments,
): Promise<SiwfResponsePayloadItemActions> {
  const actions: ItemizedAction[] = payloadArguments.actions.map(({ payloadHex }) => {
    if (isHexString(payloadHex)) {
      return {
        actionType: 'Add',
        data: payloadHex,
        index: 0,
      }
    } else throw new Error(`Expected HexString: ${payloadHex}`)
  })
  const addItemsEip712 = getEip712BrowserRequestItemizedSignaturePayloadV2(
    payloadArguments.schemaId,
    payloadArguments.targetHash,
    payloadArguments.expiration,
    actions,
  ) as EIP712Document
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
  }
}
