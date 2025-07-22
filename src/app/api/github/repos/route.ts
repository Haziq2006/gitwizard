import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get the user's GitHub access token from the session
  const token = (session as { accessToken?: string }).accessToken;
  if (!token) {
    return NextResponse.json({ error: 'No GitHub access token found' }, { status: 401 });
  }

  try {
    const res = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'GitWizard/1.0'
      }
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch GitHub repos' }, { status: 500 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch GitHub repos' }, { status: 500 });
  }
} 