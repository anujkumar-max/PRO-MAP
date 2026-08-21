import * as xlsx from 'xlsx';
import { batchImportPersons, batchImportProjects, batchImportAssignments, setPersonCounter } from './firestore';
import type { Person, Project, Assignment } from '@/types';

function cleanStr(val: any): string {
  if (val === undefined || val === null) return '';
  return String(val).trim();
}

export async function importExcelData(file: File): Promise<{ projects: number; persons: number; assignments: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error('Failed to read file');

        const workbook = xlsx.read(data, { type: 'binary' });
        const sheetNames = workbook.SheetNames;

        const isSingleSheetNominalRoll = 
          sheetNames.length === 1 || 
          sheetNames.includes('Nominal Roll') || 
          sheetNames.includes('Final Nominal Roll');

        if (isSingleSheetNominalRoll) {
          // --- FORMAT 1: Consolidated Single Sheet (Final Nominal Roll) ---
          const sheetName = sheetNames.includes('Nominal Roll') ? 'Nominal Roll' : sheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const rawData = xlsx.utils.sheet_to_json<any>(sheet, { header: 1 });
          if (!rawData || rawData.length < 2) throw new Error('Empty sheet data');

          let headerRowIndex = 0;
          if (rawData[0] && rawData[0][0] && typeof rawData[0][0] === 'string' && (rawData[0][0].includes('PART-1') || rawData[0][0].includes('PART 1'))) {
            headerRowIndex = 1;
          }

          const rows = rawData.slice(headerRowIndex + 1);
          let currentProjectName = '';
          let currentDsp = '';
          let currentCi = '';
          let currentSi = '';
          let currentAsi = '';

          const projectMap = new Map<string, Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>();
          const personMap = new Map<string, Omit<Person, 'id' | 'createdAt' | 'updatedAt'>>();
          const rawAssignments: any[] = [];

          for (const r of rows) {
            if (!r || !Array.isArray(r) || !r.some(c => c !== undefined && c !== null && String(c).trim() !== '')) continue;

            const rawPName = r[1] ? cleanStr(r[1]) : '';
            const rawDsp = r[2] ? cleanStr(r[2]) : '';
            const rawCi = r[3] ? cleanStr(r[3]) : '';
            const rawSi = r[4] ? cleanStr(r[4]) : '';
            const rawAsi = r[5] ? cleanStr(r[5]) : '';

            if (rawPName) {
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

            const name = r[6] ? cleanStr(r[6]) : '';
            if (!name || name.toLowerCase().includes('name')) continue;

            const rank = r[7] ? cleanStr(r[7]) : 'Staff';
            const genNo = r[8] ? cleanStr(r[8]) : '';
            const deputation = r[9] ? cleanStr(r[9]) : 'Deputation';
            const workingSince = r[10] ? cleanStr(r[10]) : '';
            const wsName = r[11] ? cleanStr(r[11]) : currentProjectName;
            const wsDesc = r[12] ? cleanStr(r[12]) : '';
            let alloc = 100;
            if (r[13] !== undefined && r[13] !== null) {
              const parsed = parseFloat(String(r[13]));
              if (!isNaN(parsed)) alloc = parsed <= 1 ? parsed * 100 : parsed;
            }
            const role = r[14] ? cleanStr(r[14]) : 'User Support';
            const raci = r[15] ? cleanStr(r[15]) : 'Responsible';
            const proId = r[16] ? cleanStr(r[16]) : '';
            const normName = name.replace(/[\s\.\-_]+/g, '').toUpperCase();
            const personKey = proId ? proId : normName;

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

            let targetPerson: any = null;
            for (const p of personMap.values()) {
              const existingNorm = p.name.replace(/[\s\.\-_]+/g, '').toUpperCase();
              if (existingNorm === normName || (proId && p.proId === proId)) {
                targetPerson = p;
                if (name.includes(' ') && !p.name.includes(' ')) {
                  p.name = name;
                }
                break;
              }
            }

            if (!targetPerson) {
              targetPerson = {
                key: personKey,
                proId: proId || (`PRO-${String(personMap.size + 1).padStart(3, '0')}`),
                name,
                rank,
                genNo,
                deputationType: deputation as any,
                workingSince,
                status: 'Active'
              };
              personMap.set(personKey, targetPerson);
            }

            const supervisor = currentSi || currentCi || currentDsp || '';

            rawAssignments.push({
              personKey: targetPerson.key,
              personName: targetPerson.name,
              proId: targetPerson.proId,
              projectName: currentProjectName,
              workstreamName: wsName,
              workstreamDescription: wsDesc,
              allocationPercent: Math.round(alloc),
              functionalRole: role,
              raciType: (raci.includes('Accountable') ? 'Accountable' : raci.includes('Consulted') ? 'Consulted' : raci.includes('Informed') ? 'Informed' : 'Responsible'),
              primaryOrSupport: 'Primary',
              reportingTo: supervisor
            });
          }

          const projectsToImport = Array.from(projectMap.values());
          const personsToImport = Array.from(personMap.values());

          const projectIds = await batchImportProjects(projectsToImport);
          const personIds = await batchImportPersons(personsToImport);
          await setPersonCounter(personsToImport.length);

          const projIdMap = new Map<string, string>();
          projectsToImport.forEach((p, idx) => projIdMap.set(p.name, projectIds[idx]));

          const persIdMap = new Map<string, string>();
          personsToImport.forEach((p, idx) => persIdMap.set((p as any).key || p.proId, personIds[idx]));

          const assignmentsToImport: Omit<Assignment, 'id'>[] = rawAssignments.map(a => ({
            personId: persIdMap.get(a.personKey) || '',
            projectId: projIdMap.get(a.projectName) || '',
            workstreamName: a.workstreamName,
            workstreamDescription: a.workstreamDescription,
            allocationPercent: a.allocationPercent,
            functionalRole: a.functionalRole,
            raciType: a.raciType,
            primaryOrSupport: a.primaryOrSupport,
            reportingTo: a.reportingTo
          }));

          if (assignmentsToImport.length > 0) {
            await batchImportAssignments(assignmentsToImport);
          }

          resolve({
            projects: projectsToImport.length,
            persons: personsToImport.length,
            assignments: assignmentsToImport.length
          });

        } else {
          // --- FORMAT 2: Multi-Sheet Workbook ---
          const projectsToImport: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>[] = [];
          const personsToImport: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>[] = [];
          let personCounter = 1;
          const personMap = new Map<string, string>();
          const validSheetNames: string[] = [];

          for (const sheetName of sheetNames) {
            const sheet = workbook.Sheets[sheetName];
            if (!sheet) continue;

            const rawData = xlsx.utils.sheet_to_json<any>(sheet, { header: 1 });
            if (!rawData || rawData.length < 2) continue;
            
            let headerRowIndex = 0;
            if (rawData[0] && rawData[0][0] && typeof rawData[0][0] === 'string' && rawData[0][0].includes('PART-1')) {
              headerRowIndex = 1;
            }
            
            const headers = (rawData[headerRowIndex] || []) as string[];
            if (!headers || headers.length === 0) continue;

            const rows = rawData.slice(headerRowIndex + 1);
            const firstRow = rows.find(r => r && Array.isArray(r) && r.some(cell => cell !== undefined && cell !== null && String(cell).trim() !== ''));
            
            const dspIdx = headers.findIndex(h => h && typeof h === 'string' && h.toLowerCase().includes('dsp'));
            const ciIdx = headers.findIndex(h => h && typeof h === 'string' && (h.toLowerCase().includes('ci') || h.toLowerCase().includes('inspector') || h.toLowerCase() === 'ri'));
            const siIdx = headers.findIndex(h => h && typeof h === 'string' && (h.toLowerCase().includes('si') || h.toLowerCase() === 'rsi') && !h.toLowerCase().includes('ci'));
            const spIdx = headers.findIndex(h => h && typeof h === 'string' && (h.toLowerCase() === 'sp' || h.toLowerCase() === 'sp ts'));
            const addlSpIdx = headers.findIndex(h => h && typeof h === 'string' && h.toLowerCase().includes('addl. sp'));

            const hierarchy = {
              igp: 'IGP (Tech Services)',
              sp: (firstRow && spIdx >= 0 && firstRow[spIdx]) ? cleanStr(firstRow[spIdx]) : '',
              addlSp: (firstRow && addlSpIdx >= 0 && firstRow[addlSpIdx]) ? cleanStr(firstRow[addlSpIdx]) : '',
              dsp: (firstRow && dspIdx >= 0 && firstRow[dspIdx]) ? cleanStr(firstRow[dspIdx]) : '',
              ci: (firstRow && ciIdx >= 0 && firstRow[ciIdx]) ? cleanStr(firstRow[ciIdx]) : '',
              si: (firstRow && siIdx >= 0 && firstRow[siIdx]) ? cleanStr(firstRow[siIdx]) : '',
            };

            projectsToImport.push({
              name: sheetName.trim(),
              description: `Tech Services Project: ${sheetName.trim()}`,
              status: 'Active',
              hierarchy
            });
            validSheetNames.push(sheetName);

            const nameIdx = headers.findIndex(h => h && typeof h === 'string' && h.toLowerCase().includes('name') && !h.toLowerCase().includes('workstream') && !h.toLowerCase().includes('project'));
            const rankIdx = headers.findIndex(h => h && typeof h === 'string' && h.toLowerCase().includes('rank'));
            const genNoIdx = headers.findIndex(h => h && typeof h === 'string' && (h.toLowerCase().includes('gen no') || h.toLowerCase().includes('gen_no') || h.toLowerCase().includes('gen')));
            const deputationIdx = headers.findIndex(h => h && typeof h === 'string' && (h.toLowerCase().includes('deputation') || h.toLowerCase().includes('attachment') || h.toLowerCase().includes('sourcing')));
            const workingSinceIdx = headers.findIndex(h => h && typeof h === 'string' && h.toLowerCase().includes('working since'));

            if (nameIdx >= 0) {
              for (const row of rows) {
                if (!row || !Array.isArray(row)) continue;
                const rawName = row[nameIdx];
                if (!rawName || typeof rawName !== 'string' || rawName.trim() === '' || rawName.toLowerCase().includes('name')) continue;

                const name = cleanStr(rawName);
                if (!name) continue;

                if (!personMap.has(name)) {
                  const proId = `PRO-${String(personCounter).padStart(3, '0')}`;
                  personCounter++;
                  personMap.set(name, proId);
                  
                  personsToImport.push({
                    proId,
                    name,
                    rank: rankIdx >= 0 && row[rankIdx] ? cleanStr(row[rankIdx]) : 'Other',
                    genNo: genNoIdx >= 0 && row[genNoIdx] ? cleanStr(row[genNoIdx]) : '',
                    deputationType: deputationIdx >= 0 && row[deputationIdx] ? cleanStr(row[deputationIdx]) as any : 'Deputation',
                    workingSince: workingSinceIdx >= 0 && row[workingSinceIdx] ? cleanStr(row[workingSinceIdx]) : '',
                    status: 'Active'
                  });
                }
              }
            }
          }

          const projectIds = await batchImportProjects(projectsToImport);
          const personIds = await batchImportPersons(personsToImport);
          await setPersonCounter(personCounter - 1);

          const projectMap = new Map<string, string>();
          validSheetNames.forEach((sheetName, idx) => {
            projectMap.set(sheetName, projectIds[idx]);
          });

          const actualPersonMap = new Map<string, string>();
          personsToImport.forEach((p, idx) => {
            actualPersonMap.set(p.name, personIds[idx]);
          });

          const assignmentsToImport: Omit<Assignment, 'id'>[] = [];

          for (const sheetName of validSheetNames) {
            const sheet = workbook.Sheets[sheetName];
            if (!sheet) continue;

            const rawData = xlsx.utils.sheet_to_json<any>(sheet, { header: 1 });
            if (!rawData || rawData.length < 2) continue;
            
            let headerRowIndex = 0;
            if (rawData[0] && rawData[0][0] && typeof rawData[0][0] === 'string' && rawData[0][0].includes('PART-1')) {
              headerRowIndex = 1;
            }
            
            const headers = (rawData[headerRowIndex] || []) as string[];
            if (!headers || headers.length === 0) continue;

            const rows = rawData.slice(headerRowIndex + 1);
            const currentProjectId = projectMap.get(sheetName);
            if (!currentProjectId) continue;

            const nameIdx = headers.findIndex(h => h && typeof h === 'string' && h.toLowerCase().includes('name') && !h.toLowerCase().includes('workstream') && !h.toLowerCase().includes('project'));
            const workstreamNameIdx = headers.findIndex(h => h && typeof h === 'string' && (h.toLowerCase().includes('workstream name') || h.toLowerCase() === 'workstream_name'));
            const workstreamDescIdx = headers.findIndex(h => h && typeof h === 'string' && (h.toLowerCase().includes('workstream description') || h.toLowerCase() === 'workstream_description'));
            const allocationIdx = headers.findIndex(h => h && typeof h === 'string' && h.toLowerCase().includes('allocation'));
            const functionalRoleIdx = headers.findIndex(h => h && typeof h === 'string' && (h.toLowerCase().includes('functional role') || h.toLowerCase().includes('functional_role')));
            const raciIdx = headers.findIndex(h => h && typeof h === 'string' && h.toLowerCase().includes('raci'));

            const dspIdx = headers.findIndex(h => h && typeof h === 'string' && h.toLowerCase().includes('dsp'));
            const ciIdx = headers.findIndex(h => h && typeof h === 'string' && (h.toLowerCase().includes('ci') || h.toLowerCase().includes('inspector') || h.toLowerCase() === 'ri'));
            const siIdx = headers.findIndex(h => h && typeof h === 'string' && (h.toLowerCase().includes('si') || h.toLowerCase() === 'rsi') && !h.toLowerCase().includes('ci'));

            const firstRow = rows.find(r => r && Array.isArray(r) && r.some(cell => cell !== undefined && cell !== null));
            const supervisor = (firstRow && siIdx >= 0 && firstRow[siIdx]) 
              ? cleanStr(firstRow[siIdx]) 
              : (firstRow && ciIdx >= 0 && firstRow[ciIdx])
              ? cleanStr(firstRow[ciIdx])
              : (firstRow && dspIdx >= 0 && firstRow[dspIdx])
              ? cleanStr(firstRow[dspIdx])
              : '';

            if (nameIdx >= 0) {
              for (const row of rows) {
                if (!row || !Array.isArray(row)) continue;
                const rawName = row[nameIdx];
                if (!rawName || typeof rawName !== 'string' || rawName.trim() === '' || rawName.toLowerCase().includes('name')) continue;

                const name = cleanStr(rawName);
                const personId = actualPersonMap.get(name);
                if (!personId) continue;

                let allocation = 100;
                if (allocationIdx >= 0 && row[allocationIdx] !== undefined && row[allocationIdx] !== null) {
                  const parsed = parseFloat(String(row[allocationIdx]));
                  if (!isNaN(parsed)) {
                    allocation = parsed <= 1 ? parsed * 100 : parsed;
                  }
                }

                const rawRole = functionalRoleIdx >= 0 && row[functionalRoleIdx] ? cleanStr(row[functionalRoleIdx]) : 'User Support';
                const rawRaci = raciIdx >= 0 && row[raciIdx] ? cleanStr(row[raciIdx]) : 'Responsible';
                const workstreamName = workstreamNameIdx >= 0 && row[workstreamNameIdx] ? cleanStr(row[workstreamNameIdx]) : sheetName;
                const workstreamDesc = workstreamDescIdx >= 0 && row[workstreamDescIdx] ? cleanStr(row[workstreamDescIdx]) : '';

                assignmentsToImport.push({
                  personId,
                  projectId: currentProjectId,
                  workstreamName: workstreamName || sheetName,
                  workstreamDescription: workstreamDesc,
                  allocationPercent: Math.round(allocation),
                  functionalRole: rawRole,
                  raciType: (rawRaci.includes('Accountable') ? 'Accountable' : rawRaci.includes('Consulted') ? 'Consulted' : rawRaci.includes('Informed') ? 'Informed' : 'Responsible') as any,
                  primaryOrSupport: 'Primary',
                  reportingTo: supervisor
                });
              }
            }
          }

          if (assignmentsToImport.length > 0) {
            await batchImportAssignments(assignmentsToImport);
          }

          resolve({ 
            projects: projectsToImport.length, 
            persons: personsToImport.length, 
            assignments: assignmentsToImport.length 
          });
        }
      } catch (err) {
        console.error('Import error:', err);
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
}
