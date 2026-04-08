from datetime import datetime

import anthropic
from sqlalchemy.dialects.postgresql import insert

from database import SessionLocal
from db_models import CachedAnswer
from prices import get_prices_timeperiod, get_monthly_averages


def ask_claude(question: str, region):
    client = anthropic.Anthropic()
    data = get_monthly_averages(region)
    message = client.messages.create(
        system=f"Her er strømprisdata fra databasen for region:{region}\n{data}",
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        messages=[{"role": "user", "content": question}]
    )
    return message.content[0].text

def get_cached_answer(question: str, region: str):
    db = SessionLocal()
    result = db.query(CachedAnswer) \
        .filter(CachedAnswer.question == question) \
        .filter(CachedAnswer.region == region) \
        .all()
    db.close()
    if not result:
        return None
    else:
        return result[0].answer

def save_answer(question: str, answer: str, region: str):
    db = SessionLocal()
    stmt = insert(CachedAnswer).values(
            question=question,
            answer=answer,
            created_at = datetime.now(),
            region = region
        ).on_conflict_do_nothing()
    db.execute(stmt)
    db.commit()
    db.close()