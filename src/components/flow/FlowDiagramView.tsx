'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  Node, 
  Edge, 
  Position, 
  useNodesState, 
  useEdgesState,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useProjects, useAssignmentsByProject, usePersons } from '@/lib/hooks/useRealtimeData';
import { 
  Maximize2, 
  Minimize2, 
  GitBranch, 
  Shield, 
  Eye, 
  Briefcase, 
  Sparkles, 
  ExternalLink,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RankRoleBadge } from '@/components/common/RankRoleBadge';
import Link from 'next/link';

function FlowContent({ 
  id, 
  isFullPage = false,
  height = "h-[750px]"
}: { 
  id: string; 
  isFullPage?: boolean;
  height?: string;
}) {
  const projectId = id;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const { data: projects, loading: loadingProjects } = useProjects();
  const { data: assignments, loading: loadingAssignments } = useAssignmentsByProject(projectId);
  const { data: persons, loading: loadingPersons } = usePersons();

  const loading = loadingProjects || loadingAssignments || loadingPersons;
  const project = projects.find(p => p.id === projectId);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Fullscreen event listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {
        setIsFullscreen(!isFullscreen);
      });
    } else {
      document.exitFullscreen().catch(() => {
        setIsFullscreen(false);
      });
    }
  };

  useMemo(() => {
    if (loading || !project) return;

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const personMap = new Map(persons.map(p => [p.id, p]));

    // Helper to identify officer rank vs operational staff
    const getRankTier = (rankStr?: string, isOfficerFlag?: boolean): 'supervisory' | 'monitoring' | 'staff' => {
      const r = (rankStr || '').toUpperCase().trim();
      if (['SP', 'ADDL. SP', 'ADDL.SP', 'DSP'].includes(r)) return 'supervisory';
      if (['CI', 'SI', 'ASI', 'AAO'].includes(r)) return 'monitoring';
      if (isOfficerFlag) return 'monitoring';
      return 'staff';
    };

    // Group project assignments by hierarchical tiers
    const tier2Supervisory: typeof assignments = [];
    const tier3Monitoring: typeof assignments = [];
    const tier4Staff: typeof assignments = [];

    assignments.forEach(a => {
      const person = personMap.get(a.personId);
      const tier = getRankTier(person?.rank, (person as any)?.isOfficer || (a as any)?.isOfficerAssignment);
      if (tier === 'supervisory') {
        tier2Supervisory.push(a);
      } else if (tier === 'monitoring') {
        tier3Monitoring.push(a);
      } else {
        tier4Staff.push(a);
      }
    });

    // Dimensions for auto-layout
    const CARD_WIDTH = 340;
    const SPACING_X = 380;
    const maxNodesInTier = Math.max(1, tier2Supervisory.length, tier3Monitoring.length, tier4Staff.length);
    const canvasWidth = Math.max(1200, maxNodesInTier * SPACING_X + 100);
    const centerX = canvasWidth / 2;

    // ----------------------------------------------------
    // TIER 1: APEX EXECUTIVE COMMAND (IGP)
    // ----------------------------------------------------
    const igpNodeId = 'apex-igp';
    newNodes.push({
      id: igpNodeId,
      type: 'default',
      position: { x: centerX - (CARD_WIDTH / 2), y: 40 },
      data: {
        label: (
          <div className="flex items-center gap-3.5 p-3 text-left">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/25 border border-purple-400/40 flex items-center justify-center text-purple-300 text-xl font-bold flex-shrink-0 shadow-lg shadow-purple-900/30">
              🏛️
            </div>
            <div className="overflow-hidden flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-purple-300">Apex Executive</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase tracking-widest">
                  Executive
                </span>
              </div>
              <div className="text-sm font-extrabold text-white truncate mt-0.5 tracking-tight">
                Inspector General of Police (Tech Services)
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Executive Command &amp; Strategic Oversight
              </div>
            </div>
          </div>
        )
      },
      style: {
        background: 'linear-gradient(135deg, rgba(30, 15, 60, 0.98), rgba(15, 23, 42, 0.98))',
        border: '1.5px solid rgba(192, 132, 252, 0.6)',
        borderRadius: '20px',
        width: CARD_WIDTH,
        color: '#fff',
        boxShadow: '0 12px 30px -5px rgba(0, 0, 0, 0.6), 0 0 25px rgba(168, 85, 247, 0.25)',
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    });

    // ----------------------------------------------------
    // TIER 2: SUPERVISORY COMMAND (SP / Addl. SP / DSP)
    // ----------------------------------------------------
    const tier2Y = 220;
    const tier2NodeIds: string[] = [];
    const tier2Count = tier2Supervisory.length;

    if (tier2Count > 0) {
      const tier2StartX = centerX - ((tier2Count * SPACING_X) / 2) + ((SPACING_X - CARD_WIDTH) / 2);

      tier2Supervisory.forEach((a, idx) => {
        const person = personMap.get(a.personId);
        const nodeId = `t2-officer-${a.id}`;
        tier2NodeIds.push(nodeId);
        const xPos = tier2StartX + idx * SPACING_X;

        newNodes.push({
          id: nodeId,
          type: 'default',
          position: { x: xPos, y: tier2Y },
          data: {
            label: (
              <div className="p-3 text-left space-y-2.5">
                <div className="flex items-start justify-between border-b border-blue-500/30 pb-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-white text-sm tracking-tight">{person?.name || 'Supervisory Officer'}</span>
                    </div>
                    <div className="mt-1">
                      <RankRoleBadge rank={person?.rank} genNo={person?.genNo} size="xs" />
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-lg font-mono text-[11px] font-bold">
                    {person?.proId || 'PRO-000'}
                  </span>
                </div>

                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Supervisory Share</span>
                  <span className="font-mono font-bold text-blue-400">{a.allocationPercent}% Capacity</span>
                </div>

                <div className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                  🛡️ {a.workstreamName}
                </div>

                <div className="pt-1.5 border-t border-slate-800 flex justify-between items-center text-[10px]">
                  <span className="text-blue-300/80 font-semibold">{a.functionalRole || 'Supervisory Lead'}</span>
                  {person && (
                    <Link href={`/people/detail?id=${person.id}`} className="text-slate-400 hover:text-blue-400 flex items-center gap-1">
                      Profile <ExternalLink size={10} />
                    </Link>
                  )}
                </div>
              </div>
            )
          },
          style: {
            background: 'linear-gradient(135deg, rgba(15, 30, 65, 0.95), rgba(15, 23, 42, 0.95))',
            border: '1.5px solid rgba(59, 130, 246, 0.5)',
            borderRadius: '18px',
            width: CARD_WIDTH,
            color: '#fff',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 20px rgba(59, 130, 246, 0.2)',
          },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        });

        // Edge: IGP -> Tier 2 Officer
        newEdges.push({
          id: `e-${igpNodeId}-${nodeId}`,
          source: igpNodeId,
          target: nodeId,
          animated: true,
          style: { stroke: '#A855F7', strokeWidth: 2 }
        });
      });
    }

    // ----------------------------------------------------
    // TIER 3: MONITORING & ADMINISTRATIVE (CI / SI / ASI / AAO)
    // ----------------------------------------------------
    const tier3Y = tier2Count > 0 ? 440 : 240;
    const tier3NodeIds: string[] = [];
    const tier3Count = tier3Monitoring.length;

    if (tier3Count > 0) {
      const tier3StartX = centerX - ((tier3Count * SPACING_X) / 2) + ((SPACING_X - CARD_WIDTH) / 2);

      tier3Monitoring.forEach((a, idx) => {
        const person = personMap.get(a.personId);
        const nodeId = `t3-officer-${a.id}`;
        tier3NodeIds.push(nodeId);
        const xPos = tier3StartX + idx * SPACING_X;

        newNodes.push({
          id: nodeId,
          type: 'default',
          position: { x: xPos, y: tier3Y },
          data: {
            label: (
              <div className="p-3 text-left space-y-2.5">
                <div className="flex items-start justify-between border-b border-amber-500/30 pb-2">
                  <div>
                    <div className="font-extrabold text-white text-sm tracking-tight">{person?.name || 'Monitoring Officer'}</div>
                    <div className="mt-1">
                      <RankRoleBadge rank={person?.rank} genNo={person?.genNo} size="xs" />
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg font-mono text-[11px] font-bold">
                    {person?.proId || 'PRO-000'}
                  </span>
                </div>

                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Monitoring Share</span>
                  <span className="font-mono font-bold text-amber-400">{a.allocationPercent}% Capacity</span>
                </div>

                <div className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                  👁️ {a.workstreamName}
                </div>

                <div className="pt-1.5 border-t border-slate-800 flex justify-between items-center text-[10px]">
                  <span className="text-amber-300/90 font-semibold">{a.functionalRole || 'Monitoring Officer'}</span>
                  {person && (
                    <Link href={`/people/detail?id=${person.id}`} className="text-slate-400 hover:text-amber-400 flex items-center gap-1">
                      Profile <ExternalLink size={10} />
                    </Link>
                  )}
                </div>
              </div>
            )
          },
          style: {
            background: 'linear-gradient(135deg, rgba(40, 25, 10, 0.95), rgba(15, 23, 42, 0.95))',
            border: '1.5px solid rgba(245, 158, 11, 0.5)',
            borderRadius: '18px',
            width: CARD_WIDTH,
            color: '#fff',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 20px rgba(245, 158, 11, 0.15)',
          },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        });

        // Edge: Connect from Tier 2 if exists, otherwise from IGP
        if (tier2NodeIds.length > 0) {
          // Connect to nearest or corresponding Tier 2 supervisor
          const parentT2Id = tier2NodeIds[idx % tier2NodeIds.length];
          newEdges.push({
            id: `e-${parentT2Id}-${nodeId}`,
            source: parentT2Id,
            target: nodeId,
            animated: true,
            style: { stroke: '#3B82F6', strokeWidth: 1.5 }
          });
        } else {
          newEdges.push({
            id: `e-${igpNodeId}-${nodeId}`,
            source: igpNodeId,
            target: nodeId,
            animated: true,
            style: { stroke: '#A855F7', strokeWidth: 2 }
          });
        }
      });
    }

    // ----------------------------------------------------
    // TIER 4: OPERATIONAL STAFF WORKSTREAMS
    // ----------------------------------------------------
    const tier4Y = (tier2Count > 0 ? (tier3Count > 0 ? 660 : 440) : (tier3Count > 0 ? 440 : 240));
    const tier4Count = tier4Staff.length;

    if (tier4Count > 0) {
      const tier4StartX = centerX - ((tier4Count * SPACING_X) / 2) + ((SPACING_X - CARD_WIDTH) / 2);

      tier4Staff.forEach((a, idx) => {
        const person = personMap.get(a.personId);
        const nodeId = `t4-staff-${a.id}`;
        const xPos = tier4StartX + idx * SPACING_X;

        newNodes.push({
          id: nodeId,
          type: 'default',
          position: { x: xPos, y: tier4Y },
          data: {
            label: (
              <div className="p-3.5 text-left space-y-3">
                <div className="flex items-start justify-between border-b border-emerald-500/30 pb-2.5">
                  <div>
                    <div className="font-extrabold text-white text-base tracking-tight">{person?.name || 'Operational Staff'}</div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <RankRoleBadge rank={person?.rank} genNo={person?.genNo} size="xs" />
                      {person?.deputationType && (
                        <span className="text-[10px] text-slate-400 font-medium">({person.deputationType})</span>
                      )}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg font-mono text-[11px] font-bold">
                    {person?.proId || 'PRO-000'}
                  </span>
                </div>

                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700/70 space-y-1">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400">
                    <span>Operational Task</span>
                    <span className="text-emerald-400 font-mono font-bold">{a.allocationPercent}% FTE</span>
                  </div>
                  <div className="text-xs font-bold text-white leading-snug">{a.workstreamName}</div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="px-2 py-0.5 bg-slate-800 rounded-md text-slate-300 border border-slate-700 font-medium">
                    {a.functionalRole || 'Operational Staff'}
                  </span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-md font-bold text-[10px]",
                    a.raciType === 'Accountable' ? "bg-red-500/20 text-red-300 border border-red-500/30" :
                    a.raciType === 'Responsible' ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" :
                    "bg-slate-700 text-slate-300"
                  )}>
                    RACI: {a.raciType || 'Responsible'}
                  </span>
                </div>

                {a.workstreamDescription && (
                  <div className="pt-2 border-t border-slate-800">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5 flex items-center gap-1">
                      <Sparkles size={11} className="text-amber-400" /> Action Deliverables:
                    </div>
                    <ul className="space-y-1 text-[11px] text-slate-300 pl-3 list-disc marker:text-emerald-400">
                      {a.workstreamDescription.split('\n').filter(Boolean).slice(0, 3).map((line, i) => (
                        <li key={i} className="line-clamp-2">{line.replace(/^[0-9.-]+\s*/, '')}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {person && (
                  <div className="pt-2 border-t border-slate-800 text-right">
                    <Link href={`/people/detail?id=${person.id}`} className="text-[11px] text-emerald-400 hover:underline inline-flex items-center gap-1 font-semibold">
                      View Member Profile <ExternalLink size={11} />
                    </Link>
                  </div>
                )}
              </div>
            )
          },
          style: {
            background: 'linear-gradient(135deg, rgba(6, 40, 25, 0.95), rgba(15, 23, 42, 0.95))',
            border: '1.5px solid rgba(16, 185, 129, 0.5)',
            borderRadius: '20px',
            width: CARD_WIDTH,
            color: '#fff',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.15)',
          },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        });

        // Edge: Connect from Tier 3 if exists, or Tier 2, or IGP
        if (tier3NodeIds.length > 0) {
          const parentT3Id = tier3NodeIds[idx % tier3NodeIds.length];
          newEdges.push({
            id: `e-${parentT3Id}-${nodeId}`,
            source: parentT3Id,
            target: nodeId,
            animated: true,
            style: { stroke: '#F59E0B', strokeWidth: 1.5 }
          });
        } else if (tier2NodeIds.length > 0) {
          const parentT2Id = tier2NodeIds[idx % tier2NodeIds.length];
          newEdges.push({
            id: `e-${parentT2Id}-${nodeId}`,
            source: parentT2Id,
            target: nodeId,
            animated: true,
            style: { stroke: '#3B82F6', strokeWidth: 1.5 }
          });
        } else {
          newEdges.push({
            id: `e-${igpNodeId}-${nodeId}`,
            source: igpNodeId,
            target: nodeId,
            animated: true,
            style: { stroke: '#A855F7', strokeWidth: 2 }
          });
        }
      });
    }

    // If no operational staff assigned yet, add an informative status leaf node
    if (tier4Count === 0) {
      const emptyNodeId = 'no-staff-notice';
      const emptyY = (tier2Count > 0 ? (tier3Count > 0 ? 640 : 420) : (tier3Count > 0 ? 420 : 220));

      newNodes.push({
        id: emptyNodeId,
        type: 'default',
        position: { x: centerX - 160, y: emptyY },
        data: {
          label: (
            <div className="p-3 text-center space-y-1">
              <div className="text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5">
                <Users size={14} className="text-blue-400" /> Operational Staff Roster
              </div>
              <p className="text-[11px] text-slate-400">
                Command hierarchy active. Operational technical staff will be mapped as project expands.
              </p>
            </div>
          )
        },
        style: {
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px dashed rgba(148, 163, 184, 0.3)',
          borderRadius: '14px',
          width: 320,
          color: '#94a3b8'
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });

      const parentNode = tier3NodeIds.length > 0 ? tier3NodeIds[0] : (tier2NodeIds.length > 0 ? tier2NodeIds[0] : igpNodeId);
      newEdges.push({
        id: `e-${parentNode}-${emptyNodeId}`,
        source: parentNode,
        target: emptyNodeId,
        style: { stroke: 'rgba(148, 163, 184, 0.4)', strokeDasharray: '5,5' }
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [project, assignments, persons, loading, setNodes, setEdges]);

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-3" />
        Loading complete command hierarchy flow...
      </div>
    );
  }

  if (!project) {
    return <div className="p-8 text-white text-center">Project not found.</div>;
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "w-full flex flex-col bg-[#070D18] rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl transition-all",
        isFullscreen ? "fixed inset-0 z-50 h-screen w-screen rounded-none border-none" : isFullPage ? "h-[calc(100vh-100px)] min-h-[650px]" : height
      )}
    >
      {/* Top Controls & Information Header */}
      <div className="p-4 md:px-6 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <GitBranch size={18} />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-white tracking-tight flex items-center gap-2 flex-wrap">
              {project.code && (
                <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-lg font-mono font-bold">
                  {project.code}
                </span>
              )}
              <span>{project.name}</span>
              <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-medium">
                {assignments.length} Deployed
              </span>
            </h2>
            <p className="text-xs text-slate-400 hidden sm:block">
              Interactive Multi-Tier Command Chain &amp; Operational Deliverables Flow
            </p>
          </div>
        </div>

        {/* Legend Pills & Fullscreen Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="hidden lg:flex items-center gap-2 mr-2 text-[11px]">
            <span className="flex items-center gap-1 text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 font-medium">
              <span className="w-2 h-2 rounded-full bg-purple-400" /> Executive
            </span>
            <span className="flex items-center gap-1 text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-400" /> Supervisory
            </span>
            <span className="flex items-center gap-1 text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Monitoring
            </span>
            <span className="flex items-center gap-1 text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Staff
            </span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "View Full Screen"}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            <span>{isFullscreen ? 'Exit Full Screen' : 'Full Screen View'}</span>
          </button>
        </div>
      </div>

      {/* ReactFlow Interactive Canvas */}
      <div className="flex-1 relative w-full h-full bg-[#070D18]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2.0}
          nodesDraggable={true}
          nodesConnectable={false}
        >
          <Background color="#1E293B" gap={20} size={1.5} />
          <Controls 
            className="bg-slate-900/90 border border-slate-700 fill-white rounded-xl overflow-hidden shadow-2xl" 
            showInteractive={false}
          />
          <MiniMap 
            nodeColor={(n) => {
              if (n.id.startsWith('apex')) return '#A855F7';
              if (n.id.startsWith('t2')) return '#3B82F6';
              if (n.id.startsWith('t3')) return '#F59E0B';
              if (n.id.startsWith('t4')) return '#10B981';
              return '#1E293B';
            }}
            maskColor="rgba(15, 23, 42, 0.85)"
            className="bg-slate-900/90 border border-slate-700 rounded-xl overflow-hidden shadow-2xl"
          />
        </ReactFlow>

        {/* Canvas Helper Tip */}
        <div className="absolute bottom-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl text-[11px] text-slate-400 pointer-events-none hidden md:block">
          💡 Drag canvas to pan • Scroll to zoom in/out • Click Member Profile to inspect
        </div>
      </div>
    </div>
  );
}

export default function FlowDiagramView({ 
  id, 
  isFullPage = false,
  height = "h-[750px]"
}: { 
  id: string; 
  isFullPage?: boolean;
  height?: string;
}) {
  return (
    <ReactFlowProvider>
      <FlowContent id={id} isFullPage={isFullPage} height={height} />
    </ReactFlowProvider>
  );
}
