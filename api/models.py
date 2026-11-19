from pydantic import BaseModel
from typing import List, Literal, get_args
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


Region = Literal["NO1", "NO2", "NO3", "NO4", "NO5"]
REGIONS: list[str] = list(get_args(Region))
