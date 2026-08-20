'use client';

import { useState, use } from 'react';
import { 
  useProjects, 
  useAssignmentsByProject, 
  useProjectNotes, 
  useProjectHealth,
  usePersons
} from '@/lib/hooks/useRealtimeData';
import { 
  createAssignment, 
  updateAssignment, 
  deleteAssignment,
  createProjectNote,
  updateProjectNote,
  deleteProjectNote,
  createOrUpdateProjectHealth
} from '@/lib/firestore';
import { cn, formatDate, getCurrentMonth } from '@/lib/utils';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import type { Assignment, ProjectHealth, ProjectNote } from '@/types';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const { data: projects } = useProjects();
  const { data: assignments } = useAssignmentsByProject(id);
  const { data: notes } = useProjectNotes(id);
  const { data: healthData } = useProjectHealth(id);
  const { data: persons } = usePersons();

  const project = projects.find(p => p.id === id);

  const [activeTab, setActiveTab] = useState<'team' | 'flow' | 'health' | 'notes'>('team');
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);

  // Assignment Form State
  const [assignForm, setAssignForm] = useState({
    personId: '',
    workstreamName: '',
    workstreamDescription: '',
    allocationPercent: 100,
    functionalRole: 'Developer/Engineer',
    raciType: 'Responsible' as any,
    primaryOrSupport: 'Primary' as any,
    reportingTo: ''
  });

  // Note Form State
  const [noteForm, setNoteForm] = useState({ title: '', content: '' });

  // Inline edit state for Team Tab
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Assignment>>({});

  if (!project) return <div className="p-8 text-slate-400">Loading project details...</div>;

  const currentMonth = getCurrentMonth();
  const currentHealth = healthData.find(h => h.month === currentMonth) || {
    projectId: id,
    month: currentMonth,
    sanctionedManpower: 0,
    deployedManpower: assignments.length,
    effectiveFTE: assignments.reduce((acc, a) => acc + (a.allocationPercent/100), 0),
    plannedDeliverables: 0,
    completedDeliverables: 0,
    milestoneStatus: 'on_time' as any,
    openIssues: 0,
    resolvedIssues: 0,
    internalDependencies: 0,
    vendorDependencies: 0,
    externalDependencies: 0,
    duplicateRoles: 0,
    underutilisedPersonnel: 0,
    keyPersonDependency: 'Low' as any,
    health: 'green' as any,
    remarks: ''
  };

  const [healthForm, setHealthForm] = useState<Partial<ProjectHealth>>(currentHealth);

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.personId) return;
    await createAssignment({
      projectId: id,
      ...assignForm
    });
    setShowAddMember(false);
  };

  const handleUpdateAssignment = async () => {
    if (editingAssignmentId) {
      await updateAssignment(editingAssignmentId, editForm);
      setEditingAssignmentId(null);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProjectNote({
      projectId: id,
      title: noteForm.title,
      content: noteForm.content
    });
    setShowAddNote(false);
    setNoteForm({ title: '', content: '' });
  };

  const handleSaveHealth = async () => {
    await createOrUpdateProjectHealth({
      ...healthForm,
      projectId: id,
      month: currentMonth
    } as any);
    alert('Health updated successfully');
  };

  return (
    <div className="p-6 md:p-8 text-white min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{project.name}</h1>
        <p className="text-slate-400">{project.description}</p>
      </div>

      <div className="flex border-b border-slate-800 mb-6 space-x-1">
        {['team', 'flow', 'health', 'notes'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={cn(
              "px-4 py-2 border-b-2 font-medium capitalize transition-colors",
              activeTab === tab 
                ? "border-blue-500 text-blue-400" 
                : "border-transparent text-slate-400 hover:text-slate-200"
            )}
          >
            {tab === 'flow' ? 'Flow Diagram' : tab}
          </button>
        ))}
      </div>

      {activeTab === 'team' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Team Members</h2>
            <button 
              onClick={() => setShowAddMember(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm"
            >
              <Plus className="w-4 h-4" /> Add Member
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-800/50 text-slate-400">
                <tr>
                  <th className="p-3 rounded-tl-lg">PRO-ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Workstream</th>
                  <th className="p-3">Alloc %</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">RACI</th>
                  <th className="p-3 rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {assignments.map(a => {
                  const person = persons.find(p => p.id === a.personId);
                  const isEditing = editingAssignmentId === a.id;
                  
                  return (
                    <tr key={a.id} className="hover:bg-slate-800/30">
                      <td className="p-3">{person?.proId}</td>
                      <td className="p-3">{person?.name}</td>
                      <td className="p-3">{person?.rank}</td>
                      <td className="p-3">
                        {isEditing ? (
                          <input 
                            className="bg-slate-900 border border-slate-700 px-2 py-1 w-24 rounded"
                            value={editForm.workstreamName ?? a.workstreamName}
                            onChange={e => setEditForm({...editForm, workstreamName: e.target.value})}
                          />
                        ) : a.workstreamName}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <input 
                            type="number"
                            className="bg-slate-900 border border-slate-700 px-2 py-1 w-16 rounded"
                            value={editForm.allocationPercent ?? a.allocationPercent}
                            onChange={e => setEditForm({...editForm, allocationPercent: Number(e.target.value)})}
                          />
                        ) : `${a.allocationPercent}%`}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <input 
                            className="bg-slate-900 border border-slate-700 px-2 py-1 w-24 rounded"
                            value={editForm.functionalRole ?? a.functionalRole}
                            onChange={e => setEditForm({...editForm, functionalRole: e.target.value})}
                          />
                        ) : a.functionalRole}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <select
                            className="bg-slate-900 border border-slate-700 px-2 py-1 rounded"
                            value={editForm.raciType ?? a.raciType}
                            onChange={e => setEditForm({...editForm, raciType: e.target.value as any})}
                          >
                            <option value="Accountable">Accountable</option>
                            <option value="Responsible">Responsible</option>
                            <option value="Consulted">Consulted</option>
                            <option value="Informed">Informed</option>
                          </select>
                        ) : a.raciType}
                      </td>
                      <td className="p-3 flex gap-2">
                        {isEditing ? (
                          <>
                            <button onClick={handleUpdateAssignment} className="text-emerald-400 hover:bg-emerald-400/10 p-1 rounded"><Check className="w-4 h-4"/></button>
                            <button onClick={() => setEditingAssignmentId(null)} className="text-slate-400 hover:bg-slate-800 p-1 rounded"><X className="w-4 h-4"/></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => {
                              setEditingAssignmentId(a.id);
                              setEditForm(a);
                            }} className="text-blue-400 hover:bg-blue-400/10 p-1 rounded"><Edit2 className="w-4 h-4"/></button>
                            <button onClick={() => deleteAssignment(a.id)} className="text-red-400 hover:bg-red-400/10 p-1 rounded"><Trash2 className="w-4 h-4"/></button>
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'flow' && (
        <div className="bg-slate-800/20 border border-slate-700 rounded-xl p-12 text-center text-slate-400">
          Flow diagram will be rendered here
        </div>
      )}

      {activeTab === 'health' && (
        <div className="max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">Health Card ({currentMonth})</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Health Status</label>
              <select 
                value={healthForm.health} 
                onChange={(e) => setHealthForm({...healthForm, health: e.target.value as any})}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2"
              >
                <option value="green">Green</option>
                <option value="amber">Amber</option>
                <option value="red">Red</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Milestone Status</label>
              <select 
                value={healthForm.milestoneStatus} 
                onChange={(e) => setHealthForm({...healthForm, milestoneStatus: e.target.value as any})}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2"
              >
                <option value="on_time">On Time</option>
                <option value="delayed">Delayed</option>
              </select>
            </div>
            
            {['openIssues', 'resolvedIssues', 'plannedDeliverables', 'completedDeliverables'].map(field => (
              <div key={field}>
                <label className="block text-sm text-slate-400 mb-1 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                <input 
                  type="number"
                  value={healthForm[field as keyof ProjectHealth] as number || 0}
                  onChange={(e) => setHealthForm({...healthForm, [field]: Number(e.target.value)})}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2"
                />
              </div>
            ))}
          </div>

          <button 
            onClick={handleSaveHealth}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium"
          >
            Save Health Data
          </button>
        </div>
      )}

      {activeTab === 'notes' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Project Notes</h2>
            <button 
              onClick={() => setShowAddNote(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm"
            >
              <Plus className="w-4 h-4" /> Add Note
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map(note => (
              <div key={note.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold">{note.title}</h3>
                  <button onClick={() => deleteProjectNote(note.id)} className="text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
                <p className="text-slate-400 text-sm whitespace-pre-wrap">{note.content}</p>
                <div className="text-xs text-slate-500 mt-4">{formatDate(note.createdAt as any)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Assign Team Member</h2>
            <form onSubmit={handleAddAssignment} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Person</label>
                <select 
                  required
                  value={assignForm.personId}
                  onChange={(e) => setAssignForm({...assignForm, personId: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2"
                >
                  <option value="">Select Person</option>
                  {persons.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.proId})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Workstream</label>
                  <input 
                    required
                    type="text"
                    value={assignForm.workstreamName}
                    onChange={(e) => setAssignForm({...assignForm, workstreamName: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Allocation %</label>
                  <input 
                    required
                    type="number"
                    min="1" max="100"
                    value={assignForm.allocationPercent}
                    onChange={(e) => setAssignForm({...assignForm, allocationPercent: Number(e.target.value)})}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowAddMember(false)} className="px-4 py-2 bg-slate-800 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 rounded">Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showAddNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Add Note</h2>
            <form onSubmit={handleAddNote} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Title</label>
                <input 
                  required
                  type="text"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({...noteForm, title: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Content</label>
                <textarea 
                  required
                  rows={4}
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({...noteForm, content: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowAddNote(false)} className="px-4 py-2 bg-slate-800 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 rounded">Save Note</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
