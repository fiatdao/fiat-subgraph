import { handleDeployProxy } from "./userProxy"
import {
  handleModifyCollateralAndDebt,
  handleTransferCollateralAndDebt,
  handleConfiscateCollateralAndDebt
} from "./position"
import { handleVaultInit, } from "./vault/vaults"
import { handleCollybusSetParam1, handleCollybusSetParam2, handleCollybusUpdateSpot, handleCollybusUpdateDiscountRate } from "./collybus"
import { handleFIATTransfer, handleFIATApprovals } from "./fiat"
import {
  handleStartAuction,
  handleTakeCollateral,
  handleStopAuction,
  handleRedoAuction,
  handleAuctionSetParam,
  handleUpdateAuctionDebtFloor
} from "./auctions"
import { handlePublicanSetParam } from "./publican"
import {
  handleGrantDelegate,
  handleRevokeDelegate,
  handleLock,
  handleModifyBalance,
  handleTransferBalance,
  handleSetParam
} from "./codex"
// import { handleMarketsInitialized } from "./notional"

export {
  handleDeployProxy,
  handleModifyCollateralAndDebt,
  handleTransferCollateralAndDebt,
  handleConfiscateCollateralAndDebt,
  handleVaultInit,
  handleFIATTransfer,
  handleFIATApprovals,
  handleCollybusSetParam1,
  handleCollybusSetParam2,
  handleCollybusUpdateSpot,
  handleCollybusUpdateDiscountRate,
  handleStartAuction,
  handleTakeCollateral,
  handleStopAuction,
  handleRedoAuction,
  handleAuctionSetParam,
  handlePublicanSetParam,
  handleGrantDelegate,
  handleRevokeDelegate,
  handleLock,
  handleModifyBalance,
  handleTransferBalance,
  handleSetParam,
  handleUpdateAuctionDebtFloor
  // handleMarketsInitialized,
}
