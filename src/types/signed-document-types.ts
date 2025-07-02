// https://chainagnostic.org/CAIPs/caip-122
import { Address } from "./param-types";

export interface CAIP122 {
  method: "personal_sign";
  params: [
    Address,
    string, // Signing Payload
  ];
}

// https://eips.ethereum.org/EIPS/eip-712#specification-of-the-eth_signtypeddata-json-rpc
export interface EIP712Document {
  types: {
    EIP712Domain: { name: string; type: string }[];
    [key: string]: { name: string; type: string }[];
  };
  primaryType: string;
  domain: {
    name: string;
    version: string;
    chainId: string;
    verifyingContract: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: Record<string, any>;
}

export interface EIP712 {
  method: "eth_signTypedData_v4";
  params: [Address, EIP712Document];
}
