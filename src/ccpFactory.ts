import { ICCP } from "../generated/CCPFactory/ICCP";
import { CCPoolCreated } from "../generated/CCPFactory/CCPFactory";
import { CCP } from "../generated/schema";

export function handleCCPoolCreated(event: CCPoolCreated): void {
  let bond = event.params.bondToken;
  let pool = event.params.pool;

  let ccp = CCP.load(bond.toHexString());
  if (ccp === null) {
    ccp = new CCP(bond.toHexString());
  }
  let iCcp = ICCP.bind(pool);

  ccp.balancerVault = iCcp.getVault();
  ccp.poolId = iCcp.getPoolId();
  ccp.convergentCurvePool = pool;

  ccp.save();
}
