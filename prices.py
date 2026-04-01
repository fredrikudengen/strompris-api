import httpx
from datetime import datetime

from database import SessionLocal
from db_models import PowerPrice
from models import HourlyPrice, DailyPrices
from datetime import timedelta
from datetime import date as DateType
from sqlalchemy.dialects.postgresql import insert

async def fetch_prices(region: str, date: DateType) -> DailyPrices:
    url = f"https://www.hvakosterstrommen.no/api/v1/prices/{date.strftime("%Y/%m-%d")}_{region}.json"

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
    today = DateType.today()
    for day in range(days):
        yesterday = today - timedelta(days=day)
        daily_prices = await fetch_prices(region, yesterday)
        total += sum([x.price_nok for x in daily_prices.prices])

    return total / days

def save_prices(daily_prices: DailyPrices):
    region = daily_prices.region
    date = daily_prices.date
    prices = daily_prices.prices
    db = SessionLocal()

    for price in prices:
        stmt = insert(PowerPrice).values(
            region=region,
            date=date,
            hour=price.hour,
            price=price.price_nok
        ).on_conflict_do_nothing()
        db.execute(stmt)

    db.commit()
    db.close()
