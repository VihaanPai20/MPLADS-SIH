import Papa from 'papaparse';
import type { MemberOfParliament } from '../types';

export async function fetchRajyaSabhaData(): Promise<MemberOfParliament[]> {
  const response = await fetch('/rajya_sabha.csv?v=' + new Date().getTime());
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

          let name = (row["Hon'ble Members of Parliament"] || '').trim();
          let term: string | null = null;

          const match = name.match(/\((.*?)\)$/);
          if (match) {
            term = match[1];
            name = name.substring(0, match.index).trim();
          }

          mps.push({
            id: `RS-${srNoStr}`,
            srNo: parseInt(srNoStr, 10),
            state: (row['State'] || '').trim(),
            name: name,
            term: term,
            house: 'Rajya Sabha',
            constituency: null,
            electedOrNominated: (row['Elected/Nominated'] || '').trim(),
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
