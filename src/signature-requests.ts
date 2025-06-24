// These are static mocks. These should be replaced with real ones from
// EIP-712: @frequency-chain/ethereum-utils
// CAIP-122: Manually build via concatenation or use SIWF Library

export const mockCaip122 =
  "app-website.mock wants you to sign in with your Frequency account:\n" +
  "f6akufkq9Lex6rT8RCEDRuoZQRgo5pWiRzeo81nmKNGWGNJdJ\n" +
  "\n" +
  "\n" +
  "\n" +
  "URI: https://your-app.com/signin/callback\n" +
  "Nonce: N6rLwqyz34oUxJEXJ\n" +
  "Issued At: 2024-10-29T19:17:27.077Z\n" +
  "Expiration Time: 2060-03-05T23:23:03.041Z";

export const addDelegation712 = {
  domain: {
    chainId: "0x190f1b44",
    name: "Frequency",
    verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
    version: "1",
  },
  message: {
    authorizedMsaId: "1",
    expiration: 100,
    schemaIds: [8, 9, 10, 15],
  },
  primaryType: "AddProvider",
  types: {
    AddProvider: [
      {
        name: "authorizedMsaId",
        type: "uint64",
      },
      {
        name: "schemaIds",
        type: "uint16[]",
      },
      {
        name: "expiration",
        type: "uint32",
      },
    ],
    EIP712Domain: [
      {
        name: "name",
        type: "string",
      },
      {
        name: "version",
        type: "string",
      },
      {
        name: "chainId",
        type: "uint256",
      },
      {
        name: "verifyingContract",
        type: "address",
      },
    ],
  },
};

export const claimHandle712 = {
  domain: {
    chainId: "0x190f1b44",
    name: "Frequency",
    verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
    version: "1",
  },
  message: {
    expiration: 100,
    handle: "mock-siwf-ew",
  },
  primaryType: "ClaimHandlePayload",
  types: {
    ClaimHandlePayload: [
      {
        name: "handle",
        type: "string",
      },
      {
        name: "expiration",
        type: "uint32",
      },
    ],
    EIP712Domain: [
      {
        name: "name",
        type: "string",
      },
      {
        name: "version",
        type: "string",
      },
      {
        name: "chainId",
        type: "uint256",
      },
      {
        name: "verifyingContract",
        type: "address",
      },
    ],
  },
};

export const addGraphKey712 = {
  domain: {
    chainId: "0x190f1b44",
    name: "Frequency",
    verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
    version: "1",
  },
  message: {
    actions: [
      {
        actionType: "Add",
        data: "0x40a6836ea489047852d3f0297f8fe8ad6779793af4e9c6274c230c207b9b825026",
        index: 0,
      },
    ],
    expiration: 100,
    schemaId: 7,
    targetHash: 0,
  },
  primaryType: "ItemizedSignaturePayloadV2",
  types: {
    EIP712Domain: [
      {
        name: "name",
        type: "string",
      },
      {
        name: "version",
        type: "string",
      },
      {
        name: "chainId",
        type: "uint256",
      },
      {
        name: "verifyingContract",
        type: "address",
      },
    ],
    ItemAction: [
      {
        name: "actionType",
        type: "string",
      },
      {
        name: "data",
        type: "bytes",
      },
      {
        name: "index",
        type: "uint16",
      },
    ],
    ItemizedSignaturePayloadV2: [
      {
        name: "schemaId",
        type: "uint16",
      },
      {
        name: "targetHash",
        type: "uint32",
      },
      {
        name: "expiration",
        type: "uint32",
      },
      {
        name: "actions",
        type: "ItemAction[]",
      },
    ],
  },
};
