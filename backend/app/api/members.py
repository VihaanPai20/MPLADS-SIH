from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.member import Member
from ..schemas.member import MemberResponse

router = APIRouter()

@router.get("/", response_model=List[MemberResponse])
def get_members(house: str = "ALL", db: Session = Depends(get_db)):
    query = db.query(Member)
    if house != "ALL":
        # Handle formatting differences
        db_house = "Lok Sabha" if house == "LOK_SABHA" else "Rajya Sabha"
        query = query.filter(Member.house == db_house)
    return query.all()

@router.get("/{member_id}", response_model=MemberResponse)
def get_member(member_id: str, db: Session = Depends(get_db)):
    return db.query(Member).filter(Member.id == member_id).first()
