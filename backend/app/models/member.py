from sqlalchemy import Column, String, Float
from ..database import Base

class Member(Base):
    __tablename__ = "members"

    id = Column(String, primary_key=True, index=True)
    house = Column(String, index=True)
    name = Column(String, index=True)
    state = Column(String, index=True)
    constituency = Column(String, index=True, nullable=True)
    party = Column(String, index=True, nullable=True)
    allocatedAmount = Column(Float)
