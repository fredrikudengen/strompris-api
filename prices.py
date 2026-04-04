import httpx
from datetime import datetime

from database import SessionLocal
from db_models import PowerPrice
from models import HourlyPrice, DailyPrices
from datetime import timedelta
from datetime import date as DateType
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import func

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

def fetch_prices_from_db(region: str) -> DailyPrices:
    db = SessionLocal()
    result = db.query(PowerPrice)\
            .filter(PowerPrice.region == region)\
            .filter(PowerPrice.date == DateType.today())\
            .all()
    db.close()

    prices = []
    for item in result:
        hour = item.hour
        price = item.price
        prices.append(HourlyPrice(hour=hour, price_nok=price))

    return DailyPrices(region=region, date=DateType.today(), prices=prices)

def cheapest(daily_prices: DailyPrices):
    prices = daily_prices.prices
    return min(prices, key=lambda x: x.price_nok)

def cheapest_from_db(region: str):
    db = SessionLocal()
    result = db.query(PowerPrice)\
            .filter(PowerPrice.region == region)\
            .filter(PowerPrice.date == DateType.today())\
            .order_by(PowerPrice.price)\
            .first()
    db.close()

    return HourlyPrice(hour=result.hour, price_nok=result.price)

def get_average_from_db(region: str, days: int) -> float:
    db = SessionLocal()
    cutoff = DateType.today() - timedelta(days=days)
    result = db.query(func.avg(PowerPrice.price))\
               .filter(PowerPrice.region == region)\
               .filter(PowerPrice.date >= cutoff)\
               .scalar()
    db.close()
    return result

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
