import { Address, SignatureFn } from "../types/param-types";
import {
  SiwfResponseCredentialGraph,
  SiwfResponsePayloadItemActions,
} from "@projectlibertylabs/siwf";
import { generateGraphKeyPairAndCredential } from "../helpers/crypto";
import { createSignedGraphKeyPayload } from "../helpers/payloads";

export async function generateAndSignGraphKeyPayload(
  accountId: Address,
  expiration: number,
  signatureFn: SignatureFn,
): Promise<{
  graphKeyCredential: SiwfResponseCredentialGraph;
  graphKeyPayload: SiwfResponsePayloadItemActions;
}> {
  // Generate Graph Key and Credential
  const { graphKeyPair, graphKeyCredential } =
    generateGraphKeyPairAndCredential(accountId);
  // Sign Graph Key Add
  const addGraphKeyArguments: SiwfResponsePayloadItemActions["payload"] = {
    schemaId: 7,
    targetHash: 0,
    expiration,
    actions: [
      {
        type: "addItem",
        payloadHex: graphKeyPair.publicKey,
      },
    ],
  };

  return {
    graphKeyCredential: graphKeyCredential,
    graphKeyPayload: await createSignedGraphKeyPayload(
      accountId,
      signatureFn,
      addGraphKeyArguments,
    ),
  };
}
