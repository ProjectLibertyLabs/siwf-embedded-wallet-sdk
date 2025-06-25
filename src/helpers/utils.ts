import { HexString } from "@frequency-chain/ethereum-utils";
import { u8aToHex } from "@polkadot/util";
import { addressToEvm } from "@polkadot/util-crypto"
import { ethers } from "ethers"

/**
 * Validate that a string is a valid hex string
 */
export function isHexString(value: string): value is HexString {
  // Check if string starts with '0x' and contains only hex characters
  const hexRegex = /^0[xX][0-9a-fA-F]*$/;
  const isHex = hexRegex.test(value);
  return isHex && value.length % 2 === 0;
}

// Con
export function convertSS58AddressToEthereum<T extends { controlKey: string }>(
  input: T,
): T {
  const ethereumAddress = ethers.getAddress(u8aToHex(addressToEvm(input.controlKey)))

  return {
    ...input,
    controlKey: ethereumAddress,
  };
}