import sys
import os
import uuid
import uuid

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import engine, get_db
from app.models.user import User, Base
from app.auth import get_password_hash

# Ensure tables are created
Base.metadata.create_all(bind=engine)

def seed_users():
    db = next(get_db())
    
    dummy_users = [
        {"username": "ministry1", "password": "ministry123", "role": "ministry"},
        {"username": "state1", "password": "state123", "role": "state_nodal_authority"},
        {"username": "district1", "password": "district123", "role": "district_authority"},
        {"username": "mp1", "password": "mp123", "role": "member_of_parliament"},
        {"username": "admin1", "password": "admin123", "role": "administrator"},
    ]
    
    for u in dummy_users:
        existing = db.query(User).filter(User.username == u["username"]).first()
        if not existing:
            new_user = User(
                id=str(uuid.uuid4()),
                username=u["username"],
                hashed_password=get_password_hash(u["password"]),
                role=u["role"]
            )
            db.add(new_user)
            print(f"Created user: {u['username']} with role {u['role']}")
        else:
            print(f"User {u['username']} already exists.")
            
    db.commit()
    print("Seed complete.")

if __name__ == "__main__":
    seed_users()
