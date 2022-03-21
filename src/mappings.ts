import { handleDeployProxy } from "./userProxy"
import {
  handleModifyCollateralAndDebt,
  handleTransferCollateralAndDebt,
  handleConfiscateCollateralAndDebt,
  handleGrantDelegate,
  handleRevokeDelegate,
  handleLock,
  handleModifyBalance,
  handleTransferBalance,
  handleSetParam
} from "./position"
import { handleVaultInit, } from "./vault/vaults"
import { handleCollybusSetParam, handleCollybusUpdateSpot, handleCollybusUpdateDiscountRate } from "./collybus"
import { handleMarketsInitialized } from "./notional"
import { handleFIATTransfer, handleFIATApprovals } from "./fiat"
import { handleStartAuction, handleTakeCollateral, handleStopAuction, handleRedoAuction, handleAuctionSetParam } from "./auctions"
import { handlePublicanSetParam } from "./publican"
import { handleCCPoolCreated } from "./ccpFactory"

export {
  handleDeployProxy,
  handleModifyCollateralAndDebt,
  handleTransferCollateralAndDebt,
  handleConfiscateCollateralAndDebt,
  handleVaultInit,
  handleMarketsInitialized,
  handleFIATTransfer,
  handleFIATApprovals,
  handleCollybusSetParam,
  handleCollybusUpdateSpot,
  handleCollybusUpdateDiscountRate,
  handleStartAuction,
  handleTakeCollateral,
  handleStopAuction,
  handleRedoAuction,
  handleAuctionSetParam,
  handlePublicanSetParam,
  handleCCPoolCreated,
  handleGrantDelegate,
  handleRevokeDelegate,
  handleLock,
  handleModifyBalance,
  handleTransferBalance,
  handleSetParam
}
