import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DatabaseService } from '@/lib/database';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const sub = await DatabaseService.getUserSubscription(session.user.id);
    return NextResponse.json({ plan: sub?.plan || 'free', status: sub?.status || 'active' });
  } catch (error) {
    return NextResponse.json({ plan: 'free', status: 'active' });
  }
} 