const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, deleteDoc } = require('firebase/firestore');

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
  console.log('=== PERMANENTLY DELETING PRO-094 AND PRO-095 ===');

  const pSnap = await getDocs(collection(db, 'persons'));
  const aSnap = await getDocs(collection(db, 'assignments'));
  const sSnap = await getDocs(collection(db, 'scorecards'));
  const cSnap = await getDocs(collection(db, 'commitments'));

  const targetPersons = pSnap.docs.filter(
    d => d.data().proId === 'PRO-094' || d.data().proId === 'PRO-095'
  );

  console.log(`Found ${targetPersons.length} person records to delete:`);
  targetPersons.forEach(d => {
    console.log(`- ${d.data().proId}: ${d.data().name} (${d.id})`);
  });

  const targetPersonIds = targetPersons.map(d => d.id);

  // 1. Delete assignments
  for (const aDoc of aSnap.docs) {
    if (targetPersonIds.includes(aDoc.data().personId)) {
      await deleteDoc(doc(db, 'assignments', aDoc.id));
      console.log(`Deleted assignment: ${aDoc.id} (${aDoc.data().workstreamName})`);
    }
  }

  // 2. Delete scorecards
  for (const sDoc of sSnap.docs) {
    if (targetPersonIds.includes(sDoc.data().personId)) {
      await deleteDoc(doc(db, 'scorecards', sDoc.id));
      console.log(`Deleted scorecard: ${sDoc.id}`);
    }
  }

  // 3. Delete commitments
  for (const cDoc of cSnap.docs) {
    if (targetPersonIds.includes(cDoc.data().personId)) {
      await deleteDoc(doc(db, 'commitments', cDoc.id));
      console.log(`Deleted commitment: ${cDoc.id}`);
    }
  }

  // 4. Delete person docs
  for (const pDoc of targetPersons) {
    await deleteDoc(doc(db, 'persons', pDoc.id));
    console.log(`Deleted person doc: ${pDoc.id} (${pDoc.data().proId} - ${pDoc.data().name})`);
  }

  // Verification
  const updatedPSnap = await getDocs(collection(db, 'persons'));
  console.log(`\n=== DELETION COMPLETE: Total active personnel in DB: ${updatedPSnap.size} ===`);

  const assignedSet = new Set(updatedPSnap.docs.map(d => d.data().proId));
  const unassigned = [];
  for (let i = 1; i <= 175; i++) {
    const pid = 'PRO-' + String(i).padStart(3, '0');
    if (!assignedSet.has(pid)) {
      unassigned.push(pid);
    }
  }

  console.log(`Total unassigned PRO-IDs in 1..175 range: ${unassigned.length}`);
  console.log('Unassigned list:', unassigned);

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
