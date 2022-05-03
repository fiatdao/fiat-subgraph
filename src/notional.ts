import { Address } from "@graphprotocol/graph-ts";
import { FCData } from "../generated/schema";
import { VaultFC } from "../generated/Codex/VaultFC";
import { VAULT_CONFIG } from "./generated/config";

export function createFCDataIfNonExistent(vaultAddress: string): FCData {
  let fcData = FCData.load(vaultAddress);
  if (fcData == null) {
    fcData = new FCData(vaultAddress);
    let config = VAULT_CONFIG.get(vaultAddress);
    if (config && ((config.get('type')) as string) == "NOTIONAL") {
      let vaultFC = VaultFC.bind(Address.fromString(vaultAddress));
      fcData.notional = vaultFC.token(); // Notional Monolith
      fcData.tenor = vaultFC.tenor();
    }

    fcData.save();
  }
  return fcData as FCData;
}
