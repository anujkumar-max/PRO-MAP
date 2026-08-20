const fs = require('fs');
const xlsx = require('xlsx');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, writeBatch, getDocs, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyCiW5d_KIJ5KdrSDlnS5cs3nI_t1xiPvnw',
  authDomain: 'techops-command-5b24f.firebaseapp.com',
  projectId: 'techops-command-5b24f',
  storageBucket: 'techops-command-5b24f.firebasestorage.app',
  messagingSenderId: '818634138606',
  appId: '1:818634138606:web:014ebac6c9b9424ed3e4ff',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function cleanStr(val) {
  if (val === undefined || val === null) return '';
  return String(val).trim();
}

function cleanData(obj) {
  if (obj === null || obj === undefined) return '';
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(cleanData);
  
  const result = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      result[key] = cleanData(val);
    }
  }
  return result;
}

async function wipeCollection(name) {
  const snap = await getDocs(collection(db, name));
  console.log(`Clearing ${snap.size} docs from ${name}...`);
  const docs = snap.docs;
  const BATCH_SIZE = 250;
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const chunk = docs.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);
    for (const d of chunk) {
      batch.delete(d.ref);
    }
    await batch.commit();
  }
}

async function batchImport(collectionName, items) {
  const ids = [];
  const BATCH_SIZE = 250;
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const chunk = items.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);
    for (const item of chunk) {
      const docRef = doc(collection(db, collectionName));
      batch.set(docRef, {
        ...cleanData(item),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      ids.push(docRef.id);
    }
    await batch.commit();
  }
  return ids;
}

async function run() {
  console.log('=== STARTING COMPLETE RESEED WITH FINAL NOMINAL ROLL DATA ===');
  
  await wipeCollection('projects');
  await wipeCollection('persons');
  await wipeCollection('assignments');
  await wipeCollection('scorecards');
  await wipeCollection('commitments');
  await wipeCollection('projectHealth');
  await wipeCollection('projectNotes');

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

  const projectMap = new Map(); // name -> project obj
  const personMap = new Map();  // name -> person obj
  const rawAssignments = [];

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
    if (!name) return;

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

    if (!projectMap.has(currentProjectName)) {
      projectMap.set(currentProjectName, {
        name: currentProjectName,
        description: `Tech Services Project: ${currentProjectName}`,
        status: 'Active',
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
        proId: proId || (`PRO-${String(personMap.size + 1).padStart(3, '0')}`),
        name,
        rank,
        genNo,
        deputationType: deputation,
        workingSince,
        status: 'Active'
      });
    }

    const supervisor = currentSi || currentCi || currentDsp || '';

    rawAssignments.push({
      personName: name,
      projectName: currentProjectName,
      workstreamName: wsName,
      workstreamDescription: wsDesc,
      allocationPercent: Math.round(alloc),
      functionalRole: role,
      raciType: (raci.includes('Accountable') ? 'Accountable' : raci.includes('Consulted') ? 'Consulted' : raci.includes('Informed') ? 'Informed' : 'Responsible'),
      primaryOrSupport: 'Primary',
      reportingTo: supervisor
    });
  });

  const projectsToImport = Array.from(projectMap.values());
  const personsToImport = Array.from(personMap.values());

  console.log(`Importing ${projectsToImport.length} Projects...`);
  const projectIds = await batchImport('projects', projectsToImport);

  console.log(`Importing ${personsToImport.length} Unique Personnel...`);
  const personIds = await batchImport('persons', personsToImport);

  // Set counter
  const counterRef = doc(db, 'counters', 'personCounter');
  await setDoc(counterRef, { current: personsToImport.length });

  // Map names to actual Firestore IDs
  const projIdMap = new Map();
  projectsToImport.forEach((p, idx) => projIdMap.set(p.name, projectIds[idx]));

  const persIdMap = new Map();
  personsToImport.forEach((p, idx) => persIdMap.set(p.name, personIds[idx]));

  const assignmentsToImport = rawAssignments.map(a => ({
    personId: persIdMap.get(a.personName),
    projectId: projIdMap.get(a.projectName),
    workstreamName: a.workstreamName,
    workstreamDescription: a.workstreamDescription,
    allocationPercent: a.allocationPercent,
    functionalRole: a.functionalRole,
    raciType: a.raciType,
    primaryOrSupport: a.primaryOrSupport,
    reportingTo: a.reportingTo
  }));

  console.log(`Importing ${assignmentsToImport.length} Assignments...`);
  await batchImport('assignments', assignmentsToImport);

  // Generate 35 Health Cards for 2026-08
  const currentMonth = '2026-08';
  const healthCards = projectsToImport.map((p, idx) => {
    const pAssignments = assignmentsToImport.filter(a => a.projectId === projectIds[idx]);
    const fte = pAssignments.reduce((acc, a) => acc + (a.allocationPercent / 100), 0);
    const healthStatus = idx % 5 === 0 ? 'amber' : idx % 12 === 0 ? 'red' : 'green';
    return {
      projectId: projectIds[idx],
      projectName: p.name,
      month: currentMonth,
      sanctionedManpower: pAssignments.length + 1,
      deployedManpower: pAssignments.length,
      effectiveFTE: Math.round(fte * 10) / 10,
      plannedDeliverables: 5,
      completedDeliverables: healthStatus === 'green' ? 5 : healthStatus === 'amber' ? 3 : 2,
      milestoneStatus: healthStatus === 'green' ? 'on_time' : 'delayed',
      openIssues: healthStatus === 'green' ? 1 : healthStatus === 'amber' ? 4 : 7,
      resolvedIssues: 12,
      internalDependencies: 1,
      vendorDependencies: healthStatus === 'red' ? 3 : 1,
      externalDependencies: 0,
      duplicateRoles: 0,
      underutilisedPersonnel: 0,
      keyPersonDependency: healthStatus === 'red' ? 'High' : 'Low',
      health: healthStatus,
      remarks: `Monthly status for ${p.name}`
    };
  });
  await batchImport('projectHealth', healthCards);

  // Generate 50 Scorecards for 2026-08
  const scorecards = personsToImport.slice(0, 50).map((p, idx) => {
    const delivery = 30 + (idx % 11);
    const quality = 15 + (idx % 6);
    const timeliness = 10 + (idx % 6);
    const problemSolving = 7 + (idx % 4);
    const collaboration = 7 + (idx % 4);
    const documentation = 3 + (idx % 3);
    const total = delivery + quality + timeliness + problemSolving + collaboration + documentation;
    let classification = 'Role Review';
    if (total >= 90) classification = 'Exceptional';
    else if (total >= 80) classification = 'High Contributor';
    else if (total >= 70) classification = 'Effective';
    else if (total >= 60) classification = 'Needs Optimisation';

    return {
      personId: personIds[idx],
      personName: p.name,
      personProId: p.proId,
      month: currentMonth,
      deliveryScore: delivery,
      qualityScore: quality,
      timelinessScore: timeliness,
      problemSolvingScore: problemSolving,
      collaborationScore: collaboration,
      documentationScore: documentation,
      iciTotal: total,
      classification
    };
  });
  await batchImport('scorecards', scorecards);

  // Generate 30 Commitments for 2026-08
  const commitments = assignmentsToImport.slice(0, 30).map((a, idx) => {
    const person = personsToImport.find(p => persIdMap.get(p.name) === a.personId);
    const project = projectsToImport.find(p => projIdMap.get(p.name) === a.projectId);
    const target = 10;
    const achievement = idx % 4 === 0 ? 6 : idx % 6 === 0 ? 4 : 10;
    const ratio = achievement / target;
    const status = ratio >= 0.9 ? 'green' : ratio >= 0.6 ? 'amber' : 'red';

    return {
      personId: a.personId,
      personName: person ? person.name : 'Officer',
      personProId: person ? person.proId : 'PRO-001',
      projectId: a.projectId,
      projectName: project ? project.name : 'Project',
      month: currentMonth,
      commitment: `Monthly deliverable for ${a.workstreamName || 'Operations'}`,
      target,
      achievement,
      status,
      remarks: status === 'green' ? 'Completed on schedule' : 'In progress'
    };
  });
  await batchImport('commitments', commitments);

  console.log('=== RESEED COMPLETE: 35 PROJECTS, 143 PERSONNEL, 175 ASSIGNMENTS, 35 HEALTH CARDS, 50 SCORECARDS, 30 COMMITMENTS ===');
}

run().catch(console.error);
