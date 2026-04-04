from fastapi import FastAPI
from prices import cheapest, get_average_from_db, fetch_prices_from_db, cheapest_from_db
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from prices import fetch_prices, save_prices
from datetime import date as DateType
app = FastAPI()

scheduler = AsyncIOScheduler()

@app.get("/admin/fetch-date")
async def manual_fetch(date: DateType):
    await fetch_and_save(date)
    return {"status": "done"}

@app.on_event("startup")
async def start_scheduler():
    scheduler.add_job(fetch_and_save, "cron", hour=14, minute=0)
    scheduler.start()

async def fetch_and_save(date=None):
    if date is None:
        date = DateType.today()
    for region in ["NO1", "NO2", "NO3", "NO4", "NO5"]:
        daily = await fetch_prices(region, date)
        save_prices(daily)

@app.get("/prices/today")
async def get_today_prices(region: str = "NO5"):
    prices = fetch_prices_from_db(region)
    if not prices:
        return await fetch_prices(region, DateType.today())
    else:
        return prices

@app.get("/prices/cheapest")
async def get_cheapest_prices(region: str = "NO5"):
    cheapest_price = cheapest_from_db(region)
    if not cheapest_price:
        daily = await fetch_prices(region, DateType.today())
        return cheapest(daily)
    else:
        return cheapest_price

@app.get("/prices/average")
async def get_average_prices(region: str = "NO5", days: int = 7):
    return get_average_from_db(region, days)