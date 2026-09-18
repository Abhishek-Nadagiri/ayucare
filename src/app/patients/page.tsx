'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Plus,
  Filter,
  ArrowUpRight,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  ShieldAlert,
  Archive,
  CheckCircle2,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Patient, User } from '@/types';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [sexFilter, setSexFilter] = useState('ALL');
  const [showArchived, setShowArchived] = useState(false);

  // Add Patient Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    sex: 'Male',
    bloodType: 'O+',
    allergies: '',
    phone: '',
    email: '',
    address: '',
    emergencyName: '',
    emergencyRel: '',
    emergencyPhone: '',
  });

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

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (sexFilter !== 'ALL') params.set('sex', sexFilter);
      if (showArchived) params.set('archived', 'true');

      const res = await fetch(`/api/patients?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setPatients(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch patients', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchPatients();
    }, 200);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, sexFilter, showArchived]);

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.sex) {
      setFormError('Please complete all required fields.');
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        sex: formData.sex,
        bloodType: formData.bloodType,
        allergies: formData.allergies
          ? formData.allergies.split(',').map((a) => a.trim()).filter(Boolean)
          : [],
        contactInformation: {
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          emergencyContact: formData.emergencyName
            ? {
                name: formData.emergencyName,
                relationship: formData.emergencyRel,
                phone: formData.emergencyPhone,
              }
            : undefined,
        },
      };

      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        setFormError(json.error?.message || 'Failed to create patient.');
        setSubmitting(false);
        return;
      }

      setIsAddModalOpen(false);
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        sex: 'Male',
        bloodType: 'O+',
        allergies: '',
        phone: '',
        email: '',
        address: '',
        emergencyName: '',
        emergencyRel: '',
        emergencyPhone: '',
      });
      fetchPatients();
    } catch (err) {
      setFormError('Network error registering patient.');
    } finally {
      setSubmitting(false);
    }
  };

  const canCreatePatient = currentUser?.roleName === 'Doctor' || currentUser?.roleName === 'Administrator';

  return (
    <AppShell>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-500" />
            Patient Records Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Centralized registry of verified patients and associated clinical cases.
          </p>
        </div>

        {canCreatePatient && (
          <Button
            onClick={() => setIsAddModalOpen(true)}
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Register Patient
          </Button>
        )}
      </div>

      {/* SEARCH AND FILTERS BAR */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#121927] border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search by name or MED-PT-..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="w-full sm:w-auto flex flex-wrap items-center gap-3">
          <div className="w-36">
            <Select
              options={[
                { label: 'All Genders', value: 'ALL' },
                { label: 'Male', value: 'Male' },
                { label: 'Female', value: 'Female' },
                { label: 'Other', value: 'Other' },
              ]}
              value={sexFilter}
              onChange={(e) => setSexFilter(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            Show Archived Records
          </label>
        </div>
      </div>

      {/* PATIENTS LIST / TABLE */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">
              Loading verified patient records...
            </div>
          ) : patients.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 space-y-2">
              <Users className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                No patients match the specified criteria.
              </p>
              <p>Try resetting filters or registering a new patient record.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Identifier</th>
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">DOB / Age</th>
                    <th className="py-3 px-4">Gender</th>
                    <th className="py-3 px-4">Blood Type</th>
                    <th className="py-3 px-4">Known Allergies</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {patients.map((p) => {
                    const birthYear = new Date(p.dateOfBirth).getFullYear();
                    const age = new Date().getFullYear() - birthYear;
                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                          p.archivedAt ? 'opacity-60 bg-slate-100/50 dark:bg-slate-900/40' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-xs text-teal-600 dark:text-teal-400">
                          {p.patientIdentifier}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                          <Link
                            href={`/patients/${p.id}`}
                            className="hover:underline flex items-center gap-1.5"
                          >
                            {p.firstName} {p.lastName}
                            {p.archivedAt && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 font-semibold">
                                Archived
                              </span>
                            )}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400">
                          {p.dateOfBirth} ({age} yrs)
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-700 dark:text-slate-300">
                          {p.sex}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {p.bloodType || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {p.allergies && p.allergies.length > 0 && p.allergies[0] !== 'None known' ? (
                            <div className="flex flex-wrap gap-1">
                              {p.allergies.map((allg, idx) => (
                                <span
                                  key={idx}
                                  className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 font-medium"
                                >
                                  {allg}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">No known allergies</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                          {p.contactInformation?.phone || p.contactInformation?.email || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link href={`/patients/${p.id}`}>
                            <Button size="sm" variant="ghost" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                              Profile
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ADD PATIENT MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Patient"
        subtitle="Generates an official MED-PT-2026 identifier upon submission."
        maxWidth="2xl"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleAddPatient} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              required
              placeholder="e.g. Eleanor"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
            <Input
              label="Last Name"
              required
              placeholder="e.g. Vance"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Date of Birth"
              type="date"
              required
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />
            <Select
              label="Biological Sex"
              options={[
                { label: 'Male', value: 'Male' },
                { label: 'Female', value: 'Female' },
                { label: 'Other', value: 'Other' },
              ]}
              value={formData.sex}
              onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
            />
            <Select
              label="Blood Type"
              options={[
                { label: 'O+', value: 'O+' },
                { label: 'O-', value: 'O-' },
                { label: 'A+', value: 'A+' },
                { label: 'A-', value: 'A-' },
                { label: 'B+', value: 'B+' },
                { label: 'B-', value: 'B-' },
                { label: 'AB+', value: 'AB+' },
                { label: 'AB-', value: 'AB-' },
                { label: 'Unknown', value: 'Unknown' },
              ]}
              value={formData.bloodType}
              onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
            />
          </div>

          <div>
            <Input
              label="Known Allergies (comma-separated)"
              placeholder="e.g. Penicillin, Aspirin, Latex"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              helperText="Critical medical safeguard: list all confirmed medication or substance allergies."
            />
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Contact & Emergency Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="patient@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="mt-3">
              <Input
                label="Residential Address"
                placeholder="Street address, City, State"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Emergency Contact
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Contact Name"
                placeholder="e.g. Martha Pendelton"
                value={formData.emergencyName}
                onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
              />
              <Input
                label="Relationship"
                placeholder="e.g. Spouse"
                value={formData.emergencyRel}
                onChange={(e) => setFormData({ ...formData, emergencyRel: e.target.value })}
              />
              <Input
                label="Emergency Phone"
                placeholder="+1 (555) 000-0000"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Register Patient Record
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
