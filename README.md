# SIWF Embedded Wallet SDK

![NPM Version](https://img.shields.io/npm/v/%40projectlibertylabs%2Fsiwf-embedded-wallet-sdk)
## Overview

`startSiwf(...)`:

* Signing and submitting SIWF payloads (e.g., add provider, claim handle, add graph key)
* Creating or logging into decentralized identities (MSAs) on Frequency
* Calling back to your app after MSA creation via a custom callback
* Integrating with existing wallet signature flows

`getAccountForAccountId(...)`:

* Fetches a user's account information (if present) from Gateway Services

It’s ideal for Web3 applications that want to support **embedded wallet** experiences where the wallet is controlled programmatically.

---

## Installation

Recommended Node version is **v22+**.
```bash
npm install @projectlibertylabs/siwf-embedded-wallet-sdk
```

---

## Quick Start
```ts
import { startSiwf } from "@projectlibertylabs/siwf-embedded-wallet-sdk";

const startSiwfResponse = await startSiwf(
  accountId,
  signatureFn,
  gatewayFetchFn,
  siwfSignedRequest,
  userHandle,
  email,
  msaCreationCallback,
);
```

---

## `startSiwf` Parameters

| Parameter             | Type                    | Required | Description                                                                            |
| --------------------- | ----------------------- | -------- | -------------------------------------------------------------------------------------- |
| `accountId`           | `string`                | ✅       | The wallet address of the user                                                         |
| `signatureFn`         | `SignatureFn`           | ✅       | Connects your embedded wallet to the SDK (see below)                                   |
| `gatewayFetchFn`      | `GatewayFetchFn`        | ✅       | Connects the SDK to your instance of the Frequency Gateway Account Service (see below) |
| `siwfSignedRequest`   | `string`                | ✅       | Encoded SIWF signed request string                                                     |
| `userHandle`          | `string`                | ❄️       | (New Users Only) Handle to register                                                    |
| `email`               | `string`                | ❄️       | (New Users Only) User's email for recovery setup                                       |
| `msaCreationCallback` | `MsaCreationCallbackFn` | ❄️       | Callback for when the MSA Id is claimed (see below)                                    |

### Return Value
```ts
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
```
---

## `getAccountForAccountId` Parameters

| Parameter             | Type                    | Required | Description                                                                            |
| --------------------- | ----------------------- | -------- | -------------------------------------------------------------------------------------- |
| `gatewayFetchFn`      | `GatewayFetchFn`        | ✅       | Connects the SDK to your instance of the Frequency Gateway Account Service (see below) |
| `accountId`           | `string`                | ✅       | The wallet address of the user                                                         |

### Return Value
```ts
interface AccountResponse {
   msaId: string;
   handle?: HandleResponse;
}
```
---

## Function Details

### Signature Function `signatureFn`

This function connects your embedded wallet to the SIWF interface. It follows the same interface as the [`window.ethereum.request`](https://docs.metamask.io/wallet/reference/provider-api/#request) method, although is reduced in scope.

There are only two methods requested: `eth_signTypedData_v4` for [EIP-712](https://eips.ethereum.org/EIPS/eip-712) signature requests and `personal_sign` for [CAIP-122](https://chainagnostic.org/CAIPs/caip-122) Sign In with X standard (derived from EIP-4361).

#### Example

- [Detailed Turnkey Example](./Turnkey.md)

#### TypeScript Types
```ts
type SignatureFn = (request: WindowEthereumRequest) => Promise<string>;
```

---

### Gateway Fetch Function `gatewayFetchFn`

This function connects the SDK to your instance of [Frequency Gateway Account Service](https://projectlibertylabs.github.io/gateway/Build/AccountService/AccountService.html).
Remember that Account Service is NOT a public facing service, so MUST be securely proxied.
This function will only call two endpoints, but you must map those endpoints to your own endpoints.

#### Endpoints Called
- [POST: /v2/accounts/siwf](https://projectlibertylabs.github.io/gateway/account/#tag/v2accounts/operation/AccountsControllerV2_postSignInWithFrequency) using the `authorizationPayload` version
- [GET: /v1/accounts/account/{UserControlKey}](https://projectlibertylabs.github.io/gateway/account/#tag/v1accounts/operation/AccountsControllerV1_getAccountForAccountId) to fetch account details
- [GET: /v1/frequency/blockInfo](https://projectlibertylabs.github.io/gateway/account/#tag/v1frequency/operation/FrequencyControllerV1_getBlockInfo) to fetch current block information for signature expiration

#### Example

In this example, it uses the [`Fetch API`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) and assumes two variables:

- `EXAMPLE_BASE_URL`: The backend base URL that is proxying the Gateway Account Service
- `EXAMPLE_AUTHENTICATION_HEADERS`: Example authentication method via headers

```TypeScript
const gatewayFetchFn: GatewayFetchFn = (method, path, body) => {
  const url = new URL(EXAMPLE_BASE_URL + path);
  return fetch(url, {
    method,
    body,
    headers: EXAMPLE_AUTHENTICATION_HEADERS,
  });
};
```

#### TypeScript Types

```ts
type Address = string;

type GatewayFetchFn = (
  method: "GET" | "POST",
  path: `/v1/accounts/account/${Address}` | "/v2/accounts/siwf",
  body?: undefined | { authorizationPayload: string; },
) => Promise<Response>;
```

---

### MSA Creation Callback Function `msaCreationCallback`

When a new user signs up, the allocation of the MSA Id on-chain can take some time. This callback will be called once the allocation is completed, or if the user already has an account, it will return the value without waiting.

#### Example

```ts
const msaCallbackFn = (account) => {
  setMsa(account.msaId);
  if (account.handle) setUserDisplayHandle(`${handle.base_handle}.${handle.suffix}`);
}
```

#### TypeScript Types

```ts
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

---

## How startSiwf() Works

1. Checks if the user has an existing MSA.
2. If not:

   * Validates provided `email` and `handle`
   * Signs required payloads (provider, graph key, handle)
   * Submits to the Gateway
   * Calls the `msaCreationCallback` after async MSA allocation
3. If the user does have an MSA:

   * Signs a login payload
   * Submits to the Gateway
4. In both cases, returns the Ethereum-compatible response.

---

## SDK Development

### Development Scripts

* `npm run build` – Build all outputs (ESM + CJS + types)
* `npm run format` – Typecheck, format, and lint
* `npm run clean` – Clean the `dist` folder

---

### Testing

Tests are written using **Vitest**.

To run tests:

```bash
npm test
```
