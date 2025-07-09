import * as nacl from "tweetnacl";
import { HexString } from "@frequency-chain/ethereum-utils";
import { u8aToHex } from "@polkadot/util";
import {
  SiwfResponseCredentialGraph,
  SiwfResponseCredentialRecoverySecret,
  VerifiedRecoverySecret,
} from "@projectlibertylabs/siwf";
import { Address } from "../types/param-types";

export function generateGraphKeyCredential(
  accountId: Address,
  keyPair: nacl.BoxKeyPair,
): SiwfResponseCredentialGraph {
  return {
    "@context": [
      "https://www.w3.org/ns/credentials/v2",
      "https://www.w3.org/ns/credentials/undefined-terms/v2",
    ],
    type: ["VerifiedGraphKeyCredential", "VerifiableCredential"],
    issuer: `did:ethr:${accountId}`,
    validFrom: new Date().toISOString(),
    credentialSchema: {
      type: "JsonSchema",
      id: "https://schemas.frequencyaccess.com/VerifiedGraphKeyCredential/bciqmdvmxd54zve5kifycgsdtoahs5ecf4hal2ts3eexkgocyc5oca2y.json",
    },
    credentialSubject: {
      id: `did:ethr:${accountId}`,
      encodedPublicKeyValue: keyPair.publicKey.toString(),
      encodedPrivateKeyValue: keyPair.secretKey.toString(),
      encoding: "base16",
      format: "bare",
      type: "X25519",
      keyType: "dsnp.public-key-key-agreement",
    },
  };
}

export function generateRecoverySecretCredential(
  accountId: Address,
  recoverySecret: string,
): SiwfResponseCredentialRecoverySecret {
  return {
    "@context": [
      "https://www.w3.org/ns/credentials/v2",
      "https://www.w3.org/ns/credentials/undefined-terms/v2",
    ],
    type: ["VerifiedRecoverySecretCredential", "VerifiableCredential"],
    issuer: `did:ethr:${accountId}`,
    validFrom: new Date().toISOString(),
    credentialSchema: {
      type: "JsonSchema",
      id: VerifiedRecoverySecret.id,
    },
    credentialSubject: {
      id: `did:ethr:${accountId}`,
      recoverySecret,
    },
  };
}

export function generateGraphKeyPairAndCredential(accountId: Address): {
  graphKeyPair: { privateKey: HexString; publicKey: HexString };
  graphKeyCredential: SiwfResponseCredentialGraph;
} {
  const keyPair = nacl.box.keyPair();

  return {
    graphKeyPair: {
      privateKey: u8aToHex(keyPair.secretKey),
      publicKey: u8aToHex(keyPair.publicKey),
    },
    graphKeyCredential: generateGraphKeyCredential(accountId, keyPair),
  };
}
