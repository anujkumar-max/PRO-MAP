const xlsx = require('xlsx');

const wb = xlsx.readFile('c:/Users/prasa/Desktop/PRO-MAP/Project wise officers.xlsx');
const s = wb.Sheets['Officers'];
const data = xlsx.utils.sheet_to_json(s, { header: 1 });

const ranks = ['SP', 'Addl.SP', 'DSP', 'CI', 'SI', 'ASI', 'AAO'];
const allCIs = ['M. Mohan', 'V. Sudharshana Reddy', 'K. Satish', 'K. Vijaya Kumar', 'K. Sreekanth', 'M. Manohar Rao'];
const allSIs = ['G. Jyothi', 'J. Kalpana', 'T. Anoj Kumar', 'G. Ravi Kiran', 'MD. Sadhik', 'K. Venkata Rao', 'D. Rama Koti Naik', 'P.V. Naidu (PMO)', 'Ch. Aditya Srinivas', 'B. Vijay Kumar Reddy', 'CJ. Bharath', 'S.S. Siva Rama Sastry', 'IR Koteswara Rao'];

const prjNames = {
  'PRJ-001': 'AI4AP',
  'PRJ-002': 'All-in-One Desktops',
  'PRJ-003': 'AP Police Website / Citizen Portal',
  'PRJ-004': 'APCOPS 2.0',
  'PRJ-005': 'APOLIS',
  'PRJ-006': 'BSNL Connectivity',
  'PRJ-007': 'CCTNS',
  'PRJ-008': 'CCTV Camera Cloud Based (CCTV-360)',
  'PRJ-009': 'CCTV in Police Stations',
  'PRJ-010': 'CEIR',
  'PRJ-011': 'Cri-Mac',
  'PRJ-012': 'Data Center',
  'PRJ-013': 'District Data Coordination & Collection',
  'PRJ-014': 'DLT & E-SMS PORTAL',
  'PRJ-015': 'DRONES',
  'PRJ-016': 'E-CHALLAN',
  'PRJ-017': 'e-dar',
  'PRJ-018': 'eOffice',
  'PRJ-019': 'ICJS',
  'PRJ-020': 'IGP TS_Peshi',
  'PRJ-021': 'LHMS&BWC',
  'PRJ-022': 'MEESEVA',
  'PRJ-023': 'NATGRID-Gandiva & Sudarshan',
  'PRJ-024': 'NERS & UECCR',
  'PRJ-025': 'PCS&S – External Attachments',
  'PRJ-026': 'PCS&S – Officer Attachments',
  'PRJ-027': 'PCS&S ADMIN',
  'PRJ-028': 'PCS&S MTO',
  'PRJ-029': 'PCS&S_Correspondence & Documentation',
  'PRJ-030': 'PCS&S_Stores',
  'PRJ-031': 'PM Gatishakti',
  'PRJ-032': 'SASE & XDR',
  'PRJ-033': 'Shakti',
  'PRJ-034': 'RTGS',
  'PRJ-035': 'Gem Procurement'
};

function cleanKey(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const officers = [
  { rank: 'SP', name: 'K. Sreelakshmi', proId: 'PRO-045', role: 'Supervisory' },
  { rank: 'Addl. SP', name: 'G. Veeraraghava Reddy', proId: 'PRO-074', role: 'Supervisory' },
  { rank: 'DSP', name: 'V. Vishnu Swaroop', proId: 'PRO-078', role: 'Supervisory' },
  { rank: 'DSP', name: 'M. Hema Latha', proId: 'PRO-079', role: 'Supervisory' },
  { rank: 'DSP', name: 'P. Bhavana', proId: 'PRO-081', role: 'Supervisory' },
  { rank: 'DSP', name: 'P. Sindhu Priya', proId: 'PRO-082', role: 'Supervisory' },
  { rank: 'CI', name: 'M. Mohan', proId: 'PRO-091', role: 'Monitoring' },
  { rank: 'CI', name: 'V. Sudharshana Reddy', proId: 'PRO-092', role: 'Monitoring' },
  { rank: 'CI', name: 'K. Satish', proId: 'PRO-094', role: 'Monitoring' },
  { rank: 'CI', name: 'K. Vijaya Kumar', proId: 'PRO-095', role: 'Monitoring' },
  { rank: 'CI', name: 'K. Sreekanth', proId: 'PRO-106', role: 'Monitoring' },
  { rank: 'CI', name: 'M. Manohar Rao', proId: 'PRO-123', role: 'Monitoring' },
  { rank: 'SI', name: 'G. Jyothi', proId: 'PRO-124', role: 'Monitoring' },
  { rank: 'SI', name: 'J. Kalpana', proId: 'PRO-125', role: 'Monitoring' },
  { rank: 'SI', name: 'T. Anoj Kumar', proId: 'PRO-136', role: 'Monitoring' },
  { rank: 'SI', name: 'G. Ravi Kiran', proId: 'PRO-137', role: 'Monitoring' },
  { rank: 'SI', name: 'MD. Sadhik', proId: 'PRO-140', role: 'Monitoring' },
  { rank: 'SI', name: 'K. Venkata Rao', proId: 'PRO-142', role: 'Monitoring' },
  { rank: 'SI', name: 'D. Rama Koti Naik', proId: 'PRO-150', role: 'Monitoring' },
  { rank: 'SI', name: 'P.V. Naidu (PMO)', proId: 'PRO-151', role: 'Monitoring' },
  { rank: 'SI', name: 'Ch. Aditya Srinivas', proId: 'PRO-152', role: 'Monitoring' },
  { rank: 'SI', name: 'B. Vijay Kumar Reddy', proId: 'PRO-153', role: 'Monitoring' },
  { rank: 'SI', name: 'CJ. Bharath', proId: 'PRO-154', role: 'Monitoring' },
  { rank: 'SI', name: 'S.S. Siva Rama Sastry', proId: 'PRO-155', role: 'Monitoring' },
  { rank: 'SI', name: 'IR Koteswara Rao', proId: 'PRO-157', role: 'Monitoring' },
  { rank: 'ASI', name: 'B. Rani', proId: 'PRO-158', role: 'Monitoring' },
  { rank: 'AAO', name: 'N. Sarojini', proId: 'PRO-159', role: 'Operational' }
];

const projectMap = {};
officers.forEach(o => {
  projectMap[cleanKey(o.name)] = { officer: o, projects: [] };
});

let currentPrj = null;
for (let i = 1; i < data.length; i++) {
  const row = data[i];
  if (!row || row.length === 0) continue;
  const pId = row[0] ? String(row[0]).trim() : '';
  const pName = row[1] ? String(row[1]).trim() : '';
  if (pId || (pName && pName.startsWith('AI4AP'))) {
    currentPrj = pId ? pId.replace(/[^A-Za-z0-9-]/g, '') : 'PRJ-001';
  }
  if (!currentPrj) continue;

  for (let c = 2; c <= 8; c++) {
    const rawVal = row[c] ? String(row[c]).trim() : '';
    if (!rawVal || rawVal === ';') continue;
    const lines = rawVal.split(/[\r\n]+/).map(l => l.trim()).filter(Boolean);

    lines.forEach(val => {
      const upper = val.toUpperCase();
      if (upper === 'ALL CIS' || upper === 'ALL CI') {
        allCIs.forEach(name => {
          const k = cleanKey(name);
          if (projectMap[k] && !projectMap[k].projects.includes(currentPrj)) {
            projectMap[k].projects.push(currentPrj);
          }
        });
      } else if (upper === 'ALL SIS' || upper === 'ALL SI') {
        allSIs.forEach(name => {
          const k = cleanKey(name);
          if (projectMap[k] && !projectMap[k].projects.includes(currentPrj)) {
            projectMap[k].projects.push(currentPrj);
          }
        });
      } else {
        const matched = officers.find(o => {
          const oKey = cleanKey(o.name);
          const vKey = cleanKey(val);
          return vKey.includes(oKey) || val.includes(o.proId);
        });

        if (matched) {
          const k = cleanKey(matched.name);
          if (projectMap[k] && !projectMap[k].projects.includes(currentPrj)) {
            projectMap[k].projects.push(currentPrj);
          }
        } else {
          console.log('UNMATCHED:', val, 'in project:', currentPrj);
        }
      }
    });
  }
}

console.log('=== UPDATED ALLOTMENTS FOR ALL 27 OFFICERS ===\n');
const ranksOrder = ['SP', 'Addl. SP', 'DSP', 'CI', 'SI', 'ASI', 'AAO'];
ranksOrder.forEach(r => {
  console.log(`\n--- RANK: ${r} ---`);
  const rList = officers.filter(o => o.rank === r).sort((a,b) => a.name.localeCompare(b.name));
  rList.forEach((o, idx) => {
    const k = cleanKey(o.name);
    const prjs = projectMap[k].projects.sort();
    const count = prjs.length;
    const ftePct = count > 0 ? (100 / count).toFixed(1) : '0';
    console.log(`${idx + 1}. [${o.proId}] ${o.name} (${o.role}) — ${count} Projects (@ ${ftePct}% each)`);
    prjs.forEach(p => console.log(`   • ${p} (${prjNames[p] || p})`));
  });
});
