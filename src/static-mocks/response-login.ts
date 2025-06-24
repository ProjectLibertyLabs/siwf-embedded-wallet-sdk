import { SiwfResponse } from "src/siwf-types.js";

export function mockLoginResponse(): SiwfResponse {
  return {
    userPublicKey: {
      encodedValue: "0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac",
      encoding: "base16",
      format: "eip-55",
      type: "Secp256k1",
    },
    payloads: [
      {
        signature: {
          algo: "SECP256K1",
          encoding: "base16",
          encodedValue:
            "0xf61ea075f7bfb3fb00d730e50b43c503eba6020a580a0a3c7cb43d55ed8c8a8b7d47c5140e8ed2c3a6e521c31bcb62946e3758188eacbf71831c78695842ae521c",
        },
        type: "login",
        payload: {
          message:
            "your-app.com wants you to sign in with your Frequency account:\0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac\n\n\n\nURI: https://your-app.com/signin/callback\nNonce: N6rLwqyz34oUxJEXJ\nIssued At: 2024-10-29T19:17:27.077Z\nExpiration Time: 2060-03-05T23:23:03.041Z",
        },
      },
    ],
    credentials: [],
  };
}
