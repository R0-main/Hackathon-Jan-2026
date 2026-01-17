from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models import WaitlistEntry
from app.schemas import WaitlistCreate, WaitlistResponse, MessageResponse

router = APIRouter(prefix="/waitlist", tags=["waitlist"])


@router.post("/", response_model=MessageResponse)
async def join_waitlist(data: WaitlistCreate, db: AsyncSession = Depends(get_db)):
    # Check if email already exists
    existing = await db.execute(
        select(WaitlistEntry).where(WaitlistEntry.email == data.email)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Add to waitlist
    entry = WaitlistEntry(email=data.email)
    db.add(entry)
    await db.commit()
    await db.refresh(entry)

    # Get position
    count = await db.execute(select(func.count(WaitlistEntry.id)))
    position = count.scalar()

    return MessageResponse(message="Successfully joined the waitlist!", position=position)


@router.get("/count")
async def get_waitlist_count(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(func.count(WaitlistEntry.id)))
    count = result.scalar()
    return {"count": count}
