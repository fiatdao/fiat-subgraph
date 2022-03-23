import { ICCP } from "../generated/CCPFactory/ICCP";
import { CCPoolCreated } from "../generated/CCPFactory/CCPFactory";
import { EPTData } from "../generated/schema";

export function handleCCPoolCreated(event: CCPoolCreated): void {
  let bond = event.params.bondToken;
  let pool = event.params.pool;

  let ept = EPTData.load(bond.toHexString());
  if (ept === null) {
    ept = new EPTData(bond.toHexString());
  }
  let iCcp = ICCP.bind(pool);

  ept.balancerVault = iCcp.getVault();
  ept.poolId = iCcp.getPoolId();
  ept.convergentCurvePool = pool;

  ept.save();
}
