// ============================================
// PRO-MAP TypeScript Types & Interfaces
// Project, Role, Outcome & Manpower Assessment Platform
// ============================================

import { Timestamp } from 'firebase/firestore';

// ---- Person ----
export interface Person {
  id: string; // Firestore document ID
  proId: string; // PRO-001, PRO-002, etc.
  name: string;
  rank: string; // PC, HC, WPC, SI, CI, DSP, etc.
  genNo: string;
  deputationType: 'Deputation' | 'Attachment' | 'Outsourcing' | '';
  workingSince: string; // ISO date string
  photoUrl?: string;
  status: 'Active' | 'Inactive';
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

// ---- Project ----
export interface Project {
  id: string;
  code?: string; // PRJ-001, PRJ-002, etc.
  name: string;
  description: string;
  status: 'Active' | 'Inactive' | 'Completed';
  hierarchy: ProjectHierarchy;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

export interface ProjectHierarchy {
  igp?: string;
  sp?: string;
  addlSp?: string;
  dsp?: string;
  ci?: string; // Inspector
  si?: string;
  asi?: string;
}

// ---- Workstream ----
export interface Workstream {
  id: string;
  projectId: string;
  name: string;
  description: string;
}

// ---- Assignment (Person ↔ Project) ----
export interface Assignment {
  id: string;
  personId: string;
  projectId: string;
  workstreamId?: string;
  workstreamName: string;
  workstreamDescription: string;
  allocationPercent: number; // 0-100
  functionalRole: FunctionalRole | string;
  raciType: RaciType;
  primaryOrSupport: 'Primary' | 'Support';
  reportingTo: string;
  remarks?: string;
}

// ---- Monthly Scorecard (ICI) ----
export interface MonthlyScorecard {
  id: string;
  personId: string;
  personName?: string;
  personProId?: string;
  month: string; // "2026-08"
  deliveryScore: number; // out of 40
  qualityScore: number; // out of 20
  timelinessScore: number; // out of 15
  problemSolvingScore: number; // out of 10
  collaborationScore: number; // out of 10
  documentationScore: number; // out of 5
  iciTotal: number; // auto-calculated out of 100
  classification: IciClassification;
  remarks?: string;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

// ---- Monthly Commitment ----
export interface MonthlyCommitment {
  id: string;
  personId: string;
  personName?: string;
  personProId?: string;
  projectId: string;
  projectName?: string;
  month: string; // "2026-08"
  commitment: string;
  target: number;
  achievement: number;
  status: CommitmentStatus;
  remarks?: string;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

// ---- Project Health Card ----
export interface ProjectHealth {
  id: string;
  projectId: string;
  month: string; // "2026-08"
  sanctionedManpower: number;
  deployedManpower: number;
  effectiveFTE: number; // auto-calculated
  plannedDeliverables: number;
  completedDeliverables: number;
  milestoneStatus: 'on_time' | 'delayed';
  openIssues: number;
  resolvedIssues: number;
  internalDependencies: number;
  vendorDependencies: number;
  externalDependencies: number;
  duplicateRoles: number;
  underutilisedPersonnel: number;
  keyPersonDependency: 'High' | 'Medium' | 'Low';
  health: HealthStatus;
  remarks?: string;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

// ---- Project Note ----
export interface ProjectNote {
  id: string;
  projectId: string;
  title: string;
  content: string;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

// ---- Enums / Union Types ----

export type FunctionalRole =
  | 'Project Owner'
  | 'Project Manager'
  | 'Technical Lead'
  | 'Functional Lead'
  | 'Developer/Engineer'
  | 'Data/Integration'
  | 'Testing/QA'
  | 'Deployment/Operations'
  | 'User Support';

export const FUNCTIONAL_ROLES: FunctionalRole[] = [
  'Project Owner',
  'Project Manager',
  'Technical Lead',
  'Functional Lead',
  'Developer/Engineer',
  'Data/Integration',
  'Testing/QA',
  'Deployment/Operations',
  'User Support',
];

export type RaciType = 'Accountable' | 'Responsible' | 'Consulted' | 'Informed' | '';

export const RACI_TYPES: RaciType[] = ['Accountable', 'Responsible', 'Consulted', 'Informed'];

export type CommitmentStatus = 'green' | 'amber' | 'red' | 'pending';

export type HealthStatus = 'green' | 'amber' | 'red';

export type IciClassification =
  | 'Exceptional'     // 90+
  | 'High Contributor' // 80-89
  | 'Effective'        // 70-79
  | 'Needs Optimisation' // 60-69
  | 'Role Review';     // Below 60

export const RANKS = [
  'DGP', 'ADG', 'IGP', 'DIG', 'SP', 'Addl. SP', 'DSP',
  'RI', 'RSI', 'CI', 'SI', 'SI(C)',
  'ASI', 'HC', 'HG', 'WHC',
  'PC', 'WPC', 'WPC C',
  'AAO', 'Office SUPDT.', 'Asso.Programr', 'Programmer',
  'D.E.O', 'Other',
];

export const DEPUTATION_TYPES = ['Deputation', 'Attachment', 'Outsourcing'] as const;

// ---- Dashboard Aggregates ----

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalPersonnel: number;
  effectiveFTE: number;
  projectsGreen: number;
  projectsAmber: number;
  projectsRed: number;
  highPerformers: number; // ICI 80+
  underutilised: number;
  overallocated: number;
  balancedOptimal: number;
  delayedDeliverables: number;
}

// ---- FTE Calculation ----

export interface PersonFTE {
  personId: string;
  personName: string;
  proId: string;
  rank: string;
  totalAllocation: number; // should be 100
  assignments: {
    projectId: string;
    projectCode?: string;
    projectName: string;
    allocationPercent: number;
    fte: number; // allocationPercent / 100
  }[];
  isOverallocated: boolean;
  isUnderallocated: boolean;
}

export interface ProjectFTE {
  projectId: string;
  projectCode?: string;
  projectName: string;
  headcount: number; // number of staff assigned
  staffHeadcount?: number;
  officerHeadcount?: number;
  effectiveFTE: number; // staff operational FTE
  staffFTE?: number;
  officerFTE?: number;
  status: HealthStatus;
}

// ---- Risk Analysis ----

export interface KeyPersonRisk {
  personId: string;
  personName: string;
  proId: string;
  projectId: string;
  projectName: string;
  workstream: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  hasBackup: boolean;
  hasDocumentation: boolean;
}

export interface DuplicationRisk {
  activity: string;
  persons: {
    personId: string;
    personName: string;
    projectId: string;
    projectName: string;
  }[];
  isNecessary: boolean | null; // null = not yet reviewed
}

// ---- Flow Diagram Types ----

export interface FlowNode {
  id: string;
  type: 'hierarchy' | 'person';
  data: {
    label: string;
    sublabel?: string;
    proId?: string;
    rank?: string;
    task?: string;
    actionItems?: string[];
    personId?: string;
  };
  position: { x: number; y: number };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
}

// ---- Counter for PRO-ID ----
export interface Counter {
  current: number;
}

// ---- Audit Log ----
export interface AuditLog {
  id: string;
  action: 'create' | 'update' | 'delete' | 'import';
  entityType: 'person' | 'project' | 'assignment' | 'scorecard' | 'commitment' | 'health' | 'note';
  entityId: string;
  description: string;
  timestamp: Timestamp | string;
}
