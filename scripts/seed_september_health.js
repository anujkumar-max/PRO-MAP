const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where 
} = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCiW5d_KIJ5KdrSDlnS5cs3nI_t1xiPvnw",
  authDomain: "techops-command-5b24f.firebaseapp.com",
  projectId: "techops-command-5b24f",
  storageBucket: "techops-command-5b24f.firebasestorage.app",
  messagingSenderId: "818634138606",
  appId: "1:818634138606:web:014ebac6c9b9424ed3e4ff",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedSeptemberHealth() {
  console.log("Seeding complete 10-Point Project Health Cards for September 2026...");

  const projectsSnap = await getDocs(collection(db, 'projects'));
  const assignmentsSnap = await getDocs(collection(db, 'assignments'));
  const personsSnap = await getDocs(collection(db, 'persons'));
  const existingHealthSnap = await getDocs(collection(db, 'projectHealth'));

  const projects = projectsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const assignments = assignmentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const persons = personsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const healthCards = existingHealthSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  console.log(`Found ${projects.length} projects, ${healthCards.length} existing health cards.`);

  const augustCardsByProj = new Map();
  healthCards.filter(h => h.month === '2026-08').forEach(h => {
    augustCardsByProj.set(h.projectId, h);
  });

  const isOfficer = (r, flag) => {
    if (flag) return true;
    const u = (r || '').toUpperCase().trim();
    return ['SP', 'ADDL. SP', 'ADDL.SP', 'DSP', 'CI', 'SI', 'ASI', 'AAO', 'IGP'].includes(u);
  };

  const now = new Date().toISOString();
  let createdCount = 0;
  let updatedCount = 0;

  for (const proj of projects) {
    const projAssignments = assignments.filter(a => a.projectId === proj.id);
    const staffAssignments = projAssignments.filter(a => {
      const p = persons.find(x => x.id === a.personId);
      return !isOfficer(p?.rank, p?.isOfficer || a.isOfficerAssignment);
    });

    const staffFTE = staffAssignments.reduce((sum, a) => sum + (a.allocationPercent || 0) / 100, 0);
    const augCard = augustCardsByProj.get(proj.id);

    // Existing September card
    const existingSepCard = healthCards.find(h => h.projectId === proj.id && h.month === '2026-09');

    // 10 Indicators calculation
    const plannedDeliverables = augCard?.plannedDeliverables || 5;
    const completedDeliverables = augCard ? Math.min(plannedDeliverables, Math.max(0, augCard.completedDeliverables)) : 5;
    const openIssues = augCard ? (augCard.openIssues !== undefined ? augCard.openIssues : 1) : 0;
    const resolvedIssues = augCard?.resolvedIssues || 12;
    const internalDependencies = augCard?.internalDependencies !== undefined ? augCard.internalDependencies : 1;
    const vendorDependencies = augCard?.vendorDependencies !== undefined ? augCard.vendorDependencies : 1;
    const externalDependencies = augCard?.externalDependencies !== undefined ? augCard.externalDependencies : 0;
    const duplicateRoles = augCard?.duplicateRoles !== undefined ? augCard.duplicateRoles : 0;
    const underutilisedPersonnel = augCard?.underutilisedPersonnel !== undefined ? augCard.underutilisedPersonnel : 0;
    const keyPersonDependency = augCard?.keyPersonDependency || 'Low';
    const milestoneStatus = augCard?.milestoneStatus || 'on_time';
    const health = augCard?.health || (openIssues >= 4 ? 'amber' : 'green');
    const remarks = augCard?.remarks || `Operational status for ${proj.name} (September 2026)`;

    const cardData = {
      projectId: proj.id,
      projectName: proj.name,
      month: '2026-09',
      sanctionedManpower: Math.max(projAssignments.length, augCard?.sanctionedManpower || projAssignments.length + 1),
      deployedManpower: projAssignments.length,
      effectiveFTE: Math.round(staffFTE * 10) / 10,
      plannedDeliverables,
      completedDeliverables,
      milestoneStatus,
      openIssues,
      resolvedIssues,
      internalDependencies,
      vendorDependencies,
      externalDependencies,
      duplicateRoles,
      underutilisedPersonnel,
      keyPersonDependency,
      health,
      remarks,
      updatedAt: now,
    };

    if (existingSepCard) {
      await updateDoc(doc(db, 'projectHealth', existingSepCard.id), cardData);
      updatedCount++;
    } else {
      await addDoc(collection(db, 'projectHealth'), {
        ...cardData,
        createdAt: now,
      });
      createdCount++;
    }
  }

  console.log(`✅ Seeded September 2026 Health Cards for all ${projects.length} projects! (Created: ${createdCount}, Updated: ${updatedCount})`);
  process.exit(0);
}

seedSeptemberHealth().catch(err => {
  console.error(err);
  process.exit(1);
});
