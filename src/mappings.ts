import { handleDeployProxy } from "./userProxy"
import {
  handleModifyCollateralAndDebt,
  handleTransferCollateralAndDebt,
  handleConfiscateCollateralAndDebt } from "./position"
import { handleVaultInit, handleSetParam } from "./vault/vaults"
import { handleMarketsInitialized } from "./notional"
import { handleFiatTransfer } from "./fiat"
import { handleStartAuction, handleTakeCollateral, handleStopAuction } from "./auctions"

export {
  handleDeployProxy,
  handleModifyCollateralAndDebt,
  handleTransferCollateralAndDebt,
  handleConfiscateCollateralAndDebt,
  handleVaultInit,
  handleMarketsInitialized,
  handleFiatTransfer,
  handleSetParam,
  handleStartAuction,
  handleTakeCollateral,
  handleStopAuction,
}
