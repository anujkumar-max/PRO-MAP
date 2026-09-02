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
  Info,
  Shield,
  Clock,
  ArrowUpDown,
  CheckCircle2,
  UserCheck,
  Building,
  KeyRound,
  FileText,
  Activity
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
    { id: 'overview', title: '1. PRO-MAP Framework & Architecture', icon: Layers },
    { id: 'dashboard', title: '2. Executive Dashboard & Controls', icon: LayoutDashboard },
    { id: 'projects', title: '3. Projects Directory & Sorting', icon: FolderKanban },
    { id: 'project-detail', title: '4. Project 4-Tab Detail & Health Card', icon: ShieldCheck },
    { id: 'flow', title: '5. 4-Tier Command Flow Diagrams', icon: GitBranch },
    { id: 'manpower', title: '6. Manpower Matrix & Cadres', icon: Users },
    { id: 'people', title: '7. Person Profile & Dossier', icon: Award },
    { id: 'ici', title: '8. Monthly Scorecards & ICI (100 pts)', icon: ClipboardList },
    { id: 'commitments', title: '9. Deliverables & Commitments', icon: Target },
    { id: 'analytics', title: '10. FTE & Capacity Analytics', icon: BarChart3 },
    { id: 'risks', title: '11. Risk Matrix & Dependency Analysis', icon: AlertTriangle },
    { id: 'admin', title: '12. Data Management & Excel Tools', icon: Settings },
    { id: 'glossary', title: '13. Glossary & Quick Cheat Sheet', icon: BookOpen },
    { id: 'faq', title: '14. FAQ & Officer Reference', icon: HelpCircle },
  ];

  const filteredSections = sections.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 text-white">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/70 via-slate-900/90 to-sky-950/70 border border-white/10 p-6 md:p-10 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" /> Official Platform Operations &amp; User Manual
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-sky-300 bg-clip-text text-transparent">
              PRO-MAP System Guide
            </h1>
            <p className="text-slate-300 text-sm md:text-base max-w-3xl leading-relaxed">
              Complete reference manual for the <strong>Project, Role, Outcome &amp; Manpower Assessment Platform</strong>. Covers all 12 modules, dual-track FTE formulas, 10-point project health cards, interactive flow trees, and operational workflows.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-w-[260px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search any function or option..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between px-1 font-mono">
              <span>36 Projects</span>
              <span>•</span>
              <span>167 Personnel</span>
              <span>•</span>
              <span>100% Synced</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <div className="sticky top-6 bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-2xl p-3 space-y-1 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 mb-1">
              Modules &amp; Operations Index
            </div>
            {filteredSections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all duration-200",
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
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">1. The PRO-MAP Model &amp; Architecture</h2>
                    <p className="text-sm text-slate-400">Project, Role, Outcome &amp; Manpower Assessment Platform for Police IT</p>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none text-slate-300 space-y-4 text-xs md:text-sm leading-relaxed">
                  <p>
                    In technology and IT operations within Police Tech Services, personnel are frequently involved across multiple parallel systems (e.g., CCTNS, Data Center, ICJS, RTGS). PRO-MAP replaces traditional static deployment (<em>&ldquo;Officer X works in IT wing&rdquo;</em>) with an objective <strong>Project&ndash;Role&ndash;Outcome framework</strong>.
                  </p>

                  {/* Dual-Track Cadre Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                    <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-5 space-y-2">
                      <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-4 h-4" /> Track 1: Operational Staff (140 Personnel)
                      </div>
                      <p className="text-xs text-slate-300">
                        Technical personnel (HC, PC, Developers, Data Entry) responsible for hands-on engineering, operations, and support.
                      </p>
                      <div className="pt-2 text-xs font-mono text-emerald-300 font-semibold border-t border-slate-800">
                        Total Operational Effort = 140.0 Staff FTE (100% Deployed)
                      </div>
                    </div>

                    <div className="bg-slate-900/80 border border-purple-500/30 rounded-2xl p-5 space-y-2">
                      <div className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Track 2: Command Officers (27 Officers)
                      </div>
                      <p className="text-xs text-slate-300">
                        Supervisory officers (SP, Addl. SP, DSP, CI, SI, AAO) providing project governance, administrative monitoring, and technical leadership.
                      </p>
                      <div className="pt-2 text-xs font-mono text-purple-300 font-semibold border-t border-slate-800">
                        Supervisory Allocation = 27.0 Officer FTE (Rounded % Shares)
                      </div>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mt-6">The Five Framework Layers</h3>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-2 p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs text-center font-medium shadow-inner">
                    <div className="p-3 bg-blue-600/20 text-blue-300 rounded-xl w-full border border-blue-500/30"><strong>1. Project</strong><br/><span className="text-slate-400">e.g., CCTNS, Data Center</span></div>
                    <ChevronRight className="hidden md:block text-slate-600 w-4 h-4" />
                    <div className="p-3 bg-indigo-600/20 text-indigo-300 rounded-xl w-full border border-indigo-500/30"><strong>2. Workstream</strong><br/><span className="text-slate-400">e.g., System Integration</span></div>
                    <ChevronRight className="hidden md:block text-slate-600 w-4 h-4" />
                    <div className="p-3 bg-purple-600/20 text-purple-300 rounded-xl w-full border border-purple-500/30"><strong>3. Functional Role</strong><br/><span className="text-slate-400">e.g., Tech Lead / DBA</span></div>
                    <ChevronRight className="hidden md:block text-slate-600 w-4 h-4" />
                    <div className="p-3 bg-sky-600/20 text-sky-300 rounded-xl w-full border border-sky-500/30"><strong>4. Deliverable</strong><br/><span className="text-slate-400">e.g., API Uptime / Sync</span></div>
                    <ChevronRight className="hidden md:block text-slate-600 w-4 h-4" />
                    <div className="p-3 bg-emerald-600/20 text-emerald-300 rounded-xl w-full border border-emerald-500/30"><strong>5. Monthly Outcome</strong><br/><span className="text-slate-400">e.g., 99.8% Adherence</span></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Section 2: Executive Dashboard */}
          {activeSection === 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                    <LayoutDashboard className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">2. Executive Dashboard &amp; Macro Controls</h2>
                    <p className="text-sm text-slate-400">Command view of all 36 initiatives, personnel deployment, and live alerts</p>
                  </div>
                </div>

                <div className="space-y-6 text-xs text-slate-300">
                  {/* Top Review Cycle Controls */}
                  <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                      <Clock className="w-4 h-4" /> Review Cycle Month Selector (Header)
                    </div>
                    <p>
                      Located at the top-right of the dashboard. Allows leadership to toggle between <strong>September 2026 (Active)</strong>, <strong>August 2026</strong>, or historical monthly cycles. All charts, stats, and health metrics update dynamically.
                    </p>
                  </div>

                  {/* 4 Primary Stat Cards */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Top 4 Interactive KPI Cards</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 space-y-1">
                        <strong className="text-blue-400 block font-semibold">1. Total Projects (36)</strong>
                        <p className="text-slate-400">Displays all 36 active initiatives. Click to open the Projects Directory.</p>
                      </div>
                      <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 space-y-1">
                        <strong className="text-indigo-400 block font-semibold">2. Total Personnel (167)</strong>
                        <p className="text-slate-400">Dual breakdown of 140 Staff + 27 Officers. Click to open Manpower Matrix.</p>
                      </div>
                      <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 space-y-1">
                        <strong className="text-purple-400 block font-semibold">3. Staff Effective FTE (140.0)</strong>
                        <p className="text-slate-400">True operational effort + 27.0 Officer FTE. Click to open FTE Analytics.</p>
                      </div>
                      <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 space-y-1">
                        <strong className="text-emerald-400 block font-semibold">4. High Performers</strong>
                        <p className="text-slate-400">Personnel with ICI score &ge; 80%. Click to open Monthly Scorecards.</p>
                      </div>
                    </div>
                  </div>

                  {/* Health Donut & Alerts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 space-y-2">
                      <strong className="text-emerald-400 text-sm flex items-center gap-1.5">
                        <Activity className="w-4 h-4" /> Project Health Status Donut
                      </strong>
                      <p>Visualizes overall health across all 36 projects:</p>
                      <ul className="list-disc pl-4 space-y-1 text-slate-400">
                        <li><strong>🟢 On Track (Green):</strong> Milestones &amp; deliverables proceeding on schedule.</li>
                        <li><strong>🟡 At Risk (Amber):</strong> Minor delays, dependency blockers, or understaffing.</li>
                        <li><strong>🔴 Critical (Red):</strong> Major blockers requiring senior command intervention.</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 space-y-2">
                      <strong className="text-amber-400 text-sm flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" /> 4 Command Alert Cards
                      </strong>
                      <ul className="list-disc pl-4 space-y-1 text-slate-400">
                        <li><strong>Balanced &amp; Optimal:</strong> Count of personnel at exactly 100% (1.0 FTE).</li>
                        <li><strong>Overallocated:</strong> Personnel with &gt;100% workload across projects.</li>
                        <li><strong>Underutilised:</strong> Personnel with spare capacity (&lt;50% allocation).</li>
                        <li><strong>Delayed Deliverables:</strong> Deliverable commitments below 60% completion.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Section 3: Projects Directory & Sorting */}
          {activeSection === 'projects' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                    <FolderKanban className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">3. Projects Directory &amp; Sorting Controls</h2>
                    <p className="text-sm text-slate-400">Filtering, FTE re-ordering, and dual capacity card indicators</p>
                  </div>
                </div>

                <div className="space-y-6 text-xs text-slate-300">
                  {/* Sorting Options Breakdown */}
                  <div className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                      <ArrowUpDown className="w-4 h-4" /> Multi-Dimension Sorting Dropdown
                    </div>
                    <p>
                      Located next to the Search bar. Allows re-ordering all 36 projects according to operational criteria:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                        <strong className="text-white block font-semibold">📉 Staff FTE: Low ➔ High</strong>
                        <span className="text-slate-400 text-[11px]">Instantly isolates projects with 0 FTE or low staffing awaiting technical personnel.</span>
                      </div>
                      <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                        <strong className="text-white block font-semibold">📈 Staff FTE: High ➔ Low</strong>
                        <span className="text-slate-400 text-[11px]">Highlights resource-heavy initiatives (e.g., Data Center with 13 FTE, CCTNS with 11 FTE).</span>
                      </div>
                      <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                        <strong className="text-white block font-semibold">👥 Staff Count: High / Low</strong>
                        <span className="text-slate-400 text-[11px]">Sorts by the number of operational technical hands deployed on the project.</span>
                      </div>
                      <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                        <strong className="text-white block font-semibold">🛡️ Officer Oversight: High / Low</strong>
                        <span className="text-slate-400 text-[11px]">Sorts by supervisory density (SP, DSP, CI, SI assigned).</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Indicators Guide */}
                  <div className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Project Card Indicators</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-slate-800/60 rounded-xl border border-emerald-500/30">
                        <strong className="text-emerald-400 block font-semibold mb-1">👥 Staff Operational Badge</strong>
                        <span>Displays operational headcount and exact Staff FTE (e.g. <em>11 operational • 11.0 FTE</em>).</span>
                      </div>
                      <div className="p-3 bg-slate-800/60 rounded-xl border border-purple-500/30">
                        <strong className="text-purple-400 block font-semibold mb-1">🛡️ Officer Supervisory Badge</strong>
                        <span>Displays supervising officer count and fractional capacity share (e.g. <em>2 supervising • 0.34 FTE</em>).</span>
                      </div>
                      <div className="p-3 bg-slate-800/60 rounded-xl border border-amber-500/30">
                        <strong className="text-amber-400 block font-semibold mb-1">⚠️ Zero-Staff Alert Banner</strong>
                        <span>Highlights projects that have officer command active but are awaiting operational staff deployment.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Section 4: Project 4-Tab Detail & Health Card */}
          {activeSection === 'project-detail' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">4. Project 4-Tab Detail &amp; 10-Point Health Card</h2>
                    <p className="text-sm text-slate-400">Roster management, flow trees, 10 operational health indicators, and minutes</p>
                  </div>
                </div>

                <div className="space-y-6 text-xs text-slate-300">
                  {/* Hero Banner Feature */}
                  <div className="p-4 bg-slate-900/80 rounded-2xl border border-blue-500/30 space-y-2">
                    <strong className="text-blue-400 text-sm flex items-center gap-2">
                      🏛️ Apex Executive Command Branding
                    </strong>
                    <p>
                      Every project detail page prominently features apex command ownership: <strong>Executive Command: 🏛️ Inspector General of Police (Tech Services) [Apex Executive]</strong> alongside the assigned DSP/CI supervisory chain.
                    </p>
                  </div>

                  {/* 4 Tabs Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 space-y-2">
                      <strong className="text-blue-400 text-sm flex items-center gap-1.5">
                        <Users className="w-4 h-4" /> Tab 1: Team &amp; Workstreams
                      </strong>
                      <p>
                        Roster of all assigned staff and officers. Features <strong>inline cell editing</strong> for Workstream Name, Role, RACI, and Allocation %. Includes <strong>&ldquo;+ Add Member&rdquo;</strong> modal and visual personnel allocation donut chart.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 space-y-2">
                      <strong className="text-indigo-400 text-sm flex items-center gap-1.5">
                        <GitBranch className="w-4 h-4" /> Tab 2: Flow Diagram
                      </strong>
                      <p>
                        Embedded interactive command hierarchy tree. Visualizes IGP &rarr; SP/DSP &rarr; CI/SI &rarr; Operational staff with itemized action items and full-window expansion link.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 space-y-2">
                      <strong className="text-emerald-400 text-sm flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" /> Tab 3: 10-Point Health Card
                      </strong>
                      <p>
                        Comprehensive 5-section monthly health evaluation card with month selector (September 2026, August 2026) and auto-calculated velocity and resolution rate badges.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 space-y-2">
                      <strong className="text-amber-400 text-sm flex items-center gap-1.5">
                        <FileText className="w-4 h-4" /> Tab 4: Notes &amp; Minutes
                      </strong>
                      <p>
                        Meeting minutes, vendor instructions, architectural decisions, and departmental review logs specific to the project with title, date, and content preview.
                      </p>
                    </div>
                  </div>

                  {/* 10-Point Health Card 5 Sections */}
                  <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">The 10 Operational Health Card Indicators (5 Sections)</h3>
                    <div className="space-y-2.5">
                      <div className="p-3 bg-slate-800/50 rounded-xl border border-blue-500/20">
                        <strong className="text-blue-400">1. Delivery &amp; Milestone Velocity:</strong> Health Status (Green/Amber/Red), Milestone Status (On Time/Delayed), Planned &amp; Completed Deliverables with auto % Velocity badge.
                      </div>
                      <div className="p-3 bg-slate-800/50 rounded-xl border border-emerald-500/20">
                        <strong className="text-emerald-400">2. Manpower &amp; Resource Deployment:</strong> Sanctioned Strength, Deployed Staff, Effective Staff FTE, Underutilised Personnel count (&lt;50%), Duplicate Roles count.
                      </div>
                      <div className="p-3 bg-slate-800/50 rounded-xl border border-amber-500/20">
                        <strong className="text-amber-400">3. Issue &amp; Ticket Resolution:</strong> Open Issues / Blockers, Resolved Issues with auto % Resolution Rate badge.
                      </div>
                      <div className="p-3 bg-slate-800/50 rounded-xl border border-purple-500/20">
                        <strong className="text-purple-400">4. Dependencies &amp; Operational Friction:</strong> Vendor / OEM Delays counter, Internal Tech Blockers, External Govt / District Approvals.
                      </div>
                      <div className="p-3 bg-slate-800/50 rounded-xl border border-rose-500/20">
                        <strong className="text-rose-400">5. Key-Person Risk &amp; Supervisory Remarks:</strong> Key-Person Dependency Level (Low/Medium/High) + Multiline Supervisory Remarks &amp; Escalation Notes.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Section 5: 4-Tier Command Flow Diagrams */}
          {activeSection === 'flow' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                    <GitBranch className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">5. 4-Tier Command Flow Diagrams</h2>
                    <p className="text-sm text-slate-400">Dynamic tree layout, task decomposition, and interactive navigation</p>
                  </div>
                </div>

                <div className="space-y-6 text-xs text-slate-300">
                  <p>
                    Every project automatically renders a dynamic multi-tier organizational tree accessible directly inside the project view or on the dedicated page at <code>/flow/detail?id=[PRJ-ID]</code>.
                  </p>

                  {/* 4 Tier Tree Visualization */}
                  <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3 font-mono">
                    <div className="p-3 bg-gradient-to-r from-blue-900/80 to-slate-900 rounded-xl border border-blue-500/40 text-center font-bold text-white text-sm">
                      🏛️ Tier 1: Apex Executive Command (IGP Tech Services)
                    </div>
                    <div className="text-center text-slate-600 font-bold">&darr;</div>
                    <div className="p-2.5 bg-slate-800 rounded-xl border border-purple-500/40 text-center font-bold text-purple-200">
                      🛡️ Tier 2: Supervisory Command (SP / Addl. SP / DSP)
                    </div>
                    <div className="text-center text-slate-600 font-bold">&darr;</div>
                    <div className="p-2.5 bg-slate-800 rounded-xl border border-amber-500/40 text-center font-bold text-amber-200">
                      👮 Tier 3: Monitoring &amp; Administration (CI / SI / ASI / AAO)
                    </div>
                    <div className="text-center text-slate-600 font-bold">&darr;</div>
                    <div className="p-3 bg-blue-950/60 rounded-xl border border-blue-500/40 text-left font-sans space-y-1 text-slate-300">
                      <strong className="text-blue-300 font-bold text-xs block">👥 Tier 4: Operational Staff Workstream Nodes (HC / PC / Technical Staff)</strong>
                      <ul className="list-disc pl-4 space-y-1">
                        <li><strong>Officer Card:</strong> Name, Rank, and PRO-ID badge with clickable link to profile.</li>
                        <li><strong>Assigned Workstream:</strong> Specific operational sub-discipline.</li>
                        <li><strong>Itemized Action Items:</strong> Decomposed task bullet points extracted from workstream description.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                      <strong className="text-white block font-semibold mb-1">🔍 Interactive Canvas</strong>
                      <span>Smooth zoom (20% to 150%), pan, and drag controls with auto-centering on multi-officer branches.</span>
                    </div>
                    <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                      <strong className="text-white block font-semibold mb-1">🗺️ Live Minimap</strong>
                      <span>Bottom-right navigation radar to instantly jump across large team structures.</span>
                    </div>
                    <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                      <strong className="text-white block font-semibold mb-1">👤 One-Click Dossier</strong>
                      <span>Clicking any person node opens their complete career profile and cross-project allocations.</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Section 6: Manpower Matrix & Cadres */}
          {activeSection === 'manpower' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">6. Manpower Matrix &amp; Cadre Analysis</h2>
                    <p className="text-sm text-slate-400">Complete roster of 167 personnel, cadre filters, and allocation audits</p>
                  </div>
                </div>

                <div className="space-y-6 text-xs text-slate-300">
                  {/* Cadre Filter Pills */}
                  <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                    <strong className="text-blue-400 text-sm flex items-center gap-2">
                      <Users className="w-4 h-4" /> Cadre Filter Tabs
                    </strong>
                    <p>
                      Easily toggle between <strong>All Personnel (167)</strong>, <strong>👥 Operational Staff (140)</strong>, and <strong>🛡️ Command Officers (27)</strong>.
                    </p>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                      <strong className="text-blue-400 block font-semibold">Total Pool Headcount</strong>
                      <span>Filtered count of active personnel in the system.</span>
                    </div>
                    <div className="p-3 bg-slate-800/60 rounded-xl border border-emerald-500/30">
                      <strong className="text-emerald-400 block font-semibold">Average Allocation</strong>
                      <span>Target is 100% per person across their assigned projects.</span>
                    </div>
                    <div className="p-3 bg-slate-800/60 rounded-xl border border-red-500/30">
                      <strong className="text-red-400 block font-semibold">Overallocated (&gt;100%)</strong>
                      <span>Highlighted in red; flags burnout risk.</span>
                    </div>
                    <div className="p-3 bg-slate-800/60 rounded-xl border border-amber-500/30">
                      <strong className="text-amber-400 block font-semibold">Underallocated (&lt;100%)</strong>
                      <span>Highlighted in amber; identifies spare capacity.</span>
                    </div>
                  </div>

                  {/* Multi-Project Deduplication Rule */}
                  <div className="p-4 bg-blue-950/40 border border-blue-600/30 rounded-xl space-y-1.5">
                    <strong className="text-blue-300 text-sm">Permanent PRO-ID Standard</strong>
                    <p>
                      Every officer is assigned a permanent identifier (<code>PRO-001</code> to <code>PRO-167</code>). When an officer works on multiple projects, they retain one single profile with separate assignment rows for each project.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Section 7: Person Profile */}
          {activeSection === 'people' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">7. Person Profile &amp; Individual Dossier</h2>
                    <p className="text-sm text-slate-400">Individual capacity breakdown, project assignments, and monthly ICI history</p>
                  </div>
                </div>

                <div className="space-y-6 text-xs text-slate-300">
                  <p>
                    Accessible by clicking any person&apos;s name or PRO-ID across the platform, or via <code>/people/detail?id=[PERSON-ID]</code>.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 space-y-2">
                      <strong className="text-blue-400 text-sm block">1. Officer Hero &amp; Service Metadata</strong>
                      <p>PRO-ID, Full Name, Rank badge, General Number (GEN NO), Deputation/Attachment type, and Service Start Date.</p>
                    </div>

                    <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 space-y-2">
                      <strong className="text-emerald-400 text-sm block">2. Assigned Projects Portfolio</strong>
                      <p>Cards for each assigned project with Workstream Name, Functional Role, RACI type, and Allocation % (with inline editing).</p>
                    </div>

                    <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 space-y-2">
                      <strong className="text-purple-400 text-sm block">3. Multi-Project Allocation Donut</strong>
                      <p>Recharts interactive pie chart illustrating how the officer&apos;s working hours are split across initiatives.</p>
                    </div>

                    <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 space-y-2">
                      <strong className="text-amber-400 text-sm block">4. Monthly ICI Gauge &amp; 6 Dimensions</strong>
                      <p>Current month performance rating with horizontal score bars across Delivery, Quality, Timeliness, Problem Solving, Collaboration, and Documentation.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Section 8: Monthly Scorecards & ICI */}
          {activeSection === 'ici' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">8. Monthly Scorecards &amp; ICI (100 pts)</h2>
                    <p className="text-sm text-slate-400">Objective 6-dimension evaluation matrix and performance bands</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* 6 Dimensions Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <div className="text-xl font-bold text-blue-400">40 pts</div>
                      <div className="text-[11px] font-semibold text-white mt-1">Delivery</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">Tasks &amp; output volume</div>
                    </div>
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <div className="text-xl font-bold text-emerald-400">20 pts</div>
                      <div className="text-[11px] font-semibold text-white mt-1">Quality</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">Technical precision</div>
                    </div>
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                      <div className="text-xl font-bold text-purple-400">15 pts</div>
                      <div className="text-[11px] font-semibold text-white mt-1">Timeliness</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">SLA &amp; milestone speed</div>
                    </div>
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <div className="text-xl font-bold text-amber-400">10 pts</div>
                      <div className="text-[11px] font-semibold text-white mt-1">Prob. Solving</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">Troubleshooting</div>
                    </div>
                    <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl">
                      <div className="text-xl font-bold text-sky-400">10 pts</div>
                      <div className="text-[11px] font-semibold text-white mt-1">Collaboration</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">Cross-team synergy</div>
                    </div>
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                      <div className="text-xl font-bold text-indigo-400">5 pts</div>
                      <div className="text-[11px] font-semibold text-white mt-1">Documentation</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">SOPs &amp; manuals</div>
                    </div>
                  </div>

                  {/* Interactive Simulator */}
                  <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                          <Award className="w-4 h-4 text-yellow-400" /> Interactive ICI Score Simulator
                        </h4>
                        <p className="text-xs text-slate-400">Adjust sliders below to simulate score calculation and rating tier</p>
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

                  {/* Rating Bands */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <strong className="text-emerald-400 block mb-1">90–100: Exceptional</strong>
                      Top performance; technical commendation.
                    </div>
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <strong className="text-blue-400 block mb-1">80–89: High Contributor</strong>
                      Exceeds milestones reliably.
                    </div>
                    <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20">
                      <strong className="text-sky-400 block mb-1">70–79: Effective</strong>
                      Meets core deliverables consistently.
                    </div>
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <strong className="text-amber-400 block mb-1">60–69: Needs Optimisation</strong>
                      Supervision or realignment needed.
                    </div>
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                      <strong className="text-red-400 block mb-1">&lt;60: Role Review</strong>
                      Critical deficit; reassignment review.
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Section 9: Monthly Deliverable Commitments */}
          {activeSection === 'commitments' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">9. Monthly Deliverable Commitments</h2>
                    <p className="text-sm text-slate-400">Frozen monthly targets and Target vs Achievement tracking</p>
                  </div>
                </div>

                <div className="space-y-6 text-xs text-slate-300">
                  <p>
                    At the start of each month, 3&ndash;5 frozen deliverables are established per officer per project on the <Link href="/commitments" className="text-blue-400 underline">Commitments page</Link>.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                        <span>🟢</span> Green: On Track (&ge; 90%)
                      </div>
                      <p className="text-slate-300">Achievement is &ge; 0.9 of target. Deliverable completed on schedule.</p>
                    </div>
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                        <span>🟡</span> Amber: In Progress (60% &ndash; 89%)
                      </div>
                      <p className="text-slate-300">Achievement is 0.60 to 0.89 of target. Requires acceleration.</p>
                    </div>
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1">
                      <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                        <span>🔴</span> Red: At Risk (&lt; 60%)
                      </div>
                      <p className="text-slate-300">Achievement is below 0.60 of target. Escalated to leadership.</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                    <strong className="text-white text-sm block mb-1">⚡ Inline Achievement Entry</strong>
                    <p>
                      Supervising officers can edit achievement numbers directly in the data table cells. The status emoji (🟢🟡🔴) and completion percentages recalculate automatically.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Section 10: FTE & Capacity Analytics */}
          {activeSection === 'analytics' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">10. FTE &amp; Capacity Analytics</h2>
                    <p className="text-sm text-slate-400">Cadre separation, capacity distribution charts, and workload balance</p>
                  </div>
                </div>

                <div className="space-y-6 text-xs text-slate-300">
                  <p>
                    The <Link href="/analytics/fte" className="text-blue-400 underline">FTE Analytics page</Link> measures true deployed effort using the Dual-Track FTE Model.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-800/60 rounded-xl border border-emerald-500/30 space-y-1.5">
                      <strong className="text-emerald-400 text-sm">Staff Operational FTE (140.0):</strong>
                      <p>Measures actual execution capacity from 140 technical staff members (100% optimal deployment).</p>
                    </div>
                    <div className="p-4 bg-slate-800/60 rounded-xl border border-purple-500/30 space-y-1.5">
                      <strong className="text-purple-400 text-sm">Supervisory Command FTE (27.0):</strong>
                      <p>Measures administrative and monitoring span from 27 Command Officers split across initiatives.</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                    <strong className="text-white text-sm">Expandable Project Allocation Drawer:</strong>
                    <p>
                      Clicking any person row in the table expands a nested breakdown showing every project they belong to, workstream names, and individual percentage shares.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Section 11: Risk Matrix */}
          {activeSection === 'risks' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">11. Risk Matrix &amp; Dependency Analysis</h2>
                    <p className="text-sm text-slate-400">Single Point of Failure (SPOF) detection and capacity rebalancing</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs text-slate-300">
                  <p>
                    The <Link href="/analytics/risks" className="text-blue-400 underline">Risk Matrix page</Link> evaluates all 36 projects to flag 3 categories of operational friction:
                  </p>

                  <div className="space-y-3">
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1">
                      <strong className="text-red-400 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> 1. Key-Person Risks (SPOF)
                      </strong>
                      <p>
                        Triggered when an entire technical workstream (e.g. <em>Database Administration</em> or <em>API Integration</em>) is handled by only 1 person without a cross-trained backup. PRO-MAP generates an automated recommendation: <em>&ldquo;Assign secondary backup owner&rdquo;</em>.
                      </p>
                    </div>

                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
                      <strong className="text-amber-400 text-sm flex items-center gap-2">
                        <Users className="w-4 h-4" /> 2. Overallocation Risks (&gt;100%)
                      </strong>
                      <p>
                        Flags personnel whose cumulative project allocations exceed 100%, indicating potential deliverable slippage and burnout risk.
                      </p>
                    </div>

                    <div className="p-4 bg-sky-500/10 border border-sky-500/20 rounded-xl space-y-1">
                      <strong className="text-sky-400 text-sm flex items-center gap-2">
                        <Info className="w-4 h-4" /> 3. Underutilisation Opportunities (&lt;50%)
                      </strong>
                      <p>
                        Lists personnel who have spare bandwidth and can be assigned to higher-priority projects or zero-staff initiatives.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Section 12: Data Management & Excel Tools */}
          {activeSection === 'admin' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                    <Settings className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">12. Data Management &amp; Excel Operations</h2>
                    <p className="text-sm text-slate-400">Master Excel import, live export, and database administration</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs text-slate-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 space-y-2">
                      <strong className="text-blue-400 text-sm flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4" /> Bulk Excel Import
                      </strong>
                      <p>
                        Upload <code>.xlsx</code> spreadsheets on the <Link href="/admin" className="text-blue-400 underline">Admin page</Link>. The parser automatically:
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
                        <li>All 36 Projects with hierarchy chains</li>
                        <li>All active workstream assignments and FTEs</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Section 13: Glossary & Quick Cheat Sheet */}
          {activeSection === 'glossary' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">13. Glossary &amp; Quick Cheat Sheet</h2>
                    <p className="text-sm text-slate-400">Standard terms, formulas, and abbreviations used across PRO-MAP</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs text-slate-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700 space-y-1">
                      <strong className="text-blue-400 block font-semibold text-sm">PRO-MAP</strong>
                      <p className="text-slate-400">Project, Role, Outcome &amp; Manpower Assessment Platform.</p>
                    </div>
                    <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700 space-y-1">
                      <strong className="text-emerald-400 block font-semibold text-sm">FTE (Full-Time Equivalent)</strong>
                      <p className="text-slate-400">Standard unit of effort. 1.0 FTE = 100% full-time capacity of one person.</p>
                    </div>
                    <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700 space-y-1">
                      <strong className="text-purple-400 block font-semibold text-sm">ICI (Individual Contribution Index)</strong>
                      <p className="text-slate-400">100-point monthly performance score across 6 weighted operational dimensions.</p>
                    </div>
                    <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700 space-y-1">
                      <strong className="text-amber-400 block font-semibold text-sm">RACI Framework</strong>
                      <p className="text-slate-400">Accountable (A), Responsible (R), Consulted (C), Informed (I).</p>
                    </div>
                    <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700 space-y-1">
                      <strong className="text-rose-400 block font-semibold text-sm">SPOF (Single Point of Failure)</strong>
                      <p className="text-slate-400">A critical workstream with only 1 person assigned and no designated backup.</p>
                    </div>
                    <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700 space-y-1">
                      <strong className="text-sky-400 block font-semibold text-sm">PRO-ID</strong>
                      <p className="text-slate-400">Permanent unique sequential identifier (e.g. PRO-001) assigned to every personnel record.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Section 14: FAQ */}
          {activeSection === 'faq' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">14. Frequently Asked Questions (FAQ)</h2>
                    <p className="text-sm text-slate-400">Common questions and operational guidance for supervisory officers</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-300">
                  {[
                    {
                      q: 'How do I identify which projects have no technical staff assigned?',
                      a: 'Go to the Projects page and use the Sort dropdown to select "📉 Staff FTE: Low ➔ High". All projects with 0.0 Staff FTE (e.g. RTGS, Trainings, AI4AP) will appear right at the top with an amber "Command Oversight Only • Awaiting Staff" badge.'
                    },
                    {
                      q: 'Why are Staff FTE and Officer FTE displayed separately?',
                      a: 'Operational staff (140 personnel) do hands-on engineering, coding, and operations (140.0 Staff FTE). Command officers (27 personnel) provide governance and monitoring across multiple projects (27.0 Officer FTE). Keeping them separate prevents artificial capacity inflation.'
                    },
                    {
                      q: 'How do I update the monthly 10-Point Health Card for my project?',
                      a: 'Navigate to Projects ➔ click your project ➔ select Tab 3: Health Card ➔ choose the evaluation cycle (e.g., September 2026) ➔ adjust the 10 indicators across the 5 sections ➔ click "Save 10-Point Health Card".'
                    },
                    {
                      q: 'How are Flow Diagrams generated for projects?',
                      a: 'Flow diagrams are 100% dynamically auto-generated from project data. As soon as a project is created and team members are assigned, the 4-tier tree (IGP ➔ SP/DSP ➔ CI/SI ➔ Operational Staff) is rendered instantly with zoom, pan, and minimap.'
                    },
                    {
                      q: 'What should I do if an officer is transferred or reassigned?',
                      a: 'Open the Manpower Matrix or Project Detail view, find the person, and update their project assignment or allocation %. If they are transferred out of Tech Services, mark their status as "Inactive" on their Person Profile.'
                    },
                    {
                      q: 'Can multiple officers share the same RACI role on a project?',
                      a: 'Multiple officers can be Responsible (R), Consulted (C), or Informed (I), but each project/deliverable should have exactly one Accountable (A) officer with ultimate decision-making ownership.'
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
