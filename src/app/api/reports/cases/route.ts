import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { verifyUserPermission } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await verifyUserPermission('report:read');
  if (!auth.authorized) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: auth.error || 'Access denied' } },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format'); // 'csv' or 'json'

  const cases = store.getCases();
  const enriched = cases.map((c) => {
    const p = store.getPatientById(c.patientId);
    const doc = c.responsibleUserId ? store.getUserById(c.responsibleUserId) : null;
    return {
      caseNumber: c.caseNumber,
      title: c.title,
      status: c.status,
      priority: c.priority,
      department: c.department,
      patientName: p ? `${p.firstName} ${p.lastName}` : 'Unknown',
      patientIdentifier: p?.patientIdentifier || '',
      responsibleDoctor: doc?.fullName || 'Unassigned',
      createdAt: c.createdAt,
      closedAt: c.closedAt || '',
    };
  });

  if (format === 'csv') {
    const headers = [
      'Case Number',
      'Title',
      'Status',
      'Priority',
      'Department',
      'Patient Name',
      'Patient ID',
      'Responsible Clinician',
      'Created At',
      'Closed At',
    ];

    const rows = enriched.map((r) => [
      `"${r.caseNumber}"`,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.status}"`,
      `"${r.priority}"`,
      `"${r.department}"`,
      `"${r.patientName}"`,
      `"${r.patientIdentifier}"`,
      `"${r.responsibleDoctor}"`,
      `"${r.createdAt}"`,
      `"${r.closedAt}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="ayucare_cases_report.csv"',
      },
    });
  }

  return NextResponse.json({ data: enriched });
}
