from __future__ import annotations

import hmac
import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Literal

import MetaTrader5 as mt5
from fastapi import Depends, FastAPI, Header, HTTPException, status
from pydantic import BaseModel, Field

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger("saqoor.mt5")

BRIDGE_API_KEY = os.getenv("BRIDGE_API_KEY", "")
ALLOW_LIVE_TRADING = os.getenv("ALLOW_LIVE_TRADING", "false").lower() == "true"
LIVE_TRADING_ACK = os.getenv("LIVE_TRADING_ACK", "")
ALLOWED_SYMBOLS = {
    item.strip().upper()
    for item in os.getenv("ALLOWED_SYMBOLS", "EURUSD,GBPUSD,USDJPY").split(",")
    if item.strip()
}
MAX_ORDER_VOLUME = float(os.getenv("MAX_ORDER_VOLUME", "0.01"))
MAX_OPEN_POSITIONS = int(os.getenv("MAX_OPEN_POSITIONS", "3"))
MT5_PATH = os.getenv("MT5_PATH")
MT5_LOGIN = os.getenv("MT5_LOGIN", "")
MT5_PASSWORD = os.getenv("MT5_PASSWORD", "")
MT5_SERVER = os.getenv("MT5_SERVER", "")


def require_api_key(x_bridge_key: str | None = Header(default=None)) -> None:
    if len(BRIDGE_API_KEY) < 32:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Bridge API key is not configured securely.",
        )
    if not x_bridge_key or not hmac.compare_digest(x_bridge_key, BRIDGE_API_KEY):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")


def require_connection() -> None:
    if not mt5.terminal_info() or not mt5.account_info():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="MetaTrader 5 terminal is not connected to a trading account.",
        )


@asynccontextmanager
async def lifespan(_: FastAPI):
    if not MT5_LOGIN or not MT5_PASSWORD or not MT5_SERVER:
        logger.error("MT5 credentials are not configured; trading endpoints will remain unavailable.")
        yield
        return

    kwargs = {
        "login": int(MT5_LOGIN),
        "password": MT5_PASSWORD,
        "server": MT5_SERVER,
    }
    if MT5_PATH:
        kwargs["path"] = MT5_PATH

    if not mt5.initialize(**kwargs):
        logger.error("MT5 initialization failed: %s", mt5.last_error())
    else:
        account = mt5.account_info()
        if account:
            logger.info("MT5 bridge connected (login=%s, server=%s).", account.login, account.server)
        else:
            logger.error("MT5 initialized but account information is unavailable.")

    try:
        yield
    finally:
        mt5.shutdown()


app = FastAPI(
    title="Saqoor Algeria MT5 Bridge",
    version="0.1.0",
    description="Private server-side bridge. Never expose its API key to a browser.",
    lifespan=lifespan,
)


class OrderRequest(BaseModel):
    symbol: str = Field(min_length=3, max_length=32, pattern=r"^[A-Za-z0-9._-]+$")
    side: Literal["buy", "sell"]
    volume: float = Field(gt=0)
    stop_loss: float = Field(gt=0)
    take_profit: float = Field(gt=0)
    confirm_live: bool = False
    live_acknowledgement: str | None = Field(default=None, max_length=100)


def account_mode(account) -> str:
    if account.trade_mode == mt5.ACCOUNT_TRADE_MODE_REAL:
        return "real"
    if account.trade_mode == mt5.ACCOUNT_TRADE_MODE_DEMO:
        return "demo"
    return "contest"


def json_number(value):
    return float(value) if value is not None else None


@app.get("/health", dependencies=[Depends(require_api_key)])
def health():
    require_connection()
    terminal = mt5.terminal_info()
    account = mt5.account_info()
    return {
        "status": "connected",
        "terminal_connected": bool(terminal.connected),
        "trade_allowed": bool(terminal.trade_allowed and account.trade_allowed),
        "account_mode": account_mode(account),
        "server": account.server,
        "checked_at": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/account", dependencies=[Depends(require_api_key)])
def read_account():
    require_connection()
    account = mt5.account_info()
    return {
        "login": str(account.login),
        "server": account.server,
        "company": account.company,
        "currency": account.currency,
        "leverage": int(account.leverage),
        "mode": account_mode(account),
        "balance": json_number(account.balance),
        "equity": json_number(account.equity),
        "margin": json_number(account.margin),
        "free_margin": json_number(account.margin_free),
        "profit": json_number(account.profit),
        "trade_allowed": bool(account.trade_allowed),
        "observed_at": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/quote/{symbol}", dependencies=[Depends(require_api_key)])
def read_quote(symbol: str):
    require_connection()
    normalized = symbol.upper()
    if normalized not in ALLOWED_SYMBOLS:
        raise HTTPException(status_code=403, detail="Symbol is not allow-listed.")
    if not mt5.symbol_select(normalized, True):
        raise HTTPException(status_code=404, detail="Symbol is unavailable in this broker account.")
    tick = mt5.symbol_info_tick(normalized)
    if tick is None:
        raise HTTPException(status_code=503, detail="No market tick is currently available.")
    return {
        "symbol": normalized,
        "bid": json_number(tick.bid),
        "ask": json_number(tick.ask),
        "time_msc": int(tick.time_msc),
    }


@app.get("/positions", dependencies=[Depends(require_api_key)])
def read_positions():
    require_connection()
    positions = mt5.positions_get()
    if positions is None:
        raise HTTPException(status_code=503, detail="Could not read open positions.")
    return [
        {
            "ticket": str(p.ticket),
            "symbol": p.symbol,
            "side": "buy" if p.type == mt5.POSITION_TYPE_BUY else "sell",
            "volume": json_number(p.volume),
            "open_price": json_number(p.price_open),
            "current_price": json_number(p.price_current),
            "stop_loss": json_number(p.sl),
            "take_profit": json_number(p.tp),
            "profit": json_number(p.profit),
            "opened_at": datetime.fromtimestamp(p.time, timezone.utc).isoformat(),
        }
        for p in positions
    ]


@app.post("/orders", dependencies=[Depends(require_api_key)])
def place_order(order: OrderRequest):
    require_connection()
    account = mt5.account_info()
    terminal = mt5.terminal_info()

    if not terminal.trade_allowed or not account.trade_allowed:
        raise HTTPException(status_code=423, detail="Trading is disabled by the terminal or broker.")

    mode = account_mode(account)
    if mode == "contest":
        raise HTTPException(status_code=403, detail="Contest accounts are not enabled for this bridge.")

    if mode == "real":
        if not ALLOW_LIVE_TRADING:
            raise HTTPException(status_code=423, detail="Live trading is disabled by server configuration.")
        if (
            not order.confirm_live
            or LIVE_TRADING_ACK != "I_UNDERSTAND_REAL_MONEY_RISK"
            or order.live_acknowledgement != LIVE_TRADING_ACK
        ):
            raise HTTPException(status_code=403, detail="Explicit live-trading safeguards are not satisfied.")

    symbol = order.symbol.upper()
    if symbol not in ALLOWED_SYMBOLS:
        raise HTTPException(status_code=403, detail="Symbol is not allow-listed.")

    if order.volume > MAX_ORDER_VOLUME:
        raise HTTPException(status_code=422, detail=f"Volume exceeds server limit ({MAX_ORDER_VOLUME}).")

    positions = mt5.positions_get()
    if positions is None:
        raise HTTPException(status_code=503, detail="Could not verify current exposure.")
    if len(positions) >= MAX_OPEN_POSITIONS:
        raise HTTPException(status_code=423, detail="Maximum number of open positions reached.")

    if not mt5.symbol_select(symbol, True):
        raise HTTPException(status_code=404, detail="Symbol is unavailable.")
    info = mt5.symbol_info(symbol)
    tick = mt5.symbol_info_tick(symbol)
    if info is None or tick is None:
        raise HTTPException(status_code=503, detail="Symbol pricing is unavailable.")

    if order.volume < info.volume_min or order.volume > info.volume_max:
        raise HTTPException(status_code=422, detail="Volume is outside the broker's allowed range.")
    steps = round((order.volume - info.volume_min) / info.volume_step)
    normalized_volume = round(info.volume_min + steps * info.volume_step, 8)
    if abs(normalized_volume - order.volume) > 1e-8:
        raise HTTPException(status_code=422, detail="Volume does not match the broker's volume step.")

    is_buy = order.side == "buy"
    price = tick.ask if is_buy else tick.bid
    point = info.point
    min_stop_distance = info.trade_stops_level * point
    if is_buy:
        valid_stops = order.stop_loss < price and order.take_profit > price
        valid_distance = (price - order.stop_loss) >= min_stop_distance and (order.take_profit - price) >= min_stop_distance
    else:
        valid_stops = order.stop_loss > price and order.take_profit < price
        valid_distance = (order.stop_loss - price) >= min_stop_distance and (price - order.take_profit) >= min_stop_distance
    if not valid_stops or not valid_distance:
        raise HTTPException(status_code=422, detail="Stop-loss and take-profit must be on the correct side and respect broker stop levels.")

    if info.filling_mode & mt5.SYMBOL_FILLING_IOC:
        filling = mt5.ORDER_FILLING_IOC
    elif info.filling_mode & mt5.SYMBOL_FILLING_FOK:
        filling = mt5.ORDER_FILLING_FOK
    else:
        filling = mt5.ORDER_FILLING_RETURN

    request = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": symbol,
        "volume": normalized_volume,
        "type": mt5.ORDER_TYPE_BUY if is_buy else mt5.ORDER_TYPE_SELL,
        "price": price,
        "sl": order.stop_loss,
        "tp": order.take_profit,
        "deviation": 20,
        "magic": 531001,
        "comment": "Saqoor Algeria",
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": filling,
    }

    check = mt5.order_check(request)
    if check is None or check.retcode != 0:
        reason = check.comment if check else str(mt5.last_error())
        raise HTTPException(status_code=422, detail=f"Broker pre-check rejected the order: {reason}")

    result = mt5.order_send(request)
    if result is None:
        raise HTTPException(status_code=502, detail=f"Broker did not return an order result: {mt5.last_error()}")

    accepted_codes = {mt5.TRADE_RETCODE_DONE, mt5.TRADE_RETCODE_PLACED, mt5.TRADE_RETCODE_DONE_PARTIAL}
    if result.retcode not in accepted_codes:
        raise HTTPException(status_code=422, detail=f"Broker rejected the order: {result.comment}")

    logger.info(
        "Order accepted: mode=%s symbol=%s side=%s volume=%s order=%s deal=%s",
        mode, symbol, order.side, normalized_volume, result.order, result.deal,
    )
    return {
        "accepted": True,
        "account_mode": mode,
        "symbol": symbol,
        "side": order.side,
        "volume": normalized_volume,
        "order_ticket": str(result.order),
        "deal_ticket": str(result.deal),
        "price": json_number(result.price),
        "broker_retcode": int(result.retcode),
        "broker_comment": result.comment,
        "executed_at": datetime.now(timezone.utc).isoformat(),
    }
