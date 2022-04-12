
import { TypedMap } from "@graphprotocol/graph-ts";
let VAULT_CONFIG = new TypedMap<string, TypedMap<string, string>>();
let val1 = new TypedMap<string, string>();

val1.set("name", "vaultEPT_eP:eyUSDC:10-AUG-22-GMT (deprecated)");
val1.set("address", "0x411c11ccc2bd375cf91bbe4bbb2cab64a2a60756");
val1.set("ConvergentCurvePool", "0x4294005520c453eb8fa66f53042cfc79707855c4");
val1.set("type", "ELEMENT");
val1.set("collateralTokenId", "");
val1.set("collateralMaturity", "");
val1.set("collateralType", "");
val1.set("underlierName", "");
val1.set("underlierAddress", "");
val1.set("underlierToken", "");
VAULT_CONFIG.set("0x411c11ccc2bd375cf91bbe4bbb2cab64a2a60756", val1);

let val2 = new TypedMap<string, string>();

val2.set("name", "vaultEPT_eP:eyUSDC:10-AUG-22-GMT");
val2.set("address", "0xa78e2f8e1dbbf145956bb6c2aa9655218d100aa2");
val2.set("ConvergentCurvePool", "0x4294005520c453eb8fa66f53042cfc79707855c4");
val2.set("type", "ELEMENT");
val2.set("collateralTokenId", "");
val2.set("collateralMaturity", "");
val2.set("collateralType", "");
val2.set("underlierName", "");
val2.set("underlierAddress", "");
val2.set("underlierToken", "");
VAULT_CONFIG.set("0xa78e2f8e1dbbf145956bb6c2aa9655218d100aa2", val2);

export { VAULT_CONFIG };
