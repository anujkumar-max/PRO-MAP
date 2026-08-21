const fs = require('fs');
const xlsx = require('xlsx');

const filePath = 'c:/Users/prasa/Desktop/PRO-MAP/Final Nominal Roll.xlsx';
const buf = fs.readFileSync(filePath);
const workbook = xlsx.read(buf, { type: 'buffer' });
const sheet = workbook.Sheets['Nominal Roll'];
const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

const rows = rawData.slice(2);
let currentProjectName = '';
let currentDsp = '';
let currentCi = '';
let currentSi = '';
let currentAsi = '';

const projectMap = new Map();
// Key by PRO_ID if present, otherwise by normalized name
const personMap = new Map(); // key -> person
const assignments = [];

rows.forEach((r, idx) => {
  if (!r || r.length === 0 || !r.some(c => c !== undefined && c !== null && String(c).trim() !== '')) return;

  const rawPName = r[1] ? String(r[1]).trim() : '';
  const rawDsp = r[2] ? String(r[2]).trim() : '';
  const rawCi = r[3] ? String(r[3]).trim() : '';
  const rawSi = r[4] ? String(r[4]).trim() : '';
  const rawAsi = r[5] ? String(r[5]).trim() : '';

  if (rawPName) {
    currentProjectName = rawPName;
    currentDsp = rawDsp;
    currentCi = rawCi;
    currentSi = rawSi;
    currentAsi = rawAsi;
  } else {
    if (rawDsp) currentDsp = rawDsp;
    if (rawCi) currentCi = rawCi;
    if (rawSi) currentSi = rawSi;
    if (rawAsi) currentAsi = rawAsi;
  }

  const name = r[6] ? String(r[6]).trim() : '';
  if (!name || name.toLowerCase().includes('name')) return;

  const rank = r[7] ? String(r[7]).trim() : 'Staff';
  const genNo = r[8] ? String(r[8]).trim() : '';
  const deputation = r[9] ? String(r[9]).trim() : 'Deputation';
  const workingSince = r[10] ? String(r[10]).trim() : '';
  const wsName = r[11] ? String(r[11]).trim() : currentProjectName;
  const wsDesc = r[12] ? String(r[12]).trim() : '';
  let alloc = 100;
  if (r[13] !== undefined && r[13] !== null) {
    const p = parseFloat(String(r[13]));
    if (!isNaN(p)) alloc = p <= 1 ? p * 100 : p;
  }
  const role = r[14] ? String(r[14]).trim() : 'User Support';
  const raci = r[15] ? String(r[15]).trim() : 'Responsible';
  const proId = r[16] ? String(r[16]).trim() : '';

  // Use normalized name or PRO_ID as key
  const normName = name.replace(/[\s\.\-_]+/g, '').toUpperCase();
  // Primary key: PRO_ID if present, otherwise normName
  const personKey = proId ? proId : normName;

  if (!projectMap.has(currentProjectName)) {
    projectMap.set(currentProjectName, {
      name: currentProjectName,
      hierarchy: {
        igp: 'IGP (Tech Services)',
        dsp: currentDsp,
        ci: currentCi,
        si: currentSi,
        asi: currentAsi
      }
    });
  }

  if (!personMap.has(personKey)) {
    // Also check if existing person has the same normName
    let foundExisting = false;
    for (const [k, p] of personMap.entries()) {
      const existingNorm = p.name.replace(/[\s\.\-_]+/g, '').toUpperCase();
      if (existingNorm === normName || (proId && p.proId === proId)) {
        foundExisting = true;
        // Merge / keep best name
        if (name.includes(' ') && !p.name.includes(' ')) {
          p.name = name;
        }
        break;
      }
    }

    if (!foundExisting) {
      personMap.set(personKey, {
        key: personKey,
        proId: proId || (`PRO-${String(personMap.size + 1).padStart(3, '0')}`),
        name,
        rank,
        genNo,
        deputationType: deputation,
        workingSince,
        status: 'Active'
      });
    }
  }

  // Find the exact person object
  let targetPerson = personMap.get(personKey);
  if (!targetPerson) {
    for (const p of personMap.values()) {
      const existingNorm = p.name.replace(/[\s\.\-_]+/g, '').toUpperCase();
      if (existingNorm === normName || (proId && p.proId === proId)) {
        targetPerson = p;
        break;
      }
    }
  }

  assignments.push({
    personKey: targetPerson.key,
    personName: targetPerson.name,
    proId: targetPerson.proId,
    projectName: currentProjectName,
    workstreamName: wsName,
    workstreamDescription: wsDesc,
    allocationPercent: Math.round(alloc),
    functionalRole: role,
    raciType: raci
  });
});

console.log('Unique Projects:', projectMap.size);
console.log('Unique Personnel (Deduplicated):', personMap.size);
console.log('Total Assignments:', assignments.length);

console.log('\n--- J. Mounika Details ---');
const mounikaPerson = Array.from(personMap.values()).find(p => p.name.replace(/[\s\.]+/g, '').toUpperCase() === 'JMOUNIKA');
console.log('Person:', mounikaPerson);
const mounikaAssigns = assignments.filter(a => a.personKey === mounikaPerson?.key);
console.log('Assignments for J. Mounika:', mounikaAssigns);
const totalMounikaAlloc = mounikaAssigns.reduce((s, a) => s + a.allocationPercent, 0);
console.log('Total Allocation for J. Mounika:', totalMounikaAlloc + '%');

console.log('\n--- Multi-Project Personnel Allocations ---');
const personAllocMap = new Map();
for (const a of assignments) {
  if (!personAllocMap.has(a.proId)) personAllocMap.set(a.proId, { name: a.personName, assigns: [], total: 0 });
  personAllocMap.get(a.proId).assigns.push(a);
  personAllocMap.get(a.proId).total += a.allocationPercent;
}

for (const [pid, data] of personAllocMap.entries()) {
  if (data.assigns.length > 1) {
    const list = data.assigns.map(a => `${a.projectName} (${a.allocationPercent}%)`).join(' + ');
    console.log(`${pid} | ${data.name} | Total: ${data.total}% across ${data.assigns.length} projects: ${list}`);
  }
}
