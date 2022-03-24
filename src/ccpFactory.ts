import { ICCP } from "../generated/CCPFactory/ICCP";
import { CCPoolCreated } from "../generated/CCPFactory/CCPFactory";
import { EPTData } from "../generated/schema";

export function handleCCPoolCreated(event: CCPoolCreated): void {
  let bond = event.params.bondToken;
  let pool = event.params.pool;

  let eptData = EPTData.load(bond.toHexString());
  if (eptData === null) {
    eptData = new EPTData(bond.toHexString());
  }
  let iCcp = ICCP.bind(pool);

  eptData.balancerVault = iCcp.getVault();
  eptData.poolId = iCcp.getPoolId();
  eptData.convergentCurvePool = pool;

  eptData.save();
}
