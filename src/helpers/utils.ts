import { HexString } from "@frequency-chain/ethereum-utils";
import { u8aToHex } from "@polkadot/util";
import { addressToEvm } from "@polkadot/util-crypto";
import { SiwfSignedRequest, SiwfPublicKey } from "@projectlibertylabs/siwf";
import { keccak_256 } from "@noble/hashes/sha3";

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
  const ethereumAddress = toChecksumAddress(
    u8aToHex(addressToEvm(objectContainingControlKey.controlKey)),
  );

  return {
    ...objectContainingControlKey,
    controlKey: ethereumAddress,
  };
}

export function accountIdToPublicKey(accountId: string): SiwfPublicKey {
  return {
    encodedValue: toChecksumAddress(accountId),
    encoding: "base16",
    format: "eip-55",
    type: "Secp256k1",
  };
}

export function encodedValueToSignature(
  encodedValue: string,
): SiwfSignedRequest["requestedSignatures"]["signature"] {
  return {
    algo: "SECP256K1",
    encoding: "base16",
    encodedValue: encodedValue,
  };
}

export function requestContainsCredentialType(
  request: SiwfSignedRequest,
  targetType: string,
): boolean {
  if (!request.requestedCredentials) return false;

  return request.requestedCredentials.some((credRequest) => {
    if ("anyOf" in credRequest) {
      return credRequest.anyOf.some((cred) => cred.type === targetType);
    } else {
      return credRequest.type === targetType;
    }
  });
}

function stripAddress(address: string) {
  return (
    address.slice(0, 2) === "0x" ? address.slice(2) : address
  ).toLowerCase();
}

export function toChecksumAddress(
  address: string,
  chainId: string | null = null,
) {
  if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
    throw new Error(
      `Given address "${address}" is not a valid Ethereum address.`,
    );
  }
  const strippedAddress = stripAddress(address);

  const prefix = chainId != null ? chainId.toString() + "0x" : "";
  const keccakHash = stripAddress(
    u8aToHex(keccak_256(prefix + strippedAddress)),
  );
  let checksumAddress = "0x";

  for (let i = 0; i < strippedAddress.length; i++) {
    checksumAddress +=
      parseInt(keccakHash[i]!, 16) >= 8
        ? strippedAddress[i]?.toUpperCase()
        : strippedAddress[i];
  }

  return checksumAddress;
}
