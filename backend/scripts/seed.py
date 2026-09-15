import pandas as pd
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.database import engine, Base, SessionLocal
from app.models.member import Member

Base.metadata.create_all(bind=engine)

def clean_amount(val):
    if pd.isna(val):
        return 0.0
    val_str = str(val).replace(',', '').strip()
    try:
        return float(val_str)
    except ValueError:
        return 0.0

def seed_data():
    db = SessionLocal()
    
    # Paths to source data
    lok_sabha_path = '../public/lok_sabha.csv'
    rajya_sabha_path = '../public/rajya_sabha.csv'

    try:
        if db.query(Member).first():
            print("Database already seeded!")
            return

        print("Seeding Lok Sabha...")
        ls_df = pd.read_csv(lok_sabha_path)
        for _, row in ls_df.iterrows():
            sr = str(row.get('Sr. No.', '')).strip()
            if not sr or sr == 'Grand Total': continue
                
            db.add(Member(
                id=f"LS-{sr}",
                house="Lok Sabha",
                name=str(row.get("Hon'ble Members of Parliaments", '')).strip(),
                state=str(row.get('State', '')).strip(),
                constituency=str(row.get('Constituency', '')).strip(),
                allocatedAmount=clean_amount(row.get('Allocated AMOUNT ( ₹ )'))
            ))

        print("Seeding Rajya Sabha...")
        rs_df = pd.read_csv(rajya_sabha_path)
        for _, row in rs_df.iterrows():
            sr = str(row.get('Sr. No.', '')).strip()
            if not sr or sr == 'Grand Total': continue
            
            name = str(row.get("Hon'ble Members of Parliament", '')).strip()
            
            db.add(Member(
                id=f"RS-{sr}",
                house="Rajya Sabha",
                name=name,
                state=str(row.get('State', '')).strip(),
                constituency=None,
                allocatedAmount=clean_amount(row.get('Allocated AMOUNT ( ₹ )'))
            ))
            
        db.commit()
        print("Successfully seeded all data!")
        
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
