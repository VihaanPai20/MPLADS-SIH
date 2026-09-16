import Papa from 'papaparse';
import type { MemberOfParliament } from '../types';

export async function fetchLokSabhaData(): Promise<MemberOfParliament[]> {
  const response = await fetch('/lok_sabha.csv?v=' + new Date().getTime());
  const csvText = await response.text();
  
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const mps: MemberOfParliament[] = [];
        for (const row of results.data as any[]) {
          const srNoStr = (row['Sr. No.'] || '').trim();
          if (!srNoStr || srNoStr === 'Grand Total') continue;

          let amount = 0;
          const rawAmount = row['Allocated AMOUNT ( ₹ )'];
          if (rawAmount) {
            amount = parseFloat(rawAmount.replace(/,/g, '').trim()) || 0;
          }

          mps.push({
            id: `LS-${srNoStr}`,
            srNo: parseInt(srNoStr, 10),
            state: (row['State'] || '').trim(),
            name: (row["Hon'ble Members of Parliaments"] || '').trim(),
            term: null,
            house: 'Lok Sabha',
            constituency: (row['Constituency'] || '').trim(),
            electedOrNominated: null,
            allocatedAmount: amount
          });
        }
        resolve(mps);
      },
      error: (error: any) => {
        reject(error);
      }
    });
  });
}
