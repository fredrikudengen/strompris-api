import httpx
from datetime import datetime

from fastapi import HTTPException

from database import SessionLocal
from db_models import PowerPrice
from models import HourlyPrice, DailyPrices, MonthlyPrices
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
        day = DateType.today() + timedelta(days=1)
    for region in ["NO1", "NO2", "NO3", "NO4", "NO5"]:
        daily = await fetch_prices(day, region)
        save_prices(daily)

async def get_prices_timeperiod(from_date:DateType, to_date:DateType, region):
    daily_prices = []

    if from_date <= to_date:
        while from_date <= to_date:
            daily = await fetch_prices_from_db(from_date, region)
            daily_prices.append(daily)
            from_date = from_date + timedelta(days=1)
    else:
        while from_date >= to_date:
            daily = await fetch_prices_from_db(from_date, region)
            daily_prices.append(daily)
            from_date = from_date - timedelta(days=1)

    return daily_prices

async def fetch_prices_from_db(day: DateType, region: str) -> DailyPrices:
    db = SessionLocal()
    result = db.query(PowerPrice)\
            .filter(PowerPrice.region == region)\
            .filter(PowerPrice.date == day)\
            .all()
    db.close()

    prices = []

    if not result:
        return await fetch_prices(day, region)

    for item in result:
        hour = item.hour
        price = item.price
        prices.append(HourlyPrice(hour=hour, price_nok=price))

    return DailyPrices(region=region, date=day, prices=prices)

def cheapest(daily_prices: DailyPrices):
    prices = daily_prices.prices
    return min(prices, key=lambda x: x.price_nok)

def most_expensive(daily_prices: DailyPrices):
    prices = daily_prices.prices
    return max(prices, key=lambda x: x.price_nok)

async def cheapest_timeframe(from_date: DateType, to_date: DateType, region: str):
    if from_date == DateType.today():
        await fetch_and_save_day(from_date)
    elif to_date == DateType.today():
        await fetch_and_save_day(to_date)

    cheapest_so_far = 10000000000.0
    cheapest_day = None
    if from_date <= to_date:
        while from_date <= to_date:
            new_cheapest = await cheapest_date(from_date, region)
            if new_cheapest is None:
                from_date = from_date + timedelta(days=1)
                continue
            if cheapest_so_far > new_cheapest.price_nok:
                cheapest_so_far = new_cheapest.price_nok
                cheapest_day = from_date
            from_date = from_date + timedelta(days=1)
    else:
        while from_date >= to_date:
            new_cheapest = await cheapest_date(from_date, region)
            if new_cheapest is None:
                from_date = from_date - timedelta(days=1)
                continue
            if cheapest_so_far > new_cheapest.price_nok:
                cheapest_so_far = new_cheapest.price_nok
                cheapest_day = from_date
            from_date = from_date - timedelta(days=1)
    if cheapest_day is None:
        raise HTTPException(status_code=404, detail="Ingen priser funnet for denne perioden")
    return await fetch_prices_from_db(cheapest_day, region)

async def cheapest_date(day: DateType, region: str):
    db = SessionLocal()
    result = db.query(PowerPrice)\
            .filter(PowerPrice.region == region)\
            .filter(PowerPrice.date == day)\
            .order_by(PowerPrice.price)\
            .first()
    db.close()

    if result:
        return HourlyPrice(hour=result.hour, price_nok=result.price)
    daily = await fetch_prices(day, region)
    return cheapest(daily)

async def most_expensive_date(day: DateType, region: str):
    db = SessionLocal()
    result = db.query(PowerPrice)\
            .filter(PowerPrice.region == region)\
            .filter(PowerPrice.date == day)\
            .order_by(PowerPrice.price.desc())\
            .first()
    db.close()

    if result:
        return HourlyPrice(hour=result.hour, price_nok=result.price)
    daily = await fetch_prices(day, region)
    return most_expensive(daily)

async def most_expensive_timeframe(from_date: DateType, to_date: DateType, region: str):
    if from_date == DateType.today():
        await fetch_and_save_day(from_date)
    elif to_date == DateType.today():
        await fetch_and_save_day(to_date)

    most_expensive_so_far = 0.0
    most_expensive_day = None
    if from_date <= to_date:
        while from_date <= to_date:
            new_most_expensive = await most_expensive_date(from_date, region)
            if new_most_expensive is None:
                from_date = from_date + timedelta(days=1)
                continue
            if most_expensive_so_far < new_most_expensive.price_nok:
                most_expensive_so_far = new_most_expensive.price_nok
                most_expensive_day = from_date
            from_date = from_date + timedelta(days=1)
    else:
        while from_date >= to_date:
            new_most_expensive = await most_expensive_date(from_date, region)
            if new_most_expensive is None:
                from_date = from_date - timedelta(days=1)
                continue
            if most_expensive_so_far < new_most_expensive.price_nok:
                most_expensive_so_far = new_most_expensive.price_nok
                most_expensive_day = from_date
            from_date = from_date - timedelta(days=1)
    if most_expensive_day is None:
        raise HTTPException(status_code=404, detail="Ingen priser funnet for denne perioden")
    return await fetch_prices_from_db(most_expensive_day, region)

def get_average_from_db(from_date: DateType, to_date: DateType, region: str) -> float:
    db = SessionLocal()
    result = db.query(func.avg(PowerPrice.price))\
        .filter(PowerPrice.region == region)\
        .filter(PowerPrice.date >= min(from_date, to_date))\
        .filter(PowerPrice.date <= max(from_date, to_date))\
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

def get_monthly_averages(region: str):
    monthly_averages = []
    db = SessionLocal()
    result = db.query(
        func.date_trunc('month', PowerPrice.date).label('month'),
        func.avg(PowerPrice.price).label('avg_price'))\
        .filter(PowerPrice.region == region) \
        .group_by(func.date_trunc('month', PowerPrice.date)) \
        .order_by(func.date_trunc('month', PowerPrice.date)) \
        .all()

    for month, avg_price in result:
        monthly_averages.append(MonthlyPrices(region=region, month=month, price_nok=avg_price))
    return monthly_averages