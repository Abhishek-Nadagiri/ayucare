import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { verifyUserPermission } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await verifyUserPermission('patient:read');
  if (!auth.authorized) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: auth.error || 'Access denied' } },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || searchParams.get('query') || undefined;
  const sex = searchParams.get('sex') || undefined;
  const showArchived = searchParams.get('archived') === 'true';

  const patients = store.getPatients({ query, sex, showArchived });

  return NextResponse.json({
    data: patients,
    meta: {
      total: patients.length,
    },
  });
}

export async function POST(req: NextRequest) {
  const auth = await verifyUserPermission('patient:create');
  if (!auth.authorized || !auth.user) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: auth.error || 'Permission patient:create required' } },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { firstName, lastName, dateOfBirth, sex, bloodType, allergies, contactInformation } = body;

    if (!firstName || !lastName || !dateOfBirth || !sex) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'First name, last name, date of birth, and sex are required fields.',
          },
        },
        { status: 400 }
      );
    }

    const patient = store.createPatient(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth,
        sex,
        bloodType: bloodType || 'Unknown',
        allergies: Array.isArray(allergies) ? allergies : allergies ? [allergies] : [],
        contactInformation: contactInformation || {},
      },
      auth.user
    );

    return NextResponse.json({ data: patient }, { status: 201 });
  } catch (err) {
    console.error('Error creating patient:', err);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to create patient record' } },
      { status: 500 }
    );
  }
}
