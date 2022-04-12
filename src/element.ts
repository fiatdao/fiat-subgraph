import { Address } from "@graphprotocol/graph-ts";
import { Vault, EPTData } from "../generated/schema";
import { IConvergentCurvePool } from "../generated/Codex/IConvergentCurvePool";
import { vaultsData } from "./vault/vaultsData";

export function createEPTDataIfNonExistent(vaultAddress: string): EPTData {
  let eptData = EPTData.load(vaultAddress);
  if (eptData == null) {
    eptData = new EPTData(vaultAddress);
    let config = vaultsData.get(vaultAddress);
    if (config) {
      let pool = IConvergentCurvePool.bind(Address.fromString(config.get('ConvergentCurvePool')!));
      eptData.convergentCurvePool = pool._address;
      eptData.balancerVault = pool.getVault();
      eptData.poolId = pool.getPoolId();
    }

    eptData.save();
  }
  return eptData as EPTData;
}