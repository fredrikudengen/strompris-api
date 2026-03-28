from pydantic import BaseModel
from typing import List

class HourlyPrice(BaseModel):
    hour: int
    price_nok: float

class DailyPrices(BaseModel):
    region: str
    date: str
    prices: List[HourlyPrice]

