import { requestContainsCredentialType } from "../helpers/utils";
import {
  ContactType,
  generateRecoverySecret,
  getRecoveryCommitment,
} from "@frequency-chain/recovery-sdk";
import { SiwfResponsePayloadRecoveryCommitment } from "@projectlibertylabs/siwf/types/payload";
import { createRecoverySecretPayloadAndCredential } from "../helpers/payloads";
import { SiwfSignedRequest } from "@projectlibertylabs/siwf";
import { Address, SignatureFn } from "../types/param-types";
import { SiwfResponseCredentialRecoverySecret } from "@projectlibertylabs/siwf/types/credential";

export async function handleGenerateRecoverySecret(
  signUpEmail: string,
  decodedSiwfSignedRequest: SiwfSignedRequest,
  expiration: number,
  accountId: Address,
  signatureFn: SignatureFn,
): Promise<{
  recoverySecretCredential: SiwfResponseCredentialRecoverySecret;
  recoverySecretPayload: SiwfResponsePayloadRecoveryCommitment;
  recoverySecret: string;
} | null> {
  if (signUpEmail) {
    // Figure out if recovery key was requested
    const recoveryKeyRequested = requestContainsCredentialType(
      decodedSiwfSignedRequest,
      "VerifiedRecoverySecretCredential",
    );
    if (recoveryKeyRequested) {
      const recoverySecret = generateRecoverySecret();
      const recoveryCommitmentHex = getRecoveryCommitment(
        recoverySecret,
        ContactType.EMAIL,
        signUpEmail,
      );

      const recoveryPayloadArguments: SiwfResponsePayloadRecoveryCommitment["payload"] =
        {
          recoveryCommitmentHex,
          expiration,
        };

      const { recoverySecretCredential, recoverySecretPayload } =
        await createRecoverySecretPayloadAndCredential(
          accountId,
          recoverySecret,
          signatureFn,
          recoveryPayloadArguments,
        );

      return {
        recoverySecretCredential,
        recoverySecretPayload,
        recoverySecret,
      };
    }
  }
  console.debug("Proper data was not provided for recovery key creation.");
  return null;
}
