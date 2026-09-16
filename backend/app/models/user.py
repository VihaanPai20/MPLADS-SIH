from sqlalchemy import Column, String
from ..database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String) # 'ministry', 'state_nodal_authority', 'district_authority', 'member_of_parliament', 'administrator'
