import fs from 'fs';
import path from 'path';
import {
  Patient,
  PatientCase,
  CaseNote,
  CaseEvent,
  CaseFollowup,
  Attachment,
  Notification,
  AuditLog,
  User,
  DashboardStats,
  CaseStatus,
  CasePriority,
} from '@/types';
import {
  INITIAL_USERS,
  INITIAL_PATIENTS,
  INITIAL_CASES,
  INITIAL_NOTES,
  INITIAL_EVENTS,
  INITIAL_FOLLOWUPS,
  INITIAL_ATTACHMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from './seed';

interface DatabaseSchema {
  users: User[];
  patients: Patient[];
  cases: PatientCase[];
  notes: CaseNote[];
  events: CaseEvent[];
  followups: CaseFollowup[];
  attachments: Attachment[];
  notifications: Notification[];
  auditLogs: AuditLog[];
}

const DATA_DIR = process.env.VERCEL
  ? path.join('/tmp', '.data')
  : path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'medora.json');

class Store {
  private data: DatabaseSchema | null = null;

  private loadData(): DatabaseSchema {
    if (this.data) {
      return this.data;
    }

    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        return this.data!;
      }
    } catch {
      console.warn('Failed to read database file, initializing from seed.');
    }

    this.data = {
      users: [...INITIAL_USERS],
      patients: [...INITIAL_PATIENTS],
      cases: [...INITIAL_CASES],
      notes: [...INITIAL_NOTES],
      events: [...INITIAL_EVENTS],
      followups: [...INITIAL_FOLLOWUPS],
      attachments: [...INITIAL_ATTACHMENTS],
      notifications: [...INITIAL_NOTIFICATIONS],
      auditLogs: [...INITIAL_AUDIT_LOGS],
    };

    this.persist();
    return this.data;
  }

  private persist() {
    if (!this.data) return;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting database to disk:', err);
    }
  }

  // --- Reset to seed ---
  public resetToSeed(): DatabaseSchema {
    this.data = {
      users: [...INITIAL_USERS],
      patients: [...INITIAL_PATIENTS],
      cases: [...INITIAL_CASES],
      notes: [...INITIAL_NOTES],
      events: [...INITIAL_EVENTS],
      followups: [...INITIAL_FOLLOWUPS],
      attachments: [...INITIAL_ATTACHMENTS],
      notifications: [...INITIAL_NOTIFICATIONS],
      auditLogs: [...INITIAL_AUDIT_LOGS],
    };
    this.persist();
    return this.data;
  }

  // --- Users ---
  public getUsers(): User[] {
    return this.loadData().users;
  }

  public getUserById(id: string): User | undefined {
    return this.loadData().users.find((u) => u.id === id);
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const db = this.loadData();
    const idx = db.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    db.users[idx] = {
      ...db.users[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return db.users[idx];
  }

  // --- Patients ---
  public getPatients(filter?: { query?: string; sex?: string; showArchived?: boolean }): Patient[] {
    const db = this.loadData();
    return db.patients.filter((p) => {
      if (!filter?.showArchived && p.archivedAt) return false;
      if (filter?.sex && filter.sex !== 'ALL' && p.sex !== filter.sex) return false;
      if (filter?.query) {
        const q = filter.query.toLowerCase();
        const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
        const id = p.patientIdentifier.toLowerCase();
        return fullName.includes(q) || id.includes(q);
      }
      return true;
    });
  }

  public getPatientById(id: string): Patient | undefined {
    return this.loadData().patients.find((p) => p.id === id);
  }

  public createPatient(
    patientData: Omit<Patient, 'id' | 'patientIdentifier' | 'createdAt' | 'updatedAt' | 'archivedAt'>,
    actor?: User
  ): Patient {
    const db = this.loadData();
    const nextSeq = db.patients.length + 1;
    const formattedSeq = String(nextSeq).padStart(4, '0');
    const newPatient: Patient = {
      ...patientData,
      id: `pat-${Date.now()}`,
      patientIdentifier: `MED-PT-2026-${formattedSeq}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archivedAt: null,
    };
    db.patients.unshift(newPatient);

    this.addAuditLog({
      actorId: actor?.id,
      actorName: actor?.fullName,
      actorEmail: actor?.email,
      actorRole: actor?.roleName,
      action: 'CREATE_PATIENT',
      entityType: 'PATIENT',
      entityId: newPatient.id,
      metadata: {
        identifier: newPatient.patientIdentifier,
        name: `${newPatient.firstName} ${newPatient.lastName}`,
      },
    });

    this.persist();
    return newPatient;
  }

  public updatePatient(id: string, updates: Partial<Patient>, actor?: User): Patient | null {
    const db = this.loadData();
    const idx = db.patients.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    db.patients[idx] = {
      ...db.patients[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.addAuditLog({
      actorId: actor?.id,
      actorName: actor?.fullName,
      actorEmail: actor?.email,
      actorRole: actor?.roleName,
      action: 'UPDATE_PATIENT',
      entityType: 'PATIENT',
      entityId: id,
      metadata: { updatedFields: Object.keys(updates) },
    });

    this.persist();
    return db.patients[idx];
  }

  public archivePatient(id: string, actor?: User): boolean {
    const db = this.loadData();
    const patient = db.patients.find((p) => p.id === id);
    if (!patient) return false;

    patient.archivedAt = patient.archivedAt ? null : new Date().toISOString();
    patient.updatedAt = new Date().toISOString();

    this.addAuditLog({
      actorId: actor?.id,
      actorName: actor?.fullName,
      actorEmail: actor?.email,
      actorRole: actor?.roleName,
      action: patient.archivedAt ? 'ARCHIVE_PATIENT' : 'UNARCHIVE_PATIENT',
      entityType: 'PATIENT',
      entityId: id,
      metadata: { archivedAt: patient.archivedAt },
    });

    this.persist();
    return true;
  }

  // --- Cases ---
  public getCases(filters?: {
    patientId?: string;
    status?: string;
    priority?: string;
    department?: string;
    responsibleUserId?: string;
    search?: string;
  }): PatientCase[] {
    const db = this.loadData();
    return db.cases.filter((c) => {
      if (filters?.patientId && c.patientId !== filters.patientId) return false;
      if (filters?.status && filters.status !== 'ALL' && c.status !== filters.status) return false;
      if (filters?.priority && filters.priority !== 'ALL' && c.priority !== filters.priority) return false;
      if (filters?.department && filters.department !== 'ALL' && c.department !== filters.department) return false;
      if (filters?.responsibleUserId && filters.responsibleUserId !== 'ALL' && c.responsibleUserId !== filters.responsibleUserId) return false;
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        const num = c.caseNumber.toLowerCase();
        const title = c.title.toLowerCase();
        const reason = c.consultationReason.toLowerCase();
        return num.includes(q) || title.includes(q) || reason.includes(q);
      }
      return true;
    });
  }

  public getCaseById(id: string): PatientCase | undefined {
    return this.loadData().cases.find((c) => c.id === id);
  }

  public createCase(
    caseData: Omit<PatientCase, 'id' | 'caseNumber' | 'createdAt' | 'updatedAt' | 'closedAt'>,
    actor?: User
  ): PatientCase {
    const db = this.loadData();
    const nextSeq = db.cases.length + 1;
    const formattedSeq = String(nextSeq).padStart(4, '0');
    const newCase: PatientCase = {
      ...caseData,
      id: `case-${Date.now()}`,
      caseNumber: `CASE-2026-${formattedSeq}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      closedAt: null,
    };
    db.cases.unshift(newCase);

    // Add Timeline Event
    this.addCaseEvent({
      caseId: newCase.id,
      actorId: actor?.id || 'system',
      actorName: actor?.fullName || 'System',
      actorRole: actor?.roleName,
      eventType: 'CASE_CREATED',
      description: `Case opened for "${newCase.title}" with priority ${newCase.priority}.`,
      metadata: {
        caseNumber: newCase.caseNumber,
        department: newCase.department,
        priority: newCase.priority,
      },
    });

    // Add Audit Log
    this.addAuditLog({
      actorId: actor?.id,
      actorName: actor?.fullName,
      actorEmail: actor?.email,
      actorRole: actor?.roleName,
      action: 'CREATE_CASE',
      entityType: 'CASE',
      entityId: newCase.id,
      metadata: {
        caseNumber: newCase.caseNumber,
        title: newCase.title,
        patientId: newCase.patientId,
      },
    });

    // Notify assigned user if different from actor
    if (newCase.responsibleUserId && newCase.responsibleUserId !== actor?.id) {
      this.createNotification({
        userId: newCase.responsibleUserId,
        type: 'CASE_ASSIGNED',
        title: `Assigned to Case ${newCase.caseNumber}`,
        message: `You were designated as the responsible clinician for "${newCase.title}".`,
        relatedCaseId: newCase.id,
      });
    }

    this.persist();
    return newCase;
  }

  public updateCase(id: string, updates: Partial<PatientCase>, actor?: User): PatientCase | null {
    const db = this.loadData();
    const idx = db.cases.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    const oldCase = db.cases[idx];
    const updatedCase: PatientCase = {
      ...oldCase,
      ...updates,
      updatedAt: new Date().toISOString(),
      closedAt: updates.status === 'Closed' || updates.status === 'Resolved' ? new Date().toISOString() : oldCase.closedAt,
    };
    db.cases[idx] = updatedCase;

    // Track status change specifically
    if (updates.status && updates.status !== oldCase.status) {
      this.addCaseEvent({
        caseId: id,
        actorId: actor?.id || 'system',
        actorName: actor?.fullName || 'System',
        actorRole: actor?.roleName,
        eventType: 'STATUS_CHANGED',
        description: `Case status transitioned from ${oldCase.status} to ${updates.status}.`,
        metadata: { from: oldCase.status, to: updates.status },
      });
    }

    // Track priority change specifically
    if (updates.priority && updates.priority !== oldCase.priority) {
      this.addCaseEvent({
        caseId: id,
        actorId: actor?.id || 'system',
        actorName: actor?.fullName || 'System',
        actorRole: actor?.roleName,
        eventType: 'PRIORITY_CHANGED',
        description: `Priority updated from ${oldCase.priority} to ${updates.priority}.`,
        metadata: { from: oldCase.priority, to: updates.priority },
      });
    }

    this.addAuditLog({
      actorId: actor?.id,
      actorName: actor?.fullName,
      actorEmail: actor?.email,
      actorRole: actor?.roleName,
      action: 'UPDATE_CASE',
      entityType: 'CASE',
      entityId: id,
      metadata: { changes: Object.keys(updates) },
    });

    this.persist();
    return updatedCase;
  }

  public updateCaseStatus(id: string, newStatus: CaseStatus, actor?: User): PatientCase | null {
    return this.updateCase(id, { status: newStatus }, actor);
  }

  // --- Clinical Notes ---
  public getNotesByCaseId(caseId: string): CaseNote[] {
    const db = this.loadData();
    return db.notes
      .filter((n) => n.caseId === caseId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addNote(
    noteData: Omit<CaseNote, 'id' | 'createdAt' | 'updatedAt'>,
    actor?: User
  ): CaseNote {
    const db = this.loadData();
    const newNote: CaseNote = {
      ...noteData,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.notes.unshift(newNote);

    // Timeline event
    this.addCaseEvent({
      caseId: newNote.caseId,
      actorId: actor?.id || newNote.authorId,
      actorName: actor?.fullName || newNote.authorName || 'Staff',
      actorRole: actor?.roleName || newNote.authorRole,
      eventType: newNote.isAmendment ? 'AMENDMENT_RECORDED' : 'NOTE_ADDED',
      description: newNote.isAmendment
        ? `Clinical amendment recorded under "${newNote.noteType}".`
        : `New clinical entry added: "${newNote.noteType}".`,
      metadata: { noteId: newNote.id, noteType: newNote.noteType },
    });

    // Audit log
    this.addAuditLog({
      actorId: actor?.id,
      actorName: actor?.fullName,
      actorEmail: actor?.email,
      actorRole: actor?.roleName,
      action: newNote.isAmendment ? 'ADD_AMENDMENT' : 'ADD_CLINICAL_NOTE',
      entityType: 'NOTE',
      entityId: newNote.id,
      metadata: { caseId: newNote.caseId, noteType: newNote.noteType },
    });

    this.persist();
    return newNote;
  }

  // --- Case Events / Timeline ---
  public getEventsByCaseId(caseId: string): CaseEvent[] {
    const db = this.loadData();
    return db.events
      .filter((e) => e.caseId === caseId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addCaseEvent(
    eventData: Omit<CaseEvent, 'id' | 'createdAt'>
  ): CaseEvent {
    const db = this.loadData();
    const newEvent: CaseEvent = {
      ...eventData,
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    db.events.unshift(newEvent);
    this.persist();
    return newEvent;
  }

  // --- Follow-ups ---
  public getFollowups(filters?: {
    caseId?: string;
    status?: string;
    assignedTo?: string;
    timeframe?: 'OVERDUE' | 'TODAY' | 'UPCOMING' | 'ALL';
  }): CaseFollowup[] {
    const db = this.loadData();
    const todayStr = new Date().toISOString().split('T')[0];

    return db.followups.filter((f) => {
      if (filters?.caseId && f.caseId !== filters.caseId) return false;
      if (filters?.assignedTo && filters.assignedTo !== 'ALL' && f.assignedTo !== filters.assignedTo) return false;
      if (filters?.status && filters.status !== 'ALL' && f.status !== filters.status) return false;

      if (filters?.timeframe === 'OVERDUE') {
        return f.status !== 'Completed' && f.status !== 'Cancelled' && f.followupDate < todayStr;
      }
      if (filters?.timeframe === 'TODAY') {
        return f.followupDate === todayStr;
      }
      if (filters?.timeframe === 'UPCOMING') {
        return f.status !== 'Completed' && f.status !== 'Cancelled' && f.followupDate > todayStr;
      }

      return true;
    }).sort((a, b) => a.followupDate.localeCompare(b.followupDate));
  }

  public getFollowupById(id: string): CaseFollowup | undefined {
    return this.loadData().followups.find((f) => f.id === id);
  }

  public createFollowup(
    data: Omit<CaseFollowup, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>,
    actor?: User
  ): CaseFollowup {
    const db = this.loadData();
    const newFollowup: CaseFollowup = {
      ...data,
      id: `flw-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
    };
    db.followups.unshift(newFollowup);

    // Timeline event
    this.addCaseEvent({
      caseId: newFollowup.caseId,
      actorId: actor?.id || 'system',
      actorName: actor?.fullName || 'System',
      actorRole: actor?.roleName,
      eventType: 'FOLLOWUP_SCHEDULED',
      description: `Follow-up scheduled for ${newFollowup.followupDate}: "${newFollowup.purpose}".`,
      metadata: { followupId: newFollowup.id, dueDate: newFollowup.followupDate },
    });

    // Audit log
    this.addAuditLog({
      actorId: actor?.id,
      actorName: actor?.fullName,
      actorEmail: actor?.email,
      actorRole: actor?.roleName,
      action: 'CREATE_FOLLOWUP',
      entityType: 'FOLLOWUP',
      entityId: newFollowup.id,
      metadata: { caseId: newFollowup.caseId, dueDate: newFollowup.followupDate },
    });

    // Notify assigned user if different from creator
    if (newFollowup.assignedTo && newFollowup.assignedTo !== actor?.id) {
      this.createNotification({
        userId: newFollowup.assignedTo,
        type: 'FOLLOWUP_UPCOMING',
        title: 'New Follow-up Task Assigned',
        message: `You have a scheduled follow-up on ${newFollowup.followupDate} for patient ${newFollowup.patientName || 'case'}.`,
        relatedCaseId: newFollowup.caseId,
      });
    }

    this.persist();
    return newFollowup;
  }

  public updateFollowup(
    id: string,
    updates: Partial<CaseFollowup>,
    actor?: User
  ): CaseFollowup | null {
    const db = this.loadData();
    const idx = db.followups.findIndex((f) => f.id === id);
    if (idx === -1) return null;

    const old = db.followups[idx];
    const isNowCompleted = updates.status === 'Completed' && old.status !== 'Completed';

    db.followups[idx] = {
      ...old,
      ...updates,
      updatedAt: new Date().toISOString(),
      completedAt: isNowCompleted ? new Date().toISOString() : old.completedAt,
    };

    if (isNowCompleted) {
      this.addCaseEvent({
        caseId: old.caseId,
        actorId: actor?.id || 'system',
        actorName: actor?.fullName || 'System',
        actorRole: actor?.roleName,
        eventType: 'FOLLOWUP_COMPLETED',
        description: `Follow-up completed: ${updates.outcome || 'Outcome documented.'}`,
        metadata: { followupId: id, outcome: updates.outcome },
      });
    }

    this.addAuditLog({
      actorId: actor?.id,
      actorName: actor?.fullName,
      actorEmail: actor?.email,
      actorRole: actor?.roleName,
      action: isNowCompleted ? 'COMPLETE_FOLLOWUP' : 'UPDATE_FOLLOWUP',
      entityType: 'FOLLOWUP',
      entityId: id,
      metadata: { changes: Object.keys(updates) },
    });

    this.persist();
    return db.followups[idx];
  }

  // --- Attachments ---
  public getAttachmentsByCaseId(caseId: string): Attachment[] {
    const db = this.loadData();
    return db.attachments.filter((a) => a.caseId === caseId);
  }

  public addAttachment(
    attachmentData: Omit<Attachment, 'id' | 'createdAt'>,
    actor?: User
  ): Attachment {
    const db = this.loadData();
    const newAtt: Attachment = {
      ...attachmentData,
      id: `att-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    db.attachments.unshift(newAtt);

    this.addCaseEvent({
      caseId: newAtt.caseId,
      actorId: actor?.id || newAtt.uploadedBy,
      actorName: actor?.fullName || newAtt.uploaderName || 'Staff',
      actorRole: actor?.roleName,
      eventType: 'DOCUMENT_ATTACHED',
      description: `Attached document: "${newAtt.originalFilename}" (${Math.round(newAtt.fileSize / 1024)} KB).`,
      metadata: { attachmentId: newAtt.id, filename: newAtt.originalFilename },
    });

    this.addAuditLog({
      actorId: actor?.id,
      actorName: actor?.fullName,
      actorEmail: actor?.email,
      actorRole: actor?.roleName,
      action: 'UPLOAD_ATTACHMENT',
      entityType: 'ATTACHMENT',
      entityId: newAtt.id,
      metadata: { filename: newAtt.originalFilename, mimeType: newAtt.mimeType },
    });

    this.persist();
    return newAtt;
  }

  // --- Notifications ---
  public getNotifications(userId?: string): Notification[] {
    const db = this.loadData();
    return db.notifications
      .filter((n) => (!userId ? true : n.userId === userId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createNotification(data: Omit<Notification, 'id' | 'createdAt' | 'readAt'>): Notification {
    const db = this.loadData();
    const newNotif: Notification = {
      ...data,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      readAt: null,
    };
    db.notifications.unshift(newNotif);
    this.persist();
    return newNotif;
  }

  public markNotificationAsRead(id: string): boolean {
    const db = this.loadData();
    const notif = db.notifications.find((n) => n.id === id);
    if (!notif) return false;
    notif.readAt = new Date().toISOString();
    this.persist();
    return true;
  }

  public markAllNotificationsAsRead(userId: string): void {
    const db = this.loadData();
    db.notifications
      .filter((n) => n.userId === userId && !n.readAt)
      .forEach((n) => {
        n.readAt = new Date().toISOString();
      });
    this.persist();
  }

  // --- Audit Logs ---
  public getAuditLogs(filters?: {
    entityType?: string;
    actorId?: string;
    limit?: number;
  }): AuditLog[] {
    const db = this.loadData();
    let logs = [...db.auditLogs];

    if (filters?.entityType && filters.entityType !== 'ALL') {
      logs = logs.filter((l) => l.entityType === filters.entityType);
    }
    if (filters?.actorId && filters.actorId !== 'ALL') {
      logs = logs.filter((l) => l.actorId === filters.actorId);
    }

    logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return filters?.limit ? logs.slice(0, filters.limit) : logs;
  }

  public addAuditLog(entry: Omit<AuditLog, 'id' | 'createdAt'>): AuditLog {
    const db = this.loadData();
    const newLog: AuditLog = {
      ...entry,
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    db.auditLogs.unshift(newLog);
    this.persist();
    return newLog;
  }

  // --- Dashboard Statistics Calculation ---
  public getDashboardStats(): DashboardStats {
    const db = this.loadData();
    const todayStr = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

    const activePatients = db.patients.filter((p) => !p.archivedAt).length;

    const activeCases = db.cases.filter(
      (c) => c.status !== 'Resolved' && c.status !== 'Closed'
    ).length;

    const newCasesThisWeek = db.cases.filter(
      (c) => c.createdAt >= sevenDaysAgo
    ).length;

    const followupsRequired = db.followups.filter(
      (f) => f.status !== 'Completed' && f.status !== 'Cancelled'
    ).length;

    const overdueFollowups = db.followups.filter(
      (f) =>
        f.status !== 'Completed' &&
        f.status !== 'Cancelled' &&
        f.followupDate < todayStr
    ).length;

    const casesByPriority = {
      urgent: db.cases.filter((c) => c.priority === 'Urgent').length,
      high: db.cases.filter((c) => c.priority === 'High').length,
      normal: db.cases.filter((c) => c.priority === 'Normal').length,
      low: db.cases.filter((c) => c.priority === 'Low').length,
    };

    const casesByStatus: Record<CaseStatus, number> = {
      New: 0,
      'Under Review': 0,
      Active: 0,
      'On Hold': 0,
      'Follow-up Required': 0,
      Resolved: 0,
      Closed: 0,
    };

    db.cases.forEach((c) => {
      if (casesByStatus[c.status] !== undefined) {
        casesByStatus[c.status]++;
      }
    });

    const departmentLoad: Record<string, number> = {};
    db.cases.forEach((c) => {
      departmentLoad[c.department] = (departmentLoad[c.department] || 0) + 1;
    });

    return {
      totalPatients: activePatients,
      activeCases,
      newCasesThisWeek,
      followupsRequired,
      overdueFollowups,
      casesByPriority,
      casesByStatus,
      departmentLoad,
    };
  }
}

// Global Singleton
declare global {
  // eslint-disable-next-line no-var
  var __medora_store__: Store | undefined;
}

export const store = globalThis.__medora_store__ ?? new Store();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__medora_store__ = store;
}
