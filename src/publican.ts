import { SetParam } from "../generated/Publican/Publican";
import { createVaultIfNonExistent } from "./vault/vaults";
import { log } from '@graphprotocol/graph-ts'

export function handlePublicanSetParam(event: SetParam): void {
  let vaultAddress = event.params.vault;
  log.debug("Publican: " + vaultAddress.toHexString(), [])
  let vault = createVaultIfNonExistent(vaultAddress.toHexString());
  vault.interestPerSecond = event.params.data;
  vault.save();
}
