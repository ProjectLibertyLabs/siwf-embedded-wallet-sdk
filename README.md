# Mock Version of the SIWF Embedded Wallet SDK

![NPM Version](https://img.shields.io/npm/v/%40projectlibertylabs%2Fmock-siwf-embedded-wallet-sdk)

Find the real package version here: https://github.com/ProjectLibertyLabs/siwf-embedded-wallet-sdk

## Quick Start

### Install

`npm i @projectlibertylabs/mock-siwf-embedded-wallet-sdk`

### Use TypeScript/ESM

```TypeScript

import { startSiwf } from "@projectlibertylabs/mock-siwf-embedded-wallet-sdk";

// ...
const startSiwfResponse = await startSiwf(
  userAddress,
  signatureFn,
  gatewayFetchFn,
  siwfSignedRequest,
  userHandle,
  email,
  msaCreationCallback,
);
  // ...
};
```

## Function Details

### Signature Function

This function connects your embedded wallet to the SIWF interface. It follows the same interface as the [`window.ethereum.request`](https://docs.metamask.io/wallet/reference/provider-api/#request) method, although is reduced in scope.

There are only two methods requested: `eth_signTypedData_v4` for [EIP-712](https://eips.ethereum.org/EIPS/eip-712) signature requests and `personal_sign` for [CAIP-122](https://chainagnostic.org/CAIPs/caip-122) Sign In with X standard.

#### TypeScript Types
```TypeScript
type SignatureFn = (request: WindowEthereumRequest) => Promise<string>;
```

### Gateway Fetch Function

This function connects the SDK to your instance of [Frequency Gateway Account Service](https://projectlibertylabs.github.io/gateway/Build/AccountService/AccountService.html).
Remember that Account Service is NOT a public facing service, so MUST be securely proxied.
This function will only call two endpoints, but you must map those endpoints to your own endpoints.

#### Endpoints Called
- [POST: /v2/accounts/siwf](https://projectlibertylabs.github.io/gateway/account/#tag/v2accounts/operation/AccountsControllerV2_postSignInWithFrequency) using the `authorizationPayload` version
- [GET: /v1/accounts/account/{UserControlKey}](https://projectlibertylabs.github.io/gateway/account/#tag/v1accounts/operation/AccountsControllerV1_getAccountForAccountId) to fetch account details

#### TypeScript Types

```TypeScript
type Address = string;

type GatewayFetchFn = (
  method: "GET" | "POST",
  path: `/v1/accounts/account/${Address}` | "/v2/accounts/siwf",
  body?: undefined | { authorizationPayload: string; },
) => Promise<Response>;
```

## What does it mock?

- DOES call the `SignatureFn` and `GatewayFetchFn` with the correct parameters.
- DOES NOT use the responses from either the `SignatureFn` or the `GatewayFetchFn`.
- Uses requests that _may NOT validate_ for `GatewayFetchFn` due to the static nature, but they do have the correct structure.
- Responses are _static_.
- DOES NOT currently return the Recovery Secret or the original credential values
