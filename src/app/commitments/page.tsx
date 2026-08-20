'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCommitments, usePersons, useProjects } from '@/lib/hooks/useRealtimeData';
import { createCommitment, updateCommitment } from '@/lib/firestore';
import { cn, getCurrentMonth, getStatusEmoji } from '@/lib/utils';
import { Plus, X, Check, Edit2 } from 'lucide-react';

export default function CommitmentsPage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAchievement, setEditAchievement] = useState<number>(0);

  const { data: commitments, loading: loadingCommitments } = useCommitments(month);
  const { data: persons, loading: loadingPersons } = usePersons();
  const { data: projects, loading: loadingProjects } = useProjects();

  const [formData, setFormData] = useState({
    personId: '',
    projectId: '',
    commitment: '',
    target: 0,
    achievement: 0,
  });

  if (loadingCommitments || loadingPersons || loadingProjects) {
    return <div className="p-8 text-white">Loading commitments...</div>;
  }

  const handleSaveNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.personId || !formData.projectId) return;

    const person = persons.find(p => p.id === formData.personId);
    const project = projects.find(p => p.id === formData.projectId);

    await createCommitment({
      personId: formData.personId,
      personName: person?.name,
      personProId: person?.proId,
      projectId: formData.projectId,
      projectName: project?.name,
      month,
      commitment: formData.commitment,
      target: formData.target,
      achievement: formData.achievement,
    });

    setIsModalOpen(false);
    setFormData({ personId: '', projectId: '', commitment: '', target: 0, achievement: 0 });
  };

  const handleUpdateAchievement = async (id: string, target: number) => {
    await updateCommitment(id, { achievement: editAchievement });
    setEditingId(null);
  };

  const greenCount = commitments.filter(c => c.status === 'green').length;
  const amberCount = commitments.filter(c => c.status === 'amber').length;
  const redCount = commitments.filter(c => c.status === 'red').length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Monthly Commitments</h1>
          <p className="text-slate-400">Track targets and achievements across projects</p>
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
            <Plus className="w-4 h-4 mr-2" /> Add Commitment
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-slate-400 text-sm font-medium mb-1">Total Commitments</h3>
          <div className="text-4xl font-bold text-white">{commitments.length}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-6">
          <h3 className="text-emerald-400/80 text-sm font-medium mb-1 flex items-center">🟢 On Track</h3>
          <div className="text-4xl font-bold text-emerald-400">{greenCount}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-6">
          <h3 className="text-amber-400/80 text-sm font-medium mb-1 flex items-center">🟡 At Risk</h3>
          <div className="text-4xl font-bold text-amber-400">{amberCount}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6">
          <h3 className="text-red-400/80 text-sm font-medium mb-1 flex items-center">🔴 Delayed</h3>
          <div className="text-4xl font-bold text-red-400">{redCount}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/80">
              <tr className="text-slate-300">
                <th className="p-4 font-medium">Person</th>
                <th className="p-4 font-medium">Project</th>
                <th className="p-4 font-medium w-1/3">Commitment</th>
                <th className="p-4 font-medium text-center">Target</th>
                <th className="p-4 font-medium text-center">Achievement</th>
                <th className="p-4 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {commitments.map(c => (
                <tr key={c.id} className="hover:bg-slate-700/30 transition-colors group">
                  <td className="p-4">
                    <div className="font-medium text-white">{c.personName || 'Unknown'}</div>
                    <div className="text-xs text-slate-400">{c.personProId}</div>
                  </td>
                  <td className="p-4 text-slate-300 font-medium">{c.projectName || '—'}</td>
                  <td className="p-4 text-slate-300">{c.commitment}</td>
                  <td className="p-4 text-center text-white font-medium">{c.target}</td>
                  <td className="p-4 text-center">
                    {editingId === c.id ? (
                      <div className="flex items-center justify-center space-x-2">
                        <input 
                          type="number" 
                          className="w-16 bg-slate-900 border border-slate-600 text-white rounded px-2 py-1 text-center"
                          value={editAchievement}
                          onChange={(e) => setEditAchievement(Number(e.target.value))}
                          autoFocus
                        />
                        <button onClick={() => handleUpdateAchievement(c.id, c.target)} className="text-emerald-400 hover:text-emerald-300"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-300"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-white font-medium">{c.achievement}</span>
                        <button 
                          onClick={() => { setEditingId(c.id); setEditAchievement(c.achievement); }} 
                          className="text-slate-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-center text-2xl" title={c.status}>
                    <div className={cn(
                      "inline-flex w-10 h-10 items-center justify-center rounded-full bg-opacity-20",
                      c.status === 'green' ? "bg-emerald-500" : c.status === 'amber' ? "bg-amber-500" : c.status === 'red' ? "bg-red-500" : "bg-slate-500"
                    )}>
                      {getStatusEmoji(c.status)}
                    </div>
                  </td>
                </tr>
              ))}
              {commitments.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">No commitments found for this month</td></tr>
              )}
            </tbody>
          </table>
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
                <h2 className="text-xl font-bold text-white">Add Commitment for {month}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSaveNew} className="p-6 space-y-4">
                
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

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Project</label>
                  <select 
                    required 
                    value={formData.projectId} 
                    onChange={e => setFormData({...formData, projectId: e.target.value})}
                    className="w-full bg-slate-800 border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select a project...</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Commitment Description</label>
                  <textarea 
                    required 
                    rows={3}
                    value={formData.commitment} 
                    onChange={e => setFormData({...formData, commitment: e.target.value})}
                    className="w-full bg-slate-800 border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="E.g., Complete 5 API endpoints"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Target</label>
                    <input 
                      type="number" min="1" required
                      value={formData.target}
                      onChange={e => setFormData({...formData, target: Number(e.target.value)})}
                      className="w-full bg-slate-800 border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Current Achievement</label>
                    <input 
                      type="number" min="0" required
                      value={formData.achievement}
                      onChange={e => setFormData({...formData, achievement: Number(e.target.value)})}
                      className="w-full bg-slate-800 border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-300 hover:text-white">Cancel</button>
                  <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">Save Commitment</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
