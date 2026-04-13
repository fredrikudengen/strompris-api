from anthropic.types import OverloadedError
from fastapi import FastAPI, Request
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from claude import ask_claude, get_cached_answer, save_answer
from prices import get_average_from_db, fetch_prices_from_db, cheapest_date, fetch_and_save_timeframe, \
    fetch_and_save_day, cheapest_timeframe, get_prices_timeperiod, get_monthly_averages, most_expensive_date, \
    most_expensive_timeframe, get_average
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import date as DateType, timedelta
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

scheduler = AsyncIOScheduler()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/admin/fetch-date")
async def manual_fetch(from_date: DateType=DateType.today(), to_date: DateType=DateType.today()):
    await fetch_and_save_timeframe(from_date, to_date)
    return {"status": "done"}

@app.on_event("startup")
async def start_scheduler():
    scheduler.add_job(fetch_and_save_day, "cron", hour=14, minute=0)
    scheduler.start()

@app.get("/prices/date")
async def get_today_prices(date: DateType=DateType.today(), region: str = "NO1"):
    return await fetch_prices_from_db(date, region)

@app.get("/prices/period")
async def get_period_prices(from_date: DateType=DateType.today(), to_date: DateType=DateType.today(), region: str = "NO1"):
    return await get_prices_timeperiod(from_date, to_date, region)

@app.get("/prices/cheapest-date")
async def get_cheapest_date(date: DateType=DateType.today(), region: str = "NO1"):
    return await cheapest_date(date, region)

@app.get("/prices/cheapest-period")
async def get_cheapest_timeframe(from_date: DateType=DateType.today(), to_date: DateType=DateType.today(), region: str = "NO1"):
    return await cheapest_timeframe(from_date, to_date, region)

@app.get("/prices/most-expensive-date")
async def get_most_expensive_date(date: DateType=DateType.today(), region: str = "NO1"):
    return await most_expensive_date(date, region)

@app.get("/prices/most-expensive-period")
async def get_most_expensive_timeframe(from_date: DateType=DateType.today(), to_date: DateType=DateType.today(), region: str = "NO1"):
    return await most_expensive_timeframe(from_date, to_date, region)

@app.get("/prices/average-date")
async def get_average_date(date: DateType=DateType.today(), region: str = "NO1"):
    return get_average(date, region)

@app.get("/prices/average-period")
async def get_average_prices(from_date: DateType = DateType.today(), to_date: DateType=DateType.today(), region: str = "NO1"):
    return get_average_from_db(from_date, to_date, region)

@app.get("/prices/monthly")
async def get_monthly_price(region: str = "NO1"):
    return get_monthly_averages(region)

@app.get("/claude/ask")
@limiter.limit("5/day")
async def get_claude_answer(request: Request, question: str, region: str = "NO1"):
    try:
        cached_answer = get_cached_answer(question, region)
        if cached_answer:
            return cached_answer
        else:
            answer = ask_claude(question, region)
            save_answer(question, answer, region)
            return answer
    except OverloadedError:
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail="Anthropic API er midlertidig overbelastet, prøv igjen om litt.")
