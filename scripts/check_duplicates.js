const fs = require('fs');
const xlsx = require('xlsx');

const filePath = 'c:/Users/prasa/Desktop/PRO-MAP/Final Nominal Roll.xlsx';
const buf = fs.readFileSync(filePath);
const workbook = xlsx.read(buf, { type: 'buffer' });
const sheet = workbook.Sheets['Nominal Roll'];
const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

const rows = rawData.slice(2);
const proIdMap = new Map();
const genNoMap = new Map();
const normNameMap = new Map();

let currentProject = '';

rows.forEach((r, idx) => {
  if (!r || r.length === 0 || !r.some(c => c !== undefined && c !== null && String(c).trim() !== '')) return;
  const pName = r[1] ? String(r[1]).trim() : '';
  if (pName) currentProject = pName;

  const name = r[6] ? String(r[6]).trim() : '';
  const rank = r[7] ? String(r[7]).trim() : '';
  const genNo = r[8] ? String(r[8]).trim() : '';
  const alloc = r[13];
  const proId = r[16] ? String(r[16]).trim() : '';

  if (!name) return;

  const item = { row: idx + 3, project: currentProject, name, rank, genNo, proId, alloc };

  if (proId) {
    if (!proIdMap.has(proId)) proIdMap.set(proId, []);
    proIdMap.get(proId).push(item);
  }

  if (genNo && genNo !== '-' && genNo !== 'N/A' && genNo !== '0') {
    if (!genNoMap.has(genNo)) genNoMap.set(genNo, []);
    genNoMap.get(genNo).push(item);
  }

  // Normalized name: remove spaces, dots, dashes, uppercase
  const normName = name.replace(/[\s\.\-_]+/g, '').toUpperCase();
  if (!normNameMap.has(normName)) normNameMap.set(normName, []);
  normNameMap.get(normName).push(item);
});

console.log('=== MULTI-ROW PRO_IDs in Final Nominal Roll ===');
for (const [pid, list] of proIdMap.entries()) {
  if (list.length > 1) {
    const details = list.map(l => `Row ${l.row}: "${l.name}" (${l.rank}, Gen: ${l.genNo}) on [${l.project}] (Alloc: ${l.alloc})`).join('  |  ');
    console.log(`PRO_ID ${pid} (${list.length} rows):\n  ${details}\n`);
  }
}

console.log('=== MULTI-ROW GEN NOs in Final Nominal Roll ===');
for (const [gen, list] of genNoMap.entries()) {
  if (list.length > 1) {
    const details = list.map(l => `Row ${l.row}: ${l.proId || 'NO-PID'} "${l.name}" on [${l.project}]`).join('  |  ');
    console.log(`GenNo ${gen} (${list.length} rows):\n  ${details}\n`);
  }
}

console.log('=== MULTI-ROW NORMALIZED NAMES ===');
for (const [norm, list] of normNameMap.entries()) {
  if (list.length > 1) {
    const details = list.map(l => `Row ${l.row}: ${l.proId || 'NO-PID'} "${l.name}" (${l.rank}, Gen: ${l.genNo}) on [${l.project}] (Alloc: ${l.alloc})`).join('  |  ');
    console.log(`Normalized Name "${norm}" (${list.length} rows):\n  ${details}\n`);
  }
}
