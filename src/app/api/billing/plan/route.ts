import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DatabaseService } from '@/lib/database';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const subscription = await DatabaseService.getUserSubscription(session.user.id);
    
    return NextResponse.json({
      plan: subscription?.plan || 'free',
      status: subscription?.status || 'active'
    });
  } catch (error) {
    console.error('Error fetching plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 