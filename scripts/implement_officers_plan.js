const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, setDoc, addDoc, updateDoc, query, where, deleteDoc } = require('firebase/firestore');

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

const OFFICERS_DATA = [
  // 1. SP
  { proId: 'PRO-045', name: 'K. Sreelakshmi', rank: 'SP', role: 'Supervisory' },
  // 2. Addl. SP
  { proId: 'PRO-074', name: 'G. Veeraraghava Reddy', rank: 'Addl. SP', role: 'Supervisory' },
  // 3. DSPs
  { proId: 'PRO-078', name: 'V. Vishnu Swaroop', rank: 'DSP', role: 'Supervisory' },
  { proId: 'PRO-079', name: 'M. Hema Latha', rank: 'DSP', role: 'Supervisory' },
  { proId: 'PRO-081', name: 'P. Bhavana', rank: 'DSP', role: 'Supervisory' },
  { proId: 'PRO-082', name: 'P. Sindhu Priya', rank: 'DSP', role: 'Supervisory' },
  // 4. CIs
  { proId: 'PRO-091', name: 'M. Mohan', rank: 'CI', role: 'Monitoring' },
  { proId: 'PRO-092', name: 'V. Sudharshana Reddy', rank: 'CI', role: 'Monitoring' },
  { proId: 'PRO-094', name: 'K. Satish', rank: 'CI', role: 'Monitoring' },
  { proId: 'PRO-095', name: 'K. Vijaya Kumar', rank: 'CI', role: 'Monitoring' },
  { proId: 'PRO-106', name: 'K. Sreekanth', rank: 'CI', role: 'Monitoring' },
  { proId: 'PRO-123', name: 'M. Manohar Rao', rank: 'CI', role: 'Monitoring' },
  // 5. SIs
  { proId: 'PRO-124', name: 'G. Jyothi', rank: 'SI', role: 'Monitoring' },
  { proId: 'PRO-125', name: 'J. Kalpana', rank: 'SI', role: 'Monitoring' },
  { proId: 'PRO-136', name: 'T. Anoj Kumar', rank: 'SI', role: 'Monitoring' },
  { proId: 'PRO-137', name: 'G. Ravi Kiran', rank: 'SI', role: 'Monitoring' },
  { proId: 'PRO-140', name: 'MD. Sadhik', rank: 'SI', role: 'Monitoring' },
  { proId: 'PRO-142', name: 'K. Venkata Rao', rank: 'SI', role: 'Monitoring' },
  { proId: 'PRO-150', name: 'D. Rama Koti Naik', rank: 'SI', role: 'Monitoring' },
  { proId: 'PRO-151', name: 'P.V. Naidu (PMO)', rank: 'SI', role: 'Monitoring' },
  { proId: 'PRO-152', name: 'Ch. Aditya Srinivas', rank: 'SI', role: 'Monitoring' },
  { proId: 'PRO-153', name: 'B. Vijay Kumar Reddy', rank: 'SI', role: 'Monitoring' },
  { proId: 'PRO-154', name: 'CJ. Bharath', rank: 'SI', role: 'Monitoring' },
  { proId: 'PRO-155', name: 'S.S. Siva Rama Sastry', rank: 'SI', role: 'Monitoring' },
  { proId: 'PRO-157', name: 'IR Koteswara Rao', rank: 'SI', role: 'Monitoring' },
  // 6. ASI
  { proId: 'PRO-158', name: 'B. Rani', rank: 'ASI', role: 'Monitoring' },
  // 7. AAO
  { proId: 'PRO-159', name: 'N. Sarojini', rank: 'AAO', role: 'Operational' },
];

const OFFICER_PROJECT_ALLOCATIONS = [
  // SP K. Sreelakshmi (1)
  { proId: 'PRO-045', prjCode: 'PRJ-024', pct: 100, role: 'Supervisory Head', workstream: 'Executive Command & NERS Emergency Operations Oversight' },

  // Addl. SP G. Veeraraghava Reddy (1)
  { proId: 'PRO-074', prjCode: 'PRJ-001', pct: 100, role: 'Supervisory Lead', workstream: 'AI4AP Strategic Direction, Petition AI & Docs2Data AI Architecture' },

  // DSP M. Hema Latha (3)
  { proId: 'PRO-079', prjCode: 'PRJ-001', pct: 33, role: 'Supervisory In-Charge', workstream: 'AI4AP SocInt AI & News360 AI Initiatives' },
  { proId: 'PRO-079', prjCode: 'PRJ-029', pct: 33, role: 'Supervisory In-Charge', workstream: 'Departmental Documentation, Policy & Communications' },
  { proId: 'PRO-079', prjCode: 'PRJ-033', pct: 34, role: 'Supervisory In-Charge', workstream: 'Shakti Women Safety Platform Operations' },

  // DSP P. Bhavana (1)
  { proId: 'PRO-081', prjCode: 'PRJ-025', pct: 100, role: 'Supervisory In-Charge', workstream: 'External Technical Attachments & Special Deployments' },

  // DSP P. Sindhu Priya (1)
  { proId: 'PRO-082', prjCode: 'PRJ-025', pct: 100, role: 'Supervisory In-Charge', workstream: 'External Technical Attachments & Inter-Agency Coordination' },

  // DSP V. Vishnu Swaroop (28) -> 4% x 16 + 3% x 12 = 100%
  { proId: 'PRO-078', prjCode: 'PRJ-001', pct: 4, role: 'Supervisory Lead', workstream: 'AI4AP Engineering Foundation & Digital Evidence Command' },
  { proId: 'PRO-078', prjCode: 'PRJ-002', pct: 4, role: 'Supervisory Lead', workstream: 'All-in-One Desktops Infrastructure Rollout' },
  { proId: 'PRO-078', prjCode: 'PRJ-003', pct: 4, role: 'Supervisory Lead', workstream: 'AP Police Website & Citizen Portal Administration' },
  { proId: 'PRO-078', prjCode: 'PRJ-004', pct: 4, role: 'Supervisory Lead', workstream: 'APCOPS 2.0 Police Operations Platform' },
  { proId: 'PRO-078', prjCode: 'PRJ-005', pct: 4, role: 'Supervisory Lead', workstream: 'APOLIS Logistics & Asset Tracking' },
  { proId: 'PRO-078', prjCode: 'PRJ-006', pct: 4, role: 'Supervisory Lead', workstream: 'BSNL State-wide Network & Leased Line Connectivity' },
  { proId: 'PRO-078', prjCode: 'PRJ-007', pct: 4, role: 'Supervisory Lead', workstream: 'CCTNS Platform Operations & CAS Upgrades' },
  { proId: 'PRO-078', prjCode: 'PRJ-008', pct: 4, role: 'Supervisory Lead', workstream: 'CCTV Camera Cloud Based (CCTV-360) Integration' },
  { proId: 'PRO-078', prjCode: 'PRJ-009', pct: 4, role: 'Supervisory Lead', workstream: 'Police Stations CCTV Surveillance Oversight' },
  { proId: 'PRO-078', prjCode: 'PRJ-010', pct: 4, role: 'Supervisory Lead', workstream: 'CEIR Central Equipment Identity Register Tracking' },
  { proId: 'PRO-078', prjCode: 'PRJ-011', pct: 4, role: 'Supervisory Lead', workstream: 'Cri-Mac Multi-Agency Intelligence Network' },
  { proId: 'PRO-078', prjCode: 'PRJ-012', pct: 4, role: 'Supervisory Lead', workstream: 'State Police Data Center Infrastructure Operations' },
  { proId: 'PRO-078', prjCode: 'PRJ-013', pct: 4, role: 'Supervisory Lead', workstream: 'District Data Coordination & Reporting' },
  { proId: 'PRO-078', prjCode: 'PRJ-014', pct: 4, role: 'Supervisory Lead', workstream: 'DLT & E-SMS Portal Security' },
  { proId: 'PRO-078', prjCode: 'PRJ-015', pct: 4, role: 'Supervisory Lead', workstream: 'Drones Fleet Management & Aerial Surveillance' },
  { proId: 'PRO-078', prjCode: 'PRJ-016', pct: 4, role: 'Supervisory Lead', workstream: 'E-CHALLAN Automated Traffic Enforcement System' },
  { proId: 'PRO-078', prjCode: 'PRJ-017', pct: 3, role: 'Supervisory Lead', workstream: 'e-dar Electronic Detailed Accident Report System' },
  { proId: 'PRO-078', prjCode: 'PRJ-018', pct: 3, role: 'Supervisory Lead', workstream: 'eOffice Digital Secretariat File Management' },
  { proId: 'PRO-078', prjCode: 'PRJ-019', pct: 3, role: 'Supervisory Lead', workstream: 'ICJS Inter-Operable Criminal Justice System' },
  { proId: 'PRO-078', prjCode: 'PRJ-022', pct: 3, role: 'Supervisory Lead', workstream: 'MEESEVA Citizen Service Integrations' },
  { proId: 'PRO-078', prjCode: 'PRJ-023', pct: 3, role: 'Supervisory Lead', workstream: 'NATGRID Gandiva & Sudarshan Platforms' },
  { proId: 'PRO-078', prjCode: 'PRJ-024', pct: 3, role: 'Supervisory Lead', workstream: 'NERS & UECCR Emergency Response Command' },
  { proId: 'PRO-078', prjCode: 'PRJ-029', pct: 3, role: 'Supervisory Lead', workstream: 'Technical Documentation & SOP Approvals' },
  { proId: 'PRO-078', prjCode: 'PRJ-031', pct: 3, role: 'Supervisory Lead', workstream: 'PM Gatishakti GIS Asset Mapping' },
  { proId: 'PRO-078', prjCode: 'PRJ-032', pct: 3, role: 'Supervisory Lead', workstream: 'SASE & XDR Cyber Security Architecture' },
  { proId: 'PRO-078', prjCode: 'PRJ-034', pct: 3, role: 'Supervisory Lead', workstream: 'RTGS State Analytics Integration' },
  { proId: 'PRO-078', prjCode: 'PRJ-035', pct: 3, role: 'Supervisory Lead', workstream: 'GeM Procurement & ASUMP Fund Oversight' },
  { proId: 'PRO-078', prjCode: 'PRJ-036', pct: 3, role: 'Supervisory Lead', workstream: 'Technical Training Programs & Capacity Building' },

  // CI K. Satish (6) -> 17% x 4 + 16% x 2 = 100%
  { proId: 'PRO-094', prjCode: 'PRJ-001', pct: 17, role: 'Monitoring Officer', workstream: 'AI4AP Petition AI Technical Implementation' },
  { proId: 'PRO-094', prjCode: 'PRJ-013', pct: 17, role: 'Monitoring Officer', workstream: 'District Data Coordination & Reporting Workflows' },
  { proId: 'PRO-094', prjCode: 'PRJ-019', pct: 17, role: 'Monitoring Officer', workstream: 'ICJS Inter-Agency Data Integration' },
  { proId: 'PRO-094', prjCode: 'PRJ-029', pct: 17, role: 'Monitoring Officer', workstream: 'Departmental Correspondence & Technical SOPs' },
  { proId: 'PRO-094', prjCode: 'PRJ-034', pct: 16, role: 'Monitoring Officer', workstream: 'RTGS Real-Time Data Pipeline Monitoring' },
  { proId: 'PRO-094', prjCode: 'PRJ-035', pct: 16, role: 'Monitoring Officer', workstream: 'GeM Procurement Compliance & Tender Evaluations' },

  // CI K. Sreekanth (6) -> 17% x 4 + 16% x 2 = 100%
  { proId: 'PRO-106', prjCode: 'PRJ-001', pct: 17, role: 'Monitoring Officer', workstream: 'AI4AP Docs2Data AI Ingestion Pipeline' },
  { proId: 'PRO-106', prjCode: 'PRJ-009', pct: 17, role: 'Monitoring Officer', workstream: 'Police Stations CCTV Surveillance Compliance' },
  { proId: 'PRO-106', prjCode: 'PRJ-013', pct: 17, role: 'Monitoring Officer', workstream: 'District Data Coordination & Collection' },
  { proId: 'PRO-106', prjCode: 'PRJ-018', pct: 17, role: 'Monitoring Officer', workstream: 'eOffice Implementation & Digital File Movement' },
  { proId: 'PRO-106', prjCode: 'PRJ-029', pct: 16, role: 'Monitoring Officer', workstream: 'Departmental Correspondence & Documentation' },
  { proId: 'PRO-106', prjCode: 'PRJ-035', pct: 16, role: 'Monitoring Officer', workstream: 'GeM Procurement & Technical Specifications' },

  // CI K. Vijaya Kumar (7) -> 15% x 2 + 14% x 5 = 100%
  { proId: 'PRO-095', prjCode: 'PRJ-001', pct: 15, role: 'Monitoring Officer', workstream: 'AI4AP Investigation Copilot Implementation' },
  { proId: 'PRO-095', prjCode: 'PRJ-005', pct: 15, role: 'Monitoring Officer', workstream: 'APOLIS Asset Tracking & Inventory Systems' },
  { proId: 'PRO-095', prjCode: 'PRJ-013', pct: 14, role: 'Monitoring Officer', workstream: 'District Data Coordination & Reporting' },
  { proId: 'PRO-095', prjCode: 'PRJ-015', pct: 14, role: 'Monitoring Officer', workstream: 'DRONES Fleet Operations & Maintenance' },
  { proId: 'PRO-095', prjCode: 'PRJ-022', pct: 14, role: 'Monitoring Officer', workstream: 'MEESEVA Citizen Service Integrations' },
  { proId: 'PRO-095', prjCode: 'PRJ-029', pct: 14, role: 'Monitoring Officer', workstream: 'Correspondence & Departmental Communications' },
  { proId: 'PRO-095', prjCode: 'PRJ-035', pct: 14, role: 'Monitoring Officer', workstream: 'GeM Procurement & Equipment Lifecycle' },

  // CI M. Manohar Rao (2)
  { proId: 'PRO-123', prjCode: 'PRJ-008', pct: 50, role: 'Monitoring Officer', workstream: 'CCTV Camera Cloud Based (CCTV-360) Feed Integration' },
  { proId: 'PRO-123', prjCode: 'PRJ-029', pct: 50, role: 'Monitoring Officer', workstream: 'Correspondence & Operations Documentation' },

  // CI M. Mohan (6) -> 17% x 4 + 16% x 2 = 100%
  { proId: 'PRO-091', prjCode: 'PRJ-001', pct: 17, role: 'Monitoring Officer', workstream: 'AI4AP Digital Evidence AI Pipeline' },
  { proId: 'PRO-091', prjCode: 'PRJ-012', pct: 17, role: 'Monitoring Officer', workstream: 'Data Center Infrastructure & Uptime Monitoring' },
  { proId: 'PRO-091', prjCode: 'PRJ-013', pct: 17, role: 'Monitoring Officer', workstream: 'District Data Coordination & Verification' },
  { proId: 'PRO-091', prjCode: 'PRJ-024', pct: 17, role: 'Monitoring Officer', workstream: 'NERS & UECCR Emergency Call Handling Monitoring' },
  { proId: 'PRO-091', prjCode: 'PRJ-029', pct: 16, role: 'Monitoring Officer', workstream: 'Documentation & Standing Operating Procedures' },
  { proId: 'PRO-091', prjCode: 'PRJ-035', pct: 16, role: 'Monitoring Officer', workstream: 'GeM Procurement Process & Verification' },

  // CI V. Sudharshana Reddy (15) -> 7% x 10 + 6% x 5 = 100%
  { proId: 'PRO-092', prjCode: 'PRJ-001', pct: 7, role: 'Monitoring Officer', workstream: 'AI4AP AI & Engineering Foundation Architecture' },
  { proId: 'PRO-092', prjCode: 'PRJ-002', pct: 7, role: 'Monitoring Officer', workstream: 'All-in-One Desktops Hardware Deployment' },
  { proId: 'PRO-092', prjCode: 'PRJ-003', pct: 7, role: 'Monitoring Officer', workstream: 'AP Police Website / Citizen Portal Upgrades' },
  { proId: 'PRO-092', prjCode: 'PRJ-004', pct: 7, role: 'Monitoring Officer', workstream: 'APCOPS 2.0 Feature Enhancement & Rollout' },
  { proId: 'PRO-092', prjCode: 'PRJ-006', pct: 7, role: 'Monitoring Officer', workstream: 'BSNL Network Connectivity & Bandwidth SLAs' },
  { proId: 'PRO-092', prjCode: 'PRJ-007', pct: 7, role: 'Monitoring Officer', workstream: 'CCTNS Operations & Database Maintenance' },
  { proId: 'PRO-092', prjCode: 'PRJ-010', pct: 7, role: 'Monitoring Officer', workstream: 'CEIR Mobile Device Tracing Workflows' },
  { proId: 'PRO-092', prjCode: 'PRJ-011', pct: 7, role: 'Monitoring Officer', workstream: 'Cri-Mac Inter-State Crime Multi-Agency Sharing' },
  { proId: 'PRO-092', prjCode: 'PRJ-013', pct: 7, role: 'Monitoring Officer', workstream: 'District Data Coordination & Quality Audits' },
  { proId: 'PRO-092', prjCode: 'PRJ-014', pct: 7, role: 'Monitoring Officer', workstream: 'DLT & E-SMS Portal Messaging Gateway' },
  { proId: 'PRO-092', prjCode: 'PRJ-023', pct: 6, role: 'Monitoring Officer', workstream: 'NATGRID Gandiva & Sudarshan Implementation' },
  { proId: 'PRO-092', prjCode: 'PRJ-029', pct: 6, role: 'Monitoring Officer', workstream: 'Official Communications & Project Records' },
  { proId: 'PRO-092', prjCode: 'PRJ-031', pct: 6, role: 'Monitoring Officer', workstream: 'PM Gatishakti Police Assets Geotagging' },
  { proId: 'PRO-092', prjCode: 'PRJ-032', pct: 6, role: 'Monitoring Officer', workstream: 'SASE & XDR Endpoint Threat Detection' },
  { proId: 'PRO-092', prjCode: 'PRJ-035', pct: 6, role: 'Monitoring Officer', workstream: 'GeM Procurement & ASUMP Fund Documentation' },

  // SI B. Vijay Kumar Reddy (4)
  { proId: 'PRO-153', prjCode: 'PRJ-005', pct: 25, role: 'Monitoring Officer', workstream: 'APOLIS Asset Tracking Database Support' },
  { proId: 'PRO-153', prjCode: 'PRJ-015', pct: 25, role: 'Monitoring Officer', workstream: 'DRONES Maintenance Logs & Equipment Tracking' },
  { proId: 'PRO-153', prjCode: 'PRJ-022', pct: 25, role: 'Monitoring Officer', workstream: 'MEESEVA Verification Pipeline Management' },
  { proId: 'PRO-153', prjCode: 'PRJ-029', pct: 25, role: 'Monitoring Officer', workstream: 'Correspondence & Field Reporting' },

  // SI Ch. Aditya Srinivas (5)
  { proId: 'PRO-152', prjCode: 'PRJ-003', pct: 20, role: 'Monitoring Officer', workstream: 'AP Police Citizen Portal Content & Bug Tracking' },
  { proId: 'PRO-152', prjCode: 'PRJ-004', pct: 20, role: 'Monitoring Officer', workstream: 'APCOPS 2.0 User Acceptance Testing & Support' },
  { proId: 'PRO-152', prjCode: 'PRJ-013', pct: 20, role: 'Monitoring Officer', workstream: 'District Data Coordination & Reporting' },
  { proId: 'PRO-152', prjCode: 'PRJ-029', pct: 20, role: 'Monitoring Officer', workstream: 'Documentation & Technical Briefings' },
  { proId: 'PRO-152', prjCode: 'PRJ-036', pct: 20, role: 'Monitoring Officer', workstream: 'Technical Training Coordination & Officer Induction' },

  // SI CJ. Bharath (2)
  { proId: 'PRO-154', prjCode: 'PRJ-008', pct: 50, role: 'Monitoring Officer', workstream: 'CCTV-360 Live Feed Streams & Network Health' },
  { proId: 'PRO-154', prjCode: 'PRJ-029', pct: 50, role: 'Monitoring Officer', workstream: 'Official Communications & CCTV Project Files' },

  // SI D. Rama Koti Naik (2)
  { proId: 'PRO-150', prjCode: 'PRJ-028', pct: 50, role: 'Monitoring Officer', workstream: 'PCS&S MTO Fleet Logistics & Vehicle Deployment' },
  { proId: 'PRO-150', prjCode: 'PRJ-029', pct: 50, role: 'Monitoring Officer', workstream: 'MTO Documentation & Fuel/Service Records' },

  // SI G. Jyothi (2)
  { proId: 'PRO-124', prjCode: 'PRJ-024', pct: 50, role: 'Monitoring Officer', workstream: 'NERS & UECCR Quality Audits & Escalation Tracking' },
  { proId: 'PRO-124', prjCode: 'PRJ-029', pct: 50, role: 'Monitoring Officer', workstream: 'Administrative Correspondence & Communications' },

  // SI G. Ravi Kiran (5)
  { proId: 'PRO-137', prjCode: 'PRJ-001', pct: 20, role: 'Monitoring Officer', workstream: 'AI4AP CognitiveNet AI Visual Analytics Support' },
  { proId: 'PRO-137', prjCode: 'PRJ-013', pct: 20, role: 'Monitoring Officer', workstream: 'District Data Coordination & Daily Returns' },
  { proId: 'PRO-137', prjCode: 'PRJ-016', pct: 20, role: 'Monitoring Officer', workstream: 'E-CHALLAN Database Support & Bank Reconciliation' },
  { proId: 'PRO-137', prjCode: 'PRJ-029', pct: 20, role: 'Monitoring Officer', workstream: 'Correspondence & Traffic Records' },
  { proId: 'PRO-137', prjCode: 'PRJ-035', pct: 20, role: 'Monitoring Officer', workstream: 'GeM Procurement Technical Verification' },

  // SI IR Koteswara Rao (1)
  { proId: 'PRO-157', prjCode: 'PRJ-025', pct: 100, role: 'Monitoring Officer', workstream: 'Attached to Guntur Communication / External Deployments' },

  // SI J. Kalpana (4)
  { proId: 'PRO-125', prjCode: 'PRJ-007', pct: 25, role: 'Monitoring Officer', workstream: 'CCTNS Police Station Replication & Sync Tracking' },
  { proId: 'PRO-125', prjCode: 'PRJ-013', pct: 25, role: 'Monitoring Officer', workstream: 'District Data Coordination & State Reports' },
  { proId: 'PRO-125', prjCode: 'PRJ-029', pct: 25, role: 'Monitoring Officer', workstream: 'Departmental Documentation & Circulars' },
  { proId: 'PRO-125', prjCode: 'PRJ-035', pct: 25, role: 'Monitoring Officer', workstream: 'GeM Equipment Procurement Verification' },

  // SI K. Venkata Rao (2)
  { proId: 'PRO-142', prjCode: 'PRJ-029', pct: 50, role: 'Monitoring Officer', workstream: 'Official Communications & Case Reports' },
  { proId: 'PRO-142', prjCode: 'PRJ-033', pct: 50, role: 'Monitoring Officer', workstream: 'Shakti Women Safety Dispatch & PCR Coordination' },

  // SI MD. Sadhik (7) -> 15% x 2 + 14% x 5 = 100%
  { proId: 'PRO-140', prjCode: 'PRJ-001', pct: 15, role: 'Monitoring Officer', workstream: 'AI4AP SocInt AI Sentiment & Alert Engine' },
  { proId: 'PRO-140', prjCode: 'PRJ-002', pct: 15, role: 'Monitoring Officer', workstream: 'All-in-One Desktops Commissioning & Network Configuration' },
  { proId: 'PRO-140', prjCode: 'PRJ-013', pct: 14, role: 'Monitoring Officer', workstream: 'District Data Coordination & Ingestion Pipeline' },
  { proId: 'PRO-140', prjCode: 'PRJ-014', pct: 14, role: 'Monitoring Officer', workstream: 'DLT & E-SMS Security Gateway & Logs' },
  { proId: 'PRO-140', prjCode: 'PRJ-029', pct: 14, role: 'Monitoring Officer', workstream: 'Technical Correspondence & IT Assets Documentation' },
  { proId: 'PRO-140', prjCode: 'PRJ-032', pct: 14, role: 'Monitoring Officer', workstream: 'SASE & XDR Security Operations Monitoring' },
  { proId: 'PRO-140', prjCode: 'PRJ-035', pct: 14, role: 'Monitoring Officer', workstream: 'GeM Procurement Technical Specifications Review' },

  // SI P.V. Naidu (PMO) (2)
  { proId: 'PRO-151', prjCode: 'PRJ-012', pct: 50, role: 'Monitoring Officer', workstream: 'State Police Data Center PMO Operations & Asset Upkeep' },
  { proId: 'PRO-151', prjCode: 'PRJ-035', pct: 50, role: 'Monitoring Officer', workstream: 'GeM Hardware Procurement & Technical Verification' },

  // SI S.S. Siva Rama Sastry (1)
  { proId: 'PRO-155', prjCode: 'PRJ-025', pct: 100, role: 'Monitoring Officer', workstream: 'Attached to DGP Sir Guest house / External Deployments' },

  // SI T. Anoj Kumar (7) -> 15% x 2 + 14% x 5 = 100%
  { proId: 'PRO-136', prjCode: 'PRJ-001', pct: 15, role: 'Monitoring Officer', workstream: 'AI4AP News360 AI News Scraping & Event Feed' },
  { proId: 'PRO-136', prjCode: 'PRJ-010', pct: 15, role: 'Monitoring Officer', workstream: 'CEIR Stolen Mobile Database Updates & Analysis' },
  { proId: 'PRO-136', prjCode: 'PRJ-013', pct: 14, role: 'Monitoring Officer', workstream: 'District Data Coordination & Reporting Schedules' },
  { proId: 'PRO-136', prjCode: 'PRJ-023', pct: 14, role: 'Monitoring Officer', workstream: 'NATGRID Platform Coordination & Core Queries' },
  { proId: 'PRO-136', prjCode: 'PRJ-029', pct: 14, role: 'Monitoring Officer', workstream: 'Departmental Correspondence & Monthly Compilations' },
  { proId: 'PRO-136', prjCode: 'PRJ-031', pct: 14, role: 'Monitoring Officer', workstream: 'PM Gatishakti Geographic Asset Mapping' },
  { proId: 'PRO-136', prjCode: 'PRJ-035', pct: 14, role: 'Monitoring Officer', workstream: 'GeM Procurement Quality Inspection' },

  // ASI B. Rani (1)
  { proId: 'PRO-158', prjCode: 'PRJ-024', pct: 100, role: 'Monitoring Officer', workstream: 'NERS & UECCR Call Quality Audits & Operational Records' },

  // AAO N. Sarojini (4)
  { proId: 'PRO-159', prjCode: 'PRJ-027', pct: 25, role: 'Administrative Officer', workstream: 'PCS&S ADMIN Establishment & Service Records' },
  { proId: 'PRO-159', prjCode: 'PRJ-029', pct: 25, role: 'Administrative Officer', workstream: 'Administrative Correspondence & Government Orders' },
  { proId: 'PRO-159', prjCode: 'PRJ-030', pct: 25, role: 'Administrative Officer', workstream: 'PCS&S Stores Stock Register & Material Issue' },
  { proId: 'PRO-159', prjCode: 'PRJ-035', pct: 25, role: 'Administrative Officer', workstream: 'GeM Financial Sanction & Invoice Processing' },
];

async function run() {
  console.log('=== STEP 1: REGISTERING PRJ-036 TRAININGS PROJECT IF MISSING ===');
  const prjSnap = await getDocs(collection(db, 'projects'));
  const projects = prjSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  let prj036 = projects.find(p => p.code === 'PRJ-036' || p.name.toLowerCase().includes('training'));
  if (!prj036) {
    const newPrjDoc = await addDoc(collection(db, 'projects'), {
      code: 'PRJ-036',
      name: 'Trainings',
      description: 'Departmental Technical Training Programs, Digital Policing Workshops & Officer Capacity Building.',
      status: 'Active',
      hierarchy: {
        igp: 'IGP (Tech Services)',
        dsp: 'V. Vishnu Swaroop',
        ci: '',
        si: 'Ch. Aditya Srinivas',
        asi: ''
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    console.log(`Created NEW [PRJ-036] -> Trainings (${newPrjDoc.id})`);
    prj036 = { id: newPrjDoc.id, code: 'PRJ-036', name: 'Trainings' };
  } else {
    await updateDoc(doc(db, 'projects', prj036.id), {
      code: 'PRJ-036',
      name: 'Trainings',
      updatedAt: new Date().toISOString()
    });
    console.log(`Verified [PRJ-036] -> Trainings (${prj036.id})`);
  }

  // Refresh projects map
  const updatedPrjSnap = await getDocs(collection(db, 'projects'));
  const allProjects = updatedPrjSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const prjCodeToIdMap = new Map();
  allProjects.forEach(p => {
    if (p.code) prjCodeToIdMap.set(p.code, p.id);
  });

  console.log(`Total registered projects: ${allProjects.length}`);

  console.log('\n=== STEP 2: UPSERTING 27 OFFICERS INTO PERSONS COLLECTION ===');
  const pSnap = await getDocs(collection(db, 'persons'));
  const existingPersons = pSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const officerProIdToPersonIdMap = new Map();

  for (const o of OFFICERS_DATA) {
    const existing = existingPersons.find(p => p.proId === o.proId || p.name.trim().toLowerCase() === o.name.trim().toLowerCase());
    if (existing) {
      await updateDoc(doc(db, 'persons', existing.id), {
        proId: o.proId,
        name: o.name,
        rank: o.rank,
        isOfficer: true,
        status: 'Active',
        updatedAt: new Date().toISOString()
      });
      officerProIdToPersonIdMap.set(o.proId, existing.id);
      console.log(`Updated Person [${o.proId}] ${o.rank} ${o.name} (${existing.id})`);
    } else {
      const newDoc = await addDoc(collection(db, 'persons'), {
        proId: o.proId,
        name: o.name,
        rank: o.rank,
        genNo: '',
        deputationType: 'Attachment',
        workingSince: new Date().toISOString(),
        isOfficer: true,
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      officerProIdToPersonIdMap.set(o.proId, newDoc.id);
      console.log(`Created Person [${o.proId}] ${o.rank} ${o.name} (${newDoc.id})`);
    }
  }

  console.log('\n=== STEP 3: CREATING/UPDATING OFFICER PROJECT ASSIGNMENTS ===');
  const aSnap = await getDocs(collection(db, 'assignments'));
  const existingAssignments = aSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  // Delete prior officer assignments to have a clean exact mapping
  const officerPersonIds = Array.from(officerProIdToPersonIdMap.values());
  for (const a of existingAssignments) {
    if (officerPersonIds.includes(a.personId)) {
      await deleteDoc(doc(db, 'assignments', a.id));
    }
  }
  console.log('Cleaned old officer assignment records.');

  let insertedCount = 0;
  for (const alloc of OFFICER_PROJECT_ALLOCATIONS) {
    const personId = officerProIdToPersonIdMap.get(alloc.proId);
    const projectId = prjCodeToIdMap.get(alloc.prjCode);

    if (!personId || !projectId) {
      console.warn(`Could not resolve personId (${personId}) or projectId (${projectId}) for ${alloc.proId} -> ${alloc.prjCode}`);
      continue;
    }

    await addDoc(collection(db, 'assignments'), {
      personId,
      projectId,
      workstreamName: alloc.workstream,
      workstreamDescription: `Supervisory Command & Operational Guidance for ${alloc.prjCode}.`,
      allocationPercent: alloc.pct, // Integer percentage
      functionalRole: alloc.role,
      raciType: alloc.role.includes('Supervisory') ? 'Accountable' : 'Responsible',
      isOfficerAssignment: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    insertedCount++;
  }

  console.log(`Successfully created ${insertedCount} officer project assignments with rounded integer FTEs.`);

  console.log('\n=== VERIFICATION ===');
  const finalPersons = await getDocs(collection(db, 'persons'));
  const finalAssigns = await getDocs(collection(db, 'assignments'));
  console.log(`Total Personnel in DB: ${finalPersons.size}`);
  console.log(`Total Assignments in DB: ${finalAssigns.size}`);

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
