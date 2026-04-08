from sqlalchemy import Column, String, Date, Integer, Numeric, DateTime
from database import Base

class PowerPrice(Base):
    __tablename__ = "power_prices"

    region = Column(String, primary_key=True)
    date = Column(Date, primary_key=True)
    hour = Column(Integer, primary_key=True)
    price = Column(Numeric, nullable=False)

class CachedAnswer(Base):
    __tablename__ = "cached_answers"
    question = Column(String, primary_key=True)
    answer = Column(String, primary_key=False)
    created_at = Column(DateTime, primary_key=False)
    region = Column(String, primary_key=True)