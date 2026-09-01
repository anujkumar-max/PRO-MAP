'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePersonFTEs, useProjectFTEs } from '@/lib/hooks/useRealtimeData';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { cn } from '@/lib/utils';
import { Users, AlertTriangle, ChevronDown, Search, X, Filter, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { RankRoleBadge } from '@/components/common/RankRoleBadge';

export default function FTEAnalyticsPage() {
  const { data: personFTEs, loading: personsLoading } = usePersonFTEs();
  const { data: projectFTEs, loading: projectsLoading } = useProjectFTEs();
  const [expandedPerson, setExpandedPerson] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'overallocated' | 'underallocated' | 'optimal'>('all');

  const loading = personsLoading || projectsLoading;

  // Summary stats
  const totalFTE = projectFTEs.reduce((sum, p) => sum + p.effectiveFTE, 0);
  const avgAllocation = personFTEs.length > 0 ? personFTEs.reduce((sum, p) => sum + p.totalAllocation, 0) / personFTEs.length : 0;
  const overallocatedCount = personFTEs.filter(p => p.totalAllocation > 100).length;
  const underallocatedCount = personFTEs.filter(p => p.totalAllocation < 100).length;
  const optimalCount = personFTEs.filter(p => p.totalAllocation === 100).length;

  // Filtered Person FTEs based on search and status filter
  const filteredPersons = useMemo(() => {
    return personFTEs.filter(person => {
      // 1. Status Filter
      if (statusFilter === 'overallocated' && person.totalAllocation <= 100) return false;
      if (statusFilter === 'underallocated' && person.totalAllocation >= 100) return false;
      if (statusFilter === 'optimal' && person.totalAllocation !== 100) return false;

      // 2. Search Query (Matches Name, PRO-ID, Rank, or Assigned Project Names)
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase().trim();

      const matchesName = person.personName.toLowerCase().includes(query);
      const matchesProId = person.proId.toLowerCase().includes(query);
      const matchesRank = person.rank.toLowerCase().includes(query);
      const matchesProject = person.assignments.some(a => 
        a.projectName.toLowerCase().includes(query)
      );

      return matchesName || matchesProId || matchesRank || matchesProject;
    });
  }, [personFTEs, searchQuery, statusFilter]);

  if (loading) {
    return <div className="p-8 text-slate-400 text-center">Loading FTE analytics &amp; capacity data...</div>;
  }

  // Chart 1 Data (Top 10 projects by Effective FTE)
  const chart1Data = [...projectFTEs]
    .sort((a, b) => b.effectiveFTE - a.effectiveFTE)
    .slice(0, 10)
    .map(p => ({
      name: p.projectName.length > 15 ? p.projectName.substring(0, 15) + '...' : p.projectName,
      FTE: p.effectiveFTE,
      Headcount: p.headcount
    }));

  // Chart 2 Data
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#6366F1'];
  const chart2Data = chart1Data.map((d, i) => ({
    name: d.name,
    value: d.FTE,
    color: COLORS[i % COLORS.length]
  }));

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 text-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-400">
            FTE Analytics &amp; Capacity
          </h1>
          <p className="text-slate-400 mt-1">Resource allocation, capacity distribution, and personnel workload tracking.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setStatusFilter('all')}
          className={cn(
            "bg-white/5 backdrop-blur-xl border rounded-2xl p-5 cursor-pointer transition-all hover:bg-white/10",
            statusFilter === 'all' ? "border-blue-500/60 ring-1 ring-blue-500/40" : "border-white/10"
          )}
        >
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-1 font-semibold">Total Effective FTE</p>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-bold text-white">{totalFTE.toFixed(1)}</p>
            <span className="text-xs text-slate-400 font-mono">{personFTEs.length} Officers</span>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('optimal')}
          className={cn(
            "bg-emerald-500/10 backdrop-blur-xl border rounded-2xl p-5 cursor-pointer transition-all hover:bg-emerald-500/15",
            statusFilter === 'optimal' ? "border-emerald-500 ring-1 ring-emerald-500/50" : "border-emerald-500/20"
          )}
        >
          <p className="text-emerald-400 text-xs uppercase tracking-wider mb-1 font-semibold flex items-center gap-1.5">
            <CheckCircle2 size={14} /> Optimal (100% Alloc)
          </p>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-bold text-emerald-400">{optimalCount}</p>
            <span className="text-xs text-emerald-300/70 font-mono">{((optimalCount / personFTEs.length) * 100).toFixed(0)}% of staff</span>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('overallocated')}
          className={cn(
            "bg-red-500/10 backdrop-blur-xl border rounded-2xl p-5 cursor-pointer transition-all hover:bg-red-500/15",
            statusFilter === 'overallocated' ? "border-red-500 ring-1 ring-red-500/50" : "border-red-500/20"
          )}
        >
          <p className="text-red-400 text-xs uppercase tracking-wider mb-1 font-semibold flex items-center gap-1.5">
            <AlertTriangle size={14} /> Overallocated (&gt;100%)
          </p>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-bold text-red-400">{overallocatedCount}</p>
            <span className="text-xs text-red-300/70 font-mono">Needs rebalancing</span>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('underallocated')}
          className={cn(
            "bg-amber-500/10 backdrop-blur-xl border rounded-2xl p-5 cursor-pointer transition-all hover:bg-amber-500/15",
            statusFilter === 'underallocated' ? "border-amber-500 ring-1 ring-amber-500/50" : "border-amber-500/20"
          )}
        >
          <p className="text-amber-400 text-xs uppercase tracking-wider mb-1 font-semibold flex items-center gap-1.5">
            <Users size={14} /> Underallocated (&lt;100%)
          </p>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-bold text-amber-400">{underallocatedCount}</p>
            <span className="text-xs text-amber-300/70 font-mono">Spare capacity</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-[380px] flex flex-col">
          <h2 className="text-base font-bold text-white mb-4">Effective FTE vs Headcount (Top 10 Projects)</h2>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart1Data} layout="vertical" margin={{ top: 0, right: 20, left: 40, bottom: 0 }}>
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={100} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="FTE" fill="#3B82F6" radius={[0, 4, 4, 0]} name="Effective FTE" />
                <Bar dataKey="Headcount" fill="#64748b" radius={[0, 4, 4, 0]} name="Headcount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-[380px] flex flex-col">
          <h2 className="text-base font-bold text-white mb-4">Top 10 Projects Capacity Distribution</h2>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chart2Data}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chart2Data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Personnel Table with Search and Filters */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        {/* Table Header & Search Controls */}
        <div className="p-6 border-b border-white/10 space-y-4">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Personnel Allocation &amp; FTE Breakdown</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Showing <span className="text-blue-400 font-semibold">{filteredPersons.length}</span> of {personFTEs.length} officers
              </p>
            </div>

            {/* Quick Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-medium transition-all",
                  statusFilter === 'all' ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
                )}
              >
                All ({personFTEs.length})
              </button>
              <button
                onClick={() => setStatusFilter('optimal')}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-medium transition-all",
                  statusFilter === 'optimal' ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"
                )}
              >
                Optimal ({optimalCount})
              </button>
              <button
                onClick={() => setStatusFilter('overallocated')}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-medium transition-all",
                  statusFilter === 'overallocated' ? "bg-red-600 text-white shadow" : "text-slate-400 hover:text-white"
                )}
              >
                Overallocated ({overallocatedCount})
              </button>
              <button
                onClick={() => setStatusFilter('underallocated')}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-medium transition-all",
                  statusFilter === 'underallocated' ? "bg-amber-600 text-white shadow" : "text-slate-400 hover:text-white"
                )}
              >
                Underallocated ({underallocatedCount})
              </button>
            </div>
          </div>

          {/* Search Bar Input */}
          <div className="relative max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by officer name, PRO-ID (e.g. PRO-001), rank, or project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-800/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-700">
                <th className="p-3.5">PRO-ID</th>
                <th className="p-3.5">Officer Name</th>
                <th className="p-3.5">Rank &amp; Role</th>
                <th className="p-3.5 text-right">Total Alloc %</th>
                <th className="p-3.5 text-right">FTE Value</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Projects</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredPersons.map((person) => {
                const isOver = person.totalAllocation > 100;
                const isUnder = person.totalAllocation < 100;
                const isExpanded = expandedPerson === person.personId;

                return (
                  <React.Fragment key={person.personId}>
                    <tr 
                      className={cn(
                        "hover:bg-slate-800/40 cursor-pointer transition-colors",
                        isOver && "bg-red-500/5",
                        isUnder && "bg-amber-500/5"
                      )}
                      onClick={() => setExpandedPerson(isExpanded ? null : person.personId)}
                    >
                      <td className="p-3.5">
                        <Link 
                          href={`/people/detail?id=${person.personId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-md font-mono font-bold transition-colors inline-block"
                        >
                          {person.proId}
                        </Link>
                      </td>
                      <td className="p-3.5 font-bold text-white">
                        <Link 
                          href={`/people/detail?id=${person.personId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-blue-300 transition-colors inline-flex items-center gap-1.5"
                        >
                          {person.personName}
                          <ArrowUpRight className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </td>
                      <td className="p-3.5">
                        <RankRoleBadge rank={person.rank} />
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold">
                        <span className={cn(
                          "px-2 py-0.5 rounded",
                          isOver ? "bg-red-500/20 text-red-400" : isUnder ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                        )}>
                          {person.totalAllocation}%
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono text-slate-300">
                        {(person.totalAllocation / 100).toFixed(2)}
                      </td>
                      <td className="p-3.5 text-center">
                        {isOver ? (
                          <span className="px-2.5 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-[11px] font-semibold">
                            Overallocated
                          </span>
                        ) : isUnder ? (
                          <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-[11px] font-semibold">
                            Underallocated
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[11px] font-semibold">
                            Optimal (100%)
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center text-slate-400">
                        <span className="bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700 text-[11px]">
                          {person.assignments.length} {person.assignments.length === 1 ? 'project' : 'projects'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center text-slate-400">
                        <button 
                          className="p-1 hover:bg-slate-700 rounded-lg transition-colors text-slate-300"
                          title="View project breakdown"
                        >
                          <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isExpanded && "rotate-180 text-blue-400")} />
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Project Breakdown */}
                    {isExpanded && (
                      <tr className="bg-slate-900/70 border-y border-slate-800">
                        <td colSpan={8} className="p-4">
                          <div className="ml-4 md:ml-8 pl-4 border-l-2 border-blue-500/40 space-y-2.5">
                            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                              Assigned Projects &amp; Workload Distribution for {person.personName}:
                            </div>
                            {person.assignments.length === 0 ? (
                              <p className="text-xs text-slate-500 italic">No active project assignments recorded.</p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl">
                                {person.assignments.map((assignment, idx) => (
                                  <div 
                                    key={idx} 
                                    className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex justify-between items-center gap-3"
                                  >
                                    <Link 
                                      href={`/projects?id=${assignment.projectId}`}
                                      className="text-xs font-semibold text-white hover:text-blue-400 transition-colors line-clamp-1 flex-1 flex items-center gap-1.5 flex-wrap"
                                      title={assignment.projectName}
                                    >
                                      {assignment.projectCode && (
                                        <span className="px-1.5 py-0.2 bg-blue-500/15 text-blue-300 border border-blue-500/30 rounded font-mono text-[10px] font-bold">
                                          {assignment.projectCode}
                                        </span>
                                      )}
                                      <span className="truncate">📁 {assignment.projectName}</span>
                                    </Link>
                                    <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 whitespace-nowrap">
                                      {assignment.allocationPercent}% ({assignment.fte.toFixed(2)} FTE)
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {filteredPersons.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <p className="text-base font-medium text-slate-300">No personnel found matching &ldquo;{searchQuery}&rdquo;</p>
                    <p className="text-xs text-slate-500 mt-1">Try searching by another name, PRO-ID, or clear the search filter.</p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="mt-3 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs rounded-lg transition-colors"
                      >
                        Clear Search Filter
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
