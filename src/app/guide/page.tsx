'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  ClipboardList, 
  Target, 
  BarChart3, 
  AlertTriangle, 
  Settings, 
  GitBranch, 
  HelpCircle, 
  Search, 
  Layers, 
  ShieldCheck, 
  TrendingUp, 
  FileSpreadsheet, 
  Zap,
  Award,
  ChevronRight,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function SystemGuidePage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // ICI Calculator Interactive State
  const [iciScores, setIciScores] = useState({
    delivery: 35,
    quality: 18,
    timeliness: 13,
    problemSolving: 8,
    collaboration: 9,
    documentation: 4,
  });

  const totalIci = 
    iciScores.delivery + 
    iciScores.quality + 
    iciScores.timeliness + 
    iciScores.problemSolving + 
    iciScores.collaboration + 
    iciScores.documentation;

  const getIciBadge = (score: number) => {
    if (score >= 90) return { label: 'Exceptional', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    if (score >= 80) return { label: 'High Contributor', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    if (score >= 70) return { label: 'Effective', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' };
    if (score >= 60) return { label: 'Needs Optimisation', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    return { label: 'Role Review', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
  };

  const sections = [
    { id: 'overview', title: '1. PRO-MAP Framework', icon: Layers },
    { id: 'dashboard', title: '2. Executive Dashboard', icon: LayoutDashboard },
    { id: 'projects', title: '3. Projects & 4-Tab Detail', icon: FolderKanban },
    { id: 'flow', title: '4. Auto Flow Diagrams', icon: GitBranch },
    { id: 'manpower', title: '5. Manpower & Allocation', icon: Users },
    { id: 'ici', title: '6. ICI Scoring (100 pts)', icon: ClipboardList },
    { id: 'commitments', title: '7. Deliverable Commitments', icon: Target },
    { id: 'analytics', title: '8. FTE & Capacity Analytics', icon: BarChart3 },
    { id: 'risks', title: '9. Risk & Dependency Matrix', icon: AlertTriangle },
    { id: 'admin', title: '10. Data Management & Excel', icon: Settings },
    { id: 'faq', title: '11. FAQ & Officer Reference', icon: HelpCircle },
  ];

  const filteredSections = sections.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 text-white">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/60 via-slate-900/80 to-sky-950/60 border border-white/10 p-6 md:p-10 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" /> Official Platform Guide &amp; Knowledge Base
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-sky-300 bg-clip-text text-transparent">
              PRO-MAP Operations Handbook
            </h1>
            <p className="text-slate-300 text-sm md:text-base max-w-3xl leading-relaxed">
              Comprehensive guide to the <strong>Project, Role, Outcome &amp; Manpower Assessment Platform</strong> for Tech Services. Understand all dashboards, individual scorecards, real-time sync, and operational workflows.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-w-[240px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search guide topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <div className="sticky top-6 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-3 space-y-1">
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Guide Table of Contents
            </div>
            {filteredSections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-blue-600/30 text-blue-300 border border-blue-500/40 shadow-lg shadow-blue-900/20" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-blue-400" : "text-slate-500")} />
                  <span className="truncate">{sec.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Section 1: Framework Overview */}
          {activeSection === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">1. The PRO-MAP Model</h2>
                    <p className="text-sm text-slate-400">Project, Role, Outcome &amp; Manpower Assessment Platform</p>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none text-slate-300 space-y-4">
                  <p>
                    For IT and AI operations in Tech Services where personnel contribute across multiple concurrent initiatives, PRO-MAP shifts governance away from a <strong>static person-based deployment model</strong> (<em>&ldquo;Officer X works in CCTNS&rdquo;</em>) to a dynamic <strong>Project&ndash;Role&ndash;Outcome model</strong> (<em>&ldquo;Officer X owns these specific deliverables with measurable monthly outcomes&rdquo;</em>).
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                      <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2">❌ Legacy Person Deployment</div>
                      <p className="text-xs text-slate-400">
                        Officers assigned purely to project names without explicit workstream deliverables, resulting in ambiguous ownership, untracked multi-project effort, and single-point-of-failure risks.
                      </p>
                    </div>
                    <div className="bg-blue-950/40 border border-blue-700/40 rounded-xl p-4">
                      <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">✅ PRO-MAP Model</div>
                      <p className="text-xs text-slate-300">
                        Five structured layers linking high-level departmental goals directly to measurable monthly deliverables, weighted capacity utilization, and objective performance metrics.
                      </p>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-white mt-6">The Five Framework Layers</h3>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-2 p-4 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-center font-medium">
                    <div className="p-3 bg-blue-600/20 text-blue-300 rounded-lg w-full"><strong>1. Project</strong><br/><span className="text-slate-400">e.g., CCTNS, AI4AP</span></div>
                    <ChevronRight className="hidden md:block text-slate-600 w-4 h-4" />
                    <div className="p-3 bg-indigo-600/20 text-indigo-300 rounded-lg w-full"><strong>2. Workstream</strong><br/><span className="text-slate-400">e.g., Integration</span></div>
                    <ChevronRight className="hidden md:block text-slate-600 w-4 h-4" />
                    <div className="p-3 bg-purple-600/20 text-purple-300 rounded-lg w-full"><strong>3. Functional Role</strong><br/><span className="text-slate-400">e.g., Technical Lead</span></div>
                    <ChevronRight className="hidden md:block text-slate-600 w-4 h-4" />
                    <div className="p-3 bg-sky-600/20 text-sky-300 rounded-lg w-full"><strong>4. Deliverable</strong><br/><span className="text-slate-400">e.g., API Sync</span></div>
                    <ChevronRight className="hidden md:block text-slate-600 w-4 h-4" />
                    <div className="p-3 bg-emerald-600/20 text-emerald-300 rounded-lg w-full"><strong>5. Monthly Outcome</strong><br/><span className="text-slate-400">e.g., 99.8% Uptime</span></div>
                  </div>

                  <h3 className="text-lg font-semibold text-white mt-6">The Four Monthly Executive Questions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-3.5 bg-white/5 rounded-xl border border-white/5">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">1</span>
                      <div>
                        <strong className="text-white text-sm">Who is working on what?</strong>
                        <p className="text-xs text-slate-400 mt-0.5">Track personnel distribution across all 38 projects.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3.5 bg-white/5 rounded-xl border border-white/5">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">2</span>
                      <div>
                        <strong className="text-white text-sm">In what role?</strong>
                        <p className="text-xs text-slate-400 mt-0.5">RACI definition: Accountable, Responsible, Consulted, or Informed.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3.5 bg-white/5 rounded-xl border border-white/5">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">3</span>
                      <div>
                        <strong className="text-white text-sm">What were they expected to deliver?</strong>
                        <p className="text-xs text-slate-400 mt-0.5">3&ndash;5 frozen deliverables committed at month start.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3.5 bg-white/5 rounded-xl border border-white/5">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">4</span>
                      <div>
                        <strong className="text-white text-sm">What did they actually deliver?</strong>
                        <p className="text-xs text-slate-400 mt-0.5">Target vs Achievement with 🟢🟡🔴 status tracking.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Section 2: Executive Dashboard */}
          {activeSection === 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                    <LayoutDashboard className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">2. Executive Dashboard Guide</h2>
                    <p className="text-sm text-slate-400">Understanding macro command metrics and alert triggers</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-400" /> Primary KPI Cards
                    </h3>
                    <div className="space-y-2.5 text-xs text-slate-300">
                      <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                        <strong className="text-blue-400">Total Projects &amp; Active Count:</strong> Total registered departmental initiatives and those currently in active execution.
                      </div>
                      <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                        <strong className="text-indigo-400">Total Personnel:</strong> Unique headcount across all ranks (Addl. SP, DSP, CI, SI, ASI, HC, PC, outsourcing).
                      </div>
                      <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                        <strong className="text-purple-400">Effective FTE (Full-Time Equivalent):</strong> The sum of all fractional project allocations (Sum of Allocation % / 100). For example, two officers at 50% = 1.0 FTE.
                      </div>
                      <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                        <strong className="text-emerald-400">High Performers:</strong> Count of officers with current-month Individual Contribution Index (ICI) &ge; 80%.
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-white flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" /> Real-Time Alert Triggers
                    </h3>
                    <div className="space-y-2.5 text-xs text-slate-300">
                      <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                        <strong className="text-amber-400">Overallocated Staff (&gt;100%):</strong> Personnel whose combined allocations across all projects exceed 100%, indicating burnout risk.
                      </div>
                      <div className="p-3 bg-sky-500/10 rounded-xl border border-sky-500/20">
                        <strong className="text-sky-400">Underutilised Staff (&lt;50%):</strong> Officers whose combined project allocation is below 50%, highlighting available capacity.
                      </div>
                      <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                        <strong className="text-purple-400">Key-Person Dependencies:</strong> Critical workstreams staffed by only 1 person with no designated backup owner.
                      </div>
                      <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                        <strong className="text-red-400">Delayed Deliverables:</strong> Deliverable commitments where achievement is below 60% of monthly targets (🔴 status).
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p>
                    <strong>Zero-Refresh Real-Time Sync:</strong> The Executive Dashboard is connected to Firebase Firestore live streams. Any modification made on a mobile device or admin terminal updates the charts and alert counters instantly for all viewers.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Section 3: Projects & 4-Tab Detail */}
          {activeSection === 'projects' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                    <FolderKanban className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">3. Projects Directory &amp; 4-Tab Detail</h2>
                    <p className="text-sm text-slate-400">Managing project teams, RACI matrices, and health scorecards</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">The 4 Dedicated Tabs in Project Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 space-y-2">
                      <strong className="text-blue-400 text-sm flex items-center gap-2">
                        <Users className="w-4 h-4" /> 1. Team &amp; Workstreams Tab
                      </strong>
                      <p className="text-slate-300">
                        View and manage all assigned officers. Features <strong>inline cell editing</strong> for Workstream Name, Allocation %, Functional Role, and RACI. Click &ldquo;+ Add Member&rdquo; to assign existing personnel.
                      </p>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 space-y-2">
                      <strong className="text-indigo-400 text-sm flex items-center gap-2">
                        <GitBranch className="w-4 h-4" /> 2. Flow Diagram Tab
                      </strong>
                      <p className="text-slate-300">
                        Launches the interactive hierarchy tree depicting supervisory command (DSP &rarr; CI &rarr; SI) and operational staff with their specific action items.
                      </p>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 space-y-2">
                      <strong className="text-emerald-400 text-sm flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> 3. 10-Point Health Card Tab
                      </strong>
                      <p className="text-slate-300">
                        Monthly project audit tracking Milestone Status (On Time / Delayed), Open vs Resolved Issues, Planned vs Completed Deliverables, and Overall Health (🟢 Green / 🟡 Amber / 🔴 Red).
                      </p>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 space-y-2">
                      <strong className="text-amber-400 text-sm flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4" /> 4. Project Notes Tab
                      </strong>
                      <p className="text-slate-300">
                        Log meeting minutes, executive instructions, vendor dependencies, and architectural decisions specific to this project.
                      </p>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-white mt-6">RACI Matrix Definitions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <strong className="text-red-400 block mb-1">A – Accountable</strong>
                      The single officer with ultimate ownership and decision-making veto (typically DSP / CI).
                    </div>
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <strong className="text-blue-400 block mb-1">R – Responsible</strong>
                      The officer(s) who complete the hands-on work and technical tasks (Developers, SIs, Support).
                    </div>
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <strong className="text-amber-400 block mb-1">C – Consulted</strong>
                      Subject matter experts providing critical inputs (e.g. Cyber Security, Database Admins).
                    </div>
                    <div className="p-3 bg-slate-500/10 border border-slate-500/20 rounded-xl">
                      <strong className="text-slate-400 block mb-1">I – Informed</strong>
                      Stakeholders kept updated on progress and milestones (District Nodal Officers).
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Section 4: Auto Flow Diagrams */}
          {activeSection === 'flow' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                    <GitBranch className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">4. Auto-Generated Project Flow Diagrams</h2>
                    <p className="text-sm text-slate-400">Interactive organizational command trees and task decomposition</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                  <p>
                    Every project automatically renders an interactive hierarchy diagram accessible via <code>/flow/[id]</code>. The diagram dynamically constructs the command hierarchy and maps all operational staff:
                  </p>

                  <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className="text-xs font-semibold uppercase text-blue-400 tracking-wider">Flow Tree Hierarchy Structure</span>
                      <span className="text-[10px] text-slate-500">Rendered via ReactFlow &amp; Dagre Auto-Layout</span>
                    </div>

                    <div className="space-y-3 font-mono">
                      <div className="p-2.5 bg-slate-800 rounded-lg text-slate-200 border border-slate-700 text-center font-bold">
                        🏛️ Top Node: IGP (Tech Services)
                      </div>
                      <div className="text-center text-slate-600">&darr;</div>
                      <div className="p-2.5 bg-slate-800 rounded-lg text-slate-200 border border-slate-700 text-center">
                        👮 Supervisory Node: DSP (Extracted from project hierarchy)
                      </div>
                      <div className="text-center text-slate-600">&darr;</div>
                      <div className="p-2.5 bg-slate-800 rounded-lg text-slate-200 border border-slate-700 text-center">
                        👮 Supervisory Node: CI / Inspector
                      </div>
                      <div className="text-center text-slate-600">&darr;</div>
                      <div className="p-2.5 bg-slate-800 rounded-lg text-slate-200 border border-slate-700 text-center">
                        👮 Field Supervisor: Sub-Inspector (SI)
                      </div>
                      <div className="text-center text-slate-600">&darr;</div>
                      <div className="p-3 bg-blue-900/40 rounded-xl border border-blue-500/40 text-blue-200 text-left">
                        <strong>Operational Personnel Nodes (HC / PC / Outsourcing):</strong>
                        <ul className="list-disc pl-4 mt-2 space-y-1 text-slate-300 font-sans">
                          <li><strong>Officer Name &amp; Rank</strong> + Unique PRO-ID badge</li>
                          <li><strong>Assigned Workstream:</strong> Specific operational sub-domain</li>
                          <li><strong>Itemized Action Items:</strong> Decomposed task bullet points automatically extracted from workstream descriptions</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                      <strong className="text-white block mb-1">🔍 Zoom &amp; Pan Controls</strong>
                      Use mouse wheel or touch pinch to zoom from 20% to 150%. Click &ldquo;Fit View&rdquo; to auto-center.
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                      <strong className="text-white block mb-1">🗺️ Interactive Minimap</strong>
                      Bottom-right overview navigator to jump to any branch in complex multi-officer projects.
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                      <strong className="text-white block mb-1">📱 Mobile Adaptive</strong>
                      Full touch gesture support for tablet presentations and leadership reviews.
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Section 5: Manpower & Allocation */}
          {activeSection === 'manpower' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">5. Manpower Matrix &amp; PRO-ID Rules</h2>
                    <p className="text-sm text-slate-400">Deduplication rules, multi-project allocation, and capacity validation</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs text-slate-300">
                  <div className="p-4 bg-blue-950/40 border border-blue-600/30 rounded-xl space-y-2">
                    <strong className="text-blue-400 text-sm">PRO-ID Auto-Numbering Standard</strong>
                    <p>
                      Every personnel record is assigned a permanent sequential identifier: <code>PRO-001</code>, <code>PRO-002</code>, ... <code>PRO-155</code>.
                    </p>
                    <p>
                      <strong>Cross-Project Rule:</strong> When an officer is involved in multiple projects (e.g. <em>B.S.Srinivasa Rao</em> in CCTNS, AI4AP SOCINT, and NEWS360AI), they are <strong>NOT duplicated</strong>. They retain one single PRO-ID with fractional allocations across their respective projects.
                    </p>
                  </div>

                  <h3 className="text-base font-semibold text-white mt-4">Allocation &amp; FTE Validation Rules</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <strong className="text-emerald-400 text-sm block mb-1">Optimal: 100%</strong>
                      The sum of an officer&apos;s project allocations equals 100% (1.0 FTE). Full productive capacity without overwork.
                    </div>
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <strong className="text-amber-400 text-sm block mb-1">Underallocated: &lt;50%</strong>
                      Highlighted in amber on the matrix. Indicates available officer capacity to take on new technical tasks.
                    </div>
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <strong className="text-red-400 text-sm block mb-1">Overallocated: &gt;100%</strong>
                      Highlighted in red. The officer is over-committed across multiple projects, triggering risk alerts.
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Section 6: ICI Scoring */}
          {activeSection === 'ici' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">6. Individual Contribution Index (ICI)</h2>
                    <p className="text-sm text-slate-400">100-point objective performance evaluation formula</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <div className="text-xl font-bold text-blue-400">40 pts</div>
                      <div className="text-[11px] font-semibold text-white mt-1">Delivery</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">Tasks completed</div>
                    </div>
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <div className="text-xl font-bold text-emerald-400">20 pts</div>
                      <div className="text-[11px] font-semibold text-white mt-1">Quality</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">Accuracy &amp; standards</div>
                    </div>
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                      <div className="text-xl font-bold text-purple-400">15 pts</div>
                      <div className="text-[11px] font-semibold text-white mt-1">Timeliness</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">Milestone adherence</div>
                    </div>
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <div className="text-xl font-bold text-amber-400">10 pts</div>
                      <div className="text-[11px] font-semibold text-white mt-1">Prob. Solving</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">Issue resolution</div>
                    </div>
                    <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl">
                      <div className="text-xl font-bold text-sky-400">10 pts</div>
                      <div className="text-[11px] font-semibold text-white mt-1">Collaboration</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">Cross-team work</div>
                    </div>
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                      <div className="text-xl font-bold text-indigo-400">5 pts</div>
                      <div className="text-[11px] font-semibold text-white mt-1">Documentation</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">SOPs &amp; reports</div>
                    </div>
                  </div>

                  {/* Interactive ICI Calculator */}
                  <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                          <Award className="w-4 h-4 text-yellow-400" /> Interactive ICI Score Simulator
                        </h4>
                        <p className="text-xs text-slate-400">Adjust sliders below to test score calculation and classification</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-3xl font-extrabold text-white">{totalIci}<span className="text-sm font-normal text-slate-400">/100</span></div>
                        <div className={cn("px-3 py-1 rounded-full text-xs font-semibold border", getIciBadge(totalIci).color)}>
                          {getIciBadge(totalIci).label}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {[
                        { key: 'delivery', label: 'Delivery Score', max: 40 },
                        { key: 'quality', label: 'Quality Score', max: 20 },
                        { key: 'timeliness', label: 'Timeliness Score', max: 15 },
                        { key: 'problemSolving', label: 'Problem Solving Score', max: 10 },
                        { key: 'collaboration', label: 'Collaboration Score', max: 10 },
                        { key: 'documentation', label: 'Documentation Score', max: 5 },
                      ].map((param) => (
                        <div key={param.key} className="space-y-1 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-300 font-medium">{param.label} (Max {param.max})</span>
                            <span className="text-blue-400 font-bold">{iciScores[param.key as keyof typeof iciScores]} pts</span>
                          </div>
                          <input 
                            type="range"
                            min="0"
                            max={param.max}
                            value={iciScores[param.key as keyof typeof iciScores]}
                            onChange={(e) => setIciScores({ ...iciScores, [param.key]: Number(e.target.value) })}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-white">Score Classification Bands</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <strong className="text-emerald-400 block mb-1">90–100: Exceptional</strong>
                      Top performance; suitable for technical leadership &amp; commendations.
                    </div>
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <strong className="text-blue-400 block mb-1">80–89: High Contributor</strong>
                      Exceeds milestones reliably; autonomous execution.
                    </div>
                    <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20">
                      <strong className="text-sky-400 block mb-1">70–79: Effective</strong>
                      Meets core deliverables consistently.
                    </div>
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <strong className="text-amber-400 block mb-1">60–69: Needs Optimisation</strong>
                      Workstream re-alignment or supervision required.
                    </div>
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                      <strong className="text-red-400 block mb-1">&lt;60: Role Review</strong>
                      Deliverables delayed; re-deployment or training review needed.
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Section 7: Deliverables & Commitments */}
          {activeSection === 'commitments' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">7. Monthly Deliverable Commitments</h2>
                    <p className="text-sm text-slate-400">Frozen monthly targets and Target vs Achievement tracking</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs text-slate-300">
                  <p>
                    At the start of each month, 3&ndash;5 frozen deliverables are established per officer per project. During monthly review, actual achievement is entered to compute status:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                        <span>🟢</span> Green: On Track (&ge; 90%)
                      </div>
                      <p className="text-slate-300">Achievement ratio is &ge; 0.9 of the target. Deliverable completed on schedule.</p>
                    </div>
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                        <span>🟡</span> Amber: In Progress (60% &ndash; 89%)
                      </div>
                      <p className="text-slate-300">Achievement ratio is between 0.6 and 0.89. Requires supervisory acceleration.</p>
                    </div>
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1">
                      <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                        <span>🔴</span> Red: At Risk (&lt; 60%)
                      </div>
                      <p className="text-slate-300">Achievement is below 0.6 of target. Escalated as Delayed Deliverable on Executive Dashboard.</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                    <strong className="text-white text-sm block mb-1">⚡ Inline Achievement Updating</strong>
                    <p>
                      Supervisors can update achievement numbers directly in the table on the <Link href="/commitments" className="text-blue-400 underline">Commitments page</Link>. The status badge (🟢🟡🔴) recalculates automatically in real time.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Section 8: FTE & Capacity Analytics */}
          {activeSection === 'analytics' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">8. FTE &amp; Capacity Analytics</h2>
                    <p className="text-sm text-slate-400">Headcount vs Effective Full-Time Equivalent comparison</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs text-slate-300">
                  <p>
                    Headcount alone can be misleading in multi-project IT departments. The <Link href="/analytics/fte" className="text-blue-400 underline">FTE Analytics page</Link> distinguishes between:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 space-y-1.5">
                      <strong className="text-white text-sm">Headcount:</strong>
                      <p>Total physical officers attached to a project, regardless of how much time they dedicate.</p>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 space-y-1.5">
                      <strong className="text-blue-400 text-sm">Effective FTE:</strong>
                      <p>The true deployed effort. For example, if a project has 5 officers each assigned at 20%, Headcount = 5 but Effective FTE = 1.0.</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                    <strong className="text-white text-sm">Expandable Person Breakdown:</strong>
                    <p>
                      Clicking any officer in the FTE table expands their complete portfolio showing every project they are assigned to, their fractional percentages, and whether their aggregate workload is balanced.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Section 9: Risk Matrix */}
          {activeSection === 'risks' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">9. Risk &amp; Dependency Matrix</h2>
                    <p className="text-sm text-slate-400">Detecting Single Points of Failure and organizational bottlenecks</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs text-slate-300">
                  <p>
                    The <Link href="/analytics/risks" className="text-blue-400 underline">Risk Matrix page</Link> evaluates all project allocations algorithmically to flag 3 categories of operational risk:
                  </p>

                  <div className="space-y-3">
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1">
                      <strong className="text-red-400 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> 1. Key-Person Risks (SPOF - Single Point of Failure)
                      </strong>
                      <p>
                        Triggered when an entire technical workstream (e.g. <em>Database Administration</em> or <em>CDAC API Integration</em>) relies on only 1 officer. The system generates an actionable recommendation: <em>&ldquo;Assign secondary backup owner&rdquo;</em>.
                      </p>
                    </div>

                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
                      <strong className="text-amber-400 text-sm flex items-center gap-2">
                        <Users className="w-4 h-4" /> 2. Overallocation Risks (&gt;100%)
                      </strong>
                      <p>
                        Flags personnel whose cumulative workload across all projects exceeds 100%, indicating potential deliverable slippage and burnout risk.
                      </p>
                    </div>

                    <div className="p-4 bg-sky-500/10 border border-sky-500/20 rounded-xl space-y-1">
                      <strong className="text-sky-400 text-sm flex items-center gap-2">
                        <Info className="w-4 h-4" /> 3. Underutilisation Opportunities (&lt;50%)
                      </strong>
                      <p>
                        Lists personnel who have spare capacity (&lt;50% total allocation) and can be assigned to higher-priority projects.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Section 10: Data Management & Excel */}
          {activeSection === 'admin' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                    <Settings className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">10. Data Management &amp; Excel Operations</h2>
                    <p className="text-sm text-slate-400">Bulk Excel import, live export, and manual data administration</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs text-slate-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 space-y-2">
                      <strong className="text-blue-400 text-sm flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4" /> Bulk Excel Import
                      </strong>
                      <p>
                        Upload <code>.xlsx</code> or <code>.xls</code> spreadsheets on the <Link href="/admin" className="text-blue-400 underline">Admin page</Link>. The parser automatically:
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-slate-400">
                        <li>Processes multi-sheet workbooks (1 sheet = 1 project)</li>
                        <li>Extracts supervisory hierarchy (DSP, CI, SI)</li>
                        <li>Deduplicates officers across sheets</li>
                        <li>Generates sequential PRO-IDs</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 space-y-2">
                      <strong className="text-emerald-400 text-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Full System Export
                      </strong>
                      <p>
                        Click <strong>&ldquo;Export All Data&rdquo;</strong> to generate an instant Excel backup containing:
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-slate-400">
                        <li>Master Personnel list with PRO-IDs</li>
                        <li>All 38 Projects with hierarchy chains</li>
                        <li>All active workstream assignments</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                    <strong className="text-white text-sm block mb-1">Manual CRUD Entry</strong>
                    <p>
                      In addition to bulk Excel imports, administrators can add individual projects, create new officers, assign team members, and log notes manually anytime using the &ldquo;+ Add&rdquo; modals located throughout the site.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Section 11: FAQ */}
          {activeSection === 'faq' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">11. Frequently Asked Questions (FAQ)</h2>
                    <p className="text-sm text-slate-400">Common questions and operational guidance</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-300">
                  {[
                    {
                      q: 'What should I do if an officer is transferred or reassigned?',
                      a: 'Navigate to the Manpower Matrix or Project Detail page, find the officer, and update their project assignment or allocation %. If they are no longer in Tech Services, set their status to "Inactive" on their Person Profile.'
                    },
                    {
                      q: 'How are PRO-IDs generated and can they change?',
                      a: 'PRO-IDs (PRO-001, PRO-002, etc.) are permanent sequential identifiers created automatically by Firestore transactions. They never change, even if an officer switches projects.'
                    },
                    {
                      q: 'How do I generate a new Flow Diagram for a new project?',
                      a: 'Flow diagrams are 100% auto-generated. Simply create the project, specify the DSP/CI/SI hierarchy, and assign team members with workstream descriptions. The interactive flow tree will render immediately.'
                    },
                    {
                      q: 'Can multiple officers share the same RACI role on a project?',
                      a: 'Multiple officers can be "Responsible", "Consulted", or "Informed", but only one officer should be "Accountable" (A) for a given deliverable or workstream.'
                    },
                    {
                      q: 'How often should ICI scorecards be updated?',
                      a: 'ICI Scorecards are monthly assessments evaluated at the end of each month across the 6 weighted parameters (Delivery, Quality, Timeliness, Problem Solving, Collaboration, Documentation).'
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 space-y-1.5">
                      <strong className="text-white text-sm flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                        {item.q}
                      </strong>
                      <p className="text-slate-300 pl-7">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
