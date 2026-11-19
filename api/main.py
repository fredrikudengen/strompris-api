import os
import secrets
from datetime import date as DateType

from anthropic.types import OverloadedError
from fastapi import FastAPI, Request, Header, HTTPException
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from claude import ask_claude, get_cached_answer, save_answer
from models import Region
from prices import get_average_from_db, fetch_prices_from_db, cheapest_date, fetch_and_save_timeframe, \
    fetch_and_save_day, cheapest_timeframe, get_prices_timeperiod, get_monthly_averages, most_expensive_date, \
    most_expensive_timeframe, get_average
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi.middleware.cors import CORSMiddleware

# Største tillatte periode (i dager) for offentlige periode-endepunkter.
MAX_PERIOD_DAYS = 366

ADMIN_TOKEN = os.getenv("ADMIN_TOKEN")

app = FastAPI()
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

scheduler = AsyncIOScheduler()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def resolve_day(day: DateType | None) -> DateType:
    return day if day is not None else DateType.today()


def resolve_period(from_date: DateType | None, to_date: DateType | None, max_days: int | None = MAX_PERIOD_DAYS):
    from_date = resolve_day(from_date)
    to_date = resolve_day(to_date)
    if max_days is not None and abs((to_date - from_date).days) + 1 > max_days:
        raise HTTPException(status_code=400, detail=f"Perioden kan maks være {max_days} dager")
    return from_date, to_date


def require_admin(token: str | None):
    if not ADMIN_TOKEN:
        raise HTTPException(status_code=403, detail="Admin-endepunktet er deaktivert (ADMIN_TOKEN er ikke satt)")
    if token is None or not secrets.compare_digest(token, ADMIN_TOKEN):
        raise HTTPException(status_code=401, detail="Ugyldig admin-token")


@app.get("/admin/fetch-date")
async def manual_fetch(from_date: DateType | None = None, to_date: DateType | None = None,
                       x_admin_token: str | None = Header(default=None)):
    require_admin(x_admin_token)
    from_date, to_date = resolve_period(from_date, to_date, max_days=None)
    await fetch_and_save_timeframe(from_date, to_date)
    return {"status": "done"}

@app.on_event("startup")
async def start_scheduler():
    scheduler.add_job(fetch_and_save_day, "cron", hour=14, minute=0)
    scheduler.start()

@app.get("/prices/date")
async def get_today_prices(date: DateType | None = None, region: Region = "NO1"):
    return await fetch_prices_from_db(resolve_day(date), region)

@app.get("/prices/period")
async def get_period_prices(from_date: DateType | None = None, to_date: DateType | None = None, region: Region = "NO1"):
    from_date, to_date = resolve_period(from_date, to_date)
    return await get_prices_timeperiod(from_date, to_date, region)

@app.get("/prices/cheapest-date")
async def get_cheapest_date(date: DateType | None = None, region: Region = "NO1"):
    return await cheapest_date(resolve_day(date), region)

@app.get("/prices/cheapest-period")
async def get_cheapest_timeframe(from_date: DateType | None = None, to_date: DateType | None = None, region: Region = "NO1"):
    from_date, to_date = resolve_period(from_date, to_date)
    return await cheapest_timeframe(from_date, to_date, region)

@app.get("/prices/most-expensive-date")
async def get_most_expensive_date(date: DateType | None = None, region: Region = "NO1"):
    return await most_expensive_date(resolve_day(date), region)

@app.get("/prices/most-expensive-period")
async def get_most_expensive_timeframe(from_date: DateType | None = None, to_date: DateType | None = None, region: Region = "NO1"):
    from_date, to_date = resolve_period(from_date, to_date)
    return await most_expensive_timeframe(from_date, to_date, region)

@app.get("/prices/average-date")
async def get_average_date(date: DateType | None = None, region: Region = "NO1"):
    return get_average(resolve_day(date), region)

@app.get("/prices/average-period")
async def get_average_prices(from_date: DateType | None = None, to_date: DateType | None = None, region: Region = "NO1"):
    from_date, to_date = resolve_period(from_date, to_date)
    return get_average_from_db(from_date, to_date, region)

@app.get("/prices/monthly")
async def get_monthly_price(region: Region = "NO1"):
    return get_monthly_averages(region)

@app.get("/claude/ask")
@limiter.limit("5/day")
async def get_claude_answer(request: Request, question: str, region: Region = "NO1"):
    try:
        cached_answer = get_cached_answer(question, region)
        if cached_answer:
            return cached_answer
        else:
            answer = ask_claude(question, region)
            save_answer(question, answer, region)
            return answer
    except OverloadedError:
        raise HTTPException(status_code=503, detail="Anthropic API er midlertidig overbelastet, prøv igjen om litt.")
