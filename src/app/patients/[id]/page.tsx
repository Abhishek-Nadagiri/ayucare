'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  ArrowLeft,
  Plus,
  Phone,
  Mail,
  MapPin,
  ShieldAlert,
  FolderHeart,
  Calendar,
  AlertTriangle,
  Archive,
  RefreshCw,
  CheckCircle2,
  Clock,
  Heart,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Patient, PatientCase, User as UserType } from '@/types';

export default function PatientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [patient, setPatient] = useState<(Patient & { cases?: PatientCase[] }) | null>(null);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState(false);

  const fetchPatient = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${resolvedParams.id}`);
      if (res.ok) {
        const json = await res.json();
        setPatient(json.data);
      }
    } catch (err) {
      console.error('Failed to load patient', err);
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
    fetchPatient();
    fetchCurrentUser();
  }, [resolvedParams.id]);

  const toggleArchive = async () => {
    if (!confirm('Are you sure you want to change the archival status of this patient record?')) {
      return;
    }
    setArchiving(true);
    try {
      const res = await fetch(`/api/patients/${resolvedParams.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchPatient();
      }
    } catch (err) {
      console.error('Failed to archive patient', err);
    } finally {
      setArchiving(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="p-12 text-center text-xs text-slate-400">Loading patient profile...</div>
      </AppShell>
    );
  }

  if (!patient) {
    return (
      <AppShell>
        <div className="p-8 text-center">
          <p className="text-sm font-semibold text-rose-500">Patient not found</p>
          <Link href="/patients" className="mt-2 inline-block text-xs text-teal-500 underline">
            Return to Patients Directory
          </Link>
        </div>
      </AppShell>
    );
  }

  const birthYear = new Date(patient.dateOfBirth).getFullYear();
  const age = new Date().getFullYear() - birthYear;
  const canArchive = currentUser?.roleName === 'Administrator';
  const canCreateCase = currentUser?.roleName === 'Doctor';

  return (
    <AppShell>
      {/* Back breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/patients"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Patients Directory
        </Link>

        {canArchive && (
          <Button
            size="sm"
            variant="outline"
            onClick={toggleArchive}
            isLoading={archiving}
            leftIcon={<Archive className="w-3.5 h-3.5" />}
          >
            {patient.archivedAt ? 'Restore Active Status' : 'Archive Patient Record'}
          </Button>
        )}
      </div>

      {/* PATIENT DEMOGRAPHICS HEADER BANNER */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
        {patient.archivedAt && (
          <div className="mb-4 p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-semibold flex items-center gap-2">
            <Archive className="w-4 h-4" />
            This patient record was archived on {new Date(patient.archivedAt).toLocaleDateString()}.
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-600 dark:text-teal-400 font-bold flex items-center justify-center text-2xl flex-shrink-0">
              {patient.firstName.charAt(0)}
              {patient.lastName.charAt(0)}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-1">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {patient.firstName} {patient.lastName}
                </h1>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400 border border-slate-200 dark:border-slate-700">
                  {patient.patientIdentifier}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Blood: {patient.bloodType || 'N/A'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  <strong>DOB:</strong> {patient.dateOfBirth} ({age} years old)
                </span>
                <span>•</span>
                <span>
                  <strong>Sex:</strong> {patient.sex}
                </span>
                <span>•</span>
                <span>
                  <strong>Registered:</strong> {new Date(patient.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {canCreateCase && (
            <Link href={`/cases/new?patientId=${patient.id}`}>
              <Button size="md" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                Open New Case
              </Button>
            </Link>
          )}
        </div>

        {/* ALLERGIES WARNING STRIP */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mr-2">
            <ShieldAlert className="w-4 h-4" />
            Medical Alerts / Allergies:
          </span>
          {patient.allergies && patient.allergies.length > 0 && patient.allergies[0] !== 'None known' ? (
            patient.allergies.map((a, i) => (
              <span
                key={i}
                className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
              >
                {a}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400">No known drug allergies (NKDA) recorded.</span>
          )}
        </div>
      </div>

      {/* TWO COLUMNS: CONTACT INFO & CLINICAL CASES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Contact & Demographics Card */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact & Emergency Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-500 dark:text-slate-400">Phone</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-200 mt-0.5">
                    {patient.contactInformation?.phone || 'Not provided'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-500 dark:text-slate-400">Email</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-200 mt-0.5">
                    {patient.contactInformation?.email || 'Not provided'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-500 dark:text-slate-400">Address</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-200 mt-0.5">
                    {patient.contactInformation?.address || 'Not provided'}
                  </p>
                </div>
              </div>

              {patient.contactInformation?.emergencyContact && (
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-rose-500 mb-2">
                    Emergency Contact
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {patient.contactInformation.emergencyContact.name} (
                    {patient.contactInformation.emergencyContact.relationship})
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    {patient.contactInformation.emergencyContact.phone}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Associated Cases List */}
        <div className="lg:col-span-8 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FolderHeart className="w-5 h-5 text-teal-500" />
                  Associated Clinical Cases ({patient.cases?.length || 0})
                </CardTitle>
                <CardDescription>
                  Medical episodes and monitoring records associated with this patient
                </CardDescription>
              </div>

              {canCreateCase && (
                <Link href={`/cases/new?patientId=${patient.id}`}>
                  <Button size="sm" variant="outline" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                    New Case
                  </Button>
                </Link>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {(!patient.cases || patient.cases.length === 0) ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No cases have been created for this patient yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {patient.cases.map((c) => (
                    <Link
                      key={c.id}
                      href={`/cases/${c.id}`}
                      className="p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors block"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                            {c.caseNumber}
                          </span>
                          <Badge priority={c.priority} size="sm">
                            {c.priority}
                          </Badge>
                          <Badge status={c.status} size="sm">
                            {c.status}
                          </Badge>
                        </div>
                        <span className="text-xs text-slate-400">
                          Opened: {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                        {c.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {c.consultationReason}
                      </p>

                      <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                        <span>Department: <strong className="text-slate-600 dark:text-slate-300">{c.department}</strong></span>
                        <span className="text-teal-600 dark:text-teal-400 font-medium hover:underline flex items-center gap-1">
                          Open Clinical Workspace
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
