import os
import uuid
import pandas as pd
from sqlalchemy.orm import Session
from .database import engine, SessionLocal, Base
from .models.user import User
from .models.member import Member
from .auth import get_password_hash

def clean_amount(val):
    if pd.isna(val):
        return 0.0
    val_str = str(val).replace(',', '').strip()
    try:
        return float(val_str)
    except ValueError:
        return 0.0

def init_database():
    """Initializes tables and seeds default users and member data if database is empty."""
    # Ensure all tables exist
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        # 1. Seed default demo users if none exist
        user_count = db.query(User).count()
        if user_count == 0:
            print("Seeding default demo users...")
            demo_users = [
                {"username": "ministry1", "password": "ministry123", "role": "ministry"},
                {"username": "state1", "password": "state123", "role": "state_nodal_authority"},
                {"username": "district1", "password": "district123", "role": "district_authority"},
                {"username": "mp1", "password": "mp123", "role": "member_of_parliament"},
                {"username": "admin1", "password": "admin123", "role": "administrator"},
            ]
            for u in demo_users:
                new_user = User(
                    id=str(uuid.uuid4()),
                    username=u["username"],
                    hashed_password=get_password_hash(u["password"]),
                    role=u["role"]
                )
                db.add(new_user)
            db.commit()
            print(f"Successfully seeded {len(demo_users)} demo users.")
        else:
            print(f"Users table already has {user_count} users.")

        # 2. Seed members data if none exist
        member_count = db.query(Member).count()
        if member_count == 0:
            print("Seeding member dataset...")
            # Look for CSV files in several potential locations
            base_dir = os.path.dirname(os.path.abspath(__file__))
            candidate_paths = [
                os.path.join(base_dir, "..", "data"),
                os.path.join(base_dir, "data"),
                os.path.join(base_dir, "..", "..", "public"),
                os.path.join(os.getcwd(), "data"),
                os.path.join(os.getcwd(), "backend", "data"),
                os.path.join(os.getcwd(), "public"),
            ]
            
            ls_path = None
            rs_path = None
            for p in candidate_paths:
                test_ls = os.path.join(p, "lok_sabha.csv")
                test_rs = os.path.join(p, "rajya_sabha.csv")
                if os.path.exists(test_ls) and os.path.exists(test_rs):
                    ls_path = test_ls
                    rs_path = test_rs
                    break
                    
            if ls_path and rs_path:
                print(f"Found member CSV datasets at: {ls_path}")
                ls_df = pd.read_csv(ls_path)
                for _, row in ls_df.iterrows():
                    sr = str(row.get('Sr. No.', '')).strip()
                    if not sr or sr == 'Grand Total':
                        continue
                    db.add(Member(
                        id=f"LS-{sr}",
                        house="Lok Sabha",
                        name=str(row.get("Hon'ble Members of Parliaments", '')).strip(),
                        state=str(row.get('State', '')).strip(),
                        constituency=str(row.get('Constituency', '')).strip(),
                        allocatedAmount=clean_amount(row.get('Allocated AMOUNT ( ₹ )'))
                    ))
                
                rs_df = pd.read_csv(rs_path)
                for _, row in rs_df.iterrows():
                    sr = str(row.get('Sr. No.', '')).strip()
                    if not sr or sr == 'Grand Total':
                        continue
                    db.add(Member(
                        id=f"RS-{sr}",
                        house="Rajya Sabha",
                        name=str(row.get("Hon'ble Members of Parliament", '')).strip(),
                        state=str(row.get('State', '')).strip(),
                        constituency=None,
                        allocatedAmount=clean_amount(row.get('Allocated AMOUNT ( ₹ )'))
                    ))
                db.commit()
                print("Successfully seeded member data!")
            else:
                print("Warning: CSV datasets not found in candidate paths.")
        else:
            print(f"Members table already has {member_count} members.")
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()
