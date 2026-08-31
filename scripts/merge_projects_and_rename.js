const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  writeBatch 
} = require('firebase/firestore');

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
  console.log('=== STARTING PROJECTS MERGE & RENAME (3 POINTS) ===');

  // 1. Fetch current projects, assignments, commitments
  const pSnap = await getDocs(collection(db, 'projects'));
  const aSnap = await getDocs(collection(db, 'assignments'));
  const cSnap = await getDocs(collection(db, 'commitments'));
  const hSnap = await getDocs(collection(db, 'projectHealth'));
  const nSnap = await getDocs(collection(db, 'projectNotes'));

  const projects = pSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log(`Found ${projects.length} existing projects.`);

  // -------------------------------------------------------------
  // POINT 1: Merge NATGRID-GANDIVA & NATGRID-Sudarshan -> NATGRID-Gandiva & Sudarshan
  // -------------------------------------------------------------
  console.log('\n--- 1. MERGING NATGRID-GANDIVA & NATGRID-Sudarshan ---');
  const gandivaProj = projects.find(p => p.name === 'NATGRID-GANDIVA');
  const sudarshanProj = projects.find(p => p.name === 'NATGRID-Sudarshan');
  let natgridUnifiedProj = projects.find(p => p.name === 'NATGRID-Gandiva & Sudarshan');

  let natgridUnifiedId = natgridUnifiedProj ? natgridUnifiedProj.id : null;

  if (!natgridUnifiedId) {
    // Create or update the unified NATGRID project
    const newNatgridRef = doc(collection(db, 'projects'));
    natgridUnifiedId = newNatgridRef.id;
    await addDoc(collection(db, 'projects'), {
      name: 'NATGRID-Gandiva & Sudarshan',
      description: 'National Intelligence Grid - Gandiva & Sudarshan Core Threat Intelligence & Security Analytics Platforms.',
      status: 'Active',
      hierarchy: {
        dsp: gandivaProj?.hierarchy?.dsp || sudarshanProj?.hierarchy?.dsp || 'M. Venkateswarlu',
        ci: gandivaProj?.hierarchy?.ci || sudarshanProj?.hierarchy?.ci || 'K. Suresh',
        si: gandivaProj?.hierarchy?.si || sudarshanProj?.hierarchy?.si || 'G. Jyothi',
        asi: gandivaProj?.hierarchy?.asi || sudarshanProj?.hierarchy?.asi || ''
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    console.log('Created unified project: NATGRID-Gandiva & Sudarshan');
  }

  // Remap assignments from gandiva and sudarshan to unified NATGRID project
  const oldNatgridIds = [gandivaProj?.id, sudarshanProj?.id].filter(Boolean);
  for (const aDoc of aSnap.docs) {
    const data = aDoc.data();
    if (oldNatgridIds.includes(data.projectId)) {
      await updateDoc(doc(db, 'assignments', aDoc.id), {
        projectId: natgridUnifiedId
      });
      console.log(`Remapped assignment ${aDoc.id} to NATGRID-Gandiva & Sudarshan`);
    }
  }

  // Remap commitments
  for (const cDoc of cSnap.docs) {
    const data = cDoc.data();
    if (oldNatgridIds.includes(data.projectId)) {
      await updateDoc(doc(db, 'commitments', cDoc.id), {
        projectId: natgridUnifiedId,
        projectName: 'NATGRID-Gandiva & Sudarshan'
      });
      console.log(`Remapped commitment ${cDoc.id} to NATGRID-Gandiva & Sudarshan`);
    }
  }

  // Delete old separate NATGRID project documents
  if (gandivaProj && gandivaProj.id !== natgridUnifiedId) {
    await deleteDoc(doc(db, 'projects', gandivaProj.id));
    console.log(`Deleted old project: NATGRID-GANDIVA (${gandivaProj.id})`);
  }
  if (sudarshanProj && sudarshanProj.id !== natgridUnifiedId) {
    await deleteDoc(doc(db, 'projects', sudarshanProj.id));
    console.log(`Deleted old project: NATGRID-Sudarshan (${sudarshanProj.id})`);
  }

  // -------------------------------------------------------------
  // POINT 2: Consolidate all AI4AP projects into 'AI4AP' (with 8 Use Cases)
  // -------------------------------------------------------------
  console.log('\n--- 2. CONSOLIDATING AI4AP PROJECTS INTO "AI4AP" ---');
  const ai4apSocint = projects.find(p => p.name === 'AI4AP – SOCINT');
  const ai4apNews = projects.find(p => p.name === 'AI4AP – NEWS360AI');
  let ai4apUnifiedProj = projects.find(p => p.name === 'AI4AP');

  let ai4apUnifiedId = ai4apUnifiedProj ? ai4apUnifiedProj.id : null;

  const ai4apDescription = 'Artificial Intelligence for AP Police (AI4AP) Umbrella Initiative comprising 8 Core Operational Use Cases:\n' +
    '• AI4AP (UC-1) - Petition AI\n' +
    '• AI4AP (UC-2) - AI & Engineering Foundation\n' +
    '• AI4AP (UC-3) - Digital Evidence AI\n' +
    '• AI4AP (UC-4) - CognitiveNet AI\n' +
    '• AI4AP (UC-5) - Investigation Copilot\n' +
    '• AI4AP (UC-6) - Docs2Data\n' +
    '• AI4AP (UC-7) - SocInt AI\n' +
    '• AI4AP (UC-8) - News360 AI';

  if (!ai4apUnifiedId) {
    const newDoc = await addDoc(collection(db, 'projects'), {
      name: 'AI4AP',
      description: ai4apDescription,
      status: 'Active',
      hierarchy: {
        dsp: ai4apSocint?.hierarchy?.dsp || ai4apNews?.hierarchy?.dsp || 'V. Vishnu Swaroop',
        ci: ai4apSocint?.hierarchy?.ci || ai4apNews?.hierarchy?.ci || 'M. Mohan',
        si: ai4apSocint?.hierarchy?.si || ai4apNews?.hierarchy?.si || 'G. Jyothi',
        asi: ai4apSocint?.hierarchy?.asi || ai4apNews?.hierarchy?.asi || ''
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    ai4apUnifiedId = newDoc.id;
    console.log(`Created unified project: AI4AP (${ai4apUnifiedId})`);
  } else {
    await updateDoc(doc(db, 'projects', ai4apUnifiedId), {
      description: ai4apDescription
    });
  }

  // Remap assignments from old AI4AP projects to unified AI4AP
  const oldAi4apIds = [ai4apSocint?.id, ai4apNews?.id].filter(Boolean);
  for (const aDoc of aSnap.docs) {
    const data = aDoc.data();
    if (oldAi4apIds.includes(data.projectId)) {
      // If workstream was just AI4AP - SOCINT, map to UC-7 / UC-8
      let updatedWs = data.workstreamName;
      if (updatedWs === 'AI4AP – SOCINT') updatedWs = 'AI4AP (UC-7)-SocInt AI';
      if (updatedWs === 'AI4AP – NEWS360AI') updatedWs = 'AI4AP (UC-8)-News360 AI';

      await updateDoc(doc(db, 'assignments', aDoc.id), {
        projectId: ai4apUnifiedId,
        workstreamName: updatedWs
      });
      console.log(`Remapped assignment ${aDoc.id} to AI4AP (${updatedWs})`);
    }
  }

  // Remap commitments
  for (const cDoc of cSnap.docs) {
    const data = cDoc.data();
    if (oldAi4apIds.includes(data.projectId)) {
      await updateDoc(doc(db, 'commitments', cDoc.id), {
        projectId: ai4apUnifiedId,
        projectName: 'AI4AP'
      });
      console.log(`Remapped commitment ${cDoc.id} to AI4AP`);
    }
  }

  // Delete old separate AI4AP project documents
  if (ai4apSocint && ai4apSocint.id !== ai4apUnifiedId) {
    await deleteDoc(doc(db, 'projects', ai4apSocint.id));
    console.log(`Deleted old project: AI4AP – SOCINT (${ai4apSocint.id})`);
  }
  if (ai4apNews && ai4apNews.id !== ai4apUnifiedId) {
    await deleteDoc(doc(db, 'projects', ai4apNews.id));
    console.log(`Deleted old project: AI4AP – NEWS360AI (${ai4apNews.id})`);
  }

  // -------------------------------------------------------------
  // POINT 3: Rename "Cloud Based CCTV Camera(CCTV-360)" -> "CCTV Camera Cloud Based (CCTV-360)"
  // -------------------------------------------------------------
  console.log('\n--- 3. RENAMING CCTV-360 PROJECT ---');
  const cctv360Proj = projects.find(p => 
    p.name === 'Cloud Based CCTV Camera(CCTV-360)' || 
    p.name === 'Cloud Based CCTV Camera (CCTV-360)' ||
    p.name.includes('CCTV-360')
  );

  if (cctv360Proj) {
    await updateDoc(doc(db, 'projects', cctv360Proj.id), {
      name: 'CCTV Camera Cloud Based (CCTV-360)',
      updatedAt: new Date().toISOString()
    });
    console.log(`Renamed project ${cctv360Proj.id} to "CCTV Camera Cloud Based (CCTV-360)"`);

    // Update any commitments referencing old name
    for (const cDoc of cSnap.docs) {
      const data = cDoc.data();
      if (data.projectId === cctv360Proj.id || data.projectName?.includes('CCTV-360')) {
        await updateDoc(doc(db, 'commitments', cDoc.id), {
          projectName: 'CCTV Camera Cloud Based (CCTV-360)'
        });
      }
    }
  }

  // -------------------------------------------------------------
  // FINAL VERIFICATION
  // -------------------------------------------------------------
  const updatedPSnap = await getDocs(collection(db, 'projects'));
  console.log(`\n=== MIGRATION COMPLETE: Total active projects in Firestore: ${updatedPSnap.size} ===`);
  updatedPSnap.docs.forEach((d, idx) => {
    console.log(`${idx + 1}. ${d.data().name} (${d.id})`);
  });

  process.exit(0);
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
