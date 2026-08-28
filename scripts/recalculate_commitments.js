const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, writeBatch } = require('firebase/firestore');

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

function calculateCommitmentStatus(target, achievement) {
  if (target <= 0) return 'green';
  const ratio = achievement / target;
  if (ratio >= 0.9) return 'green';
  if (ratio >= 0.6) return 'amber';
  return 'red';
}

async function run() {
  console.log('--- RECALCULATING ALL COMMITMENT STATUSES IN FIRESTORE ---');
  const snap = await getDocs(collection(db, 'commitments'));
  console.log(`Found ${snap.size} commitments`);

  const batch = writeBatch(db);
  let updatedCount = 0;

  snap.forEach(docSnap => {
    const data = docSnap.data();
    const target = data.target || 0;
    const achievement = data.achievement || 0;
    const correctStatus = calculateCommitmentStatus(target, achievement);

    if (data.status !== correctStatus) {
      console.log(`Updating ${data.personName || docSnap.id}: Target ${target}, Ach ${achievement}, Old Status: "${data.status}" -> New Status: "${correctStatus}"`);
      batch.update(doc(db, 'commitments', docSnap.id), {
        status: correctStatus,
        updatedAt: new Date().toISOString()
      });
      updatedCount++;
    }
  });

  if (updatedCount > 0) {
    await batch.commit();
    console.log(`Successfully updated ${updatedCount} commitment records in Firestore!`);
  } else {
    console.log('All commitments are already up-to-date.');
  }
}

run().catch(console.error);
