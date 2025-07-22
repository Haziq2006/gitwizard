import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin, TABLES } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's repositories
    const { data: repositories } = await supabaseAdmin
      .from(TABLES.REPOSITORIES)
      .select('id')
      .eq('user_id', session.user.id);

    if (!repositories || repositories.length === 0) {
      return NextResponse.json([]);
    }

    const repoIds = repositories.map(repo => repo.id);

    // Get recent scans for user's repositories
    const { data: scans, error } = await supabaseAdmin
      .from(TABLES.SECRET_SCANS)
      .select(`
        id,
        commit_sha,
        commit_message,
        secret_type,
        file_path,
        line_number,
        is_resolved,
        created_at
      `)
      .in('repository_id', repoIds)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    return NextResponse.json(scans || []);
  } catch (error) {
    console.error('Error fetching recent scans:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 