// ============================================
// Real-Time Data Hooks for Firebase
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, QueryConstraint } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/firestore';
import type {
  Person,
  Project,
  Assignment,
  MonthlyScorecard,
  MonthlyCommitment,
  ProjectHealth,
  ProjectNote,
  DashboardStats,
  PersonFTE,
  ProjectFTE,
} from '@/types';

// ---- Generic Real-Time Hook ----

function useRealtimeCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  queryKey: string = ''
): { data: T[]; loading: boolean; error: string | null } {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, collectionName), ...constraints);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setData(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(`Error in ${collectionName}:`, err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, queryKey]);

  return { data, loading, error };
}

// ---- Persons Hook ----

export function usePersons() {
  return useRealtimeCollection<Person>(COLLECTIONS.persons);
}

// ---- Projects Hook ----

export function useProjects() {
  return useRealtimeCollection<Project>(COLLECTIONS.projects);
}

// ---- Assignments Hook ----

export function useAssignments() {
  return useRealtimeCollection<Assignment>(COLLECTIONS.assignments);
}

export function useAssignmentsByProject(projectId: string) {
  return useRealtimeCollection<Assignment>(COLLECTIONS.assignments, [
    where('projectId', '==', projectId),
  ], `proj:${projectId}`);
}

export function useAssignmentsByPerson(personId: string) {
  return useRealtimeCollection<Assignment>(COLLECTIONS.assignments, [
    where('personId', '==', personId),
  ], `person:${personId}`);
}

// ---- Scorecards Hook ----

export function useScorecards(month?: string) {
  const constraints: QueryConstraint[] = [];
  if (month) constraints.push(where('month', '==', month));
  return useRealtimeCollection<MonthlyScorecard>(COLLECTIONS.scorecards, constraints, `month:${month || 'all'}`);
}

export function usePersonScorecards(personId: string) {
  return useRealtimeCollection<MonthlyScorecard>(COLLECTIONS.scorecards, [
    where('personId', '==', personId),
  ], `person:${personId}`);
}

// ---- Commitments Hook ----

export function useCommitments(month?: string) {
  const constraints: QueryConstraint[] = [];
  if (month) constraints.push(where('month', '==', month));
  return useRealtimeCollection<MonthlyCommitment>(COLLECTIONS.commitments, constraints, `month:${month || 'all'}`);
}

export function usePersonCommitments(personId: string) {
  return useRealtimeCollection<MonthlyCommitment>(COLLECTIONS.commitments, [
    where('personId', '==', personId),
  ], `person:${personId}`);
}

// ---- Project Health Hook ----

export function useProjectHealth(projectId?: string) {
  const constraints: QueryConstraint[] = [];
  if (projectId) constraints.push(where('projectId', '==', projectId));
  return useRealtimeCollection<ProjectHealth>(COLLECTIONS.projectHealth, constraints, `proj:${projectId || 'all'}`);
}

// ---- Project Notes Hook ----

export function useProjectNotes(projectId: string) {
  return useRealtimeCollection<ProjectNote>(COLLECTIONS.projectNotes, [
    where('projectId', '==', projectId),
  ], `proj:${projectId}`);
}

// ---- Dashboard Stats (Computed from real-time data) ----

export function useDashboardStats(): {
  stats: DashboardStats;
  loading: boolean;
  persons: Person[];
  projects: Project[];
  assignments: Assignment[];
  scorecards: MonthlyScorecard[];
  commitments: MonthlyCommitment[];
  healthCards: ProjectHealth[];
} {
  const { data: persons, loading: loadingPersons } = usePersons();
  const { data: projects, loading: loadingProjects } = useProjects();
  const { data: assignments, loading: loadingAssignments } = useAssignments();
  const { data: scorecards, loading: loadingScorecards } = useScorecards();
  const { data: commitments, loading: loadingCommitments } = useCommitments();
  const { data: healthCards, loading: loadingHealth } = useProjectHealth();

  const loading = loadingPersons || loadingProjects || loadingAssignments || loadingScorecards || loadingCommitments || loadingHealth;

  // Calculate dashboard stats from real-time data
  const currentMonth = new Date().toISOString().slice(0, 7); // "2026-08"
  const currentScorecards = scorecards.filter((s) => s.month === currentMonth);
  const currentCommitments = commitments.filter((c) => c.month === currentMonth);
  const currentHealth = healthCards.filter((h) => h.month === currentMonth);

  // Calculate FTE per person
  const personAllocations = new Map<string, number>();
  assignments.forEach((a) => {
    const current = personAllocations.get(a.personId) || 0;
    personAllocations.set(a.personId, current + a.allocationPercent);
  });

  // Effective FTE across all projects
  const effectiveFTE = assignments.reduce((sum, a) => sum + a.allocationPercent / 100, 0);

  const stats: DashboardStats = {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.status === 'Active').length,
    totalPersonnel: persons.filter((p) => p.status === 'Active').length,
    effectiveFTE: Math.round(effectiveFTE * 10) / 10,
    projectsGreen: currentHealth.filter((h) => h.health === 'green').length,
    projectsAmber: currentHealth.filter((h) => h.health === 'amber').length,
    projectsRed: currentHealth.filter((h) => h.health === 'red').length,
    highPerformers: currentScorecards.filter((s) => s.iciTotal >= 80).length,
    underutilised: Array.from(personAllocations.entries()).filter(([, total]) => total < 50).length,
    overallocated: Array.from(personAllocations.entries()).filter(([, total]) => total > 100).length,
    balancedOptimal: Array.from(personAllocations.entries()).filter(([, total]) => total === 100).length,
    delayedDeliverables: currentCommitments.filter((c) => c.status === 'red').length,
  };

  return { stats, loading, persons, projects, assignments, scorecards, commitments, healthCards };
}

// ---- FTE Calculations ----

export function usePersonFTEs(): { data: PersonFTE[]; loading: boolean } {
  const { data: persons, loading: l1 } = usePersons();
  const { data: assignments, loading: l2 } = useAssignments();
  const { data: projects, loading: l3 } = useProjects();

  const loading = l1 || l2 || l3;

  const projectMap = new Map(projects.map((p) => [p.id, p.name]));

  const data: PersonFTE[] = persons.map((person) => {
    const personAssignments = assignments.filter((a) => a.personId === person.id);
    const totalAllocation = personAssignments.reduce((sum, a) => sum + a.allocationPercent, 0);

    return {
      personId: person.id,
      personName: person.name,
      proId: person.proId,
      rank: person.rank,
      totalAllocation,
      assignments: personAssignments.map((a) => ({
        projectId: a.projectId,
        projectName: projectMap.get(a.projectId) || 'Unknown',
        allocationPercent: a.allocationPercent,
        fte: a.allocationPercent / 100,
      })),
      isOverallocated: totalAllocation > 100,
      isUnderallocated: totalAllocation < 50,
    };
  });

  return { data, loading };
}

export function useProjectFTEs(): { data: ProjectFTE[]; loading: boolean } {
  const { data: projects, loading: l1 } = useProjects();
  const { data: assignments, loading: l2 } = useAssignments();
  const { data: healthCards, loading: l3 } = useProjectHealth();

  const loading = l1 || l2 || l3;

  const currentMonth = new Date().toISOString().slice(0, 7);

  const data: ProjectFTE[] = projects.map((project) => {
    const projectAssignments = assignments.filter((a) => a.projectId === project.id);
    const effectiveFTE = projectAssignments.reduce((sum, a) => sum + a.allocationPercent / 100, 0);
    const currentHealth = healthCards.find(
      (h) => h.projectId === project.id && h.month === currentMonth
    );

    return {
      projectId: project.id,
      projectName: project.name,
      headcount: projectAssignments.length,
      effectiveFTE: Math.round(effectiveFTE * 10) / 10,
      status: currentHealth?.health || 'green',
    };
  });

  return { data, loading };
}
