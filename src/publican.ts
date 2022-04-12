import { SetParam2 } from "../generated/Publican/Publican";
import { createVaultIfNonExistent } from "./vault";

export function handlePublicanSetParam2(event: SetParam2): void {
  let vault = createVaultIfNonExistent(event.params.vault);
  if (event.params.param.toString() == "interestPerSecond") {
    vault.interestPerSecond = event.params.data;
  }
  vault.save();
}
