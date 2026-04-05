from sqlalchemy import Column, String, Date, Integer, Numeric
from database import Base

class PowerPrice(Base):
    __tablename__ = "power_prices"

    region = Column(String, primary_key=True)
    date = Column(Date, primary_key=True)
    hour = Column(Integer, primary_key=True)
    price = Column(Numeric, nullable=False)