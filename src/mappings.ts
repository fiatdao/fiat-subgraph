import { handleDeployProxy } from "./userProxy"
import {
  handleModifyCollateralAndDebt,
  handleTransferCollateralAndDebt,
  handleConfiscateCollateralAndDebt
} from "./position"
import { handleVaultInit } from "./vault"
import { handleCollybusSetParam1, handleCollybusSetParam2, handleCollybusUpdateSpot, handleCollybusUpdateDiscountRate } from "./collybus"
import { handleFIATTransfer, handleFIATApprovals } from "./fiat"
import {
  handleStartAuction,
  handleTakeCollateral,
  handleStopAuction,
  handleRedoAuction,
  handleCollateralAuctionSetParam,
  handleUpdateAuctionDebtFloor
} from "./collateralAuction"
import { handlePublicanSetParam2 } from "./publican"
import {
  handleModifyBalance,
  handleTransferBalance,
  handleCodexSetParam,
  handleCodexSetParam1
} from "./codex"
import {
  handleGrantDelegate,
  handleRevokeDelegate,
} from "./delegate"
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
  handleCollateralAuctionSetParam,
  handlePublicanSetParam2,
  handleGrantDelegate,
  handleRevokeDelegate,
  handleModifyBalance,
  handleTransferBalance,
  handleCodexSetParam,
  handleCodexSetParam1,
  handleUpdateAuctionDebtFloor
  // handleMarketsInitialized,
}
