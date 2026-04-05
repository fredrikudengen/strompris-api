from fastapi import FastAPI
from prices import cheapest, get_average_from_db, fetch_prices_from_db, cheapest_date, fetch_and_save_timeframe, \
    fetch_and_save_day, cheapest_timeframe, get_prices_period, get_monthly_averages, most_expensive_date, \
    most_expensive_timeframe
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from prices import fetch_prices
from datetime import date as DateType
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

scheduler = AsyncIOScheduler()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
async def get_today_prices(date: DateType=DateType.today(), region: str = "NO5"):
    return await fetch_prices_from_db(date, region)

@app.get("/prices/period")
async def get_period_prices(from_date: DateType=DateType.today(), to_date: DateType=DateType.today(), region: str = "NO5"):
    return await get_prices_period(from_date, to_date, region)

@app.get("/prices/cheapest-date")
async def get_cheapest_date(date: DateType=DateType.today(), region: str = "NO5"):
    return await cheapest_date(date, region)

@app.get("/prices/cheapest-period")
async def get_cheapest_timeframe(from_date: DateType=DateType.today(), to_date: DateType=DateType.today(), region: str = "NO5"):
    return await cheapest_timeframe(from_date, to_date, region)

@app.get("/prices/most-expensive-date")
async def get_most_expensive_date(date: DateType=DateType.today(), region: str = "NO5"):
    return await most_expensive_date(date, region)

@app.get("/prices/most-expensive-period")
async def get_most_expensive_timeframe(from_date: DateType=DateType.today(), to_date: DateType=DateType.today(), region: str = "NO5"):
    return await most_expensive_timeframe(from_date, to_date, region)

@app.get("/prices/average")
async def get_average_prices(from_date: DateType = DateType.today(), to_date: DateType=DateType.today(), region: str = "NO5"):
    return get_average_from_db(from_date, to_date, region)

@app.get("/prices/monthly")
async def get_monthly_price(region: str = "NO5"):
    return get_monthly_averages(region)