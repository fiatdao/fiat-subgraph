import { BigInt, Address, log } from "@graphprotocol/graph-ts";
import { CollateralType, Vault } from "../generated/schema";
import { ERC20 as ERC20Contract } from "../generated/Codex/ERC20";
import { IVault as IVaultContract } from "../generated/Codex/IVault";
import { VAULT_CONFIG } from "./generated/config";

import { BIGINT_ZERO, WAD } from "./utils";
import { createEPTDataIfNonExistent } from "./element";
import { createFCDataIfNonExistent } from "./notional";
import { createFYDataIfNonExistent } from "./yield";

export function createCollateralTypeIfNonExistent(vault: Vault, tokenId: BigInt): CollateralType {
  let id = vault.id + "-" + tokenId.toString();

  let collateralType = CollateralType.load(id);
  if (!collateralType) {
    collateralType = new CollateralType(id);
    collateralType.tokenId = tokenId;
    collateralType.depositedCollateral = BIGINT_ZERO;
    collateralType.vault = vault.id;
    collateralType.vaultName = vault.name;
    collateralType.faceValue = WAD;

    let iVault = IVaultContract.bind(Address.fromBytes(vault.address!));
    let token = ERC20Contract.bind(iVault.token());
    let underlier = ERC20Contract.bind(iVault.underlierToken());

    collateralType.address = token._address;
    const symbolResult = token.try_symbol();
    if (!symbolResult.reverted) collateralType.symbol = symbolResult.value;
    collateralType.scale = iVault.tokenScale();
    collateralType.underlierAddress = underlier._address;
    collateralType.underlierSymbol = underlier.symbol();
    collateralType.underlierScale = iVault.underlierScale();
    collateralType.maturity = iVault.maturity(tokenId);

    collateralType.save();
  }

  let config = VAULT_CONFIG.get(vault.address!.toHexString());
  if (config) {
    if (((config.get('type')) as string) == "ELEMENT") {
      createEPTCollateralTypeIfNonExistent(collateralType);
    } else if (((config.get('type')) as string) == "NOTIONAL") {
      createFCCollateralTypeIfNonExistent(collateralType);
    } else if (((config.get('type')) as string) == "YIELD") {
      createFYCollateralTypeIfNonExistent(collateralType);
    }
  }

  return collateralType as CollateralType;
}

function createEPTCollateralTypeIfNonExistent(collateralType: CollateralType): CollateralType {
  collateralType.eptData = createEPTDataIfNonExistent(collateralType.vault!).id;
  collateralType.save();

  return collateralType as CollateralType;
}

function createFCCollateralTypeIfNonExistent(collateralType: CollateralType): CollateralType {
  collateralType.fcData = createFCDataIfNonExistent(collateralType.vault!).id;
  collateralType.save();
  
  return collateralType as CollateralType;
}

function createFYCollateralTypeIfNonExistent(collateralType: CollateralType): CollateralType {
  collateralType.fyData = createFYDataIfNonExistent(collateralType.vault!).id;
  collateralType.save();
  
  return collateralType as CollateralType;
}
