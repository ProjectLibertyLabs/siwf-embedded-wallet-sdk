import { privateKeyToAccount } from "viem/accounts";
import { SignatureFn } from "../src/types/param-types";
import { hexToBigInt, TypedDataDomain } from "viem";
import { EIP712Document } from "../src/types/signed-document-types";

const toViemCompatibleDomain = (inputDomain: EIP712Document["domain"]): TypedDataDomain => {
  const { chainId: sourceChainId, verifyingContract: sourceVerifyingContract, ...restDomain } = inputDomain
  const chainId = hexToBigInt(sourceChainId as `0x${string}`)
  const verifyingContract = sourceVerifyingContract as `0x${string}`

  return { chainId, verifyingContract, ...restDomain }
}

/**
 * Test signature function
 * Signs using 0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac
 * @param request
 * @returns string
 */
export const TEST_SIGNATURE_FN: SignatureFn = async (request) => {
  const account = privateKeyToAccount(
    "0x5fb92d6e98884f76de468fa3f6278f8807c48bebc13595d45af5bdc4da702133"
  );

  if (request.method === "personal_sign") {
    const [_address, message] = request.params;
    return await account.signMessage({ message });
  }

  if (request.method === "eth_signTypedData_v4") {
    const [_address, typedData] = request.params;
    const { domain, types, message } = typedData;

    const updatedDomain = toViemCompatibleDomain(domain)
    // Drop EIP712Domain from `types`
    const { EIP712Domain: _, ...filteredTypes } = types;

    return await account.signTypedData({
      domain: updatedDomain,
      types: filteredTypes,
      primaryType: typedData.primaryType,
      message,
    });
  }

  throw new Error("Incorrect method sent to the TEST_SIGNATURE_FN");
};
