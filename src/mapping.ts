import { BigInt, Address } from "@graphprotocol/graph-ts"
import { Transfer } from "../generated/ETH/IERC20"
import { Fee, DateToBlock } from "../generated/schema"

let baseUnit = BigInt.fromI32(10).pow(18).toBigDecimal()

let treasuryAddress = Address.fromString('0x4200000000000000000000000000000000000011')

export function handleTransfer(event: Transfer): void {
  if (event.params.to != treasuryAddress) {
    return
  }

  let entity = Fee.load('1')

  if (entity == null) {
    entity = new Fee('1')

    entity.totalFees = BigInt.fromI32(0).toBigDecimal()
  }

  entity.totalFees = entity.totalFees + event.params.value.divDecimal(baseUnit)

  entity.save()

  let timestampRoundedDown = event.block.timestamp.toI32() / 86400 * 86400
  let block = DateToBlock.load(timestampRoundedDown.toString())

  if (block == null) {
    block = new DateToBlock(timestampRoundedDown.toString())
    block.blockNum = event.block.number
    block.save()
  }
}
