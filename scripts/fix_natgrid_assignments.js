const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

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
  console.log('=== FIXING NATGRID ASSIGNMENTS PROJECT ID MAPPING ===');

  const pSnap = await getDocs(collection(db, 'projects'));
  const natgridProj = pSnap.docs.find(d => d.data().name === 'NATGRID-Gandiva & Sudarshan');

  if (!natgridProj) {
    console.error('NATGRID-Gandiva & Sudarshan project not found!');
    process.exit(1);
  }

  const natgridId = natgridProj.id;
  console.log(`Found NATGRID-Gandiva & Sudarshan Project ID: ${natgridId}`);

  const aSnap = await getDocs(collection(db, 'assignments'));
  let updatedCount = 0;

  for (const aDoc of aSnap.docs) {
    const a = aDoc.data();
    if (
      a.projectId === '9Usbyc3zvTVCk3GSPxUN' ||
      (a.workstreamName && (a.workstreamName.includes('Gandiva') || a.workstreamName.includes('Sudarshan')))
    ) {
      await updateDoc(doc(db, 'assignments', aDoc.id), {
        projectId: natgridId
      });
      console.log(`Updated assignment ${aDoc.id} -> projectId: ${natgridId}`);
      updatedCount++;
    }
  }

  console.log(`\nSuccessfully updated ${updatedCount} assignments.`);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
