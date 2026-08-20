const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

async function run() {
  const personsSnap = await getDocs(collection(db, 'persons'));
  const projectsSnap = await getDocs(collection(db, 'projects'));
  const assignSnap = await getDocs(collection(db, 'assignments'));
  const commitSnap = await getDocs(collection(db, 'commitments'));

  const persons = [];
  personsSnap.forEach(d => persons.push({ id: d.id, ...d.data() }));
  const projects = [];
  projectsSnap.forEach(d => projects.push({ id: d.id, ...d.data() }));
  const assignments = [];
  assignSnap.forEach(d => assignments.push({ id: d.id, ...d.data() }));
  const commitments = [];
  commitSnap.forEach(d => commitments.push({ id: d.id, ...d.data() }));

  const personAllocMap = new Map();
  for (const a of assignments) {
    if (!personAllocMap.has(a.personId)) {
      personAllocMap.set(a.personId, []);
    }
    const proj = projects.find(p => p.id === a.projectId);
    personAllocMap.get(a.personId).push({
      projectName: proj ? proj.name : 'Unknown',
      workstream: a.workstreamName,
      alloc: a.allocationPercent,
      role: a.functionalRole,
      raci: a.raciType
    });
  }

  const overallocated = [];
  const underallocated = [];
  const unassigned = [];

  for (const p of persons) {
    const pAssigns = personAllocMap.get(p.id) || [];
    const totalAlloc = pAssigns.reduce((sum, item) => sum + item.alloc, 0);
    
    const record = {
      proId: p.proId,
      name: p.name,
      rank: p.rank,
      genNo: p.genNo,
      totalAlloc,
      projectCount: pAssigns.length,
      assignments: pAssigns
    };

    if (totalAlloc > 100) {
      overallocated.push(record);
    } else if (totalAlloc === 0) {
      unassigned.push(record);
    } else if (totalAlloc < 100) {
      underallocated.push(record);
    }
  }

  console.log('=== OVERALLOCATED (>100%) === Count:', overallocated.length);
  overallocated.forEach(o => {
    const details = o.assignments.map(a => `${a.projectName} (${a.alloc}%)`).join(' + ');
    console.log(`${o.proId} | ${o.name} | Rank: ${o.rank} | Total: ${o.totalAlloc}% | Projects: ${details}`);
  });

  console.log('\n=== UNDERALLOCATED (<100%) === Count:', underallocated.length);
  underallocated.forEach(u => {
    const details = u.assignments.map(a => `${a.projectName} (${a.alloc}%)`).join(' + ');
    console.log(`${u.proId} | ${u.name} | Rank: ${u.rank} | Total: ${u.totalAlloc}% | Projects: ${details}`);
  });

  const delayedCommitments = commitments.filter(c => c.status === 'red' || (c.achievement / c.target) < 0.6);
  console.log('\n=== DELAYED DELIVERABLES === Count:', delayedCommitments.length);
  delayedCommitments.forEach(d => {
    console.log(`[${d.personProId}] ${d.personName} | Project: ${d.projectName} | Deliverable: ${d.commitment.replace(/\n/g, ' ')} | Target: ${d.target} | Actual: ${d.achievement} (${Math.round((d.achievement/d.target)*100)}%)`);
  });
}

run().catch(console.error);
