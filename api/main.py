from fastapi import FastAPI
from prices import cheapest, get_average_from_db, fetch_prices_from_db, cheapest_from_db, fetch_and_save_timeframe, \
    fetch_and_save_day, cheapest_timeframe
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

@app.get("/prices/day")
async def get_today_prices(day: DateType=DateType.today(), region: str = "NO5"):
    prices = fetch_prices_from_db(day, region)
    if not prices:
        return await fetch_prices(day, region)
    else:
        return prices

@app.get("/prices/cheapest-day")
async def get_cheapest_price_day(day: DateType=DateType.today(), region: str = "NO5"):
    cheapest_price = cheapest_from_db(day, region)
    if not cheapest_price:
        daily = await fetch_prices(day, region)
        return cheapest(daily)
    else:
        return cheapest_price

@app.get("/prices/cheapest-timeframe")
async def get_cheapest_price_timeframe(from_date: DateType=DateType.today(), to_date: DateType=DateType.today(), region: str = "NO5"):
    if from_date == DateType.today():
        await fetch_and_save_day(from_date)
    elif to_date == DateType.today():
        await fetch_and_save_day(to_date)
    return cheapest_timeframe(from_date, to_date, region)

@app.get("/prices/average")
async def get_average_prices(day: DateType = DateType.today(), region: str = "NO5", days: int = 7):
    return get_average_from_db(day, region, days)