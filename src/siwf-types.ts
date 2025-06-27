// TODO: Use the siwf library instead of copying these types?
// NOTE: The `siwf` types do not support 'Secp256k1' for `AlgorithmType`

import { HexString } from "@frequency-chain/ethereum-utils";

type CurveType = "Sr25519" | "Secp256k1";

type AlgorithmType = "SR25519" | "SECP256K1";

type SupportedPayload = unknown;

export type SignedPayload = Uint8Array | SupportedPayload;

export interface SiwfPublicKey {
  encodedValue: string;
  encoding: "base58" | "base16";
  format: "ss58" | "eip-55";
  type: CurveType;
}

interface SiwfResponsePayloadEndpoint {
  pallet: string;
  extrinsic: string;
}

interface SiwfResponsePayloadBase {
  signature: {
    algo: AlgorithmType;
    encoding: "base16";
    encodedValue: string;
  };
  endpoint?: SiwfResponsePayloadEndpoint;
  type: string;
  payload: Record<string, unknown>;
}

export interface AddProviderPayloadArguments extends Record<string, unknown> {
  authorizedMsaId: string;
  schemaIds: number[];
  expiration: number;
}

export interface SiwfResponsePayloadAddProvider
  extends SiwfResponsePayloadBase {
  endpoint: {
    pallet: "msa";
    extrinsic: "createSponsoredAccountWithDelegation" | "grantDelegation";
  };
  type: "addProvider";
  payload: AddProviderPayloadArguments;
}

export interface ItemActionsPayloadArguments extends Record<string, unknown> {
  schemaId: number;
  targetHash: number;
  expiration: number;
  actions: {
    type: "addItem";
    payloadHex: HexString;
  }[];
}

export interface SiwfResponsePayloadItemActions
  extends SiwfResponsePayloadBase {
  endpoint: {
    pallet: "statefulStorage";
    extrinsic: "applyItemActionsWithSignatureV2";
  };
  type: "itemActions";
  payload: ItemActionsPayloadArguments;
}

export interface ClaimHandlePayloadArguments extends Record<string, unknown> {
  baseHandle: string;
  expiration: number;
}

export interface SiwfResponsePayloadClaimHandle
  extends SiwfResponsePayloadBase {
  endpoint: {
    pallet: "handles";
    extrinsic: "claimHandle";
  };
  type: "claimHandle";
  payload: {
    baseHandle: string;
    expiration: number;
  };
}

export type SiwfResponsePayload =
  | SiwfResponsePayloadAddProvider
  | SiwfResponsePayloadItemActions
  | SiwfResponsePayloadClaimHandle
  | SiwfResponsePayloadBase;

export interface CreateSignedLogInPayloadArguments
  extends Record<string, unknown> {
  domain: string;
  uri: string;
  version: string;
  chainId: string;
  nonce?: string;
  issuedAt?: string;
}

interface SiwfResponseCredentialBase {
  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://www.w3.org/ns/credentials/undefined-terms/v2",
  ];
  type: string[];
  issuer: string;
  validFrom?: string;
  credentialSchema: {
    type: "JsonSchema";
    id: string;
  };
  credentialSubject: Record<string, unknown>;
  proof: {
    type: "DataIntegrityProof";
    created?: string;
    verificationMethod: string;
    cryptosuite: "eddsa-rdfc-2022";
    proofPurpose: "assertionMethod";
    proofValue: string;
    expirationDate?: string;
    validUntil?: string;
  };
}

export interface SiwfResponseCredentialEmail
  extends SiwfResponseCredentialBase {
  type: ["VerifiedEmailAddressCredential", "VerifiableCredential"];
  credentialSubject: {
    id: string;
    emailAddress: string;
    lastVerified: string;
  };
}

export interface SiwfResponseCredentialPhone
  extends SiwfResponseCredentialBase {
  type: ["VerifiedPhoneNumberCredential", "VerifiableCredential"];
  credentialSubject: {
    id: string;
    phoneNumber: string;
    lastVerified: string;
  };
}

export interface SiwfResponseCredentialGraph
  extends SiwfResponseCredentialBase {
  type: ["VerifiedGraphKeyCredential", "VerifiableCredential"];
  credentialSubject: {
    id: string;
    encodedPublicKeyValue: string;
    encodedPrivateKeyValue: string;
    encoding: "base16";
    format: "bare";
    type: "X25519";
    keyType: "dsnp.public-key-key-agreement";
  };
}

export type SiwfResponseCredential =
  | SiwfResponseCredentialEmail
  | SiwfResponseCredentialPhone
  | SiwfResponseCredentialGraph;

export interface SiwfResponse {
  userPublicKey: SiwfPublicKey;
  payloads: SiwfResponsePayload[];
  credentials?: SiwfResponseCredential[];
}
