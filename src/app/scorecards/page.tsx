'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScorecards, usePersons } from '@/lib/hooks/useRealtimeData';
import { createOrUpdateScorecard } from '@/lib/firestore';
import { cn, getCurrentMonth, getIciColor, getIciBg } from '@/lib/utils';
import { Plus, X, BarChart2, Edit3, Award, Target, Clock, Lightbulb, Users, FileText, Save, Search, CheckCircle, MinusCircle } from 'lucide-react';
import { MonthlyScorecard, Person } from '@/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { RankRoleBadge } from '@/components/common/RankRoleBadge';

const SCORE_FIELDS = [
  { key: 'deliveryScore', label: 'Delivery', desc: 'Tasks completed & output volume', max: 40, icon: Target, color: 'blue' },
  { key: 'qualityScore', label: 'Quality', desc: 'Accuracy, standards & precision', max: 20, icon: Award, color: 'emerald' },
  { key: 'timelinessScore', label: 'Timeliness', desc: 'Milestone & deadline adherence', max: 15, icon: Clock, color: 'purple' },
  { key: 'problemSolvingScore', label: 'Prob. Solving', desc: 'Issue identification & resolution', max: 10, icon: Lightbulb, color: 'amber' },
  { key: 'collaborationScore', label: 'Collaboration', desc: 'Cross-team coordination & support', max: 10, icon: Users, color: 'cyan' },
  { key: 'documentationScore', label: 'Documentation', desc: 'SOPs, reports & record keeping', max: 5, icon: FileText, color: 'rose' },
] as const;

type ScoreKey = typeof SCORE_FIELDS[number]['key'];

function getClassification(total: number): string {
  if (total >= 90) return 'Exceptional';
  if (total >= 80) return 'High Contributor';
  if (total >= 70) return 'Effective';
  if (total >= 60) return 'Needs Optimisation';
  return 'Role Review';
}

function getClassBadgeStyle(cls: string) {
  switch (cls) {
    case 'Exceptional': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'High Contributor': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'Effective': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    case 'Needs Optimisation': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    default: return 'bg-red-500/20 text-red-400 border-red-500/30';
  }
}

function getBarColor(val: number, max: number) {
  const pct = (val / max) * 100;
  if (pct >= 80) return 'bg-emerald-500';
  if (pct >= 60) return 'bg-blue-500';
  if (pct >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

// Merged row type: every person + their scorecard (if any)
interface PersonRow {
  person: Person;
  scorecard: MonthlyScorecard | null;
}

export default function ScorecardsPage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [editingScorecard, setEditingScorecard] = useState<MonthlyScorecard | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'evaluated' | 'pending'>('all');
  
  const { data: scorecards, loading: loadingScorecards } = useScorecards(month);
  const { data: persons, loading: loadingPersons } = usePersons();

  // Modal form state
  const [formData, setFormData] = useState({
    personId: '',
    deliveryScore: 0,
    qualityScore: 0,
    timelinessScore: 0,
    problemSolvingScore: 0,
    collaborationScore: 0,
    documentationScore: 0,
  });

  // Build merged list: ALL persons + their scorecards (if any)
  const allRows: PersonRow[] = useMemo(() => {
    if (loadingPersons || loadingScorecards) return [];
    const scorecardMap = new Map<string, MonthlyScorecard>();
    scorecards.forEach(s => scorecardMap.set(s.personId, s));

    return persons.map(p => ({
      person: p,
      scorecard: scorecardMap.get(p.id) || null,
    }));
  }, [persons, scorecards, loadingPersons, loadingScorecards]);

  // Filter by tab + search
  const filteredRows = useMemo(() => {
    let rows = allRows;

    // Tab filter
    if (filterTab === 'evaluated') {
      rows = rows.filter(r => r.scorecard !== null);
    } else if (filterTab === 'pending') {
      rows = rows.filter(r => r.scorecard === null);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      rows = rows.filter(r =>
        r.person.name.toLowerCase().includes(q) ||
        r.person.proId.toLowerCase().includes(q) ||
        (r.person.rank || '').toLowerCase().includes(q)
      );
    }

    // Sort: evaluated first (by ICI desc), then pending (by name asc)
    rows.sort((a, b) => {
      if (a.scorecard && !b.scorecard) return -1;
      if (!a.scorecard && b.scorecard) return 1;
      if (a.scorecard && b.scorecard) return b.scorecard.iciTotal - a.scorecard.iciTotal;
      return a.person.name.localeCompare(b.person.name);
    });

    return rows;
  }, [allRows, filterTab, searchQuery]);

  // Open modal for a person (with or without existing scorecard)
  const openScoring = (person: Person, scorecard: MonthlyScorecard | null) => {
    setEditingPerson(person);
    setEditingScorecard(scorecard);
    setFormData({
      personId: person.id,
      deliveryScore: scorecard?.deliveryScore ?? 0,
      qualityScore: scorecard?.qualityScore ?? 0,
      timelinessScore: scorecard?.timelinessScore ?? 0,
      problemSolvingScore: scorecard?.problemSolvingScore ?? 0,
      collaborationScore: scorecard?.collaborationScore ?? 0,
      documentationScore: scorecard?.documentationScore ?? 0,
    });
    setIsModalOpen(true);
  };

  // Open modal for new entry via button (person select dropdown)
  const openNewScorecard = () => {
    setEditingPerson(null);
    setEditingScorecard(null);
    setFormData({
      personId: '',
      deliveryScore: 0,
      qualityScore: 0,
      timelinessScore: 0,
      problemSolvingScore: 0,
      collaborationScore: 0,
      documentationScore: 0,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPerson(null);
    setEditingScorecard(null);
  };

  const iciTotal = formData.deliveryScore + formData.qualityScore + formData.timelinessScore + formData.problemSolvingScore + formData.collaborationScore + formData.documentationScore;
  const classification = getClassification(iciTotal);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.personId) return;
    setSaving(true);
    
    try {
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
      closeModal();
    } catch (err) {
      console.error('Failed to save scorecard:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleScoreChange = (key: ScoreKey, value: number, max: number) => {
    const clamped = Math.min(Math.max(0, value), max);
    setFormData(prev => ({ ...prev, [key]: clamped }));
  };

  if (loadingScorecards || loadingPersons) {
    return <div className="p-8 text-white">Loading scorecards...</div>;
  }

  // Stats
  const evaluatedCount = allRows.filter(r => r.scorecard !== null).length;
  const pendingCount = allRows.filter(r => r.scorecard === null).length;
  const avgIci = evaluatedCount ? Math.round(scorecards.reduce((sum, s) => sum + s.iciTotal, 0) / evaluatedCount) : 0;
  const exceptionalCount = scorecards.filter(s => s.classification === 'Exceptional').length;
  const reviewCount = scorecards.filter(s => s.classification === 'Role Review' || s.classification === 'Needs Optimisation').length;

  // Chart Data
  const dist: Record<string, number> = { 'Exceptional': 0, 'High Contributor': 0, 'Effective': 0, 'Needs Optimisation': 0, 'Role Review': 0 };
  scorecards.forEach(s => { if (dist[s.classification] !== undefined) dist[s.classification]++; });
  const chartData = Object.keys(dist).map(k => ({ name: k, count: dist[k] }));

  // Selected person info for modal
  const selectedPerson = editingPerson || persons.find(p => p.id === formData.personId);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Monthly Scorecards</h1>
          <p className="text-slate-400">Individual Contribution Index (ICI) — 100-Point Performance Evaluation</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <input 
            type="month" 
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
          <button 
            onClick={openNewScorecard}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-5 py-2 rounded-xl transition-all shadow-lg shadow-blue-500/20 text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> New Evaluation
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
          <h3 className="text-slate-400 text-xs font-medium mb-1 uppercase tracking-wider">Total Personnel</h3>
          <div className="text-4xl font-bold text-white">{persons.length}</div>
          <p className="text-xs text-slate-500 mt-1">In department</p>
        </div>
        <div 
          onClick={() => setFilterTab('evaluated')}
          className={cn("bg-white/5 backdrop-blur-xl border rounded-2xl p-5 cursor-pointer transition-all hover:bg-white/10", filterTab === 'evaluated' ? 'border-emerald-500 ring-1 ring-emerald-500/30' : 'border-white/10')}
        >
          <h3 className="text-slate-400 text-xs font-medium mb-1 uppercase tracking-wider">Evaluated</h3>
          <div className="text-4xl font-bold text-emerald-400">{evaluatedCount}</div>
          <p className="text-xs text-slate-500 mt-1">Scored this month</p>
        </div>
        <div 
          onClick={() => setFilterTab('pending')}
          className={cn("bg-white/5 backdrop-blur-xl border rounded-2xl p-5 cursor-pointer transition-all hover:bg-white/10", filterTab === 'pending' ? 'border-amber-500 ring-1 ring-amber-500/30' : 'border-white/10')}
        >
          <h3 className="text-slate-400 text-xs font-medium mb-1 uppercase tracking-wider">Pending</h3>
          <div className="text-4xl font-bold text-amber-400">{pendingCount}</div>
          <p className="text-xs text-slate-500 mt-1">Not yet evaluated</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
          <h3 className="text-slate-400 text-xs font-medium mb-1 uppercase tracking-wider">Average ICI</h3>
          <div className={cn("text-4xl font-bold", getIciColor(avgIci))}>{avgIci}</div>
          <p className="text-xs text-slate-500 mt-1">{getClassification(avgIci)}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
          <h3 className="text-slate-400 text-xs font-medium mb-1 uppercase tracking-wider">Exceptional (≥90)</h3>
          <div className="text-4xl font-bold text-emerald-400">{exceptionalCount}</div>
          <p className="text-xs text-slate-500 mt-1">Top performers</p>
        </div>
      </div>

      {/* Search + Filter Tabs */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
          <button
            onClick={() => setFilterTab('all')}
            className={cn("px-3.5 py-1.5 rounded-lg font-semibold transition-all", filterTab === 'all' ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white")}
          >
            All ({persons.length})
          </button>
          <button
            onClick={() => setFilterTab('evaluated')}
            className={cn("px-3.5 py-1.5 rounded-lg font-semibold transition-all", filterTab === 'evaluated' ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white")}
          >
            Evaluated ({evaluatedCount})
          </button>
          <button
            onClick={() => setFilterTab('pending')}
            className={cn("px-3.5 py-1.5 rounded-lg font-semibold transition-all", filterTab === 'pending' ? "bg-amber-600 text-white shadow" : "text-slate-400 hover:text-white")}
          >
            Pending ({pendingCount})
          </button>
        </div>

        <div className="relative max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, PRO-ID, or rank..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Table — ALL PERSONNEL */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Edit3 size={16} className="text-blue-400" />
              Click any row to evaluate or update ICI scores
            </h3>
            <span className="text-xs text-slate-400">
              Showing {filteredRows.length} of {persons.length}
            </span>
          </div>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/80 sticky top-0 z-10">
                <tr className="text-slate-300">
                  <th className="p-3 font-medium">Name</th>
                  <th className="p-3 font-medium">PRO-ID</th>
                  <th className="p-3 font-medium text-center">Delivery<br/><span className="text-[10px] text-slate-500">(40)</span></th>
                  <th className="p-3 font-medium text-center">Quality<br/><span className="text-[10px] text-slate-500">(20)</span></th>
                  <th className="p-3 font-medium text-center">Time<br/><span className="text-[10px] text-slate-500">(15)</span></th>
                  <th className="p-3 font-medium text-center">Prob.<br/><span className="text-[10px] text-slate-500">(10)</span></th>
                  <th className="p-3 font-medium text-center">Collab<br/><span className="text-[10px] text-slate-500">(10)</span></th>
                  <th className="p-3 font-medium text-center">Doc<br/><span className="text-[10px] text-slate-500">(5)</span></th>
                  <th className="p-3 font-medium text-center">ICI</th>
                  <th className="p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredRows.map(row => {
                  const { person, scorecard } = row;
                  const hasScore = scorecard !== null;
                  return (
                    <tr 
                      key={person.id} 
                      onClick={() => openScoring(person, scorecard)}
                      className={cn(
                        "transition-colors cursor-pointer group",
                        hasScore ? "hover:bg-blue-500/10" : "hover:bg-amber-500/10 bg-slate-900/30"
                      )}
                      title={hasScore ? "Click to update scores" : "Click to evaluate"}
                    >
                      <td className="p-3">
                        <div className="font-medium text-white group-hover:text-blue-300 transition-colors text-sm">{person.name}</div>
                        <div className="mt-0.5">
                          <RankRoleBadge rank={person.rank} genNo={person.genNo} size="xs" />
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-mono text-[11px] font-semibold">
                          {person.proId}
                        </span>
                      </td>
                      {hasScore ? (
                        <>
                          <td className="p-3 text-center text-slate-300 font-mono text-sm">{scorecard.deliveryScore}</td>
                          <td className="p-3 text-center text-slate-300 font-mono text-sm">{scorecard.qualityScore}</td>
                          <td className="p-3 text-center text-slate-300 font-mono text-sm">{scorecard.timelinessScore}</td>
                          <td className="p-3 text-center text-slate-300 font-mono text-sm">{scorecard.problemSolvingScore}</td>
                          <td className="p-3 text-center text-slate-300 font-mono text-sm">{scorecard.collaborationScore}</td>
                          <td className="p-3 text-center text-slate-300 font-mono text-sm">{scorecard.documentationScore}</td>
                          <td className={cn("p-3 text-center font-bold font-mono", getIciColor(scorecard.iciTotal))}>{scorecard.iciTotal}</td>
                          <td className="p-3">
                            <span className={cn("px-2 py-1 rounded-lg text-[11px] font-semibold border", getClassBadgeStyle(scorecard.classification))}>
                              {scorecard.classification}
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-3 text-center text-slate-600 text-sm">—</td>
                          <td className="p-3 text-center text-slate-600 text-sm">—</td>
                          <td className="p-3 text-center text-slate-600 text-sm">—</td>
                          <td className="p-3 text-center text-slate-600 text-sm">—</td>
                          <td className="p-3 text-center text-slate-600 text-sm">—</td>
                          <td className="p-3 text-center text-slate-600 text-sm">—</td>
                          <td className="p-3 text-center text-slate-600 text-sm">—</td>
                          <td className="p-3">
                            <span className="px-2 py-1 rounded-lg text-[11px] font-semibold border bg-slate-700/30 text-slate-400 border-slate-600 flex items-center gap-1 w-fit">
                              <MinusCircle size={12} /> Not Evaluated
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
                {filteredRows.length === 0 && (
                  <tr><td colSpan={10} className="p-8 text-center text-slate-400">
                    {searchQuery ? 'No personnel match your search.' : 'No personnel found.'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-medium text-white mb-6 flex items-center">
            <BarChart2 className="w-5 h-5 mr-2 text-blue-400" /> Classification Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#94A3B8" />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" width={100} tick={{ fontSize: 11 }} />
                <Tooltip cursor={{ fill: '#334155', opacity: 0.4 }} contentStyle={{ backgroundColor: '#1E293B', border: 'none', color: '#fff', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick summary */}
          <div className="mt-6 space-y-2 border-t border-slate-800 pt-4">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Evaluated</span>
              <span className="text-emerald-400 font-semibold">{evaluatedCount} / {persons.length}</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${persons.length ? (evaluatedCount / persons.length) * 100 : 0}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">{pendingCount} personnel pending evaluation this month</p>
          </div>
        </div>

      </div>

      {/* ============================================ */}
      {/* SCORING MODAL                                */}
      {/* ============================================ */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-800 bg-slate-900/80 sticky top-0 z-10">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-blue-400" />
                      {editingScorecard ? 'Update ICI Score' : 'New ICI Evaluation'}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                      <span>Month: <span className="text-blue-400 font-semibold">{month}</span></span>
                      {selectedPerson && (
                        <>
                          <span>•</span>
                          <span className="text-white font-semibold">{selectedPerson.name}</span>
                          <span className="text-blue-300 font-mono">({selectedPerson.proId})</span>
                          <RankRoleBadge rank={selectedPerson.rank} genNo={selectedPerson.genNo} size="xs" />
                        </>
                      )}
                    </p>
                  </div>
                  <button onClick={closeModal} className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSave} className="p-5 space-y-5">
                
                {/* Person Selector (only when opened via "New Evaluation" button) */}
                {!editingPerson && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">Select Person to Evaluate</label>
                    <select 
                      required 
                      value={formData.personId} 
                      onChange={e => setFormData({...formData, personId: e.target.value})}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    >
                      <option value="">— Select a person —</option>
                      {persons.map(p => (
                        <option key={p.id} value={p.id}>{p.proId} — {p.name} ({p.rank})</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 6 Score Category Cards */}
                <div className="space-y-3">
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    Enter Points for Each Category
                  </div>

                  {SCORE_FIELDS.map(field => {
                    const Icon = field.icon;
                    const value = formData[field.key];
                    const pct = (value / field.max) * 100;

                    return (
                      <div 
                        key={field.key}
                        className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-2.5 hover:border-slate-600 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className={cn("p-1.5 rounded-lg", `bg-${field.color}-500/15`)}>
                              <Icon size={16} className={`text-${field.color}-400`} />
                            </div>
                            <div>
                              <span className="font-semibold text-white text-sm">{field.label}</span>
                              <p className="text-[11px] text-slate-400">{field.desc}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              min={0} 
                              max={field.max} 
                              required
                              value={value}
                              onChange={e => handleScoreChange(field.key, Number(e.target.value), field.max)}
                              className="w-16 bg-slate-900 border border-slate-600 text-white text-center rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono font-bold"
                            />
                            <span className="text-xs text-slate-400 font-mono w-8">/{field.max}</span>
                          </div>
                        </div>

                        {/* Slider */}
                        <input 
                          type="range"
                          min={0}
                          max={field.max}
                          value={value}
                          onChange={e => handleScoreChange(field.key, Number(e.target.value), field.max)}
                          className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
                        />

                        {/* Progress bar */}
                        <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                          <div 
                            className={cn("h-1.5 rounded-full transition-all duration-300", getBarColor(value, field.max))}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Live ICI Total Preview */}
                <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Live ICI Score</div>
                      <div className={cn("text-sm font-semibold mt-0.5", getClassBadgeStyle(classification).split(' ').find(c => c.startsWith('text-')))}>
                        {classification}
                      </div>
                    </div>
                    <div className={cn("text-4xl font-extrabold font-mono", getIciColor(iciTotal))}>
                      {iciTotal}<span className="text-lg text-slate-500">/100</span>
                    </div>
                  </div>

                  {/* Mini breakdown bar */}
                  <div className="flex h-3 rounded-full overflow-hidden bg-slate-700/50">
                    {SCORE_FIELDS.map(field => {
                      const val = formData[field.key];
                      const widthPct = (val / 100) * 100;
                      const colors: Record<string, string> = {
                        blue: 'bg-blue-500', emerald: 'bg-emerald-500', purple: 'bg-purple-500',
                        amber: 'bg-amber-500', cyan: 'bg-cyan-500', rose: 'bg-rose-500'
                      };
                      return (
                        <div 
                          key={field.key}
                          className={cn("transition-all duration-300", colors[field.color] || 'bg-blue-500')}
                          style={{ width: `${widthPct}%` }}
                          title={`${field.label}: ${val}/${field.max}`}
                        />
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {SCORE_FIELDS.map(field => (
                      <span key={field.key} className="text-[10px] text-slate-400">
                        {field.label}: <span className="text-white font-mono font-semibold">{formData[field.key]}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={closeModal} 
                    className="px-5 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving || !formData.personId}
                    className={cn(
                      "flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all",
                      (saving || !formData.personId) && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : editingScorecard ? 'Update Score' : 'Save Evaluation'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
