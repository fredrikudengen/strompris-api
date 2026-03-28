from fastapi import FastAPI
from prices import fetch_prices, cheapest, average
from datetime import date

app = FastAPI()

@app.get("/prices/today")
async def get_today_prices(region: str = "NO5"):
    string_date = date.today().strftime("%Y/%m-%d")
    return await fetch_prices(region, string_date)

@app.get("/prices/cheapest")
async def get_cheapest_prices(region: str = "NO5"):
    string_date = date.today().strftime("%Y/%m-%d")
    daily = await fetch_prices(region, string_date)
    return cheapest(daily)

@app.get("/prices/average")
async def get_average_prices(region: str = "NO5", days: int = 7):
    return await average(region, days)