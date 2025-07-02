export interface HandleResponse {
  base_handle: string;
  canonical_base: string;
  suffix: number;
}

export interface AccountResponse {
  msaId: string;
  handle?: HandleResponse;
}

export interface ChainInfoResponse {
  blocknumber: number;
  finalized_blocknumber: number;
  genesis: string;
  runtime_version: number;
}

interface GraphKeySubject {
  // The id type of the VerifiedGraphKeyCredential.
  id: string;

  // The encoded public key.
  encodedPublicKeyValue: string;

  // The encoded private key. WARNING: This is sensitive user information!
  encodedPrivateKeyValue: string;

  // How the encoded keys are encoded. Only "base16" (aka hex) currently.
  encoding: string;

  // Any addition formatting options. Only: "bare" currently.
  format: string;

  // The encryption key algorithm.
  type: string;

  // The DSNP key type.
  keyType: string;
}

export interface GatewaySiwfResponse {
  // The ss58 encoded MSA Control Key of the login.
  controlKey: string;

  // ReferenceId of an associated sign-up request queued task, if applicable
  signUpReferenceId?: string;

  // Status of associated sign-up request queued task, if applicable
  signUpStatus?: string;

  // The user's MSA Id, if one is already created. Will be empty if it is still being processed.
  msaId?: string;

  // The user's validated email
  email?: string;

  // The user's validated SMS/Phone Number
  phoneNumber?: string;

  // The user's Private Graph encryption key.
  graphKey?: GraphKeySubject;

  // Raw parsed credentials received.
  rawCredentials?: object[];
}
