const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, addDoc } = require('firebase/firestore');

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

const PROJECT_ID_MAPPINGS = [
  { code: 'PRJ-001', name: 'AI4AP', desc: '8 Core AI Use Cases (Petition, Foundation, Evidence, Copilot, Docs2Data, SocInt, News360)' },
  { code: 'PRJ-002', name: 'All-in-One Desktops', desc: 'Hardware Workstation Lifecycle & Infrastructure Management' },
  { code: 'PRJ-003', name: 'AP Police Website / Citizen Portal', desc: 'Citizen Facing Service Delivery & Official Departmental Web Portal' },
  { code: 'PRJ-004', name: 'APCOPS 2.0', desc: 'Core Police Operations Platform & Mobile Application Ecosystem' },
  { code: 'PRJ-005', name: 'APOLIS', desc: 'Police Logistics, Asset Tracking & Inventory Operations' },
  { code: 'PRJ-006', name: 'BSNL Connectivity', desc: 'State-wide WAN, Leased Line & High-speed Station Connectivity' },
  { code: 'PRJ-007', name: 'CCTNS', desc: 'Crime and Criminal Tracking Network & Systems' },
  { code: 'PRJ-008', name: 'CCTV Camera Cloud Based (CCTV-360)', desc: 'Cloud-connected Surveillance & Video Feeds Integration' },
  { code: 'PRJ-009', name: 'CCTV in Police Stations', desc: 'Police Station Surveillance Compliance & Footage Archival' },
  { code: 'PRJ-010', name: 'CEIR', desc: 'Central Equipment Identity Register (Lost & Stolen Mobile Tracking)' },
  { code: 'PRJ-011', name: 'Cri-Mac', desc: 'Crime Multi-Agency Center Inter-state Intelligence Network' },
  { code: 'PRJ-012', name: 'Data Center', desc: 'State Police Data Center (SPDC) Server Hosting & Operations' },
  { code: 'PRJ-013', name: 'District Data Coordination & Collection', desc: 'District-level Reporting Pipelines & Operational Data Returns' },
  { code: 'PRJ-014', name: 'DLT & E-SMS PORTAL', desc: 'Distributed Ledger Technology & Automated Police SMS Gateways' },
  { code: 'PRJ-015', name: 'DRONES', desc: 'Aerial Surveillance Operations, Drone Fleet Maintenance & Pilot Training' },
  { code: 'PRJ-016', name: 'E-CHALLAN', desc: 'Automated Traffic Enforcement, e-Challan Gateway & APCS' },
  { code: 'PRJ-017', name: 'e-dar', desc: 'Electronic Detailed Accident Report System (MoRTH Integration)' },
  { code: 'PRJ-018', name: 'eOffice', desc: 'Digital Secretariat, File Movement & Paperless Administration' },
  { code: 'PRJ-019', name: 'ICJS', desc: 'Inter-Operable Criminal Justice System (Court, Police, Jail, FSL)' },
  { code: 'PRJ-020', name: 'IGP TS_Peshi', desc: 'Executive Command Secretarial & Administrative Peshi Operations' },
  { code: 'PRJ-021', name: 'LHMS&BWC', desc: 'Locked House Monitoring System & Body Worn Cameras' },
  { code: 'PRJ-022', name: 'MEESEVA', desc: 'Meeseva Citizen Service Integrations (PCC, NOCs & Verifications)' },
  { code: 'PRJ-023', name: 'NATGRID-Gandiva & Sudarshan', desc: 'National Intelligence Grid (Gandiva & Sudarshan Core Analytics)' },
  { code: 'PRJ-024', name: 'NERS & UECCR', desc: 'National Emergency Response System (Dial 112 / Dial 100) & UECCR' },
  { code: 'PRJ-025', name: 'PCS&S – External Attachments', desc: 'Specialized External Technical Deployments & Attachments' },
  { code: 'PRJ-026', name: 'PCS&S – Officer Attachments', desc: 'Priority Officer Attachments & Command Support' },
  { code: 'PRJ-027', name: 'PCS&S ADMIN', desc: 'Technical Services Wing Administration & Establishment' },
  { code: 'PRJ-028', name: 'PCS&S MTO', desc: 'Motor Transport Operations & Fleet Logistics Management' },
  { code: 'PRJ-029', name: 'PCS&S_Correspondence & Documentation', desc: 'Official Correspondence, Documentation & Technical SOPs' },
  { code: 'PRJ-030', name: 'PCS&S_Stores', desc: 'Hardware Inventory, Equipment Stores & Asset Dispatch' },
  { code: 'PRJ-031', name: 'PM Gatishakti', desc: 'National Master Plan GIS Infrastructure Mapping & Assets' },
  { code: 'PRJ-032', name: 'SASE & XDR', desc: 'Secure Access Service Edge & Extended Detection & Response' },
  { code: 'PRJ-033', name: 'Shakti', desc: 'Women Safety, SOS Emergency Response & Intervention App' },
  { code: 'PRJ-034', name: 'RTGS', desc: 'Real Time Governance Society (RTGS) State Surveillance & Analytics Integration', dsp: 'K. Satish', ci: 'M. Mohan', si: 'G. Jyothi' },
  { code: 'PRJ-035', name: 'Gem Procurement', desc: 'Government e-Marketplace (GeM) Procurement, ASUMP Fund Equipment & Tenders', dsp: 'V. Vishnu Swaroop', ci: 'V. Sudharshana Reddy', si: 'G. Ravi kiran' }
];

async function run() {
  console.log('=== ASSIGNING PRJ-001 TO PRJ-035 TO ALL PROJECTS ===');

  const pSnap = await getDocs(collection(db, 'projects'));
  const existingProjects = pSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  console.log(`Found ${existingProjects.length} existing projects in Firestore.`);

  for (const item of PROJECT_ID_MAPPINGS) {
    // Find matching project
    const match = existingProjects.find(p => {
      const pName = p.name.trim().toLowerCase();
      const iName = item.name.trim().toLowerCase();
      return pName === iName || 
             (iName === 'natgrid-gandiva & sudarshan' && pName.includes('natgrid')) ||
             (iName.includes('cctv-360') && pName.includes('cctv-360'));
    });

    if (match) {
      await updateDoc(doc(db, 'projects', match.id), {
        code: item.code,
        name: item.name,
        updatedAt: new Date().toISOString()
      });
      console.log(`Updated [${item.code}] -> ${item.name} (${match.id})`);
    } else {
      // Create project if missing (e.g. RTGS or Gem Procurement)
      const newDoc = await addDoc(collection(db, 'projects'), {
        code: item.code,
        name: item.name,
        description: item.desc || `Tech Services Project: ${item.name}`,
        status: 'Active',
        hierarchy: {
          igp: 'IGP (Tech Services)',
          dsp: item.dsp || 'V. Vishnu Swaroop',
          ci: item.ci || 'M. Mohan',
          si: item.si || 'G. Jyothi',
          asi: ''
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log(`Created NEW [${item.code}] -> ${item.name} (${newDoc.id})`);
    }
  }

  const finalSnap = await getDocs(collection(db, 'projects'));
  console.log(`\n=== ALL ${finalSnap.size} PROJECTS ASSIGNED PRJ-001 TO PRJ-035 ===`);
  const sorted = finalSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.code || '').localeCompare(b.code || ''));
  sorted.forEach(p => {
    console.log(`${p.code || 'NO_CODE'} -> ${p.name}`);
  });

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
