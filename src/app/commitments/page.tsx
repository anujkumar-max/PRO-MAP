'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCommitments, usePersons, useProjects } from '@/lib/hooks/useRealtimeData';
import { createCommitment, updateCommitment, deleteCommitment, calculateCommitmentStatus } from '@/lib/firestore';
import { cn, getCurrentMonth, formatMonth } from '@/lib/utils';
import { 
  Plus, 
  Search, 
  X, 
  Check, 
  Edit2, 
  Trash2, 
  Target, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FolderKanban, 
  TrendingUp,
  Percent,
  Calendar,
  User,
  FileText,
  Save
} from 'lucide-react';
import { MonthlyCommitment, Person } from '@/types';
import { RankRoleBadge } from '@/components/common/RankRoleBadge';

export default function CommitmentsPage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCommitment, setSelectedCommitment] = useState<MonthlyCommitment | null>(null);
  const [detailAchievement, setDetailAchievement] = useState<number>(0);
  const [detailTarget, setDetailTarget] = useState<number>(1);
  const [isSavingDetail, setIsSavingDetail] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'green' | 'amber' | 'red'>('all');
  
  // Inline editing state in table
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAchievement, setEditAchievement] = useState<number>(0);
  const [savingId, setSavingId] = useState<string | null>(null);

  const { data: commitments, loading: loadingCommitments } = useCommitments(month);
  const { data: persons, loading: loadingPersons } = usePersons();
  const { data: projects, loading: loadingProjects } = useProjects();

  const [formData, setFormData] = useState({
    personId: '',
    projectId: '',
    commitment: '',
    target: 1,
    achievement: 0,
  });

  const loading = loadingCommitments || loadingPersons || loadingProjects;

  // Compute status for all commitments dynamically
  const computedCommitments = useMemo(() => {
    return commitments.map((c) => {
      const liveStatus = calculateCommitmentStatus(c.target, c.achievement);
      const ratio = c.target > 0 ? Math.round((c.achievement / c.target) * 100) : 100;
      return {
        ...c,
        liveStatus,
        ratio,
      };
    });
  }, [commitments]);

  // Counts for filter cards
  const counts = useMemo(() => {
    return {
      all: computedCommitments.length,
      green: computedCommitments.filter((c) => c.liveStatus === 'green').length,
      amber: computedCommitments.filter((c) => c.liveStatus === 'amber').length,
      red: computedCommitments.filter((c) => c.liveStatus === 'red').length,
    };
  }, [computedCommitments]);

  // Filtered commitments by active tab card and search query
  const filteredCommitments = useMemo(() => {
    let list = computedCommitments;

    // Filter by card tab
    if (activeTab !== 'all') {
      list = list.filter((c) => c.liveStatus === activeTab);
    }

    // Filter by search query (Person Name, PRO-ID, Project, Commitment text)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((c) =>
        (c.personName || '').toLowerCase().includes(q) ||
        (c.personProId || '').toLowerCase().includes(q) ||
        (c.projectName || '').toLowerCase().includes(q) ||
        (c.commitment || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [computedCommitments, activeTab, searchQuery]);

  const handleOpenDetailModal = (c: MonthlyCommitment) => {
    setSelectedCommitment(c);
    setDetailAchievement(c.achievement);
    setDetailTarget(c.target);
  };

  const handleSaveDetailUpdate = async () => {
    if (!selectedCommitment) return;
    setIsSavingDetail(true);
    try {
      const target = Math.max(1, detailTarget);
      const achievement = Math.max(0, detailAchievement);
      await updateCommitment(selectedCommitment.id, {
        target,
        achievement,
        status: calculateCommitmentStatus(target, achievement)
      });
      setSelectedCommitment(null);
    } catch (err) {
      console.error('Failed to update commitment details:', err);
    } finally {
      setIsSavingDetail(false);
    }
  };

  const handleSaveNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.personId || !formData.projectId || !formData.commitment.trim()) return;

    const person = persons.find((p) => p.id === formData.personId);
    const project = projects.find((p) => p.id === formData.projectId);

    await createCommitment({
      personId: formData.personId,
      personName: person?.name || 'Personnel',
      personProId: person?.proId || 'PRO-001',
      projectId: formData.projectId,
      projectName: project?.name || 'Project',
      month,
      commitment: formData.commitment.trim(),
      target: Number(formData.target),
      achievement: Number(formData.achievement),
    });

    setIsAddModalOpen(false);
    setFormData({ personId: '', projectId: '', commitment: '', target: 1, achievement: 0 });
  };

  const handleUpdateAchievement = async (c: MonthlyCommitment) => {
    const newAch = Math.max(0, editAchievement);
    setSavingId(c.id);
    try {
      await updateCommitment(c.id, { 
        achievement: newAch,
        target: c.target,
        status: calculateCommitmentStatus(c.target, newAch)
      });
      setEditingId(null);
    } catch (err) {
      console.error('Failed to update achievement:', err);
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete this commitment for ${name}?`)) {
      await deleteCommitment(id);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-400 text-center">Loading commitments...</div>;
  }

  // Live preview for Add Modal
  const modalLiveStatus = calculateCommitmentStatus(formData.target, formData.achievement);
  const modalRatio = formData.target > 0 ? Math.round((formData.achievement / formData.target) * 100) : 0;

  // Live preview for Detail Modal
  const detailModalStatus = selectedCommitment ? calculateCommitmentStatus(detailTarget, detailAchievement) : 'green';
  const detailRatio = detailTarget > 0 ? Math.round((detailAchievement / detailTarget) * 100) : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 text-white min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-400">
            Monthly Commitments
          </h1>
          <p className="text-slate-400 mt-1">
            Track operational targets &amp; deliverables. Click any staff member row to view full commitment description and targets.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <input 
            type="month" 
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
          />
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-5 py-2 rounded-xl transition-all shadow-lg shadow-blue-500/20 text-sm font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Commitment
          </button>
        </div>
      </div>

      {/* Primary Filter Cards (Top Row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Commitments Card */}
        <div 
          onClick={() => setActiveTab('all')}
          className={cn(
            "bg-white/5 backdrop-blur-xl border rounded-2xl p-5 cursor-pointer transition-all hover:bg-white/10 shadow-lg relative group",
            activeTab === 'all' 
              ? "border-blue-500 ring-2 ring-blue-500/40 bg-blue-600/10" 
              : "border-white/10"
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-300">All Commitments</span>
            <Target size={18} className="text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">{counts.all}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
            <p className="text-xs text-slate-400">{formatMonth(month)}</p>
            {activeTab === 'all' && (
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-semibold border border-blue-500/30">
                Active Filter
              </span>
            )}
          </div>
        </div>

        {/* On Track (Green) Card */}
        <div 
          onClick={() => setActiveTab('green')}
          className={cn(
            "bg-emerald-500/10 backdrop-blur-xl border rounded-2xl p-5 cursor-pointer transition-all hover:bg-emerald-500/20 shadow-lg relative group",
            activeTab === 'green' 
              ? "border-emerald-500 ring-2 ring-emerald-500/50 bg-emerald-600/20" 
              : "border-emerald-500/20"
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> On Track (≥90%)
            </span>
            <CheckCircle2 size={18} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">{counts.green}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-900/40">
            <p className="text-xs text-emerald-300/70">Achieved deliverables</p>
            {activeTab === 'green' && (
              <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full font-semibold border border-emerald-400/40">
                Active Filter
              </span>
            )}
          </div>
        </div>

        {/* At Risk (Amber) Card */}
        <div 
          onClick={() => setActiveTab('amber')}
          className={cn(
            "bg-amber-500/10 backdrop-blur-xl border rounded-2xl p-5 cursor-pointer transition-all hover:bg-amber-500/20 shadow-lg relative group",
            activeTab === 'amber' 
              ? "border-amber-500 ring-2 ring-amber-500/50 bg-amber-600/20" 
              : "border-amber-500/20"
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs uppercase tracking-wider font-bold text-amber-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> At Risk (60-89%)
            </span>
            <AlertTriangle size={18} className="text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 mt-2">{counts.amber}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-amber-900/40">
            <p className="text-xs text-amber-300/70">In progress / Minor delay</p>
            {activeTab === 'amber' && (
              <span className="text-[10px] bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded-full font-semibold border border-amber-400/40">
                Active Filter
              </span>
            )}
          </div>
        </div>

        {/* Delayed (Red) Card */}
        <div 
          onClick={() => setActiveTab('red')}
          className={cn(
            "bg-red-500/10 backdrop-blur-xl border rounded-2xl p-5 cursor-pointer transition-all hover:bg-red-500/20 shadow-lg relative group",
            activeTab === 'red' 
              ? "border-red-500 ring-2 ring-red-500/50 bg-red-600/20" 
              : "border-red-500/20"
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs uppercase tracking-wider font-bold text-red-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400" /> Delayed (&lt;60%)
            </span>
            <Clock size={18} className="text-red-400" />
          </div>
          <div className="text-3xl font-extrabold text-red-400 mt-2">{counts.red}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-red-900/40">
            <p className="text-xs text-red-300/70">Requiring escalation</p>
            {activeTab === 'red' && (
              <span className="text-[10px] bg-red-500/30 text-red-200 px-2 py-0.5 rounded-full font-semibold border border-red-400/40">
                Active Filter
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar Row (Cleaned: duplicate pill tabs removed) */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="text-slate-400">Current View:</span>
          <span className="font-bold text-white uppercase bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
            {activeTab === 'all' ? 'All Deliverables' : activeTab === 'green' ? '🟢 On Track' : activeTab === 'amber' ? '🟡 At Risk' : '🔴 Delayed'}
          </span>
          <span className="text-slate-400">({filteredCommitments.length} records)</span>
        </div>

        <div className="relative max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by officer name, PRO-ID, project, targets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Commitments Data Table */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/40">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <User size={14} className="text-blue-400" />
            Click any personnel row to view full Commitment Description &amp; Targets
          </span>
          <span className="text-xs text-slate-400">
            Showing {filteredCommitments.length} of {computedCommitments.length} deliverables
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/80">
              <tr className="text-slate-300">
                <th className="p-4 font-medium">Personnel</th>
                <th className="p-4 font-medium">Project</th>
                <th className="p-4 font-medium w-1/3">Commitment Description &amp; Targets</th>
                <th className="p-4 font-medium text-center">Target</th>
                <th className="p-4 font-medium text-center">Achievement</th>
                <th className="p-4 font-medium text-center">Progress</th>
                <th className="p-4 font-medium text-center">Status</th>
                <th className="p-4 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredCommitments.map((c) => {
                const isGreen = c.liveStatus === 'green';
                const isAmber = c.liveStatus === 'amber';
                const isRed = c.liveStatus === 'red';

                return (
                  <tr 
                    key={c.id} 
                    onClick={() => handleOpenDetailModal(c)}
                    className={cn(
                      "hover:bg-blue-500/10 transition-colors cursor-pointer group",
                      isGreen && "hover:bg-emerald-950/20",
                      isAmber && "hover:bg-amber-950/20",
                      isRed && "hover:bg-red-950/20"
                    )}
                    title="Click to view full description and update details"
                  >
                    {/* Person */}
                    <td className="p-4">
                      {(() => {
                        const person = persons.find(p => p.id === c.personId || p.proId === c.personProId);
                        return (
                          <div>
                            <div className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                              {c.personName || 'Personnel'}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-mono text-[10px] font-semibold">
                                {c.personProId}
                              </span>
                              <RankRoleBadge rank={person?.rank} genNo={person?.genNo} size="xs" />
                            </div>
                          </div>
                        );
                      })()}
                    </td>

                    {/* Project */}
                    <td className="p-4">
                      <div className="text-slate-200 font-medium flex items-center gap-1.5">
                        <FolderKanban size={14} className="text-blue-400 flex-shrink-0" />
                        <span className="truncate max-w-[200px]" title={c.projectName}>{c.projectName || '—'}</span>
                      </div>
                    </td>

                    {/* Commitment Description & Targets */}
                    <td className="p-4 text-slate-300">
                      <p className="line-clamp-2 leading-relaxed" title={c.commitment}>{c.commitment}</p>
                    </td>

                    {/* Target */}
                    <td className="p-4 text-center">
                      <span className="font-mono font-bold text-white text-base bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                        {c.target}
                      </span>
                    </td>

                    {/* Achievement with Instant Inline Edit */}
                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                      {editingId === c.id ? (
                        <div className="flex items-center justify-center space-x-1.5">
                          <input 
                            type="number" 
                            min="0"
                            className="w-16 bg-slate-900 border border-blue-500 text-white rounded-lg px-2 py-1 text-center font-mono font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={editAchievement}
                            onChange={(e) => setEditAchievement(Number(e.target.value))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleUpdateAchievement(c);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            autoFocus
                          />
                          <button 
                            onClick={() => handleUpdateAchievement(c)} 
                            disabled={savingId === c.id}
                            className="p-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setEditingId(null)} 
                            className="p-1 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <span className={cn(
                            "font-mono font-bold text-base px-2.5 py-1 rounded-lg border",
                            isGreen && "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
                            isAmber && "bg-amber-500/10 text-amber-400 border-amber-500/30",
                            isRed && "bg-red-500/10 text-red-400 border-red-500/30"
                          )}>
                            {c.achievement}
                          </span>
                          <button 
                            onClick={() => { setEditingId(c.id); setEditAchievement(c.achievement); }} 
                            className="p-1 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            title="Click to quick-edit achievement"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Progress Bar & Ratio */}
                    <td className="p-4 text-center min-w-[130px]">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-slate-400">Ratio</span>
                          <span className={cn(
                            "font-bold",
                            isGreen && "text-emerald-400",
                            isAmber && "text-amber-400",
                            isRed && "text-red-400"
                          )}>
                            {c.ratio}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-700/60 rounded-full h-2 overflow-hidden">
                          <div 
                            className={cn(
                              "h-2 rounded-full transition-all duration-300",
                              isGreen && "bg-emerald-500",
                              isAmber && "bg-amber-500",
                              isRed && "bg-red-500"
                            )}
                            style={{ width: `${Math.min(100, c.ratio)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4 text-center">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border tracking-wide whitespace-nowrap",
                        isGreen && "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
                        isAmber && "bg-amber-500/15 text-amber-400 border-amber-500/30",
                        isRed && "bg-red-500/15 text-red-400 border-red-500/30"
                      )}>
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          isGreen && "bg-emerald-400 animate-pulse",
                          isAmber && "bg-amber-400",
                          isRed && "bg-red-400"
                        )} />
                        {isGreen ? 'On Track' : isAmber ? 'At Risk' : 'Delayed'}
                      </span>
                    </td>

                    {/* Delete Action */}
                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleDelete(e, c.id, c.personName || 'this personnel')}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Delete commitment"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredCommitments.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    {commitments.length === 0 ? (
                      <div className="max-w-md mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                          <Calendar size={24} />
                        </div>
                        <h3 className="text-base font-bold text-white">
                          No Commitments Found for {formatMonth(month)}
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          All present departmental deliverables are currently mapped under <span className="text-blue-400 font-semibold">August 2026</span>. You can add new targets for {formatMonth(month)} or switch back to August 2026.
                        </p>
                        <div className="flex items-center justify-center gap-3 pt-2">
                          <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md cursor-pointer"
                          >
                            + Add Commitment for {formatMonth(month)}
                          </button>
                          {month !== '2026-08' && (
                            <button
                              onClick={() => setMonth('2026-08')}
                              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                            >
                              📅 View August 2026
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Target className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                        <p className="text-base font-semibold text-white">No commitments match the selected filter</p>
                        <p className="text-xs">Try clicking a different filter card above or clearing the search query.</p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================= */}
      {/* 1. STAFF COMMITMENT DETAIL & TARGETS MODAL (On Row Click) */}
      {/* ======================================================= */}
      <AnimatePresence>
        {selectedCommitment && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedCommitment(null); }}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-900/90">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded font-mono text-xs font-bold">
                      {selectedCommitment.personProId}
                    </span>
                    <h2 className="text-xl font-bold text-white">
                      {selectedCommitment.personName}
                    </h2>
                    {(() => {
                      const person = persons.find(p => p.id === selectedCommitment.personId || p.proId === selectedCommitment.personProId);
                      return <RankRoleBadge rank={person?.rank} genNo={person?.genNo} size="xs" />;
                    })()}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                    <FolderKanban size={13} className="text-blue-400" />
                    Project: <span className="text-slate-200 font-semibold">{selectedCommitment.projectName}</span>
                    <span>•</span>
                    <span>Month: <span className="text-blue-400 font-semibold">{formatMonth(selectedCommitment.month)}</span></span>
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedCommitment(null)} 
                  className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Full Commitment Description & Targets */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={14} className="text-blue-400" />
                    Commitment Description &amp; Targets
                  </label>
                  <div className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 leading-relaxed whitespace-pre-wrap shadow-inner">
                    {selectedCommitment.commitment}
                  </div>
                </div>

                {/* Target & Achievement Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Monthly Target
                    </label>
                    <input 
                      type="number"
                      min="1"
                      value={detailTarget}
                      onChange={(e) => setDetailTarget(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Current Achievement
                    </label>
                    <input 
                      type="number"
                      min="0"
                      value={detailAchievement}
                      onChange={(e) => setDetailAchievement(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* Status & Progress Summary Card */}
                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block">Calculated Status ({detailRatio}%)</span>
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mt-1",
                        detailModalStatus === 'green' && "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
                        detailModalStatus === 'amber' && "bg-amber-500/15 text-amber-400 border-amber-500/30",
                        detailModalStatus === 'red' && "bg-red-500/15 text-red-400 border-red-500/30"
                      )}>
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          detailModalStatus === 'green' && "bg-emerald-400 animate-pulse",
                          detailModalStatus === 'amber' && "bg-amber-400",
                          detailModalStatus === 'red' && "bg-red-400"
                        )} />
                        {detailModalStatus === 'green' ? '🟢 On Track (≥90%)' : detailModalStatus === 'amber' ? '🟡 At Risk (60-89%)' : '🔴 Delayed (<60%)'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Deliverables Ratio</span>
                      <span className="text-xl font-bold font-mono text-white">
                        {detailAchievement} / {detailTarget}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-700/60 rounded-full h-2 overflow-hidden">
                    <div 
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        detailModalStatus === 'green' && "bg-emerald-500",
                        detailModalStatus === 'amber' && "bg-amber-500",
                        detailModalStatus === 'red' && "bg-red-500"
                      )}
                      style={{ width: `${Math.min(100, detailRatio)}%` }}
                    />
                  </div>
                </div>

                {/* Modal Action Buttons */}
                <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
                  <button 
                    type="button" 
                    onClick={() => setSelectedCommitment(null)} 
                    className="px-4 py-2.5 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors text-sm cursor-pointer"
                  >
                    Close
                  </button>
                  <button 
                    type="button"
                    onClick={handleSaveDetailUpdate}
                    disabled={isSavingDetail}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSavingDetail ? 'Saving...' : 'Update & Save'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================= */}
      {/* 2. ADD COMMITMENT MODAL                                  */}
      {/* ======================================================= */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
            onClick={(e) => { if (e.target === e.currentTarget) setIsAddModalOpen(false); }}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-400" />
                    Add Monthly Commitment
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Month: <span className="text-blue-400 font-semibold">{formatMonth(month)}</span></p>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(false)} 
                  className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveNew} className="p-6 space-y-4">
                
                {/* Person Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Assign Officer / Personnel *</label>
                  <select 
                    required 
                    value={formData.personId} 
                    onChange={(e) => setFormData({ ...formData, personId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  >
                    <option value="">— Select personnel —</option>
                    {persons.map((p) => (
                      <option key={p.id} value={p.id}>{p.proId} — {p.name} ({p.rank})</option>
                    ))}
                  </select>
                </div>

                {/* Project Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Project *</label>
                  <select 
                    required 
                    value={formData.projectId} 
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  >
                    <option value="">— Select project —</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Commitment Description & Targets */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Commitment Description &amp; Targets *
                  </label>
                  <textarea 
                    required 
                    rows={3}
                    value={formData.commitment} 
                    onChange={(e) => setFormData({ ...formData, commitment: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder-slate-500"
                    placeholder="e.g. Total police and population data district wise; Integrate 15 Police Stations with CCTV-360"
                  />
                </div>

                {/* Target & Achievement */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Monthly Target *</label>
                    <input 
                      type="number" 
                      min="1" 
                      required
                      value={formData.target}
                      onChange={(e) => setFormData({ ...formData, target: Math.max(1, Number(e.target.value)) })}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Current Achievement</label>
                    <input 
                      type="number" 
                      min="0" 
                      required
                      value={formData.achievement}
                      onChange={(e) => setFormData({ ...formData, achievement: Math.max(0, Number(e.target.value)) })}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Live Status Calculation Preview */}
                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    Calculated Status ({modalRatio}%):
                  </div>
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                    modalLiveStatus === 'green' && "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
                    modalLiveStatus === 'amber' && "bg-amber-500/15 text-amber-400 border-amber-500/30",
                    modalLiveStatus === 'red' && "bg-red-500/15 text-red-400 border-red-500/30"
                  )}>
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      modalLiveStatus === 'green' && "bg-emerald-400 animate-pulse",
                      modalLiveStatus === 'amber' && "bg-amber-400",
                      modalLiveStatus === 'red' && "bg-red-400"
                    )} />
                    {modalLiveStatus === 'green' ? '🟢 On Track' : modalLiveStatus === 'amber' ? '🟡 At Risk' : '🔴 Delayed'}
                  </span>
                </div>

                {/* Modal Actions */}
                <div className="pt-3 flex justify-end space-x-3">
                  <button 
                    type="button" 
                    onClick={() => setIsAddModalOpen(false)} 
                    className="px-4 py-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors text-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-6 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    Save Commitment
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
