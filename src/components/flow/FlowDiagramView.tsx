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
  useReactFlow,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useProjects, useAssignmentsByProject, usePersons } from '@/lib/hooks/useRealtimeData';
import { 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  GitBranch, 
  Users, 
  Layers, 
  Briefcase,
  Shield,
  Clock,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
    let yPos = 40;

    // Helper to add hierarchy node
    const addHierarchyNode = (nodeId: string, title: string, subtitle: string, iconType: string, xPos: number) => {
      newNodes.push({
        id: nodeId,
        type: 'default',
        data: { 
          label: (
            <div className="flex items-center gap-3 p-2 text-left">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold flex-shrink-0 shadow">
                <Shield className="w-5 h-5 text-blue-300" />
              </div>
              <div className="overflow-hidden">
                <div className="text-[10px] uppercase tracking-wider font-bold text-blue-300">{subtitle}</div>
                <div className="text-sm font-extrabold text-white truncate">{title}</div>
              </div>
            </div>
          )
        },
        position: { x: xPos, y: yPos },
        style: {
          background: '#0F172A',
          color: '#fff',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          borderRadius: '16px',
          padding: '4px',
          minWidth: 260,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(59, 130, 246, 0.2)',
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });
      yPos += 140;
      return nodeId;
    };

    // 1. IGP Node (Top Command)
    let parentId = addHierarchyNode(
      'igp', 
      project.hierarchy?.igp || 'IGP (Tech Services)', 
      'Apex Command', 
      'igp', 
      400
    );

    // 2. DSP Node
    if (project.hierarchy?.dsp) {
      const dspId = addHierarchyNode(
        'dsp', 
        project.hierarchy.dsp, 
        'Deputy Supdt. of Police (DSP)', 
        'dsp', 
        400
      );
      if (parentId && dspId) {
        newEdges.push({ 
          id: `e-${parentId}-${dspId}`, 
          source: parentId, 
          target: dspId, 
          animated: true, 
          style: { stroke: '#3B82F6', strokeWidth: 2 } 
        });
      }
      parentId = dspId;
    }

    // 3. CI Node
    if (project.hierarchy?.ci) {
      const ciId = addHierarchyNode(
        'ci', 
        project.hierarchy.ci, 
        'Circle Inspector (CI)', 
        'ci', 
        400
      );
      if (parentId && ciId) {
        newEdges.push({ 
          id: `e-${parentId}-${ciId}`, 
          source: parentId, 
          target: ciId, 
          animated: true, 
          style: { stroke: '#38BDF8', strokeWidth: 2 } 
        });
      }
      parentId = ciId;
    }

    // 4. SI Node
    if (project.hierarchy?.si) {
      const siId = addHierarchyNode(
        'si', 
        project.hierarchy.si, 
        'Sub-Inspector (SI)', 
        'si', 
        400
      );
      if (parentId && siId) {
        newEdges.push({ 
          id: `e-${parentId}-${siId}`, 
          source: parentId, 
          target: siId, 
          animated: true, 
          style: { stroke: '#60A5FA', strokeWidth: 2 } 
        });
      }
      parentId = siId;
    }

    // 5. Persons / Assignments Nodes
    const personMap = new Map(persons.map(p => [p.id, p]));
    const startX = 40;
    const spacingX = 360;
    
    assignments.forEach((a, idx) => {
      const person = personMap.get(a.personId);
      const personNodeId = `person-${a.id}`;
      const xPos = startX + (idx * spacingX);
      
      newNodes.push({
        id: personNodeId,
        type: 'default',
        position: { x: xPos, y: yPos },
        data: { 
          label: (
            <div className="text-left space-y-3 p-3">
              {/* Header with Name & PRO-ID */}
              <div className="flex justify-between items-start border-b border-blue-500/30 pb-2.5">
                <div>
                  <div className="font-extrabold text-white text-base tracking-tight">{person?.name || 'Officer'}</div>
                  <div className="text-xs text-blue-300 font-semibold mt-0.5">{person?.rank || 'Staff'} {person?.genNo ? `(${person.genNo})` : ''}</div>
                </div>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded font-mono text-[11px] font-bold">
                  {person?.proId || 'PRO-000'}
                </span>
              </div>

              {/* Workstream & Allocation */}
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60 space-y-1">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400">
                  <span>Workstream</span>
                  <span className="text-emerald-400">{a.allocationPercent}% FTE</span>
                </div>
                <div className="text-xs font-bold text-slate-100 leading-snug">{a.workstreamName}</div>
              </div>

              {/* Functional Role & RACI */}
              <div className="flex items-center gap-2 text-[11px]">
                <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700 font-medium">
                  {a.functionalRole || 'Operational Staff'}
                </span>
                <span className={cn(
                  "px-2 py-0.5 rounded font-bold text-[10px]",
                  a.raciType === 'Accountable' ? "bg-red-500/20 text-red-300 border border-red-500/30" :
                  a.raciType === 'Responsible' ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" :
                  "bg-slate-700 text-slate-300"
                )}>
                  RACI: {a.raciType || 'Responsible'}
                </span>
              </div>

              {/* Action Items List */}
              {a.workstreamDescription && (
                <div className="pt-2 border-t border-slate-700/50">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5 flex items-center gap-1">
                    <Sparkles size={11} className="text-amber-400" /> Key Action Items:
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-300 pl-3 list-disc marker:text-blue-400">
                    {a.workstreamDescription.split('\n').filter(Boolean).slice(0, 4).map((line, i) => (
                      <li key={i} className="line-clamp-2">{line.replace(/^[0-9.-]+\s*/, '')}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) 
        },
        style: {
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 58, 138, 0.4))',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          borderRadius: '16px',
          width: 320,
          color: 'white',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(59, 130, 246, 0.15)',
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });

      if (parentId) {
        newEdges.push({ 
          id: `e-${parentId}-${personNodeId}`, 
          source: parentId, 
          target: personNodeId, 
          animated: true, 
          style: { stroke: 'rgba(59, 130, 246, 0.6)', strokeWidth: 2 } 
        });
      }
    });

    // Auto-center hierarchy nodes above all assigned staff nodes
    if (assignments.length > 0) {
      const totalWidth = (assignments.length - 1) * spacingX + 320;
      const centerOffsetX = startX + (totalWidth / 2) - 130;
      
      newNodes.forEach(n => {
        if (n.id === 'igp' || n.id === 'dsp' || n.id === 'ci' || n.id === 'si') {
          n.position.x = centerOffsetX;
        }
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [project, assignments, persons, loading, setNodes, setEdges]);

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-3" />
        Loading full hierarchy flow...
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
            <h2 className="text-base md:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              {project.name}
              <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-medium">
                {assignments.length} Officers
              </span>
            </h2>
            <p className="text-xs text-slate-400 hidden sm:block">
              Interactive Command Chain &amp; Operational Deliverables Flow
            </p>
          </div>
        </div>

        {/* Action & Fullscreen Controls */}
        <div className="flex items-center gap-2">
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
              if (n.id.startsWith('person')) return '#2563EB';
              if (n.id === 'igp') return '#3B82F6';
              return '#1E293B';
            }}
            maskColor="rgba(15, 23, 42, 0.85)"
            className="bg-slate-900/90 border border-slate-700 rounded-xl overflow-hidden shadow-2xl"
          />
        </ReactFlow>

        {/* Canvas Helper Tip */}
        <div className="absolute bottom-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl text-[11px] text-slate-400 pointer-events-none hidden md:block">
          💡 Drag canvas to pan • Scroll to zoom in/out • Click node to inspect
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
