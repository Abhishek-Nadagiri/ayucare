import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { verifyUserPermission } from '@/lib/auth';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyUserPermission('case:read');
  if (!auth.authorized) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: auth.error || 'Access denied' } },
      { status: 403 }
    );
  }

  const { id } = await params;
  const attachments = store.getAttachmentsByCaseId(id);
  return NextResponse.json({ data: attachments });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyUserPermission('case:update');
  if (!auth.authorized || !auth.user) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: auth.error || 'Permission case:update required' } },
      { status: 403 }
    );
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const { originalFilename, mimeType, fileSize } = body;

    if (!originalFilename) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Original filename is required' } },
        { status: 400 }
      );
    }

    const att = store.addAttachment(
      {
        caseId: id,
        uploadedBy: auth.user.id,
        uploaderName: auth.user.fullName,
        storagePath: `cases/${id}/attachments/${Date.now()}_${originalFilename.replace(/\s+/g, '_')}`,
        originalFilename,
        mimeType: mimeType || 'application/octet-stream',
        fileSize: fileSize || 102400,
      },
      auth.user
    );

    return NextResponse.json({ data: att }, { status: 201 });
  } catch (err) {
    console.error('Error attaching file:', err);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to record attachment' } },
      { status: 500 }
    );
  }
}
