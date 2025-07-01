import { HexString } from "@frequency-chain/ethereum-utils";
import { u8aToHex } from "@polkadot/util";
import { addressToEvm } from "@polkadot/util-crypto";
import { ethers } from "ethers";
import { SiwfResponsePayloadSignature, SiwfPublicKey } from "../siwf-types";
import { SiwfCredentialRequest, SiwfSignedRequest } from "@projectlibertylabs/siwf";

/**
 * Validate that a string is a valid hex string
 */
export function isHexString(value: string): value is HexString {
  // Check if string starts with '0x' and contains only hex characters
  const hexRegex = /^0[xX][0-9a-fA-F]*$/;
  const isHex = hexRegex.test(value);
  return isHex && value.length % 2 === 0;
}

// Converts an SS58-encoded 'universal' frequency address into a checksum (EIP-55)
// encoded ethereum address.
export function convertSS58AddressToEthereum<T extends { controlKey: string }>(
  objectContainingControlKey: T,
): T {
  const ethereumAddress = ethers.getAddress(
    u8aToHex(addressToEvm(objectContainingControlKey.controlKey)),
  );

  return {
    ...objectContainingControlKey,
    controlKey: ethereumAddress,
  };
}

export function userAddressToPublicKey(userAddress: string): SiwfPublicKey {
  return {
    encodedValue: ethers.getAddress(userAddress),
    encoding: "base16",
    format: "eip-55",
    type: "Secp256k1",
  };
}

export function encodedValueToSignature(
  encodedValue: string,
): SiwfResponsePayloadSignature {
  return {
    algo: "SECP256K1",
    encoding: "base16",
    encodedValue: encodedValue,
  };
}

// TODO: Write some
export function requestContainsCredentialType(request: SiwfSignedRequest, targetType: string): boolean {
  const credentials = request.requestedCredentials

  if (credentials !== undefined) {
    credentials.forEach((c) => {

    })
  }

  return false
}