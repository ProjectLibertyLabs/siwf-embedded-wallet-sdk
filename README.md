# SIWF Embedded Wallet SDK

![NPM Version](https://img.shields.io/npm/v/%40projectlibertylabs%2Fsiwf-embedded-wallet-sdk)

## Quick Start

### Install

`npm i @projectlibertylabs/siwf-embedded-wallet-sdk`

### Use TypeScript/ESM

```TypeScript

import { startSiwf } from "@projectlibertylabs/siwf-embedded-wallet-sdk";

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
```

## `startSiwf` Parameters

- `userAddress`: The wallet address of the user
- `signatureFn`: Connect the specific embedded wallet to the SDK (see Signature Function below)
- `gatewayFetchFn`: Connect the SDK to the Frequency Gateway Account Service (see Gateway Fetch Function below)
- `userHandle`: (Optional, New User Only) The user supplied handle to register
- `email`: (Optional, New User Only) The user's email address for generating the values for the Recovery System
- `msaCreationCallback`: (Optional) Will be called with the final MSA Id and Handle for the user (see MSA Callback Function below)


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

### MSA Callback Function

When a new user signs up, the allocation of the MSA Id on-chain can take some time. This callback will be called once the allocation is completed, or if the user already has an account, it will return the value without waiting.

```TypeScript
interface AccountResponse {
  msaId: string;
  handle?: {
    base_handle: string;
    canonical_base: string;
    suffix: number;
  };
}

type MsaCreationCallbackFn = (account: AccountResponse) => void;
```

## What does it mock?

- DOES call the `SignatureFn` and `GatewayFetchFn` with the correct parameters.
- DOES NOT use the responses from either the `SignatureFn` or the `GatewayFetchFn`.
- Uses requests that _may NOT validate_ for `GatewayFetchFn` due to the static nature, but they do have the correct structure.
- Responses are _static_.
- DOES NOT currently return the Recovery Secret or the original credential values
