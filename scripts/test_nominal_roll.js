const fs = require('fs');
const xlsx = require('xlsx');

const filePath = 'c:/Users/prasa/Desktop/PRO-MAP/Final Nominal Roll.xlsx';
const buf = fs.readFileSync(filePath);
const workbook = xlsx.read(buf, { type: 'buffer' });
const sheet = workbook.Sheets['Nominal Roll'];
const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

const rows = rawData.slice(2);
let currentProjectId = '';
let currentProjectName = '';
let currentDsp = '';
let currentCi = '';
let currentSi = '';
let currentAsi = '';

const projectMap = new Map();
const personMap = new Map();
const assignments = [];

rows.forEach((r, idx) => {
  if (!r || r.length === 0 || !r.some(c => c !== undefined && c !== null && String(c).trim() !== '')) return;

  const rawPId = r[0] ? String(r[0]).trim() : '';
  const rawPName = r[1] ? String(r[1]).trim() : '';
  const rawDsp = r[2] ? String(r[2]).trim() : '';
  const rawCi = r[3] ? String(r[3]).trim() : '';
  const rawSi = r[4] ? String(r[4]).trim() : '';
  const rawAsi = r[5] ? String(r[5]).trim() : '';

  if (rawPName) {
    currentProjectId = rawPId;
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
  const remarks = r[17] ? String(r[17]).trim() : '';

  if (!name) return;

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

  if (!personMap.has(name)) {
    personMap.set(name, {
      proId: proId || ('PRO-' + String(personMap.size + 1).padStart(3, '0')),
      name,
      rank,
      genNo,
      deputationType: deputation,
      workingSince,
      status: 'Active'
    });
  }

  assignments.push({
    personName: name,
    projectName: currentProjectName,
    workstreamName: wsName,
    workstreamDescription: wsDesc,
    allocationPercent: Math.round(alloc),
    functionalRole: role,
    raciType: raci,
    proId: personMap.get(name).proId
  });
});

console.log('Processed Projects:', projectMap.size);
console.log('Processed Unique Personnel:', personMap.size);
console.log('Processed Assignments:', assignments.length);

for (const [pName, pObj] of projectMap.entries()) {
  const pAssigns = assignments.filter(a => a.projectName === pName);
  console.log(`- ${pName} (${pAssigns.length} officers) | Command: DSP: ${pObj.hierarchy.dsp || 'N/A'}, CI: ${pObj.hierarchy.ci || 'N/A'}, SI: ${pObj.hierarchy.si || 'N/A'}`);
}
