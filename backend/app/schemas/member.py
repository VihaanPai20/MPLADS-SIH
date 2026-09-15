from pydantic import BaseModel
from typing import Optional

class MemberBase(BaseModel):
    id: str
    house: str
    name: str
    state: str
    constituency: Optional[str] = None
    party: Optional[str] = None
    allocatedAmount: float

class MemberCreate(MemberBase):
    pass

class MemberResponse(MemberBase):
    class Config:
        from_attributes = True
