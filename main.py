from fastapi import FastAPI
from prices import fetch_prices
from datetime import date

app = FastAPI()

@app.get("/prices/today")
async def get_today_prices(region: str = "NO5"):

    string_date = date.today().strftime("%Y/%m-%d")
    return await fetch_prices(region, string_date)