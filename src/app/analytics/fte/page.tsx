'use client';

import React from 'react';
import { usePersonFTEs, useProjectFTEs } from '@/lib/hooks/useRealtimeData';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { cn } from '@/lib/utils';
import { Users, AlertTriangle, ChevronDown } from 'lucide-react';

export default function FTEAnalyticsPage() {
  const { data: personFTEs, loading: personsLoading } = usePersonFTEs();
  const { data: projectFTEs, loading: projectsLoading } = useProjectFTEs();
  const [expandedPerson, setExpandedPerson] = React.useState<string | null>(null);

  const loading = personsLoading || projectsLoading;

  if (loading) {
    return <div className="p-8 text-slate-400 text-center">Loading FTE data...</div>;
  }

  // Summary stats
  const totalFTE = projectFTEs.reduce((sum, p) => sum + p.effectiveFTE, 0);
  const avgAllocation = personFTEs.length > 0 ? personFTEs.reduce((sum, p) => sum + p.totalAllocation, 0) / personFTEs.length : 0;
  const overallocatedCount = personFTEs.filter(p => p.isOverallocated).length;
  const underallocatedCount = personFTEs.filter(p => p.isUnderallocated).length;

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
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">FTE Analytics</h1>
        <p className="text-slate-400">Resource allocation and capacity planning dashboard.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <p className="text-slate-400 text-sm mb-1">Total Effective FTE</p>
          <p className="text-3xl font-bold text-white">{totalFTE.toFixed(1)}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <p className="text-slate-400 text-sm mb-1">Avg Person Allocation</p>
          <p className="text-3xl font-bold text-white">{avgAllocation.toFixed(0)}%</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
          <p className="text-red-400 text-sm mb-1 font-medium flex items-center gap-2">
            <AlertTriangle size={16} /> Overallocated Persons
          </p>
          <p className="text-3xl font-bold text-red-400">{overallocatedCount}</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
          <p className="text-amber-400 text-sm mb-1 font-medium flex items-center gap-2">
            <Users size={16} /> Underallocated Persons
          </p>
          <p className="text-3xl font-bold text-amber-400">{underallocatedCount}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 h-[400px] flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-6">Effective FTE vs Headcount (Top 10 Projects)</h2>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart1Data} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="FTE" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Headcount" fill="#64748b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 h-[400px] flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-6">FTE Distribution</h2>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chart2Data}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chart2Data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Person Table */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Personnel Allocation Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50">
                <th className="p-4 text-sm font-medium text-slate-400">PRO-ID</th>
                <th className="p-4 text-sm font-medium text-slate-400">Name</th>
                <th className="p-4 text-sm font-medium text-slate-400">Rank</th>
                <th className="p-4 text-sm font-medium text-slate-400 text-right">Total Allocation %</th>
                <th className="p-4 text-sm font-medium text-slate-400 text-right">FTE Value</th>
                <th className="p-4 text-sm font-medium text-slate-400">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {personFTEs.map((person) => (
                <React.Fragment key={person.personId}>
                  <tr 
                    className={cn(
                      "border-b border-white/5 hover:bg-slate-800/30 cursor-pointer transition-colors",
                      person.isOverallocated && "bg-red-500/5",
                      person.isUnderallocated && "bg-amber-500/5"
                    )}
                    onClick={() => setExpandedPerson(expandedPerson === person.personId ? null : person.personId)}
                  >
                    <td className="p-4 text-sm text-slate-300 font-mono">{person.proId}</td>
                    <td className="p-4 text-sm text-white font-medium">{person.personName}</td>
                    <td className="p-4 text-sm text-slate-400">{person.rank}</td>
                    <td className="p-4 text-sm text-right font-medium">
                      <span className={cn(
                        person.isOverallocated ? "text-red-400" : person.isUnderallocated ? "text-amber-400" : "text-emerald-400"
                      )}>
                        {person.totalAllocation}%
                      </span>
                    </td>
                    <td className="p-4 text-sm text-right text-slate-300">{(person.totalAllocation / 100).toFixed(2)}</td>
                    <td className="p-4 text-sm">
                      {person.isOverallocated ? (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-md text-xs">Overallocated</span>
                      ) : person.isUnderallocated ? (
                        <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded-md text-xs">Underallocated</span>
                      ) : (
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-md text-xs">Optimal</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500">
                      <ChevronDown className={cn("w-5 h-5 transition-transform", expandedPerson === person.personId && "rotate-180")} />
                    </td>
                  </tr>
                  {expandedPerson === person.personId && (
                    <tr className="bg-slate-900/50">
                      <td colSpan={7} className="p-4 border-b border-white/5">
                        <div className="ml-12 border-l-2 border-slate-700 pl-4 py-2 space-y-3">
                          {person.assignments.length === 0 ? (
                            <p className="text-sm text-slate-500">No project assignments.</p>
                          ) : (
                            person.assignments.map((assignment, idx) => (
                              <div key={idx} className="flex items-center justify-between max-w-md">
                                <span className="text-sm text-slate-300">{assignment.projectName}</span>
                                <span className="text-sm text-blue-400 font-medium">{assignment.allocationPercent}% ({assignment.fte.toFixed(2)} FTE)</span>
                              </div>
                            ))
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
