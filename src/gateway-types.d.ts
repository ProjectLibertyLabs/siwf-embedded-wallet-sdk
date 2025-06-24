export interface HandleResponse {
    base_handle: string;
    canonical_base: string;
    suffix: number;
}
export interface AccountResponse {
    msaId: string;
    handle?: HandleResponse;
}
interface GraphKeySubject {
    id: string;
    encodedPublicKeyValue: string;
    encodedPrivateKeyValue: string;
    encoding: string;
    format: string;
    type: string;
    keyType: string;
}
export interface GatewaySiwfResponse {
    controlKey: string;
    signUpReferenceId?: string;
    signUpStatus?: string;
    msaId?: string;
    email?: string;
    phoneNumber?: string;
    graphKey?: GraphKeySubject;
    rawCredentials?: object[];
}
export {};
