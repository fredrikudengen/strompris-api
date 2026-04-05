from pydantic import BaseModel
from typing import List
from datetime import date as DateType, datetime


class HourlyPrice(BaseModel):
    hour: int
    price_nok: float

class DailyPrices(BaseModel):
    region: str
    date: DateType
    prices: List[HourlyPrice]

class MonthlyPrices(BaseModel):
    region: str
    month: datetime
    price_nok: float

