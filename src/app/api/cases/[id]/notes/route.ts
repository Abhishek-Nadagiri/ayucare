import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { verifyUserPermission } from '@/lib/auth';
import { NoteType } from '@/types';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyUserPermission('note:read');
  if (!auth.authorized) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: auth.error || 'Access denied' } },
      { status: 403 }
    );
  }

  const { id } = await params;
  const notes = store.getNotesByCaseId(id);
  return NextResponse.json({ data: notes });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyUserPermission('note:create');
  if (!auth.authorized || !auth.user) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: auth.error || 'Permission note:create required' } },
      { status: 403 }
    );
  }

  const { id } = await params;
  const patientCase = store.getCaseById(id);
  if (!patientCase) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Case not found' } },
      { status: 404 }
    );
  }

  try {
    const body = await req.json();
    const { noteType = 'Clinical Note', content, isAmendment = false } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Note content cannot be empty' } },
        { status: 400 }
      );
    }

    const newNote = store.addNote(
      {
        caseId: id,
        authorId: auth.user.id,
        authorName: auth.user.fullName,
        authorRole: auth.user.roleName,
        noteType: noteType as NoteType,
        content: content.trim(),
        isAmendment: Boolean(isAmendment),
      },
      auth.user
    );

    return NextResponse.json({ data: newNote }, { status: 201 });
  } catch (err) {
    console.error('Error adding case note:', err);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to create case note' } },
      { status: 500 }
    );
  }
}
