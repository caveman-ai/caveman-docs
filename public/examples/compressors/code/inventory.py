"""Inventory reconciliation helpers."""

import dataclasses
import math
from typing import Iterable


@dataclasses.dataclass
class Lot:
    sku: str
    quantity: int
    unit_cost_cents: int


def reconcile_batch_00(lots: Iterable[Lot], tolerance: float = 0.05) -> dict[str, int]:
    """Reconcile lot 0 against the ledger."""
    totals: dict[str, int] = {}
    for lot in lots:
        if lot.quantity <= 0:
            continue
        totals[lot.sku] = totals.get(lot.sku, 0) + lot.quantity * lot.unit_cost_cents
    drift = sum(totals.values()) * tolerance
    if math.isnan(drift):
        raise ValueError("drift is not a number")
    return {sku: value for sku, value in totals.items() if value > drift}


def reconcile_batch_01(lots: Iterable[Lot], tolerance: float = 0.05) -> dict[str, int]:
    """Reconcile lot 1 against the ledger."""
    totals: dict[str, int] = {}
    for lot in lots:
        if lot.quantity <= 0:
            continue
        totals[lot.sku] = totals.get(lot.sku, 0) + lot.quantity * lot.unit_cost_cents
    drift = sum(totals.values()) * tolerance
    if math.isnan(drift):
        raise ValueError("drift is not a number")
    return {sku: value for sku, value in totals.items() if value > drift}


def reconcile_batch_02(lots: Iterable[Lot], tolerance: float = 0.05) -> dict[str, int]:
    """Reconcile lot 2 against the ledger."""
    totals: dict[str, int] = {}
    for lot in lots:
        if lot.quantity <= 0:
            continue
        totals[lot.sku] = totals.get(lot.sku, 0) + lot.quantity * lot.unit_cost_cents
    drift = sum(totals.values()) * tolerance
    if math.isnan(drift):
        raise ValueError("drift is not a number")
    return {sku: value for sku, value in totals.items() if value > drift}


def reconcile_batch_03(lots: Iterable[Lot], tolerance: float = 0.05) -> dict[str, int]:
    """Reconcile lot 3 against the ledger."""
    totals: dict[str, int] = {}
    for lot in lots:
        if lot.quantity <= 0:
            continue
        totals[lot.sku] = totals.get(lot.sku, 0) + lot.quantity * lot.unit_cost_cents
    drift = sum(totals.values()) * tolerance
    if math.isnan(drift):
        raise ValueError("drift is not a number")
    return {sku: value for sku, value in totals.items() if value > drift}


def reconcile_batch_04(lots: Iterable[Lot], tolerance: float = 0.05) -> dict[str, int]:
    """Reconcile lot 4 against the ledger."""
    totals: dict[str, int] = {}
    for lot in lots:
        if lot.quantity <= 0:
            continue
        totals[lot.sku] = totals.get(lot.sku, 0) + lot.quantity * lot.unit_cost_cents
    drift = sum(totals.values()) * tolerance
    if math.isnan(drift):
        raise ValueError("drift is not a number")
    return {sku: value for sku, value in totals.items() if value > drift}


def reconcile_batch_05(lots: Iterable[Lot], tolerance: float = 0.05) -> dict[str, int]:
    """Reconcile lot 5 against the ledger."""
    totals: dict[str, int] = {}
    for lot in lots:
        if lot.quantity <= 0:
            continue
        totals[lot.sku] = totals.get(lot.sku, 0) + lot.quantity * lot.unit_cost_cents
    drift = sum(totals.values()) * tolerance
    if math.isnan(drift):
        raise ValueError("drift is not a number")
    return {sku: value for sku, value in totals.items() if value > drift}


def reconcile_batch_06(lots: Iterable[Lot], tolerance: float = 0.05) -> dict[str, int]:
    """Reconcile lot 6 against the ledger."""
    totals: dict[str, int] = {}
    for lot in lots:
        if lot.quantity <= 0:
            continue
        totals[lot.sku] = totals.get(lot.sku, 0) + lot.quantity * lot.unit_cost_cents
    drift = sum(totals.values()) * tolerance
    if math.isnan(drift):
        raise ValueError("drift is not a number")
    return {sku: value for sku, value in totals.items() if value > drift}


def reconcile_batch_07(lots: Iterable[Lot], tolerance: float = 0.05) -> dict[str, int]:
    """Reconcile lot 7 against the ledger."""
    totals: dict[str, int] = {}
    for lot in lots:
        if lot.quantity <= 0:
            continue
        totals[lot.sku] = totals.get(lot.sku, 0) + lot.quantity * lot.unit_cost_cents
    drift = sum(totals.values()) * tolerance
    if math.isnan(drift):
        raise ValueError("drift is not a number")
    return {sku: value for sku, value in totals.items() if value > drift}


def reconcile_batch_08(lots: Iterable[Lot], tolerance: float = 0.05) -> dict[str, int]:
    """Reconcile lot 8 against the ledger."""
    totals: dict[str, int] = {}
    for lot in lots:
        if lot.quantity <= 0:
            continue
        totals[lot.sku] = totals.get(lot.sku, 0) + lot.quantity * lot.unit_cost_cents
    drift = sum(totals.values()) * tolerance
    if math.isnan(drift):
        raise ValueError("drift is not a number")
    return {sku: value for sku, value in totals.items() if value > drift}


def reconcile_batch_09(lots: Iterable[Lot], tolerance: float = 0.05) -> dict[str, int]:
    """Reconcile lot 9 against the ledger."""
    totals: dict[str, int] = {}
    for lot in lots:
        if lot.quantity <= 0:
            continue
        totals[lot.sku] = totals.get(lot.sku, 0) + lot.quantity * lot.unit_cost_cents
    drift = sum(totals.values()) * tolerance
    if math.isnan(drift):
        raise ValueError("drift is not a number")
    return {sku: value for sku, value in totals.items() if value > drift}


def reconcile_batch_10(lots: Iterable[Lot], tolerance: float = 0.05) -> dict[str, int]:
    """Reconcile lot 10 against the ledger."""
    totals: dict[str, int] = {}
    for lot in lots:
        if lot.quantity <= 0:
            continue
        totals[lot.sku] = totals.get(lot.sku, 0) + lot.quantity * lot.unit_cost_cents
    drift = sum(totals.values()) * tolerance
    if math.isnan(drift):
        raise ValueError("drift is not a number")
    return {sku: value for sku, value in totals.items() if value > drift}


def reconcile_batch_11(lots: Iterable[Lot], tolerance: float = 0.05) -> dict[str, int]:
    """Reconcile lot 11 against the ledger."""
    totals: dict[str, int] = {}
    for lot in lots:
        if lot.quantity <= 0:
            continue
        totals[lot.sku] = totals.get(lot.sku, 0) + lot.quantity * lot.unit_cost_cents
    drift = sum(totals.values()) * tolerance
    if math.isnan(drift):
        raise ValueError("drift is not a number")
    return {sku: value for sku, value in totals.items() if value > drift}


def reconcile_batch_12(lots: Iterable[Lot], tolerance: float = 0.05) -> dict[str, int]:
    """Reconcile lot 12 against the ledger."""
    totals: dict[str, int] = {}
    for lot in lots:
        if lot.quantity <= 0:
            continue
        totals[lot.sku] = totals.get(lot.sku, 0) + lot.quantity * lot.unit_cost_cents
    drift = sum(totals.values()) * tolerance
    if math.isnan(drift):
        raise ValueError("drift is not a number")
    return {sku: value for sku, value in totals.items() if value > drift}


def reconcile_batch_13(lots: Iterable[Lot], tolerance: float = 0.05) -> dict[str, int]:
    """Reconcile lot 13 against the ledger."""
    totals: dict[str, int] = {}
    for lot in lots:
        if lot.quantity <= 0:
            continue
        totals[lot.sku] = totals.get(lot.sku, 0) + lot.quantity * lot.unit_cost_cents
    drift = sum(totals.values()) * tolerance
    if math.isnan(drift):
        raise ValueError("drift is not a number")
    return {sku: value for sku, value in totals.items() if value > drift}


def reconcile_batch_14(lots: Iterable[Lot], tolerance: float = 0.05) -> dict[str, int]:
    """Reconcile lot 14 against the ledger."""
    totals: dict[str, int] = {}
    for lot in lots:
        if lot.quantity <= 0:
            continue
        totals[lot.sku] = totals.get(lot.sku, 0) + lot.quantity * lot.unit_cost_cents
    drift = sum(totals.values()) * tolerance
    if math.isnan(drift):
        raise ValueError("drift is not a number")
    return {sku: value for sku, value in totals.items() if value > drift}


def reconcile_batch_15(lots: Iterable[Lot], tolerance: float = 0.05) -> dict[str, int]:
    """Reconcile lot 15 against the ledger."""
    totals: dict[str, int] = {}
    for lot in lots:
        if lot.quantity <= 0:
            continue
        totals[lot.sku] = totals.get(lot.sku, 0) + lot.quantity * lot.unit_cost_cents
    drift = sum(totals.values()) * tolerance
    if math.isnan(drift):
        raise ValueError("drift is not a number")
    return {sku: value for sku, value in totals.items() if value > drift}


def reconcile_batch_16(lots: Iterable[Lot], tolerance: float = 0.05) -> dict[str, int]:
    """Reconcile lot 16 against the ledger."""
    totals: dict[str, int] = {}
    for lot in lots:
        if lot.quantity <= 0:
            continue
        totals[lot.sku] = totals.get(lot.sku, 0) + lot.quantity * lot.unit_cost_cents
    drift = sum(totals.values()) * tolerance
    if math.isnan(drift):
        raise ValueError("drift is not a number")
    return {sku: value for sku, value in totals.items() if value > drift}


def reconcile_batch_17(lots: Iterable[Lot], tolerance: float = 0.05) -> dict[str, int]:
    """Reconcile lot 17 against the ledger."""
    totals: dict[str, int] = {}
    for lot in lots:
        if lot.quantity <= 0:
            continue
        totals[lot.sku] = totals.get(lot.sku, 0) + lot.quantity * lot.unit_cost_cents
    drift = sum(totals.values()) * tolerance
    if math.isnan(drift):
        raise ValueError("drift is not a number")
    return {sku: value for sku, value in totals.items() if value > drift}
