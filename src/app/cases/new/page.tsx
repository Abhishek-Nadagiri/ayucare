'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  FolderPlus,
  ArrowLeft,
  AlertCircle,
  Stethoscope,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Patient, User } from '@/types';

function NewCaseForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId') || '';

  const [patients, setPatients] = useState<Patient[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    patientId: preselectedPatientId,
    title: '',
    consultationReason: '',
    status: 'New',
    priority: 'Normal',
    department: 'General Medicine',
    responsibleUserId: '',
    chiefComplaint: '',
    historyOfPresentIllness: '',
    medicalHistory: '',
    examinationFindings: '',
    investigations: '',
    assessmentAndPlan: '',
    medications: '',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [patRes, usrRes, meRes] = await Promise.all([
          fetch('/api/patients'),
          fetch('/api/users'),
          fetch('/api/auth/me'),
        ]);

        if (patRes.ok) {
          const json = await patRes.json();
          setPatients(json.data);
        }
        if (usrRes.ok) {
          const json = await usrRes.json();
          setUsers(json.data);
        }
        if (meRes.ok) {
          const json = await meRes.json();
          setCurrentUser(json.data.user);
          if (!formData.responsibleUserId) {
            setFormData((prev) => ({
              ...prev,
              responsibleUserId: json.data.user?.id || '',
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load form prerequisites', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!formData.patientId) {
      setError('Please select a patient.');
      setSubmitting(false);
      return;
    }
    if (!formData.title.trim()) {
      setError('Case title is required.');
      setSubmitting(false);
      return;
    }
    if (!formData.consultationReason.trim()) {
      setError('Consultation reason cannot be empty.');
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        patientId: formData.patientId,
        title: formData.title.trim(),
        consultationReason: formData.consultationReason.trim(),
        status: formData.status,
        priority: formData.priority,
        department: formData.department,
        responsibleUserId: formData.responsibleUserId || currentUser?.id,
        clinicalDocumentation: {
          chiefComplaint: formData.chiefComplaint || formData.consultationReason,
          historyOfPresentIllness: formData.historyOfPresentIllness,
          medicalHistory: formData.medicalHistory,
          examinationFindings: formData.examinationFindings,
          investigations: formData.investigations,
          assessmentAndPlan: formData.assessmentAndPlan || 'Initial clinical plan formulated.',
          medications: formData.medications,
        },
      };

      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error?.message || 'Failed to create case.');
        setSubmitting(false);
        return;
      }

      // Redirect directly to the newly created case workspace
      router.push(`/cases/${json.data.id}`);
    } catch (err) {
      setError('Network error submitting clinical case.');
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/cases"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cases Directory
        </Link>
      </div>

      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <FolderPlus className="w-6 h-6 text-teal-500" />
          Open New Clinical Case
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Establishes an official CASE-2026 record with structured clinical history and event timeline.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: CASE IDENTITY & PATIENT */}
        <Card>
          <CardHeader>
            <CardTitle>Case Information & Attribution</CardTitle>
            <CardDescription>Select the patient and define case parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Associated Patient"
                required
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                options={[
                  { label: '— Choose Patient —', value: '' },
                  ...patients.map((p) => ({
                    label: `${p.firstName} ${p.lastName} (${p.patientIdentifier})`,
                    value: p.id,
                  })),
                ]}
              />

              <Input
                label="Case Title"
                required
                placeholder="e.g. Acute Coronary Syndrome Surveillance"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <Textarea
                label="Consultation Reason / Chief Presentation"
                required
                rows={2}
                placeholder="Primary reason for admission or clinical consultation..."
                value={formData.consultationReason}
                onChange={(e) => setFormData({ ...formData, consultationReason: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Select
                label="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                options={[
                  { label: 'Cardiology', value: 'Cardiology' },
                  { label: 'Neurology', value: 'Neurology' },
                  { label: 'General Medicine', value: 'General Medicine' },
                  { label: 'General Surgery', value: 'General Surgery' },
                  { label: 'Pulmonology', value: 'Pulmonology' },
                  { label: 'Nephrology', value: 'Nephrology' },
                  { label: 'Endocrinology', value: 'Endocrinology' },
                  { label: 'Emergency', value: 'Emergency' },
                ]}
              />

              <Select
                label="Case Priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                options={[
                  { label: 'Urgent', value: 'Urgent' },
                  { label: 'High', value: 'High' },
                  { label: 'Normal', value: 'Normal' },
                  { label: 'Low', value: 'Low' },
                ]}
              />

              <Select
                label="Initial Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                options={[
                  { label: 'New', value: 'New' },
                  { label: 'Active', value: 'Active' },
                  { label: 'Under Review', value: 'Under Review' },
                  { label: 'Follow-up Required', value: 'Follow-up Required' },
                ]}
              />

              <Select
                label="Responsible Clinician"
                value={formData.responsibleUserId}
                onChange={(e) => setFormData({ ...formData, responsibleUserId: e.target.value })}
                options={[
                  { label: 'Unassigned', value: '' },
                  ...users
                    .filter((u) => u.roleName === 'Doctor' || u.roleName === 'Nurse')
                    .map((u) => ({
                      label: `${u.fullName} (${u.roleName})`,
                      value: u.id,
                    })),
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2: INITIAL CLINICAL DOCUMENTATION */}
        <Card>
          <CardHeader>
            <CardTitle>Initial Clinical Documentation</CardTitle>
            <CardDescription>
              Record baseline findings, past medical history, and clinical assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Textarea
                label="History of Present Illness (HPI)"
                rows={3}
                placeholder="Onset, duration, exacerbating/alleviating factors..."
                value={formData.historyOfPresentIllness}
                onChange={(e) =>
                  setFormData({ ...formData, historyOfPresentIllness: e.target.value })
                }
              />
              <Textarea
                label="Relevant Medical / Family History"
                rows={3}
                placeholder="Pre-existing chronic conditions, previous surgeries..."
                value={formData.medicalHistory}
                onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Textarea
                label="Physical Examination Findings"
                rows={3}
                placeholder="Vitals, auscultation, localized findings..."
                value={formData.examinationFindings}
                onChange={(e) =>
                  setFormData({ ...formData, examinationFindings: e.target.value })
                }
              />
              <Textarea
                label="Investigations & Diagnostic Tests"
                rows={3}
                placeholder="Labs, ECG findings, imaging impressions..."
                value={formData.investigations}
                onChange={(e) => setFormData({ ...formData, investigations: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Textarea
                label="Clinical Assessment & Care Plan"
                rows={3}
                placeholder="Diagnostic synthesis, therapeutic interventions, monitoring orders..."
                value={formData.assessmentAndPlan}
                onChange={(e) => setFormData({ ...formData, assessmentAndPlan: e.target.value })}
              />
              <Textarea
                label="Medications Prescribed / Maintained"
                rows={3}
                placeholder="Drug name, dosage, frequency, route..."
                value={formData.medications}
                onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/cases">
            <Button type="button" variant="outline" disabled={submitting}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" variant="primary" size="lg" isLoading={submitting}>
            Open Clinical Case Record
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewCasePage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading form...</div>}>
        <NewCaseForm />
      </Suspense>
    </AppShell>
  );
}
