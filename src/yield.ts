import { Address } from "@graphprotocol/graph-ts";
import { FYData } from "../generated/schema";
import { VAULT_CONFIG } from "./generated/config";

export function createFYDataIfNonExistent(vaultAddress: string): FYData {
  let fyData = FYData.load(vaultAddress);
  if (fyData == null) {
    fyData = new FYData(vaultAddress);
    let config = VAULT_CONFIG.get(vaultAddress);
    if (config) {
      fyData.yieldSpacePool = Address.fromString(config.get('YieldSpacePool')!);
    }

    fyData.save();
  }
  return fyData as FYData;
}
