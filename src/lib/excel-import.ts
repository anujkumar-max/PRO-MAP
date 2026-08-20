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

        const projectsToImport: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>[] = [];
        const personsToImport: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>[] = [];
        
        let personCounter = 1;
        const personMap = new Map<string, string>(); // name to proId
        const validSheetNames: string[] = [];

        // 1. Process Projects and Persons
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

          // Get hierarchy from the first non-empty data row
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

          const project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
            name: sheetName.trim(),
            description: `Tech Services Project: ${sheetName.trim()}`,
            status: 'Active',
            hierarchy
          };
          projectsToImport.push(project);
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
                
                const person: Omit<Person, 'id' | 'createdAt' | 'updatedAt'> = {
                  proId,
                  name,
                  rank: rankIdx >= 0 && row[rankIdx] ? cleanStr(row[rankIdx]) : 'Other',
                  genNo: genNoIdx >= 0 && row[genNoIdx] ? cleanStr(row[genNoIdx]) : '',
                  deputationType: deputationIdx >= 0 && row[deputationIdx] ? cleanStr(row[deputationIdx]) as any : 'Deputation',
                  workingSince: workingSinceIdx >= 0 && row[workingSinceIdx] ? cleanStr(row[workingSinceIdx]) : '',
                  status: 'Active'
                };
                personsToImport.push(person);
              }
            }
          }
        }

        // 2. Batch import Projects & Persons
        const projectIds = await batchImportProjects(projectsToImport);
        const personIds = await batchImportPersons(personsToImport);
        await setPersonCounter(personCounter - 1);

        // Build name-to-actual-ID maps
        const projectMap = new Map<string, string>();
        validSheetNames.forEach((sheetName, idx) => {
          projectMap.set(sheetName, projectIds[idx]);
        });

        const actualPersonMap = new Map<string, string>();
        personsToImport.forEach((p, idx) => {
          actualPersonMap.set(p.name, personIds[idx]);
        });

        // 3. Build and batch import Assignments
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
      } catch (err) {
        console.error('Import error:', err);
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
}
