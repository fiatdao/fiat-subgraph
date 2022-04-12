import { Address } from "@graphprotocol/graph-ts";
import { EPTData } from "../generated/schema";
import { IConvergentCurvePool as IConvergentCurvePoolContract } from "../generated/Codex/IConvergentCurvePool";
import { VAULT_CONFIG } from "./generated/config";

export function createEPTDataIfNonExistent(vaultAddress: string): EPTData {
  let eptData = EPTData.load(vaultAddress);
  if (eptData == null) {
    eptData = new EPTData(vaultAddress);
    let config = VAULT_CONFIG.get(vaultAddress);
    if (config) {
      let pool = IConvergentCurvePoolContract.bind(Address.fromString(config.get('ConvergentCurvePool')!));
      eptData.convergentCurvePool = pool._address;
      eptData.balancerVault = pool.getVault();
      eptData.poolId = pool.getPoolId();
    }

    eptData.save();
  }
  return eptData as EPTData;
}