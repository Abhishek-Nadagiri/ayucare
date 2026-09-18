import { NextResponse } from 'next/server';
import { ROLE_DEFINITIONS } from '@/lib/auth/rbac';

export async function GET() {
  const roles = Object.values(ROLE_DEFINITIONS);
  return NextResponse.json({ data: roles });
}
