import httpx
from datetime import datetime
from models import HourlyPrice, DailyPrices
from datetime import date, timedelta

async def fetch_prices(region: str, date: str) -> DailyPrices:
    url = f"https://www.hvakosterstrommen.no/api/v1/prices/{date}_{region}.json"
    print(f"Fetcher: {url}")

    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        data = response.json()

    prices = []
    for item in data:
        hour = datetime.fromisoformat(item.get("time_start")).hour
        price = item.get("NOK_per_kWh")
        prices.append(HourlyPrice(hour=hour, price_nok=price))

    return DailyPrices(
        region=region,
        date=date,
        prices=prices
    )

def cheapest(daily_prices: DailyPrices):
    prices = daily_prices.prices
    return min(prices, key=lambda x: x.price_nok)

async def average(region, days):
    total = 0
    today = date.today()
    for day in range(days):
        yesterday = today - timedelta(days=day)
        daily_prices = await fetch_prices(region, yesterday.strftime("%Y/%m-%d"))
        total += sum([x.price_nok for x in daily_prices.prices])
        today = yesterday

    return total / days
