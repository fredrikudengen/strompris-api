import httpx
from datetime import datetime

from fastapi import HTTPException

from database import SessionLocal
from db_models import PowerPrice
from models import HourlyPrice, DailyPrices
from datetime import timedelta
from datetime import date as DateType
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import func

async def fetch_prices(day: DateType, region: str) -> DailyPrices:
    url = f"https://www.hvakosterstrommen.no/api/v1/prices/{day.strftime("%Y/%m-%d")}_{region}.json"

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
        date=day,
        prices=prices
    )

async def fetch_and_save_timeframe(from_date: DateType, to_date: DateType):
    start_date = from_date
    for region in ["NO1", "NO2", "NO3", "NO4", "NO5"]:
        if from_date <= to_date:
            while from_date <= to_date:
                daily = await fetch_prices(from_date, region)
                save_prices(daily)
                from_date = from_date + timedelta(days=1)
            from_date = start_date
        else:
            while from_date >= to_date:
                daily = await fetch_prices(from_date, region)
                save_prices(daily)
                from_date = from_date - timedelta(days=1)
            from_date = start_date

async def fetch_and_save_day(day=None):
    if day is None:
        day = DateType.today()
    for region in ["NO1", "NO2", "NO3", "NO4", "NO5"]:
        daily = await fetch_prices(day, region)
        save_prices(daily)

def fetch_prices_from_db(day: DateType, region: str) -> DailyPrices:
    db = SessionLocal()
    result = db.query(PowerPrice)\
            .filter(PowerPrice.region == region)\
            .filter(PowerPrice.date == day)\
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

def cheapest_timeframe(from_date: DateType, to_date: DateType, region: str):
    cheapest_so_far = 10000000000.0
    cheapest_day = None
    if from_date <= to_date:
        while from_date <= to_date:
            new_cheapest = cheapest_from_db(from_date, region)
            if new_cheapest is None:
                from_date = from_date + timedelta(days=1)
                continue
            if cheapest_so_far > new_cheapest.price_nok:
                cheapest_so_far = new_cheapest.price_nok
                cheapest_day = from_date
            from_date = from_date + timedelta(days=1)
    else:
        while from_date >= to_date:
            new_cheapest = cheapest_from_db(from_date, region)
            if new_cheapest is None:
                from_date = from_date - timedelta(days=1)
                continue
            if cheapest_so_far > new_cheapest.price_nok:
                cheapest_so_far = new_cheapest.price_nok
                cheapest_day = from_date
            from_date = from_date - timedelta(days=1)
    if cheapest_day is None:
        raise HTTPException(status_code=404, detail="Ingen priser funnet for denne perioden")
    return fetch_prices_from_db(cheapest_day, region)

def cheapest_from_db(day: DateType, region: str):
    db = SessionLocal()
    result = db.query(PowerPrice)\
            .filter(PowerPrice.region == region)\
            .filter(PowerPrice.date == day)\
            .order_by(PowerPrice.price)\
            .first()
    db.close()
    if result:
        return HourlyPrice(hour=result.hour, price_nok=result.price)
    return None

def get_average_from_db(day: DateType, region: str, days: int) -> float:
    db = SessionLocal()
    cutoff = day - timedelta(days=days)
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
