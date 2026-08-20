import * as xlsx from 'xlsx';
import { batchImportPersons, batchImportProjects, batchImportAssignments, setPersonCounter } from './firestore';
import type { Person, Project, Assignment } from '@/types';

function generateRandomId() {
  return Math.random().toString(36).substring(2, 9);
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
        const assignmentsToImport: Omit<Assignment, 'id'>[] = [];
        
        let personCounter = 1;
        const personMap = new Map<string, string>(); // name to proId

        for (const sheetName of sheetNames) {
          const sheet = workbook.Sheets[sheetName];
          const rawData = xlsx.utils.sheet_to_json<any>(sheet, { header: 1 });
          if (rawData.length < 2) continue;
          
          let headerRowIndex = 0;
          if (rawData[0][0] && typeof rawData[0][0] === 'string' && rawData[0][0].includes('PART-1')) {
            headerRowIndex = 1;
          }
          
          const headers = rawData[headerRowIndex] as string[];
          if (!headers || headers.length === 0) continue;

          const rows = rawData.slice(headerRowIndex + 1);

          // Get hierarchy from the first data row
          const firstRow = rows.find(r => r && r.length > 0);
          const hierarchy = {
            igp: 'IGP',
            sp: 'SP',
            dsp: firstRow ? firstRow[headers.findIndex(h => h && h.toLowerCase().includes('dsp'))] : '',
            ci: firstRow ? firstRow[headers.findIndex(h => h && h.toLowerCase().includes('ci') || h && h.toLowerCase().includes('inspector'))] : '',
            si: firstRow ? firstRow[headers.findIndex(h => h && h.toLowerCase().includes('si') && !h.toLowerCase().includes('ci'))] : '',
          };

          const project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
            name: sheetName,
            description: `Imported project ${sheetName}`,
            status: 'Active',
            hierarchy
          };
          projectsToImport.push(project);
          
          // Temporary project ID to link assignments
          const tempProjectId = `temp_proj_${generateRandomId()}`;

          const nameIdx = headers.findIndex(h => h && typeof h === 'string' && h.toLowerCase().includes('name') && !h.toLowerCase().includes('workstream'));
          const rankIdx = headers.findIndex(h => h && typeof h === 'string' && h.toLowerCase() === 'rank');
          const genNoIdx = headers.findIndex(h => h && typeof h === 'string' && (h.toLowerCase() === 'gen no' || h.toLowerCase() === 'gen_no'));
          const deputationIdx = headers.findIndex(h => h && typeof h === 'string' && h.toLowerCase().includes('deputation'));
          const workingSinceIdx = headers.findIndex(h => h && typeof h === 'string' && h.toLowerCase().includes('working since'));
          
          const workstreamNameIdx = headers.findIndex(h => h && typeof h === 'string' && h.toLowerCase().includes('workstream name'));
          const workstreamDescIdx = headers.findIndex(h => h && typeof h === 'string' && h.toLowerCase().includes('workstream description'));
          const allocationIdx = headers.findIndex(h => h && typeof h === 'string' && h.toLowerCase().includes('allocation'));
          const functionalRoleIdx = headers.findIndex(h => h && typeof h === 'string' && h.toLowerCase().includes('functional role'));
          const raciIdx = headers.findIndex(h => h && typeof h === 'string' && h.toLowerCase() === 'raci');

          for (const row of rows) {
            if (!row || row.length === 0 || !row[nameIdx]) continue;

            const name = row[nameIdx];
            let proId = personMap.get(name);
            let tempPersonId = `temp_pers_${name}`;
            
            if (!proId) {
              proId = `PRO-${String(personCounter).padStart(3, '0')}`;
              personCounter++;
              personMap.set(name, proId);
              
              const person: Omit<Person, 'id' | 'createdAt' | 'updatedAt'> = {
                proId,
                name,
                rank: rankIdx >= 0 ? row[rankIdx] || 'Other' : 'Other',
                genNo: genNoIdx >= 0 ? row[genNoIdx] || '' : '',
                deputationType: deputationIdx >= 0 ? row[deputationIdx] || '' : '',
                workingSince: workingSinceIdx >= 0 ? row[workingSinceIdx]?.toString() || '' : '',
                status: 'Active'
              };
              personsToImport.push(person);
            }

            let allocation = allocationIdx >= 0 ? parseFloat(row[allocationIdx]) : 100;
            if (isNaN(allocation)) allocation = 100;
            if (allocation <= 1) allocation = allocation * 100; // handle 0.x format

            const assignment: Omit<Assignment, 'id'> = {
              personId: tempPersonId,
              projectId: tempProjectId,
              workstreamName: workstreamNameIdx >= 0 ? row[workstreamNameIdx] || 'General' : 'General',
              workstreamDescription: workstreamDescIdx >= 0 ? row[workstreamDescIdx] || '' : '',
              allocationPercent: allocation,
              functionalRole: functionalRoleIdx >= 0 ? row[functionalRoleIdx] || 'Developer/Engineer' : 'Developer/Engineer',
              raciType: raciIdx >= 0 ? row[raciIdx] || 'Responsible' : 'Responsible',
              primaryOrSupport: 'Primary',
              reportingTo: hierarchy.si || hierarchy.ci || hierarchy.dsp || ''
            };
            assignmentsToImport.push(assignment);
          }
        }

        // Upload projects
        const projectIds = await batchImportProjects(projectsToImport);
        
        // Upload persons
        const personIds = await batchImportPersons(personsToImport);
        await setPersonCounter(personCounter - 1);
        
        // Map temp IDs to actual IDs for assignments
        const projectMap = new Map(); // sheetname to actual ID
        projectsToImport.forEach((p, idx) => projectMap.set(p.name, projectIds[idx]));
        
        const actualPersonMap = new Map(); // name to actual ID
        personsToImport.forEach((p, idx) => actualPersonMap.set(p.name, personIds[idx]));

        const finalAssignments = assignmentsToImport.map(a => {
          const personName = a.personId.replace('temp_pers_', '');
          // Need to find original sheetname for project. We use a naive approach here since tempProjectId logic is lost in the loop context.
          // Better approach: track indices.
          return {
            ...a,
            personId: actualPersonMap.get(personName) || a.personId,
            projectId: projectIds[0], // Simplified, actual logic needs sheet to projectId mapping properly
          };
        });
        
        // Let's fix assignment mapping properly. 
        // We'll reset assignment creation.
        const properAssignmentsToImport: Omit<Assignment, 'id'>[] = [];
        let pIndex = 0;
        for (const sheetName of sheetNames) {
           const sheet = workbook.Sheets[sheetName];
           const rawData = xlsx.utils.sheet_to_json<any>(sheet, { header: 1 });
           if (rawData.length < 2) continue;
           let headerRowIndex = 0;
           if (rawData[0][0] && typeof rawData[0][0] === 'string' && rawData[0][0].includes('PART-1')) headerRowIndex = 1;
           const headers = rawData[headerRowIndex] as string[];
           if (!headers || headers.length === 0) continue;
           const rows = rawData.slice(headerRowIndex + 1);

           const nameIdx = headers.findIndex(h => h && typeof h === 'string' && h.toLowerCase().includes('name') && !h.toLowerCase().includes('workstream'));
           const workstreamNameIdx = headers.findIndex(h => h && typeof h === 'string' && h.toLowerCase().includes('workstream name'));
           const workstreamDescIdx = headers.findIndex(h => h && typeof h === 'string' && h.toLowerCase().includes('workstream description'));
           const allocationIdx = headers.findIndex(h => h && typeof h === 'string' && h.toLowerCase().includes('allocation'));
           const functionalRoleIdx = headers.findIndex(h => h && typeof h === 'string' && h.toLowerCase().includes('functional role'));
           const raciIdx = headers.findIndex(h => h && typeof h === 'string' && h.toLowerCase() === 'raci');

           for (const row of rows) {
             if (!row || row.length === 0 || !row[nameIdx]) continue;
             const name = row[nameIdx];
             const personId = actualPersonMap.get(name);
             if (!personId) continue;
             
             let allocation = allocationIdx >= 0 ? parseFloat(row[allocationIdx]) : 100;
             if (isNaN(allocation)) allocation = 100;
             if (allocation <= 1) allocation = allocation * 100;

             properAssignmentsToImport.push({
               personId,
               projectId: projectIds[pIndex],
               workstreamName: workstreamNameIdx >= 0 ? row[workstreamNameIdx] || 'General' : 'General',
               workstreamDescription: workstreamDescIdx >= 0 ? row[workstreamDescIdx] || '' : '',
               allocationPercent: allocation,
               functionalRole: functionalRoleIdx >= 0 ? row[functionalRoleIdx] || 'Developer/Engineer' : 'Developer/Engineer',
               raciType: raciIdx >= 0 ? row[raciIdx] || 'Responsible' : 'Responsible',
               primaryOrSupport: 'Primary',
               reportingTo: ''
             });
           }
           pIndex++;
        }

        await batchImportAssignments(properAssignmentsToImport);

        resolve({ projects: projectsToImport.length, persons: personsToImport.length, assignments: properAssignmentsToImport.length });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
}
