import httpx
from datetime import datetime
from models import HourlyPrice, DailyPrices


async def fetch_prices(region: str, date: str) -> DailyPrices:
    url = f"https://www.hvakosterstrommen.no/api/v1/prices/{date}_{region}.json"

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