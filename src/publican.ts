import { SetParam } from "../generated/Publican/Publican";
import { createVaultIfNonExistent } from "./vault/vaults";

export function handlePublicanSetParam(event: SetParam): void {
  let vaultAddress = event.params.vault;
  let vault = createVaultIfNonExistent(vaultAddress.toHexString());
  if (event.params.param.toString() == "interestPerSecond") {
    vault.interestPerSecond = event.params.data;
  }
  vault.save();
}
