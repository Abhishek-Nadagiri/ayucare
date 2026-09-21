export type RoleName = 'Doctor' | 'Nurse' | 'Administrator' | 'Student';

export type PermissionName =
  | 'patient:create'
  | 'patient:read'
  | 'patient:update'
  | 'patient:archive'
  | 'case:create'
  | 'case:read'
  | 'case:update'
  | 'case:assign'
  | 'case:status_update'
  | 'note:create'
  | 'note:read'
  | 'followup:create'
  | 'followup:read'
  | 'followup:update'
  | 'report:read'
  | 'report:export'
  | 'user:manage'
  | 'audit:read';

export interface Role {
  id: string;
  name: RoleName;
  description: string;
  permissions: PermissionName[];
  createdAt: string;
}

export interface User {
  id: string;
  roleId: string;
  roleName: RoleName;
  fullName: string;
  email: string;
  department: string;
  isActive: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientContactInfo {
  phone?: string;
  email?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface Patient {
  id: string;
  patientIdentifier: string; // e.g. AYU-PT-2026-0001
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  sex: 'Male' | 'Female' | 'Other';
  bloodType?: string;
  allergies?: string[];
  contactInformation: PatientContactInfo;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
}

export type CaseStatus =
  | 'New'
  | 'Under Review'
  | 'Active'
  | 'On Hold'
  | 'Follow-up Required'
  | 'Resolved'
  | 'Closed';

export type CasePriority = 'Urgent' | 'High' | 'Normal' | 'Low';

export interface ClinicalDocumentation {
  chiefComplaint: string;
  historyOfPresentIllness: string;
  medicalHistory?: string;
  familySocialHistory?: string;
  examinationFindings?: string;
  investigations?: string;
  assessmentAndPlan: string;
  medications?: string;
}

export interface PatientCase {
  id: string;
  patientId: string;
  caseNumber: string; // e.g. CASE-2026-0001
  title: string;
  consultationReason: string;
  status: CaseStatus;
  priority: CasePriority;
  department: string;
  responsibleUserId?: string | null;
  clinicalDocumentation: ClinicalDocumentation;
  createdAt: string;
  updatedAt: string;
  closedAt?: string | null;
}

export type NoteType =
  | 'Clinical Note'
  | 'Observation / Nursing'
  | 'Care Plan'
  | 'Consultation'
  | 'Discharge Summary';

export interface CaseNote {
  id: string;
  caseId: string;
  authorId: string;
  authorName?: string;
  authorRole?: RoleName;
  noteType: NoteType;
  content: string;
  isAmendment: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CaseEvent {
  id: string;
  caseId: string;
  actorId: string;
  actorName?: string;
  actorRole?: RoleName;
  eventType:
    | 'CASE_CREATED'
    | 'STATUS_CHANGED'
    | 'PRIORITY_CHANGED'
    | 'ASSIGNED'
    | 'NOTE_ADDED'
    | 'FOLLOWUP_SCHEDULED'
    | 'FOLLOWUP_COMPLETED'
    | 'DOCUMENT_ATTACHED'
    | 'CASE_CLOSED'
    | 'AMENDMENT_RECORDED';
  description: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface CaseAssignment {
  id: string;
  caseId: string;
  userId: string;
  assignedBy: string;
  assignedAt: string;
  endedAt?: string | null;
}

export type FollowupStatus = 'Scheduled' | 'Pending' | 'Completed' | 'Cancelled';

export interface CaseFollowup {
  id: string;
  caseId: string;
  caseNumber?: string;
  caseTitle?: string;
  patientId?: string;
  patientName?: string;
  assignedTo: string;
  assignedToName?: string;
  followupDate: string; // YYYY-MM-DD
  purpose: string;
  status: FollowupStatus;
  outcome?: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export interface Attachment {
  id: string;
  caseId: string;
  uploadedBy: string;
  uploaderName?: string;
  storagePath: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number; // bytes
  createdAt: string;
}

export type NotificationType =
  | 'FOLLOWUP_UPCOMING'
  | 'FOLLOWUP_OVERDUE'
  | 'CASE_ASSIGNED'
  | 'STATUS_CHANGED'
  | 'SYSTEM_ALERT';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedCaseId?: string | null;
  readAt?: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId?: string | null;
  actorName?: string;
  actorEmail?: string;
  actorRole?: RoleName;
  action: string;
  entityType: 'PATIENT' | 'CASE' | 'NOTE' | 'FOLLOWUP' | 'ATTACHMENT' | 'USER' | 'AUTH';
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface DashboardStats {
  totalPatients: number;
  activeCases: number;
  newCasesThisWeek: number;
  followupsRequired: number;
  overdueFollowups: number;
  casesByPriority: {
    urgent: number;
    high: number;
    normal: number;
    low: number;
  };
  casesByStatus: Record<CaseStatus, number>;
  departmentLoad: Record<string, number>;
}
