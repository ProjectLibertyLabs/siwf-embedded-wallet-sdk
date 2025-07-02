import { TypedDataField, Wallet } from "ethers";
import { SignatureFn } from "../src/types/param-types";

/**
 * Test signature function
 * Signs using 0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac
 * @param request
 * @returns string
 */
export const TEST_SIGNATURE_FN: SignatureFn = async (request) => {
  // Alith: 0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac
  const privateKey =
    "0x5fb92d6e98884f76de468fa3f6278f8807c48bebc13595d45af5bdc4da702133";
  const wallet = new Wallet(privateKey);

  if (request.method === "personal_sign") {
    const [_address, message] = request.params;
    return await wallet.signMessage(message);
  }
  if (request.method === "eth_signTypedData_v4") {
    const [_address, typedData] = request.params;

    // Ethers forces this type to be removed
    const types: Record<string, TypedDataField[]> = structuredClone(
      typedData.types,
    );
    delete types["EIP712Domain"];

    return await wallet.signTypedData(
      typedData.domain,
      types,
      typedData.message,
    );
  }
  throw new Error("Incorrect method sent to the TEST_SIGNATURE_FN");
};
