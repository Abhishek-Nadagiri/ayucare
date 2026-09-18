'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FolderHeart,
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Building2,
  FileText,
  History,
  CalendarClock,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Plus,
  ShieldCheck,
  Stethoscope,
  Send,
  Download,
  FileCheck,
  HeartPulse,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Select } from '@/components/ui/Input';
import {
  PatientCase,
  Patient,
  CaseNote,
  CaseEvent,
  CaseFollowup,
  Attachment,
  User as UserType,
  CaseStatus,
  CasePriority,
  NoteType,
} from '@/types';

export default function CaseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('documentation');
  const [caseData, setCaseData] = useState<
    | (PatientCase & {
        patient: Patient;
        responsibleDoctor?: UserType | null;
        notes: CaseNote[];
        events: CaseEvent[];
        followups: CaseFollowup[];
        attachments: Attachment[];
      })
    | null
  >(null);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  // Status Change State
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Note Modal State
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState<NoteType>('Clinical Note');
  const [isAmendment, setIsAmendment] = useState(false);
  const [addingNote, setAddingNote] = useState(false);

  // Schedule Follow-up Modal State
  const [isAddFollowupOpen, setIsAddFollowupOpen] = useState(false);
  const [followupDate, setFollowupDate] = useState('');
  const [followupPurpose, setFollowupPurpose] = useState('');
  const [schedulingFollowup, setSchedulingFollowup] = useState(false);

  // Complete Follow-up Modal State
  const [completingFollowupId, setCompletingFollowupId] = useState<string | null>(null);
  const [followupOutcome, setFollowupOutcome] = useState('');
  const [completingFollowup, setCompletingFollowup] = useState(false);

  // Attach Document Modal State
  const [isAddAttachmentOpen, setIsAddAttachmentOpen] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentType, setAttachmentType] = useState('application/pdf');
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  // Clinical Documentation Edit State
  const [isEditingDoc, setIsEditingDoc] = useState(false);
  const [docDraft, setDocDraft] = useState<any>({});
  const [savingDoc, setSavingDoc] = useState(false);

  const fetchCaseDetails = async () => {
    try {
      const res = await fetch(`/api/cases/${resolvedParams.id}`);
      if (res.ok) {
        const json = await res.json();
        setCaseData(json.data);
        setDocDraft(json.data.clinicalDocumentation || {});
      }
    } catch (err) {
      console.error('Failed to load case', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const json = await res.json();
        setCurrentUser(json.data.user);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCaseDetails();
    fetchCurrentUser();
  }, [resolvedParams.id]);

  // Handle Quick Status Transition
  const handleStatusChange = async (newStatus: CaseStatus) => {
    if (!caseData || caseData.status === newStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/cases/${caseData.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchCaseDetails();
      }
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle Note Submission
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() || !caseData) return;
    setAddingNote(true);
    try {
      const res = await fetch(`/api/cases/${caseData.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteType,
          content: noteContent.trim(),
          isAmendment,
        }),
      });
      if (res.ok) {
        setNoteContent('');
        setIsAmendment(false);
        setIsAddNoteOpen(false);
        await fetchCaseDetails();
      }
    } catch (err) {
      console.error('Failed to add note', err);
    } finally {
      setAddingNote(false);
    }
  };

  // Handle Follow-up Schedule
  const handleScheduleFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followupDate || !followupPurpose.trim() || !caseData) return;
    setSchedulingFollowup(true);
    try {
      const res = await fetch('/api/followups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: caseData.id,
          followupDate,
          purpose: followupPurpose.trim(),
          assignedTo: currentUser?.id,
        }),
      });
      if (res.ok) {
        setFollowupDate('');
        setFollowupPurpose('');
        setIsAddFollowupOpen(false);
        await fetchCaseDetails();
      }
    } catch (err) {
      console.error('Failed to schedule follow-up', err);
    } finally {
      setSchedulingFollowup(false);
    }
  };

  // Handle Follow-up Completion
  const handleCompleteFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingFollowupId || !caseData) return;
    setCompletingFollowup(true);
    try {
      const res = await fetch(`/api/followups/${completingFollowupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Completed',
          outcome: followupOutcome.trim() || 'Follow-up completed and outcome verified.',
        }),
      });
      if (res.ok) {
        setCompletingFollowupId(null);
        setFollowupOutcome('');
        await fetchCaseDetails();
      }
    } catch (err) {
      console.error('Failed to complete follow-up', err);
    } finally {
      setCompletingFollowup(false);
    }
  };

  // Handle Upload Attachment
  const handleUploadAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachmentName.trim() || !caseData) return;
    setUploadingAttachment(true);
    try {
      const res = await fetch(`/api/cases/${caseData.id}/attachments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalFilename: attachmentName.trim(),
          mimeType: attachmentType,
          fileSize: 1540200, // Simulated size ~1.5 MB
        }),
      });
      if (res.ok) {
        setAttachmentName('');
        setIsAddAttachmentOpen(false);
        await fetchCaseDetails();
      }
    } catch (err) {
      console.error('Failed to add attachment', err);
    } finally {
      setUploadingAttachment(false);
    }
  };

  // Handle Save Clinical Documentation
  const handleSaveDocumentation = async () => {
    if (!caseData) return;
    setSavingDoc(true);
    try {
      const res = await fetch(`/api/cases/${caseData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicalDocumentation: docDraft,
        }),
      });
      if (res.ok) {
        setIsEditingDoc(false);
        await fetchCaseDetails();
      }
    } catch (err) {
      console.error('Failed to save documentation', err);
    } finally {
      setSavingDoc(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="p-12 text-center text-xs text-slate-400">
          Loading case workspace...
        </div>
      </AppShell>
    );
  }

  if (!caseData) {
    return (
      <AppShell>
        <div className="p-8 text-center">
          <p className="text-sm font-semibold text-rose-500">Case record not found</p>
          <Link href="/cases" className="mt-2 inline-block text-xs text-teal-500 underline">
            Return to Cases Directory
          </Link>
        </div>
      </AppShell>
    );
  }

  const tabs = [
    {
      id: 'documentation',
      label: 'Clinical Documentation',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: 'notes',
      label: 'Case Notes',
      icon: <Stethoscope className="w-4 h-4" />,
      count: caseData.notes?.length || 0,
    },
    {
      id: 'timeline',
      label: 'Case Timeline',
      icon: <History className="w-4 h-4" />,
      count: caseData.events?.length || 0,
    },
    {
      id: 'followups',
      label: 'Follow-ups',
      icon: <CalendarClock className="w-4 h-4" />,
      count: caseData.followups?.length || 0,
    },
    {
      id: 'attachments',
      label: 'Attachments',
      icon: <Paperclip className="w-4 h-4" />,
      count: caseData.attachments?.length || 0,
    },
  ];

  return (
    <AppShell>
      {/* Back link */}
      <div>
        <Link
          href="/cases"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cases Directory
        </Link>
      </div>

      {/* CASE OVERVIEW HEADER BANNER */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-md bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                {caseData.caseNumber}
              </span>
              <Badge priority={caseData.priority} size="md">
                {caseData.priority} Priority
              </Badge>
              <Badge status={caseData.status} size="md">
                {caseData.status}
              </Badge>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {caseData.department}
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {caseData.title}
            </h1>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
              <strong>Consultation Reason:</strong> {caseData.consultationReason}
            </p>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span>
                Patient:{' '}
                <Link
                  href={`/patients/${caseData.patient?.id}`}
                  className="font-bold text-teal-600 dark:text-teal-400 hover:underline"
                >
                  {caseData.patient?.firstName} {caseData.patient?.lastName}
                </Link>{' '}
                ({caseData.patient?.patientIdentifier})
              </span>
              <span>•</span>
              <span>
                Clinician:{' '}
                <strong className="text-slate-700 dark:text-slate-300">
                  {caseData.responsibleDoctor?.fullName || 'Unassigned'}
                </strong>
              </span>
              <span>•</span>
              <span>Opened: {new Date(caseData.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Quick Status Transition Bar */}
          <div className="flex flex-col gap-2 min-w-[200px] p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Update Case Status
            </label>
            <select
              value={caseData.status}
              onChange={(e) => handleStatusChange(e.target.value as CaseStatus)}
              disabled={updatingStatus}
              className="w-full text-xs font-semibold px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
            >
              <option value="New">New</option>
              <option value="Under Review">Under Review</option>
              <option value="Active">Active</option>
              <option value="On Hold">On Hold</option>
              <option value="Follow-up Required">Follow-up Required</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
            <p className="text-[10px] text-slate-400">
              Transitions automatically generate timeline & audit logs.
            </p>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: CLINICAL DOCUMENTATION */}
      {activeTab === 'documentation' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Structured Clinical Record
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Documented findings, diagnostic synthesis, and patient therapeutic management plan
              </p>
            </div>
            {!isEditingDoc ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditingDoc(true)}
                leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              >
                Edit Documentation
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditingDoc(false);
                    setDocDraft(caseData.clinicalDocumentation);
                  }}
                  disabled={savingDoc}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleSaveDocumentation}
                  isLoading={savingDoc}
                >
                  Save Changes
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chief Complaint & HPI */}
            <Card>
              <CardHeader>
                <CardTitle>History of Present Illness (HPI)</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditingDoc ? (
                  <Textarea
                    rows={4}
                    value={docDraft.historyOfPresentIllness || ''}
                    onChange={(e) =>
                      setDocDraft({ ...docDraft, historyOfPresentIllness: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {caseData.clinicalDocumentation?.historyOfPresentIllness ||
                      'No HPI documented yet.'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Relevant Medical / Family History */}
            <Card>
              <CardHeader>
                <CardTitle>Medical & Social History</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditingDoc ? (
                  <Textarea
                    rows={4}
                    value={docDraft.medicalHistory || ''}
                    onChange={(e) => setDocDraft({ ...docDraft, medicalHistory: e.target.value })}
                  />
                ) : (
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {caseData.clinicalDocumentation?.medicalHistory ||
                      'No past medical history recorded.'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Examination Findings */}
            <Card>
              <CardHeader>
                <CardTitle>Physical Examination Findings</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditingDoc ? (
                  <Textarea
                    rows={4}
                    value={docDraft.examinationFindings || ''}
                    onChange={(e) =>
                      setDocDraft({ ...docDraft, examinationFindings: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {caseData.clinicalDocumentation?.examinationFindings ||
                      'No physical examination recorded.'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Diagnostic Investigations */}
            <Card>
              <CardHeader>
                <CardTitle>Investigations & Laboratory Findings</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditingDoc ? (
                  <Textarea
                    rows={4}
                    value={docDraft.investigations || ''}
                    onChange={(e) => setDocDraft({ ...docDraft, investigations: e.target.value })}
                  />
                ) : (
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {caseData.clinicalDocumentation?.investigations ||
                      'No laboratory or imaging findings recorded.'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Assessment & Care Plan */}
            <Card className="md:col-span-2 border-teal-500/30">
              <CardHeader className="bg-teal-500/5">
                <CardTitle className="text-teal-600 dark:text-teal-400">
                  Assessment & Management Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditingDoc ? (
                  <Textarea
                    rows={4}
                    value={docDraft.assessmentAndPlan || ''}
                    onChange={(e) =>
                      setDocDraft({ ...docDraft, assessmentAndPlan: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-medium">
                    {caseData.clinicalDocumentation?.assessmentAndPlan ||
                      'Assessment and plan pending clinical synthesis.'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Medications */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Medications & Therapeutics</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditingDoc ? (
                  <Textarea
                    rows={3}
                    value={docDraft.medications || ''}
                    onChange={(e) => setDocDraft({ ...docDraft, medications: e.target.value })}
                  />
                ) : (
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {caseData.clinicalDocumentation?.medications ||
                      'No specific medications documented.'}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: CASE NOTES & AMENDMENTS */}
      {activeTab === 'notes' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Clinical Case Notes ({caseData.notes?.length || 0})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chronological observations, nursing notes, and amendments
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsAddNoteOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Note
            </Button>
          </div>

          <div className="space-y-4">
            {(!caseData.notes || caseData.notes.length === 0) ? (
              <Card>
                <CardContent className="p-8 text-center text-xs text-slate-400">
                  No notes recorded yet for this case.
                </CardContent>
              </Card>
            ) : (
              caseData.notes.map((note) => (
                <Card key={note.id} className={note.isAmendment ? 'border-amber-500/40 bg-amber-500/5' : ''}>
                  <CardHeader className="flex flex-row items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {note.noteType}
                      </span>
                      {note.isAmendment && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30 uppercase">
                          Amendment
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(note.createdAt).toLocaleString()}
                    </span>
                  </CardHeader>
                  <CardContent className="py-3">
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {note.content}
                    </p>
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span>
                        Author: <strong className="text-slate-700 dark:text-slate-300">{note.authorName}</strong> ({note.authorRole || 'Staff'})
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TIMELINE & CHRONOLOGICAL HISTORY */}
      {activeTab === 'timeline' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Chronological Case Event History
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit-verified timeline of all admissions, transitions, and milestone changes
            </p>
          </div>

          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {caseData.events?.map((evt) => (
              <div key={evt.id} className="relative group">
                <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-teal-500/20 border-2 border-teal-500 text-teal-500 flex items-center justify-center text-[10px] font-bold shadow-sm">
                  •
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-[#121927] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider font-mono">
                      {evt.eventType.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(evt.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-medium">
                    {evt.description}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Actor: {evt.actorName || 'System'} ({evt.actorRole || 'Service'})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: FOLLOW-UPS */}
      {activeTab === 'followups' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Patient Milestone Follow-ups
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Scheduled surveillance checks, lab re-evaluations, and care plans
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsAddFollowupOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Schedule Follow-up
            </Button>
          </div>

          <div className="space-y-3">
            {(!caseData.followups || caseData.followups.length === 0) ? (
              <Card>
                <CardContent className="p-8 text-center text-xs text-slate-400">
                  No follow-ups currently scheduled for this case.
                </CardContent>
              </Card>
            ) : (
              caseData.followups.map((flw) => {
                const isOverdue =
                  flw.status !== 'Completed' &&
                  flw.status !== 'Cancelled' &&
                  flw.followupDate < new Date().toISOString().split('T')[0];

                return (
                  <Card
                    key={flw.id}
                    className={isOverdue ? 'border-rose-500/40 bg-rose-500/5' : ''}
                  >
                    <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                            Due: {flw.followupDate}
                          </span>
                          <Badge status={flw.status} size="sm">
                            {flw.status}
                          </Badge>
                          {isOverdue && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-500 border border-rose-500/30 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Overdue
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {flw.purpose}
                        </p>

                        {flw.outcome && (
                          <div className="mt-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400">
                            <strong>Outcome:</strong> {flw.outcome}
                          </div>
                        )}

                        <p className="text-[11px] text-slate-400 pt-1">
                          Assigned to: {flw.assignedToName || 'Unassigned'}
                        </p>
                      </div>

                      {flw.status !== 'Completed' && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => {
                            setCompletingFollowupId(flw.id);
                          }}
                          leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        >
                          Complete Milestone
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 5: ATTACHMENTS */}
      {activeTab === 'attachments' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Clinical Attachments & Documents
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Controlled medical imaging, ECG scans, and laboratory diagnostic PDFs
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsAddAttachmentOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Attach Document
            </Button>
          </div>

          <div className="space-y-3">
            {(!caseData.attachments || caseData.attachments.length === 0) ? (
              <Card>
                <CardContent className="p-8 text-center text-xs text-slate-400">
                  No documents attached to this case.
                </CardContent>
              </Card>
            ) : (
              caseData.attachments.map((att) => (
                <Card key={att.id}>
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {att.originalFilename}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {Math.round(att.fileSize / 1024)} KB • {att.mimeType} • Uploaded by {att.uploaderName} on {new Date(att.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <a
                      href={`#`}
                      onClick={(e) => {
                        e.preventDefault();
                        alert(`Opening simulated secure attachment preview: ${att.originalFilename}`);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download / View
                    </a>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD CASE NOTE */}
      <Modal
        isOpen={isAddNoteOpen}
        onClose={() => setIsAddNoteOpen(false)}
        title="Add Clinical Case Note"
        subtitle="Appends an auditable clinical note to this patient case."
      >
        <form onSubmit={handleAddNote} className="space-y-4">
          <Select
            label="Note Classification"
            value={noteType}
            onChange={(e) => setNoteType(e.target.value as NoteType)}
            options={[
              { label: 'Clinical Note (Physician)', value: 'Clinical Note' },
              { label: 'Observation / Nursing', value: 'Observation / Nursing' },
              { label: 'Care Plan Note', value: 'Care Plan' },
              { label: 'Specialist Consultation', value: 'Consultation' },
              { label: 'Discharge Summary', value: 'Discharge Summary' },
            ]}
          />

          <Textarea
            label="Clinical Observations & Notes"
            required
            rows={5}
            placeholder="Record clinical observations, vitals assessment, or patient progress..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
          />

          <label className="flex items-center gap-2 text-xs font-semibold text-amber-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAmendment}
              onChange={(e) => setIsAmendment(e.target.checked)}
              className="rounded border-amber-500 text-amber-600 focus:ring-amber-500"
            />
            Mark as Clinical Amendment to Previous Record
          </label>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddNoteOpen(false)}
              disabled={addingNote}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={addingNote}>
              Save Case Note
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: SCHEDULE FOLLOW-UP */}
      <Modal
        isOpen={isAddFollowupOpen}
        onClose={() => setIsAddFollowupOpen(false)}
        title="Schedule Clinical Follow-Up"
        subtitle="Set a mandatory clinical milestone for this case."
      >
        <form onSubmit={handleScheduleFollowup} className="space-y-4">
          <Input
            label="Follow-Up Due Date"
            type="date"
            required
            value={followupDate}
            onChange={(e) => setFollowupDate(e.target.value)}
          />

          <Textarea
            label="Follow-Up Purpose & Orders"
            required
            rows={3}
            placeholder="e.g. Suture removal, blood pressure review, or repeat troponin test..."
            value={followupPurpose}
            onChange={(e) => setFollowupPurpose(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddFollowupOpen(false)}
              disabled={schedulingFollowup}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={schedulingFollowup}>
              Schedule Milestone
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: COMPLETE FOLLOW-UP */}
      <Modal
        isOpen={Boolean(completingFollowupId)}
        onClose={() => setCompletingFollowupId(null)}
        title="Document Follow-Up Completion"
        subtitle="Record clinical outcomes and verification notes before closing this milestone."
      >
        <form onSubmit={handleCompleteFollowup} className="space-y-4">
          <Textarea
            label="Clinical Outcome & Results"
            required
            rows={4}
            placeholder="Document patient progress, test results, and whether criteria were satisfied..."
            value={followupOutcome}
            onChange={(e) => setFollowupOutcome(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCompletingFollowupId(null)}
              disabled={completingFollowup}
            >
              Cancel
            </Button>
            <Button type="submit" variant="success" isLoading={completingFollowup}>
              Verify & Complete Follow-Up
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ATTACH DOCUMENT */}
      <Modal
        isOpen={isAddAttachmentOpen}
        onClose={() => setIsAddAttachmentOpen(false)}
        title="Upload Clinical Attachment"
        subtitle="Attaches imaging or lab reports to the private case storage container."
      >
        <form onSubmit={handleUploadAttachment} className="space-y-4">
          <Input
            label="Document Name"
            required
            placeholder="e.g. 12_Lead_ECG_Post_Stent.pdf"
            value={attachmentName}
            onChange={(e) => setAttachmentName(e.target.value)}
          />

          <Select
            label="Document Format"
            value={attachmentType}
            onChange={(e) => setAttachmentType(e.target.value)}
            options={[
              { label: 'PDF Report (application/pdf)', value: 'application/pdf' },
              { label: 'Diagnostic Image (image/png)', value: 'image/png' },
              { label: 'DICOM Image Scan (image/dicom)', value: 'image/dicom' },
            ]}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddAttachmentOpen(false)}
              disabled={uploadingAttachment}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={uploadingAttachment}>
              Upload Document
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
