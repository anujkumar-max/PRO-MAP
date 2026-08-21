'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePersons, useProjects, useAssignments } from '@/lib/hooks/useRealtimeData';
import { AlertTriangle, Users, Search, X, CheckCircle2, ArrowRight, ShieldCheck, TrendingDown, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RiskMatrixPage() {
  const { data: persons, loading: loadingPersons } = usePersons();
  const { data: projects, loading: loadingProjects } = useProjects();
  const { data: assignments, loading: loadingAssignments } = useAssignments();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'overallocated' | 'underutilised'>('all');

  const loading = loadingPersons || loadingProjects || loadingAssignments;

  const { overallocated, underutilised, optimalCount } = useMemo(() => {
    if (loading) return { overallocated: [], underutilised: [], optimalCount: 0 };

    const projectMap = new Map(projects.map(p => [p.id, p]));
    const personMap = new Map(persons.map(p => [p.id, p]));

    // Group assignments by person
    const personAssignmentsMap = new Map<string, typeof assignments>();
    assignments.forEach(a => {
      const existing = personAssignmentsMap.get(a.personId) || [];
      existing.push(a);
      personAssignmentsMap.set(a.personId, existing);
    });

    const overallocatedList: any[] = [];
    const underutilisedList: any[] = [];
    let optimal = 0;

    persons.forEach(person => {
      const pAssigns = personAssignmentsMap.get(person.id) || [];
      const totalAlloc = pAssigns.reduce((sum, a) => sum + a.allocationPercent, 0);

      const record = {
        personId: person.id,
        proId: person.proId,
        personName: person.name,
        rank: person.rank,
        genNo: person.genNo,
        deputationType: person.deputationType,
        totalAllocation: totalAlloc,
        projectCount: pAssigns.length,
        assignments: pAssigns.map(a => ({
          projectId: a.projectId,
          projectName: projectMap.get(a.projectId)?.name || 'Project',
          workstreamName: a.workstreamName,
          allocationPercent: a.allocationPercent,
          functionalRole: a.functionalRole,
          raciType: a.raciType
        }))
      };

      if (totalAlloc > 100) {
        overallocatedList.push(record);
      } else if (totalAlloc < 100) {
        underutilisedList.push(record);
      } else {
        optimal++;
      }
    });

    // Sort: highest overload first, lowest allocation first
    overallocatedList.sort((a, b) => b.totalAllocation - a.totalAllocation);
    underutilisedList.sort((a, b) => a.totalAllocation - b.totalAllocation);

    return { 
      overallocated: overallocatedList, 
      underutilised: underutilisedList,
      optimalCount: optimal 
    };
  }, [persons, projects, assignments, loading]);

  // Filter based on search query
  const filteredOverallocated = useMemo(() => {
    if (!searchQuery.trim()) return overallocated;
    const q = searchQuery.toLowerCase().trim();
    return overallocated.filter(p => 
      p.personName.toLowerCase().includes(q) ||
      p.proId.toLowerCase().includes(q) ||
      p.rank.toLowerCase().includes(q) ||
      p.assignments.some((a: any) => a.projectName.toLowerCase().includes(q))
    );
  }, [overallocated, searchQuery]);

  const filteredUnderutilised = useMemo(() => {
    if (!searchQuery.trim()) return underutilised;
    const q = searchQuery.toLowerCase().trim();
    return underutilised.filter(p => 
      p.personName.toLowerCase().includes(q) ||
      p.proId.toLowerCase().includes(q) ||
      p.rank.toLowerCase().includes(q) ||
      p.assignments.some((a: any) => a.projectName.toLowerCase().includes(q))
    );
  }, [underutilised, searchQuery]);

  if (loading) {
    return <div className="p-8 text-slate-400 text-center">Analyzing workload &amp; capacity risks...</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 text-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-amber-300 to-emerald-400">
            Risk Matrix: Workload &amp; Capacity
          </h1>
          <p className="text-slate-400 mt-1">
            Real-time audit of cumulative overallocations and spare productive capacity across all 35 departmental initiatives.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => setActiveTab('overallocated')}
          className={cn(
            "bg-red-500/10 backdrop-blur-xl border rounded-2xl p-5 cursor-pointer transition-all hover:bg-red-500/15 shadow-lg",
            activeTab === 'overallocated' ? "border-red-500 ring-1 ring-red-500/50" : "border-red-500/20"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider font-bold text-red-400 flex items-center gap-1.5">
              <AlertTriangle size={14} /> Overallocation Risks
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-mono font-semibold">
              &gt; 100% Alloc
            </span>
          </div>
          <div className="text-3xl font-extrabold text-red-400">{overallocated.length}</div>
          <p className="text-xs text-red-300/70 mt-1">Personnel exceeding 100% workload capacity</p>
        </div>

        <div 
          onClick={() => setActiveTab('underutilised')}
          className={cn(
            "bg-amber-500/10 backdrop-blur-xl border rounded-2xl p-5 cursor-pointer transition-all hover:bg-amber-500/15 shadow-lg",
            activeTab === 'underutilised' ? "border-amber-500 ring-1 ring-amber-500/50" : "border-amber-500/20"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider font-bold text-amber-400 flex items-center gap-1.5">
              <Users size={14} /> Underutilisation
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-semibold">
              &lt; 100% Alloc
            </span>
          </div>
          <div className="text-3xl font-extrabold text-amber-400">{underutilised.length}</div>
          <p className="text-xs text-amber-300/70 mt-1">Personnel with available spare productive capacity</p>
        </div>

        <div 
          onClick={() => setActiveTab('all')}
          className={cn(
            "bg-emerald-500/10 backdrop-blur-xl border rounded-2xl p-5 cursor-pointer transition-all hover:bg-emerald-500/15 shadow-lg",
            activeTab === 'all' ? "border-emerald-500 ring-1 ring-emerald-500/50" : "border-emerald-500/20"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 size={14} /> Balanced &amp; Optimal
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-semibold">
              = 100% Alloc
            </span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{optimalCount}</div>
          <p className="text-xs text-emerald-300/70 mt-1">Personnel operating at exactly 100% capacity</p>
        </div>
      </div>

      {/* Search and Section Tabs */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              "px-3.5 py-1.5 rounded-lg font-semibold transition-all",
              activeTab === 'all' ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
            )}
          >
            Show All Sections
          </button>
          <button
            onClick={() => setActiveTab('overallocated')}
            className={cn(
              "px-3.5 py-1.5 rounded-lg font-semibold transition-all",
              activeTab === 'overallocated' ? "bg-red-600 text-white shadow" : "text-slate-400 hover:text-white"
            )}
          >
            Overallocation ({overallocated.length})
          </button>
          <button
            onClick={() => setActiveTab('underutilised')}
            className={cn(
              "px-3.5 py-1.5 rounded-lg font-semibold transition-all",
              activeTab === 'underutilised' ? "bg-amber-600 text-white shadow" : "text-slate-400 hover:text-white"
            )}
          >
            Underutilisation ({underutilised.length})
          </button>
        </div>

        <div className="relative max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by officer name, PRO-ID, rank, or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main 2-Section Grid */}
      <div className={cn(
        "grid gap-8",
        activeTab === 'all' ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
      )}>

        {/* SECTION 1: OVERALLOCATION RISKS */}
        {(activeTab === 'all' || activeTab === 'overallocated') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-red-500/20 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-500/20 rounded-xl text-red-400">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Overallocation Risks (&gt;100%)</h2>
                  <p className="text-xs text-slate-400">Officers assigned more capacity than available.</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-mono font-bold">
                {filteredOverallocated.length} Critical
              </span>
            </div>

            {filteredOverallocated.length === 0 ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-base font-bold text-emerald-300">No Overallocation Risks Detected</h3>
                <p className="text-xs text-emerald-200/70 max-w-md mx-auto">
                  All active technical officers are currently operating within balanced 100% capacity limits across all projects.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOverallocated.map(person => (
                  <div 
                    key={person.personId} 
                    className="bg-red-500/5 backdrop-blur-xl border border-red-500/20 rounded-2xl p-5 space-y-4 hover:border-red-500/40 transition-all shadow-md"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link 
                            href={`/people/detail?id=${person.personId}`}
                            className="text-base font-bold text-white hover:text-blue-300 transition-colors"
                          >
                            {person.personName}
                          </Link>
                          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-mono text-[11px] font-semibold">
                            {person.proId}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Rank: <span className="text-slate-200 font-medium">{person.rank}</span>
                          {person.genNo && <span className="text-slate-400"> (Gen: {person.genNo})</span>}
                          {person.deputationType && <span> • {person.deputationType}</span>}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-mono font-extrabold text-red-400">
                          {person.totalAllocation}%
                        </div>
                        <span className="text-[10px] text-red-300/80 uppercase font-semibold tracking-wider">
                          +{person.totalAllocation - 100}% Overloaded
                        </span>
                      </div>
                    </div>

                    {/* Assigned Project Breakdown */}
                    <div className="space-y-2 pt-2 border-t border-red-500/10">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Layers size={12} /> Active Project Deployments ({person.assignments.length}):
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {person.assignments.map((a: any, idx: number) => (
                          <div key={idx} className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                            <Link 
                              href={`/projects?id=${a.projectId}`}
                              className="font-medium text-slate-200 hover:text-blue-400 transition-colors truncate max-w-[180px]"
                              title={a.projectName}
                            >
                              📁 {a.projectName}
                            </Link>
                            <span className="font-mono font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                              {a.allocationPercent}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendation Box */}
                    <div className="bg-red-950/40 p-3 rounded-xl border border-red-500/20 text-xs">
                      <span className="text-red-400 font-bold uppercase tracking-wider block mb-0.5 text-[10px]">Recommended Action</span>
                      <p className="text-red-200/80">
                        Rebalance workload by transferring {(person.totalAllocation - 100)}% of tasks to available support staff.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: UNDERUTILISATION RISKS */}
        {(activeTab === 'all' || activeTab === 'underutilised') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400">
                  <Users size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Underutilisation &amp; Spare Capacity (&lt;100%)</h2>
                  <p className="text-xs text-slate-400">Officers with available capacity for new deliverables.</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-mono font-bold">
                {filteredUnderutilised.length} Available
              </span>
            </div>

            {filteredUnderutilised.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center space-y-2">
                <p className="text-sm text-slate-400">No underutilised personnel matching filter.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUnderutilised.map(person => {
                  const spareCapacity = 100 - person.totalAllocation;

                  return (
                    <div 
                      key={person.personId} 
                      className="bg-amber-500/5 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-5 space-y-4 hover:border-amber-500/40 transition-all shadow-md"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Link 
                              href={`/people/detail?id=${person.personId}`}
                              className="text-base font-bold text-white hover:text-blue-300 transition-colors"
                            >
                              {person.personName}
                            </Link>
                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-mono text-[11px] font-semibold">
                              {person.proId}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            Rank: <span className="text-slate-200 font-medium">{person.rank}</span>
                            {person.genNo && <span className="text-slate-400"> (Gen: {person.genNo})</span>}
                            {person.deputationType && <span> • {person.deputationType}</span>}
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-mono font-extrabold text-amber-400">
                            {person.totalAllocation}%
                          </div>
                          <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
                            {spareCapacity}% Spare Capacity
                          </span>
                        </div>
                      </div>

                      {/* Assigned Project Breakdown */}
                      <div className="space-y-2 pt-2 border-t border-amber-500/10">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Layers size={12} /> Assigned Projects ({person.assignments.length}):
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {person.assignments.map((a: any, idx: number) => (
                            <div key={idx} className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                              <Link 
                                href={`/projects?id=${a.projectId}`}
                                className="font-medium text-slate-200 hover:text-blue-400 transition-colors truncate max-w-[180px]"
                                title={a.projectName}
                              >
                                📁 {a.projectName}
                              </Link>
                              <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                {a.allocationPercent}%
                              </span>
                            </div>
                          ))}
                          {person.assignments.length === 0 && (
                            <div className="col-span-2 text-xs text-slate-500 italic p-2 bg-slate-900/50 rounded-lg">
                              No project assignments currently mapped.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Recommendation Box */}
                      <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-500/20 text-xs">
                        <span className="text-amber-400 font-bold uppercase tracking-wider block mb-0.5 text-[10px]">Resource Opportunity</span>
                        <p className="text-amber-200/80">
                          Deploy available spare capacity of {spareCapacity}% to heavy initiatives or new tech projects.
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
