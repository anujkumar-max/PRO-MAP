'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScorecards, usePersons } from '@/lib/hooks/useRealtimeData';
import { createOrUpdateScorecard } from '@/lib/firestore';
import { cn, getCurrentMonth, getIciColor, getIciBg } from '@/lib/utils';
import { Plus, X, BarChart2 } from 'lucide-react';
import { MonthlyScorecard, IciClassification } from '@/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function ScorecardsPage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: scorecards, loading: loadingScorecards } = useScorecards(month);
  const { data: persons, loading: loadingPersons } = usePersons();

  // Modal State
  const [formData, setFormData] = useState({
    personId: '',
    deliveryScore: 0,
    qualityScore: 0,
    timelinessScore: 0,
    problemSolvingScore: 0,
    collaborationScore: 0,
    documentationScore: 0,
  });

  if (loadingScorecards || loadingPersons) {
    return <div className="p-8 text-white">Loading scorecards...</div>;
  }

  const iciTotal = formData.deliveryScore + formData.qualityScore + formData.timelinessScore + formData.problemSolvingScore + formData.collaborationScore + formData.documentationScore;
  
  let classification = 'Role Review';
  if (iciTotal >= 90) classification = 'Exceptional';
  else if (iciTotal >= 80) classification = 'High Contributor';
  else if (iciTotal >= 70) classification = 'Effective';
  else if (iciTotal >= 60) classification = 'Needs Optimisation';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.personId) return;
    
    await createOrUpdateScorecard({
      personId: formData.personId,
      month,
      deliveryScore: formData.deliveryScore,
      qualityScore: formData.qualityScore,
      timelinessScore: formData.timelinessScore,
      problemSolvingScore: formData.problemSolvingScore,
      collaborationScore: formData.collaborationScore,
      documentationScore: formData.documentationScore,
    });
    
    setIsModalOpen(false);
    setFormData({
      personId: '', deliveryScore: 0, qualityScore: 0, timelinessScore: 0, problemSolvingScore: 0, collaborationScore: 0, documentationScore: 0
    });
  };

  // Stats
  const avgIci = scorecards.length ? Math.round(scorecards.reduce((sum, s) => sum + s.iciTotal, 0) / scorecards.length) : 0;
  const exceptionalCount = scorecards.filter(s => s.classification === 'Exceptional').length;
  const reviewCount = scorecards.filter(s => s.classification === 'Role Review' || s.classification === 'Needs Optimisation').length;

  // Chart Data
  const dist = { 'Exceptional': 0, 'High Contributor': 0, 'Effective': 0, 'Needs Optimisation': 0, 'Role Review': 0 };
  scorecards.forEach(s => dist[s.classification as keyof typeof dist]++);
  const chartData = Object.keys(dist).map(k => ({ name: k, count: dist[k as keyof typeof dist] }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Monthly Scorecards</h1>
          <p className="text-slate-400">Track and manage Individual Contribution Index (ICI)</p>
        </div>
        <div className="flex space-x-4">
          <input 
            type="month" 
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white rounded-lg px-4 py-2"
          />
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Scorecard
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-slate-400 text-sm font-medium mb-1">Average ICI</h3>
          <div className={cn("text-4xl font-bold", getIciColor(avgIci))}>{avgIci}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-slate-400 text-sm font-medium mb-1">Exceptional</h3>
          <div className="text-4xl font-bold text-emerald-400">{exceptionalCount}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-slate-400 text-sm font-medium mb-1">Needs Review</h3>
          <div className="text-4xl font-bold text-red-400">{reviewCount}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-slate-400 text-sm font-medium mb-1">Total Assessed</h3>
          <div className="text-4xl font-bold text-white">{scorecards.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Table */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/80">
                <tr className="text-slate-300">
                  <th className="p-4 font-medium">Person</th>
                  <th className="p-4 font-medium">Delivery (40)</th>
                  <th className="p-4 font-medium">Qual (20)</th>
                  <th className="p-4 font-medium">Time (15)</th>
                  <th className="p-4 font-medium">Prob (10)</th>
                  <th className="p-4 font-medium">Collab (10)</th>
                  <th className="p-4 font-medium">Doc (5)</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium">Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {scorecards.map(s => {
                  const p = persons.find(per => per.id === s.personId);
                  return (
                    <tr key={s.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-white">{p?.name || s.personName || 'Unknown'}</div>
                        <div className="text-xs text-slate-400">{p?.proId || s.personProId}</div>
                      </td>
                      <td className="p-4 text-slate-300">{s.deliveryScore}</td>
                      <td className="p-4 text-slate-300">{s.qualityScore}</td>
                      <td className="p-4 text-slate-300">{s.timelinessScore}</td>
                      <td className="p-4 text-slate-300">{s.problemSolvingScore}</td>
                      <td className="p-4 text-slate-300">{s.collaborationScore}</td>
                      <td className="p-4 text-slate-300">{s.documentationScore}</td>
                      <td className={cn("p-4 font-bold", getIciColor(s.iciTotal))}>{s.iciTotal}</td>
                      <td className="p-4">
                        <span className={cn("px-2 py-1 rounded text-xs font-medium border", getIciBg(s.iciTotal), getIciColor(s.iciTotal), "border-current/20")}>
                          {s.classification}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {scorecards.length === 0 && (
                  <tr><td colSpan={9} className="p-8 text-center text-slate-400">No scorecards found for this month</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-medium text-white mb-6 flex items-center">
            <BarChart2 className="w-5 h-5 mr-2 text-blue-400" /> Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#94A3B8" />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" width={100} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#334155', opacity: 0.4 }} contentStyle={{ backgroundColor: '#1E293B', border: 'none', color: '#fff' }} />
                <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Add Scorecard for {month}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Person</label>
                  <select 
                    required 
                    value={formData.personId} 
                    onChange={e => setFormData({...formData, personId: e.target.value})}
                    className="w-full bg-slate-800 border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select a person...</option>
                    {persons.map(p => (
                      <option key={p.id} value={p.id}>{p.proId} - {p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'deliveryScore', label: 'Delivery', max: 40 },
                    { key: 'qualityScore', label: 'Quality', max: 20 },
                    { key: 'timelinessScore', label: 'Timeliness', max: 15 },
                    { key: 'problemSolvingScore', label: 'Prob. Solving', max: 10 },
                    { key: 'collaborationScore', label: 'Collaboration', max: 10 },
                    { key: 'documentationScore', label: 'Documentation', max: 5 },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-slate-300 mb-1">{field.label} (Max {field.max})</label>
                      <input 
                        type="number" min="0" max={field.max} required
                        value={formData[field.key as keyof typeof formData]}
                        onChange={e => setFormData({...formData, [field.key]: Number(e.target.value)})}
                        className="w-full bg-slate-800 border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700 flex justify-between items-center">
                  <div>
                    <div className="text-sm text-slate-400">Total ICI Score</div>
                    <div className="text-lg font-medium text-white">{classification}</div>
                  </div>
                  <div className={cn("text-3xl font-bold", getIciColor(iciTotal))}>{iciTotal}/100</div>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-300 hover:text-white">Cancel</button>
                  <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">Save Scorecard</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
