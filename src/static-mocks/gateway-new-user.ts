import { GatewaySiwfResponse } from "src/gateway-types.js";

export function mockGatewayNewUserResponse(): GatewaySiwfResponse {
  return {
    controlKey: "f6d1YDa4agkaQ5Kqq8ZKwCf2Ew8UFz9ot2JNrBwHsFkhdtHEn",
    signUpReferenceId:
      "MjY3MjI3NWZlMGM0NTZmYjY3MWU0ZjQxN2ZiMmY5ODkyYzc1NzNiYQo",
    signUpStatus: "waiting",
    email: "user@example.com",
    phoneNumber: "555-867-5309",
    graphKey: {
      id: "did:key:z6QNucQV4AF1XMQV4kngbmnBHwYa6mVswPEGrkFrUayhttT1",
      encodedPublicKeyValue:
        "0xb5032900293f1c9e5822fd9c120b253cb4a4dfe94c214e688e01f32db9eedf17",
      encodedPrivateKeyValue:
        "0xd0910c853563723253c4ed105c08614fc8aaaf1b0871375520d72251496e8d87",
      encoding: "base16",
      format: "bare",
      type: "X25519",
      keyType: "dsnp.public-key-key-agreement",
    },
    rawCredentials: [
      {
        "@context": [
          "https://www.w3.org/ns/credentials/v2",
          "https://www.w3.org/ns/credentials/undefined-terms/v2",
        ],
        type: ["VerifiedEmailAddressCredential", "VerifiableCredential"],
        issuer: "did:web:frequencyaccess.com",
        validFrom: "2024-08-21T21:28:08.289+0000",
        credentialSchema: {
          type: "JsonSchema",
          id: "https://schemas.frequencyaccess.com/VerifiedEmailAddressCredential/bciqe4qoczhftici4dzfvfbel7fo4h4sr5grco3oovwyk6y4ynf44tsi.json",
        },
        credentialSubject: {
          id: "did:key:z6QNucQV4AF1XMQV4kngbmnBHwYa6mVswPEGrkFrUayhttT1",
          emailAddress: "john.doe@example.com",
          lastVerified: "2024-08-21T21:27:59.309+0000",
        },
        proof: {
          type: "DataIntegrityProof",
          verificationMethod:
            "did:web:frequencyaccess.com#z6MkofWExWkUvTZeXb9TmLta5mBT6Qtj58es5Fqg1L5BCWQD",
          cryptosuite: "eddsa-rdfc-2022",
          proofPurpose: "assertionMethod",
          proofValue:
            "z4jArnPwuwYxLnbBirLanpkcyBpmQwmyn5f3PdTYnxhpy48qpgvHHav6warjizjvtLMg6j3FK3BqbR2nuyT2UTSWC",
        },
      },
      {
        "@context": [
          "https://www.w3.org/ns/credentials/v2",
          "https://www.w3.org/ns/credentials/undefined-terms/v2",
        ],
        type: ["VerifiedGraphKeyCredential", "VerifiableCredential"],
        issuer: "did:key:z6QNucQV4AF1XMQV4kngbmnBHwYa6mVswPEGrkFrUayhttT1",
        validFrom: "2024-08-21T21:28:08.289+0000",
        credentialSchema: {
          type: "JsonSchema",
          id: "https://schemas.frequencyaccess.com/VerifiedGraphKeyCredential/bciqmdvmxd54zve5kifycgsdtoahs5ecf4hal2ts3eexkgocyc5oca2y.json",
        },
        credentialSubject: {
          id: "did:key:z6QNucQV4AF1XMQV4kngbmnBHwYa6mVswPEGrkFrUayhttT1",
          encodedPublicKeyValue:
            "0xb5032900293f1c9e5822fd9c120b253cb4a4dfe94c214e688e01f32db9eedf17",
          encodedPrivateKeyValue:
            "0xd0910c853563723253c4ed105c08614fc8aaaf1b0871375520d72251496e8d87",
          encoding: "base16",
          format: "bare",
          type: "X25519",
          keyType: "dsnp.public-key-key-agreement",
        },
        proof: {
          type: "DataIntegrityProof",
          verificationMethod:
            "did:key:z6MktZ15TNtrJCW2gDLFjtjmxEdhCadNCaDizWABYfneMqhA",
          cryptosuite: "eddsa-rdfc-2022",
          proofPurpose: "assertionMethod",
          proofValue:
            "z2HHWwtWggZfvGqNUk4S5AAbDGqZRFXjpMYAsXXmEksGxTk4DnnkN3upCiL1mhgwHNLkxY3s8YqNyYnmpuvUke7jF",
        },
      },
    ],
  };
}
