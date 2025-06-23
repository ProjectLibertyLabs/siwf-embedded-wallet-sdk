import { getMsaByPublicKey, siwf } from "./gatewayApi";

const poll = async (
  msaCreationCallback: (
    response: unknown,
    msaId: string | null,
    userHandle?: string
  ) => void,
  response: unknown,
  msaId: string | null,
  userHandle?: string
) => {
  // if account create, it takes a second so we have to poll.
  // - Refer to social app template for how to handle.
  // - If account creation: Poll GET /v1/accounts/account/{accountId} to get the MSA Id

  // - Call msaCreationCallback with finalized handle and MSA Id
  msaCreationCallback(response, msaId, userHandle);
};

export const startSiwf = async (
  userAddress: string,
  signatureFn: (
    address: string,
    standard: "eip712" | "caip122",
    payload: Object
  ) => string,
  gatewayFetchFn: () => unknown,
  siwfSignedRequest: string,
  msaCreationCallback: (
    response: unknown,
    msaId: string | null,
    userHandle?: string
  ) => void,
  userHandle?: string,
  email?: string
) => {
  const address = userAddress;
  const gateway = gatewayFetchFn();

  // use gateway check if address has an msaId
  const msaId = getMsaByPublicKey(address);

  if (!msaId) {
    // ...
  }

  // TODO: graph key loop because we're not using FA
  // TODO: recovery key loop because we're not using FA

  const standard = "eip712";
  const payload = { payload: "123" };

  // talks to signatureFn to generate the various SIWF v2.2 Authentication Payloads (with Graph Key)
  const signature = signatureFn(address, standard, payload);

  // Submits to Gateway POST /v2/accounts/siwf
  // if has an account, gets response right away.

  const response = await siwf(signature);

  await poll(msaCreationCallback, response, msaId, userHandle);

  return response;
};
