"""
Deterministic orderbook generator for (ident, date). Seeded random so
orderbook is stable per flight, not random on every refresh.
"""
import hashlib
import random
from typing import Any

from app.models.schemas import MarketResponse, OrderbookLevel


def _seed_random(ident: str, date: str) -> None:
    h = hashlib.sha256(f"{ident}{date}".encode()).hexdigest()
    seed = int(h[:16], 16)
    random.seed(seed)


def _rand_int(lo: int, hi: int) -> int:
    return random.randint(lo, hi)


def generate_orderbook(p_model: float, p_mkt: float, ident: str = "", date: str = "") -> MarketResponse:
    _seed_random(ident or "default", date or "default")
    yes_best_ask = max(5, min(95, round(p_mkt * 100)))
    yes_best_bid = yes_best_ask - 2
    if yes_best_bid < 5:
        yes_best_bid = 5
        yes_best_ask = 7
    no_best_ask = 100 - yes_best_bid
    no_best_bid = 100 - yes_best_ask

    def make_yes_levels() -> list[OrderbookLevel]:
        levels: list[OrderbookLevel] = []
        for i in range(5):
            price = yes_best_bid - i
            if price < 5:
                price = 5
            size = _rand_int(50, 500)
            levels.append(OrderbookLevel(price=price, size=size))
        levels.sort(key=lambda x: -x.price)
        return levels[:5]

    def make_no_levels() -> list[OrderbookLevel]:
        levels = []
        for i in range(5):
            price = no_best_bid - i
            if price < 5:
                price = 5
            size = _rand_int(50, 500)
            levels.append(OrderbookLevel(price=price, size=size))
        levels.sort(key=lambda x: -x.price)
        return levels[:5]

    yes_levels = make_yes_levels()
    no_levels = make_no_levels()
    last_trade_price = yes_best_ask
    volume_24h = _rand_int(500, 5000)
    open_interest = _rand_int(500, 5000)

    return MarketResponse(
        yes_best_ask=yes_best_ask,
        yes_best_bid=yes_best_bid,
        no_best_ask=no_best_ask,
        no_best_bid=no_best_bid,
        yes_levels=yes_levels,
        no_levels=no_levels,
        last_trade_price=last_trade_price,
        volume_24h=volume_24h,
        open_interest=open_interest,
    )
