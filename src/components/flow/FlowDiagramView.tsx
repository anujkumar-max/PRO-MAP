'use client';

import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap, Node, Edge, Position, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';
import { useProjects, useAssignmentsByProject, usePersons } from '@/lib/hooks/useRealtimeData';

export default function FlowDiagramView({ id }: { id: string }) {
  const projectId = id;
  
  const { data: projects, loading: loadingProjects } = useProjects();
  const { data: assignments, loading: loadingAssignments } = useAssignmentsByProject(projectId);
  const { data: persons, loading: loadingPersons } = usePersons();

  const loading = loadingProjects || loadingAssignments || loadingPersons;
  const project = projects.find(p => p.id === projectId);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useMemo(() => {
    if (loading || !project) return;

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    let yPos = 50;

    // Helper to add hierarchy node
    const addHierarchyNode = (id: string, label: string, xPos: number) => {
      if (!label) return null;
      newNodes.push({
        id,
        type: 'default',
        data: { label },
        position: { x: xPos, y: yPos },
        style: {
          background: '#1e293b',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '10px 20px',
          minWidth: 200,
          textAlign: 'center',
          fontWeight: 'bold'
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });
      yPos += 120;
      return id;
    };

    // 1. IGP Node
    let parentId = addHierarchyNode('igp', 'IGP (Tech Services)', 400);

    // 2. DSP Node
    if (project.hierarchy?.dsp) {
      const dspId = addHierarchyNode('dsp', `DSP: ${project.hierarchy.dsp}`, 400);
      if (parentId && dspId) {
        newEdges.push({ id: `e-${parentId}-${dspId}`, source: parentId, target: dspId, animated: true, style: { stroke: 'rgba(255,255,255,0.3)', strokeWidth: 2 } });
      }
      parentId = dspId;
    }

    // 3. CI Node
    if (project.hierarchy?.ci) {
      const ciId = addHierarchyNode('ci', `CI/Inspector: ${project.hierarchy.ci}`, 400);
      if (parentId && ciId) {
        newEdges.push({ id: `e-${parentId}-${ciId}`, source: parentId, target: ciId, animated: true, style: { stroke: 'rgba(255,255,255,0.3)', strokeWidth: 2 } });
      }
      parentId = ciId;
    }

    // 4. SI Node
    if (project.hierarchy?.si) {
      const siId = addHierarchyNode('si', `SI: ${project.hierarchy.si}`, 400);
      if (parentId && siId) {
        newEdges.push({ id: `e-${parentId}-${siId}`, source: parentId, target: siId, animated: true, style: { stroke: 'rgba(255,255,255,0.3)', strokeWidth: 2 } });
      }
      parentId = siId;
    }

    // 5. Persons / Assignments
    const personMap = new Map(persons.map(p => [p.id, p]));
    const startX = 50;
    const spacingX = 350;
    
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
            <div className="text-left space-y-2 p-2">
              <div className="flex justify-between items-center border-b border-blue-500/30 pb-2 mb-2">
                <div>
                  <div className="font-bold text-white text-lg">{person?.name || 'Unknown'}</div>
                  <div className="text-xs text-blue-300">{person?.rank || ''} | {person?.proId || ''}</div>
                </div>
              </div>
              <div className="bg-slate-900/50 p-2 rounded border border-slate-700/50">
                <div className="text-xs text-slate-400 mb-1">Workstream</div>
                <div className="text-sm font-medium text-white">{a.workstreamName}</div>
              </div>
              {a.workstreamDescription && (
                <div className="mt-2 text-xs text-slate-300">
                  <div className="text-slate-500 mb-1">Action Items:</div>
                  <ul className="list-disc pl-4 space-y-1">
                    {a.workstreamDescription.split('\n').filter(Boolean).map((line, i) => (
                      <li key={i}>{line.replace(/^[0-9.-]+\s*/, '')}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) 
        },
        style: {
          background: 'rgba(30, 58, 138, 0.8)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '12px',
          width: 300,
          color: 'white',
          backdropFilter: 'blur(12px)',
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
          style: { stroke: 'rgba(59, 130, 246, 0.5)', strokeWidth: 1.5 }
        });
      }
    });

    // Auto-center the hierarchy nodes above the person nodes if there are persons
    if (assignments.length > 0) {
      const totalWidth = (assignments.length - 1) * spacingX + 300;
      const centerOffsetX = startX + totalWidth / 2 - 150; // roughly center
      
      newNodes.forEach(n => {
        if (n.id === 'igp' || n.id === 'dsp' || n.id === 'ci' || n.id === 'si') {
          n.position.x = centerOffsetX;
        }
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [project, assignments, persons, loading, setNodes, setEdges]);

  if (loading) return <div className="p-8 text-white">Loading flow...</div>;
  if (!project) return <div className="p-8 text-white">Project not found.</div>;

  return (
    <div className="h-[calc(100vh-64px)] w-full flex flex-col bg-slate-950">
      <div className="p-6 bg-white/5 backdrop-blur-md border-b border-white/10 z-10 relative">
        <h1 className="text-2xl font-bold text-white">{project.name}</h1>
        <p className="text-slate-400 text-sm">Project Hierarchy & Assignments Flow</p>
      </div>
      <div className="flex-1 relative w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          minZoom={0.2}
          maxZoom={1.5}
        >
          <Background color="#334155" gap={16} size={1} />
          <Controls className="bg-slate-800 border-slate-700 fill-white" />
          <MiniMap 
            nodeColor={(n) => {
              if (n.id.startsWith('person')) return '#1e3a8a';
              return '#1e293b';
            }}
            maskColor="rgba(15, 23, 42, 0.8)"
            className="bg-slate-900 border-slate-800"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
