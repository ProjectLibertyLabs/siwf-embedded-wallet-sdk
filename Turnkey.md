# Turnkey Integration with the SDK

Turnkey Embedded Wallet is easy to integrate with the SIWF Embedded Wallet SDK, but depends on the tooling used and your particular Turnkey setup.

Note that each SIWF signup requires up to four signatures, but a simple login with no changes has just a single signature.

## Signature Function

The SDK uses a Signature Function to connect any Embedded Wallet with the SDK. It follows the same interface as the [`window.ethereum.request`](https://docs.metamask.io/wallet/reference/provider-api/#request) method, although is reduced in scope.

There are only two methods requested:
- `eth_signTypedData_v4` for [EIP-712](https://eips.ethereum.org/EIPS/eip-712) signature requests
- `personal_sign` for [CAIP-122](https://chainagnostic.org/CAIPs/caip-122) Sign In with X standard

## Viem

Viem uses two functions for signing.

- `eth_signTypedData_v4` / `EIP-712` => [`signTypedData`](https://viem.sh/docs/actions/wallet/signTypedData)
- `personal_sign` / `CAIP-122` => [`signMessage`](https://viem.sh/docs/actions/wallet/signMessage)

### Example

This assumes that you already have Turnkey and understand the basics of creating wallets and using them. Here focuses on the use of the account to integrate with the signatures.

```JavaScript
import { createAccount } from "@turnkey/viem";
import { createWalletClient, http } from "viem";
import { startSiwf } from "@projectlibertylabs/mock-siwf-embedded-wallet-sdk";

// Example of the viem/Turnkey setup

const viemAccount = await createAccount(
  // Turnkey Client, Organization Id, signWith, etc...
);

// Signature Function Example
const signatureFn = async (request) => {
  if (request.method === "personal_sign") {
    // You might need to make sure that the viemAccount matches the address
    // if dealing with multiple wallets
    const [address, message] = request.params;
    return await viemAccount.signMessage({ message });
  }
  if (request.method === "eth_signTypedData_v4") {
    const [address, typedData] = request.params;
    return (await viemAccount.signTypedData(typedData)) as string;
  }
};

// Use startSiwf
const result = await startSiwf(
  viemAccount.address,
  signatureFn,
  gatewayFetchFn,
  siwfSignedRequest,
  userHandle,
  email,
  msaCreationCallback,
);
```

## Ethers.js

Ethers.js uses two functions for signing.

- `eth_signTypedData_v4` / `EIP-712` => [`signTypedData`](https://docs.ethers.org/v6/api/providers/#Signer-signTypedData)
- `personal_sign` / `CAIP-122` => [`signMessage`](https://docs.ethers.org/v6/api/providers/#Signer-signMessage)

## Resources

- [Turnkey Documentation](https://docs.turnkey.com)
- [Viem Documentation](https://viem.sh/docs/getting-started)
- Additional Examples
    - [Turnkey Demo for React Native & Viem](https://github.com/tkhq/react-native-demo-wallet/)
    - [Example of Turnkey with `signTypedData` in Ethers.js](https://github.com/tkhq/sdk/blob/fc4e7d0d4fa5fb158ff5e2f6a9c3863105f34d0a/examples/with-ethers/src/advanced.ts#L63)
    - [Example of Turnkey with `signTypedData` in Viem](https://github.com/tkhq/sdk/blob/fc4e7d0d4fa5fb158ff5e2f6a9c3863105f34d0a/examples/with-viem/src/advanced.ts#L85)
