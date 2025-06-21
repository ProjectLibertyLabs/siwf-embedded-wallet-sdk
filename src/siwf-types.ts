// TODO: Use the siwf library instead of copying these types?

type CurveType = "Sr25519" | "Secp256k1";

type AlgorithmType = "SR25519" | "SECP256K1";

type SupportedPayload = any;

export type SignedPayload = Uint8Array | SupportedPayload;

export interface SiwfPublicKey {
  encodedValue: string;
  encoding: "base58";
  format: "ss58";
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

export interface SiwfResponsePayloadLogin extends SiwfResponsePayloadBase {
  type: "login";
  payload: {
    message: string;
  };
}

export interface SiwfResponsePayloadAddProvider
  extends SiwfResponsePayloadBase {
  endpoint: {
    pallet: "msa";
    extrinsic: "createSponsoredAccountWithDelegation" | "grantDelegation";
  };
  type: "addProvider";
  payload: {
    authorizedMsaId: number;
    schemaIds: number[];
    expiration: number;
  };
}

export interface SiwfResponsePayloadItemActions
  extends SiwfResponsePayloadBase {
  endpoint: {
    pallet: "statefulStorage";
    extrinsic: "applyItemActionsWithSignatureV2";
  };
  type: "itemActions";
  payload: {
    schemaId: number;
    targetHash: number;
    expiration: number;
    actions: {
      type: "addItem";
      payloadHex: string;
    }[];
  };
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
