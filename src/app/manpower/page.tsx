'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePersons, useAssignments, useProjects } from '@/lib/hooks/useRealtimeData';
import { createPerson } from '@/lib/firestore';
import { cn } from '@/lib/utils';
import { Search, Plus, Filter, Download } from 'lucide-react';
import { RankRoleBadge } from '@/components/common/RankRoleBadge';

export default function ManpowerPage() {
  const { data: persons, loading: personsLoading } = usePersons();
  const { data: assignments, loading: assignLoading } = useAssignments();
  const { data: projects, loading: projLoading } = useProjects();
  
  const [search, setSearch] = useState('');
  const [showAddPerson, setShowAddPerson] = useState(false);
  
  const [personForm, setPersonForm] = useState({
    name: '',
    rank: 'PC',
    genNo: '',
    deputationType: 'Deputation' as any,
    workingSince: new Date().toISOString().split('T')[0]
  });

  const loading = personsLoading || assignLoading || projLoading;

  // Flatten assignments with person data for table
  const matrixData = assignments.map(a => {
    const person = persons.find(p => p.id === a.personId);
    const project = projects.find(p => p.id === a.projectId);
    const personAssignments = assignments.filter(assign => assign.personId === a.personId);
    const totalAlloc = personAssignments.reduce((sum, curr) => sum + curr.allocationPercent, 0);
    
    return {
      assignmentId: a.id,
      personId: a.personId,
      projectId: a.projectId,
      proId: person?.proId || '-',
      personName: person?.name || '-',
      rank: person?.rank || '-',
      projectCode: project?.code || '',
      projectName: project?.name || '-',
      workstream: a.workstreamName,
      allocation: a.allocationPercent,
      totalAllocation: totalAlloc,
      role: a.functionalRole,
      raci: a.raciType,
      reportingTo: a.reportingTo || '-',
    };
  }).filter(row => 
    row.personName.toLowerCase().includes(search.toLowerCase()) || 
    row.projectName.toLowerCase().includes(search.toLowerCase()) ||
    row.projectCode.toLowerCase().includes(search.toLowerCase()) ||
    row.proId.toLowerCase().includes(search.toLowerCase())
  );

  // Compute stats
  const uniquePersons = new Set(assignments.map(a => a.personId));
  const overAllocated = new Set(matrixData.filter(d => d.totalAllocation > 100).map(d => d.proId)).size;
  const underAllocated = new Set(matrixData.filter(d => d.totalAllocation < 100).map(d => d.proId)).size;
  
  const avgAlloc = uniquePersons.size > 0 
    ? assignments.reduce((acc, a) => acc + a.allocationPercent, 0) / uniquePersons.size
    : 0;

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPerson(personForm);
    setShowAddPerson(false);
    setPersonForm({
      name: '',
      rank: 'PC',
      genNo: '',
      deputationType: 'Deputation',
      workingSince: new Date().toISOString().split('T')[0]
    });
  };

  if (loading) return <div className="p-8 text-slate-400">Loading manpower data...</div>;

  return (
    <div className="p-6 md:p-8 text-white min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Manpower Matrix
          </h1>
          <p className="text-slate-400 mt-1">Full-Time Equivalent Analysis</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white font-medium transition-colors border border-slate-700">
            <Download className="w-5 h-5" /> Export
          </button>
          <button 
            onClick={() => setShowAddPerson(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors"
          >
            <Plus className="w-5 h-5" /> Add Person
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <div className="text-slate-400 text-sm mb-1">Total Assigned Persons</div>
          <div className="text-2xl font-semibold">{uniquePersons.size}</div>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <div className="text-slate-400 text-sm mb-1">Avg Allocation</div>
          <div className="text-2xl font-semibold">{avgAlloc.toFixed(1)}%</div>
        </div>
        <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20">
          <div className="text-red-400 text-sm mb-1">Overallocated (&gt;100%)</div>
          <div className="text-2xl font-semibold text-red-400">{overAllocated}</div>
        </div>
        <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
          <div className="text-amber-400 text-sm mb-1">Underallocated (&lt;100%)</div>
          <div className="text-2xl font-semibold text-amber-400">{underAllocated}</div>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, PRO-ID, or project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <button className="p-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-400 hover:text-white">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-800/80 text-slate-400">
              <tr>
                <th className="p-4 font-medium">PRO-ID</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Rank &amp; Role</th>
                <th className="p-4 font-medium">Project</th>
                <th className="p-4 font-medium">Workstream</th>
                <th className="p-4 font-medium text-right">Alloc %</th>
                <th className="p-4 font-medium text-right">Total Alloc %</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">RACI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {matrixData.map(row => (
                <tr 
                  key={row.assignmentId} 
                  className={cn(
                    "hover:bg-slate-700/50 transition-colors",
                    row.totalAllocation > 100 ? "bg-red-500/5" : row.totalAllocation < 100 ? "bg-amber-500/5" : ""
                  )}
                >
                  <td className="p-4">
                    <Link href={`/people/detail?id=${row.personId}`} className="text-blue-400 hover:underline font-mono">
                      {row.proId}
                    </Link>
                  </td>
                  <td className="p-4 font-medium">
                    <Link href={`/people/detail?id=${row.personId}`} className="text-white hover:text-blue-300 transition-colors">
                      {row.personName}
                    </Link>
                  </td>
                  <td className="p-4">
                    <RankRoleBadge rank={row.rank} />
                  </td>
                  <td className="p-4">
                    <Link href={`/projects?id=${row.projectId}`} className="text-blue-400 hover:underline font-medium flex items-center gap-1.5 flex-wrap">
                      {row.projectCode && (
                        <span className="px-1.5 py-0.2 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded font-mono text-[11px] font-semibold">
                          {row.projectCode}
                        </span>
                      )}
                      <span>{row.projectName}</span>
                    </Link>
                  </td>
                  <td className="p-4 text-slate-300">{row.workstream}</td>
                  <td className="p-4 text-right font-mono">{row.allocation}%</td>
                  <td className={cn(
                    "p-4 text-right font-medium font-mono",
                    row.totalAllocation > 100 ? "text-red-400" : row.totalAllocation < 100 ? "text-amber-400" : "text-emerald-400"
                  )}>
                    {row.totalAllocation}%
                  </td>
                  <td className="p-4 text-slate-300">{row.role}</td>
                  <td className="p-4 text-slate-300">{row.raci}</td>
                </tr>
              ))}
              {matrixData.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    No matching assignment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Person</h2>
            <form onSubmit={handleAddPerson} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Name</label>
                <input 
                  required
                  type="text"
                  value={personForm.name}
                  onChange={(e) => setPersonForm({...personForm, name: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Rank</label>
                  <input 
                    required
                    type="text"
                    value={personForm.rank}
                    onChange={(e) => setPersonForm({...personForm, rank: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Gen No</label>
                  <input 
                    type="text"
                    value={personForm.genNo}
                    onChange={(e) => setPersonForm({...personForm, genNo: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Deputation Type</label>
                <select 
                  value={personForm.deputationType}
                  onChange={(e) => setPersonForm({...personForm, deputationType: e.target.value as any})}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2"
                >
                  <option value="Deputation">Deputation</option>
                  <option value="Attachment">Attachment</option>
                  <option value="Outsourcing">Outsourcing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Working Since</label>
                <input 
                  required
                  type="date"
                  value={personForm.workingSince}
                  onChange={(e) => setPersonForm({...personForm, workingSince: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setShowAddPerson(false)} className="px-4 py-2 bg-slate-800 rounded hover:bg-slate-700 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 transition-colors">Save Person</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
