'use client';

import React, { useMemo } from 'react';
import { usePersons, useProjects, useAssignments } from '@/lib/hooks/useRealtimeData';
import { AlertTriangle, Users, AlertCircle, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RiskMatrixPage() {
  const { data: persons, loading: loadingPersons } = usePersons();
  const { data: projects, loading: loadingProjects } = useProjects();
  const { data: assignments, loading: loadingAssignments } = useAssignments();

  const loading = loadingPersons || loadingProjects || loadingAssignments;

  const risks = useMemo(() => {
    if (loading) return { keyPersons: [], overallocated: [], underutilized: [] };

    const projectMap = new Map(projects.map(p => [p.id, p]));
    const personMap = new Map(persons.map(p => [p.id, p]));

    // 1. Key Person Risks (Only 1 person per workstream per project)
    const workstreamAssignments = new Map<string, typeof assignments>();
    assignments.forEach(a => {
      const key = `${a.projectId}_${a.workstreamName}`;
      const existing = workstreamAssignments.get(key) || [];
      existing.push(a);
      workstreamAssignments.set(key, existing);
    });

    const keyPersons = Array.from(workstreamAssignments.entries())
      .filter(([, group]) => group.length === 1)
      .map(([key, group]) => {
        const a = group[0];
        return {
          id: key,
          projectId: a.projectId,
          projectName: projectMap.get(a.projectId)?.name || 'Unknown',
          workstream: a.workstreamName,
          personId: a.personId,
          personName: personMap.get(a.personId)?.name || 'Unknown',
          riskLevel: 'RED'
        };
      });

    // Allocation calculation
    const personAllocations = new Map<string, number>();
    assignments.forEach(a => {
      const current = personAllocations.get(a.personId) || 0;
      personAllocations.set(a.personId, current + a.allocationPercent);
    });

    // 2. Overallocated
    const overallocated = Array.from(personAllocations.entries())
      .filter(([, total]) => total > 100)
      .map(([personId, total]) => ({
        personId,
        personName: personMap.get(personId)?.name || 'Unknown',
        totalAllocation: total,
      }));

    // 3. Underutilized
    const underutilized = Array.from(personAllocations.entries())
      .filter(([, total]) => total < 50)
      .map(([personId, total]) => ({
        personId,
        personName: personMap.get(personId)?.name || 'Unknown',
        totalAllocation: total,
      }));

    return { keyPersons, overallocated, underutilized };
  }, [persons, projects, assignments, loading]);

  if (loading) {
    return <div className="p-8 text-slate-400 text-center">Analyzing risks...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Risk Matrix</h1>
        <p className="text-slate-400">Duplication & Dependency Analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Key Person Risks */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <ShieldAlert className="text-red-400" size={24} />
            <h2 className="text-xl font-semibold text-white">Key Person Risks</h2>
          </div>
          {risks.keyPersons.length === 0 ? (
            <p className="text-slate-500 text-sm">No critical dependencies found.</p>
          ) : (
            risks.keyPersons.map(risk => (
              <div key={risk.id} className="bg-red-500/10 border border-red-500/20 rounded-xl p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-red-100">{risk.projectName}</h3>
                  <span className="px-2 py-0.5 bg-red-500/30 text-red-300 text-xs rounded uppercase font-bold tracking-wider">Critical</span>
                </div>
                <p className="text-sm text-red-200/70 mb-4">
                  <span className="text-white font-medium">{risk.personName}</span> is the only assignee for <span className="text-white font-medium">{risk.workstream}</span>.
                </p>
                <div className="bg-red-950/50 p-3 rounded-lg border border-red-500/10">
                  <p className="text-xs text-red-400 font-medium">RECOMMENDATION</p>
                  <p className="text-sm text-red-200">Assign a backup owner to mitigate dependency risk.</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Overallocation Risks */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="text-amber-400" size={24} />
            <h2 className="text-xl font-semibold text-white">Overallocation Risks</h2>
          </div>
          {risks.overallocated.length === 0 ? (
            <p className="text-slate-500 text-sm">No overallocated personnel.</p>
          ) : (
            risks.overallocated.map(risk => (
              <div key={risk.personId} className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 flex items-start gap-4">
                <div className="p-2 bg-amber-500/20 rounded-full text-amber-400 shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-100 mb-1">{risk.personName}</h3>
                  <p className="text-sm text-amber-200/70">
                    Allocated at <span className="text-amber-400 font-bold">{risk.totalAllocation}%</span> across multiple projects. High risk of burnout and delays.
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Underutilization Risks */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="text-blue-400" size={24} />
            <h2 className="text-xl font-semibold text-white">Underutilisation</h2>
          </div>
          {risks.underutilized.length === 0 ? (
            <p className="text-slate-500 text-sm">No underutilized personnel.</p>
          ) : (
            risks.underutilized.map(risk => (
              <div key={risk.personId} className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 flex items-start gap-4">
                <div className="p-2 bg-blue-500/20 rounded-full text-blue-400 shrink-0">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-100 mb-1">{risk.personName}</h3>
                  <p className="text-sm text-blue-200/70">
                    Allocated at <span className="text-blue-400 font-bold">{risk.totalAllocation}%</span>. Available for additional assignments.
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
