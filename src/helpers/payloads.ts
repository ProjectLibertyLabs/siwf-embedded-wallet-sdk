import { getEip712BrowserRequestAddProvider } from "@frequency-chain/ethereum-utils"
import { EIP712Document, SignatureFn } from "../types";
import { AddProviderPayloadArguments, SiwfResponsePayloadAddProvider } from "src/siwf-types";


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
