'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { User, Calendar, MapPin, Edit, Plus, Briefcase, Activity } from 'lucide-react';
import { usePersons, useAssignmentsByPerson, usePersonScorecards, usePersonCommitments } from '@/lib/hooks/useRealtimeData';
import { cn, formatDate, getIciColor, getStatusEmoji } from '@/lib/utils';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function PersonProfileView({ id }: { id: string }) {
  const personId = id;

  const { data: persons, loading: loadingPersons } = usePersons();
  const { data: assignments, loading: loadingAssignments } = useAssignmentsByPerson(personId);
  const { data: scorecards, loading: loadingScorecards } = usePersonScorecards(personId);
  const { data: commitments, loading: loadingCommitments } = usePersonCommitments(personId);

  const loading = loadingPersons || loadingAssignments || loadingScorecards || loadingCommitments;

  if (loading) {
    return <div className="p-8 text-center text-white">Loading profile...</div>;
  }

  const person = persons.find(p => p.id === personId);
  
  if (!person) {
    return <div className="p-8 text-center text-red-400">Person not found</div>;
  }

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentScorecard = scorecards.find(s => s.month === currentMonth);
  const totalAllocation = assignments.reduce((sum, a) => sum + a.allocationPercent, 0);

  // Chart data
  const chartData = assignments.map(a => ({
    name: a.workstreamName || 'Unknown Project',
    value: a.allocationPercent
  }));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 max-w-7xl mx-auto space-y-8"
    >
      {/* Hero Section */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        
        <div className="flex justify-between items-start relative z-10">
          <div>
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
              {person.proId}
            </h1>
            <h2 className="text-3xl font-semibold text-white mb-2">{person.name}</h2>
            <div className="flex items-center space-x-4 text-slate-300">
              <span className="flex items-center"><User className="w-4 h-4 mr-2" /> {person.rank} | Gen No: {person.genNo}</span>
              <span className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> {person.deputationType || 'N/A'}</span>
              <span className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> Since {formatDate(person.workingSince)}</span>
            </div>
          </div>
          <div className={cn(
            "px-4 py-2 rounded-full font-medium border",
            person.status === 'Active' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-500/10 text-slate-400 border-slate-500/20"
          )}>
            {person.status}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Assignments & FTE */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-blue-400" />
                Current Assignments
              </h3>
              <button className="flex items-center text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                <Plus className="w-4 h-4 mr-2" /> Add Assignment
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.map(a => (
                <div key={a.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 relative group">
                  <button className="absolute top-4 right-4 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit className="w-4 h-4" />
                  </button>
                  <h4 className="font-semibold text-white">{a.workstreamName || 'Project Name'}</h4>
                  <p className="text-sm text-slate-400 mb-3">{a.functionalRole} ({a.raciType})</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300">Reporting: {a.reportingTo}</span>
                    <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded font-medium">{a.allocationPercent}%</span>
                  </div>
                </div>
              ))}
              {assignments.length === 0 && (
                <div className="col-span-2 text-center text-slate-400 py-8">No assignments yet</div>
              )}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Commitment History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-700">
                    <th className="pb-3 font-medium">Month</th>
                    <th className="pb-3 font-medium">Project</th>
                    <th className="pb-3 font-medium">Commitment</th>
                    <th className="pb-3 font-medium">Achievement</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {commitments.slice(0, 5).map(c => (
                    <tr key={c.id} className="hover:bg-slate-800/30">
                      <td className="py-3 text-white">{c.month}</td>
                      <td className="py-3 text-slate-300">{c.projectName || '—'}</td>
                      <td className="py-3 text-slate-300">{c.commitment}</td>
                      <td className="py-3 text-white">{c.achievement} / {c.target}</td>
                      <td className="py-3 text-xl">{getStatusEmoji(c.status)}</td>
                    </tr>
                  ))}
                  {commitments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">No commitments found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Scorecard & FTE breakdown */}
        <div className="space-y-8">
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white flex items-center mb-6">
              <Activity className="w-5 h-5 mr-2 text-blue-400" />
              Current ICI Score
            </h3>
            
            {currentScorecard ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className={cn("text-6xl font-bold mb-2", getIciColor(currentScorecard.iciTotal))}>
                    {currentScorecard.iciTotal}
                  </div>
                  <div className="text-sm text-slate-400 uppercase tracking-wider">{currentScorecard.classification}</div>
                </div>
                
                <div className="space-y-3">
                  {[
                    { label: 'Delivery (40)', val: currentScorecard.deliveryScore, max: 40 },
                    { label: 'Quality (20)', val: currentScorecard.qualityScore, max: 20 },
                    { label: 'Timeliness (15)', val: currentScorecard.timelinessScore, max: 15 },
                    { label: 'Prob. Solving (10)', val: currentScorecard.problemSolvingScore, max: 10 },
                    { label: 'Collab (10)', val: currentScorecard.collaborationScore, max: 10 },
                    { label: 'Docs (5)', val: currentScorecard.documentationScore, max: 5 },
                  ].map(stat => (
                    <div key={stat.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">{stat.label}</span>
                        <span className="text-white">{stat.val}/{stat.max}</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(stat.val / stat.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-8">
                No scorecard for current month
              </div>
            )}
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-2">FTE Breakdown</h3>
            <p className="text-sm text-slate-400 mb-6">Total Allocation: <span className={cn("font-bold", totalAllocation > 100 ? "text-red-400" : "text-white")}>{totalAllocation}%</span></p>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.length ? chartData : [{ name: 'Unallocated', value: 100 }]}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.length 
                      ? chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
                      : <Cell fill="#334155" />
                    }
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
