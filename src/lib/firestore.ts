// ============================================
// Firestore CRUD Operations
// ============================================

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  runTransaction,
  serverTimestamp,
  Unsubscribe,
  QueryConstraint,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  Person,
  Project,
  Assignment,
  Workstream,
  MonthlyScorecard,
  MonthlyCommitment,
  ProjectHealth,
  ProjectNote,
  Counter,
  AuditLog,
} from '@/types';

// ---- Collection References ----
export const COLLECTIONS = {
  persons: 'persons',
  projects: 'projects',
  assignments: 'assignments',
  workstreams: 'workstreams',
  scorecards: 'scorecards',
  commitments: 'commitments',
  projectHealth: 'projectHealth',
  projectNotes: 'projectNotes',
  counters: 'counters',
  auditLogs: 'auditLogs',
} as const;

// ---- Generic CRUD ----

export async function getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as T;
  }
  return null;
}

export async function getCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  const q = query(collection(db, collectionName), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
}

export async function addDocument<T extends DocumentData = DocumentData>(
  collectionName: string,
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'> | DocumentData
): Promise<string> {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateDocument(
  collectionName: string,
  docId: string,
  data: Partial<DocumentData>
): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDocument(collectionName: string, docId: string): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
}

// ---- Real-time Listeners ----

export function subscribeToCollection<T>(
  collectionName: string,
  callback: (data: T[]) => void,
  constraints: QueryConstraint[] = []
): Unsubscribe {
  const q = query(collection(db, collectionName), ...constraints);
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
    callback(data);
  });
}

export function subscribeToDocument<T>(
  collectionName: string,
  docId: string,
  callback: (data: T | null) => void
): Unsubscribe {
  const docRef = doc(db, collectionName, docId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() } as T);
    } else {
      callback(null);
    }
  });
}

// ---- PRO-ID Generator ----

export async function generateProId(): Promise<string> {
  const counterRef = doc(db, COLLECTIONS.counters, 'personCounter');

  const newId = await runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    let current = 0;
    if (counterDoc.exists()) {
      current = counterDoc.data().current || 0;
    }
    const next = current + 1;
    transaction.set(counterRef, { current: next });
    return next;
  });

  return `PRO-${String(newId).padStart(3, '0')}`;
}

// ---- Person Operations ----

export async function createPerson(
  data: Omit<Person, 'id' | 'proId' | 'createdAt' | 'updatedAt' | 'status'> & { status?: 'Active' | 'Inactive' }
): Promise<string> {
  const proId = await generateProId();
  const docId = await addDocument(COLLECTIONS.persons, { ...data, proId, status: data.status || 'Active' });
  await logAudit('create', 'person', docId, `Created person ${data.name} (${proId})`);
  return docId;
}

export async function updatePerson(id: string, data: Partial<Person>): Promise<void> {
  await updateDocument(COLLECTIONS.persons, id, data);
  await logAudit('update', 'person', id, `Updated person ${data.name || id}`);
}

export async function deletePerson(id: string): Promise<void> {
  // Also delete all assignments for this person
  const assignments = await getCollection<Assignment>(COLLECTIONS.assignments, [
    where('personId', '==', id),
  ]);
  const batch = writeBatch(db);
  assignments.forEach((a) => {
    batch.delete(doc(db, COLLECTIONS.assignments, a.id));
  });
  batch.delete(doc(db, COLLECTIONS.persons, id));
  await batch.commit();
  await logAudit('delete', 'person', id, `Deleted person ${id} and ${assignments.length} assignments`);
}

// ---- Project Operations ----

export async function createProject(
  data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const docId = await addDocument(COLLECTIONS.projects, data);
  await logAudit('create', 'project', docId, `Created project ${data.name}`);
  return docId;
}

export async function updateProject(id: string, data: Partial<Project>): Promise<void> {
  await updateDocument(COLLECTIONS.projects, id, data);
  await logAudit('update', 'project', id, `Updated project ${data.name || id}`);
}

export async function deleteProject(id: string): Promise<void> {
  // Also delete all assignments, workstreams, notes, health for this project
  const batch = writeBatch(db);

  const collections = [COLLECTIONS.assignments, COLLECTIONS.workstreams, COLLECTIONS.projectNotes, COLLECTIONS.projectHealth];
  for (const col of collections) {
    const docs = await getCollection<{ id: string }>(col, [where('projectId', '==', id)]);
    docs.forEach((d) => batch.delete(doc(db, col, d.id)));
  }

  batch.delete(doc(db, COLLECTIONS.projects, id));
  await batch.commit();
  await logAudit('delete', 'project', id, `Deleted project ${id} with all related data`);
}

// ---- Assignment Operations ----

export async function createAssignment(data: Omit<Assignment, 'id'>): Promise<string> {
  const docId = await addDocument(COLLECTIONS.assignments, data);
  await logAudit('create', 'assignment', docId, `Assigned person to project`);
  return docId;
}

export async function updateAssignment(id: string, data: Partial<Assignment>): Promise<void> {
  await updateDocument(COLLECTIONS.assignments, id, data);
}

export async function deleteAssignment(id: string): Promise<void> {
  await deleteDocument(COLLECTIONS.assignments, id);
  await logAudit('delete', 'assignment', id, `Removed assignment ${id}`);
}

// ---- Scorecard Operations ----

export async function createOrUpdateScorecard(
  data: Omit<MonthlyScorecard, 'id' | 'iciTotal' | 'classification' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  // Calculate ICI
  const iciTotal =
    data.deliveryScore +
    data.qualityScore +
    data.timelinessScore +
    data.problemSolvingScore +
    data.collaborationScore +
    data.documentationScore;

  let classification: MonthlyScorecard['classification'];
  if (iciTotal >= 90) classification = 'Exceptional';
  else if (iciTotal >= 80) classification = 'High Contributor';
  else if (iciTotal >= 70) classification = 'Effective';
  else if (iciTotal >= 60) classification = 'Needs Optimisation';
  else classification = 'Role Review';

  // Check if scorecard already exists for this person-month
  const existing = await getCollection<MonthlyScorecard>(COLLECTIONS.scorecards, [
    where('personId', '==', data.personId),
    where('month', '==', data.month),
  ]);

  if (existing.length > 0) {
    await updateDocument(COLLECTIONS.scorecards, existing[0].id, {
      ...data,
      iciTotal,
      classification,
    });
    return existing[0].id;
  }

  return await addDocument(COLLECTIONS.scorecards, { ...data, iciTotal, classification });
}

// ---- Commitment Operations ----

export async function createCommitment(
  data: Omit<MonthlyCommitment, 'id' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const status = calculateCommitmentStatus(data.target, data.achievement);
  return await addDocument(COLLECTIONS.commitments, { ...data, status });
}

export async function updateCommitment(id: string, data: Partial<MonthlyCommitment>): Promise<void> {
  if (data.target !== undefined && data.achievement !== undefined) {
    data.status = calculateCommitmentStatus(data.target, data.achievement);
  }
  await updateDocument(COLLECTIONS.commitments, id, data);
}

function calculateCommitmentStatus(target: number, achievement: number): MonthlyCommitment['status'] {
  if (achievement <= 0 && target > 0) return 'pending';
  const ratio = achievement / target;
  if (ratio >= 0.9) return 'green';
  if (ratio >= 0.6) return 'amber';
  return 'red';
}

// ---- Project Note Operations ----

export async function createProjectNote(
  data: Omit<ProjectNote, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  return await addDocument(COLLECTIONS.projectNotes, data);
}

export async function updateProjectNote(id: string, data: Partial<ProjectNote>): Promise<void> {
  await updateDocument(COLLECTIONS.projectNotes, id, data);
}

export async function deleteProjectNote(id: string): Promise<void> {
  await deleteDocument(COLLECTIONS.projectNotes, id);
}

// ---- Project Health Operations ----

export async function createOrUpdateProjectHealth(
  data: Omit<ProjectHealth, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const existing = await getCollection<ProjectHealth>(COLLECTIONS.projectHealth, [
    where('projectId', '==', data.projectId),
    where('month', '==', data.month),
  ]);

  if (existing.length > 0) {
    await updateDocument(COLLECTIONS.projectHealth, existing[0].id, data);
    return existing[0].id;
  }

  return await addDocument(COLLECTIONS.projectHealth, data);
}

// ---- Audit Log ----

async function logAudit(
  action: AuditLog['action'],
  entityType: AuditLog['entityType'],
  entityId: string,
  description: string
): Promise<void> {
  try {
    await addDoc(collection(db, COLLECTIONS.auditLogs), {
      action,
      entityType,
      entityId,
      description,
      timestamp: serverTimestamp(),
    });
  } catch {
    // Don't fail main operation if audit logging fails
    console.error('Failed to log audit:', description);
  }
}

// ---- Batch Import (for Excel) ----

function cleanData(obj: any): any {
  if (obj === null || obj === undefined) return '';
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(cleanData);
  
  const result: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      result[key] = cleanData(val);
    }
  }
  return result;
}

export async function batchImportPersons(persons: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<string[]> {
  const ids: string[] = [];
  const BATCH_SIZE = 250;

  for (let i = 0; i < persons.length; i += BATCH_SIZE) {
    const chunk = persons.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);

    for (const person of chunk) {
      const docRef = doc(collection(db, COLLECTIONS.persons));
      batch.set(docRef, {
        ...cleanData(person),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      ids.push(docRef.id);
    }

    await batch.commit();
  }

  return ids;
}

export async function batchImportAssignments(assignments: Omit<Assignment, 'id'>[]): Promise<void> {
  const BATCH_SIZE = 250;

  for (let i = 0; i < assignments.length; i += BATCH_SIZE) {
    const chunk = assignments.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);

    for (const assignment of chunk) {
      const docRef = doc(collection(db, COLLECTIONS.assignments));
      batch.set(docRef, {
        ...cleanData(assignment),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    await batch.commit();
  }
}

export async function batchImportProjects(projects: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<string[]> {
  const ids: string[] = [];
  const BATCH_SIZE = 250;

  for (let i = 0; i < projects.length; i += BATCH_SIZE) {
    const chunk = projects.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);

    for (const project of chunk) {
      const docRef = doc(collection(db, COLLECTIONS.projects));
      batch.set(docRef, {
        ...cleanData(project),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      ids.push(docRef.id);
    }

    await batch.commit();
  }

  return ids;
}

export async function setPersonCounter(value: number): Promise<void> {
  const counterRef = doc(db, COLLECTIONS.counters, 'personCounter');
  await updateDoc(counterRef, { current: value }).catch(() => {
    // If document doesn't exist, create it
    const { setDoc } = require('firebase/firestore');
    return setDoc(counterRef, { current: value });
  });
}
