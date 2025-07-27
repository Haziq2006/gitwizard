import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GitHubService } from '@/lib/github';
import { DatabaseService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's GitHub access token
    const accessToken = await DatabaseService.getUserToken(session.user.id);
    
    if (!accessToken) {
      return NextResponse.json({ error: 'No GitHub access token found' }, { status: 401 });
    }

    // Create GitHub service with user's token
    const githubService = new GitHubService(accessToken);
    
    // Get user's repositories
    const repositories = await githubService.getUserRepositories();
    
    // Filter out repositories that are already connected
    const userRepos = await DatabaseService.getUserRepositories(session.user.id);
    const connectedRepoIds = userRepos.map(repo => repo.github_id);
    
    const availableRepos = repositories.filter((repo: { id: number }) => 
      !connectedRepoIds.includes(repo.id)
    );

    return NextResponse.json(availableRepos);
  } catch (error) {
    console.error('Error fetching GitHub repositories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    );
  }
} 