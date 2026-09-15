import csv
import json
import re

mps = []

def parse_amount(val):
    if not val:
        return 0
    val = val.replace(',', '').strip()
    try:
        return float(val)
    except:
        return 0

# Lok Sabha
with open('public/lok_sabha.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        sr_no = row.get('Sr. No.', '').strip()
        if not sr_no or sr_no == 'Grand Total': continue
        
        mps.append({
            'id': f'LS-{sr_no}',
            'srNo': int(sr_no),
            'state': row.get('State', '').strip(),
            'name': row.get("Hon'ble Members of Parliaments", '').strip(),
            'term': None,
            'house': 'Lok Sabha',
            'constituency': row.get('Constituency', '').strip(),
            'electedOrNominated': None,
            'allocatedAmount': parse_amount(row.get('Allocated AMOUNT ( ₹ )', ''))
        })

# Rajya Sabha
with open('public/rajya_sabha.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        sr_no = row.get('Sr. No.', '').strip()
        if not sr_no or sr_no == 'Grand Total': continue
        
        raw_name = row.get("Hon'ble Members of Parliament", '').strip()
        name = raw_name
        term = None
        match = re.search(r'\((.*?)\)$', raw_name)
        if match:
            term = match.group(1)
            name = raw_name[:match.start()].strip()
            
        mps.append({
            'id': f'RS-{sr_no}',
            'srNo': int(sr_no),
            'state': row.get('State', '').strip(),
            'name': name,
            'term': term,
            'house': 'Rajya Sabha',
            'constituency': None,
            'electedOrNominated': row.get('Elected/Nominated', '').strip(),
            'allocatedAmount': parse_amount(row.get('Allocated AMOUNT ( ₹ )', ''))
        })

with open('src/data/mps.json', 'w', encoding='utf-8') as f:
    json.dump(mps, f, indent=2)
print('Done parsing', len(mps), 'MPs')
