import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DatabaseService } from '@/lib/database';
import { GitHubService } from '@/lib/github';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const repositories = await DatabaseService.getUserRepositories(session.user.id);
    return NextResponse.json(repositories);
  } catch (error) {
    console.error('Error fetching repositories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Fetch user plan
    const subscription = await DatabaseService.getUserSubscription(userId);
    const plan = subscription?.plan || 'free';
    
    // Count current repos (only active and fully connected)
    const allUserRepos = await DatabaseService.getUserRepositories(userId);
    const userRepos = Array.isArray(allUserRepos)
      ? allUserRepos.filter(r => r.is_active === true && r.webhook_id != null)
      : [];
    const repoCount = userRepos.length;
    
    // Set plan limits
    let repoLimit = 1;
    if (plan === 'pro') repoLimit = 10;
    if (plan === 'business') repoLimit = Infinity;
    
    if (repoCount >= repoLimit) {
      return NextResponse.json(
        { 
          error: `Plan limit reached: ${plan} plan allows ${repoLimit === Infinity ? 'unlimited' : repoLimit} repositories.` 
        }, 
        { status: 403 }
      );
    }

    const body = await req.json();
    const { github_id, name, full_name, private: isPrivate } = body;
    
    if (!github_id || !name || !full_name) {
      return NextResponse.json(
        { error: 'Missing required fields (github_id, name, full_name)' },
        { status: 400 }
      );
    }

    // Check for duplicate repository (check ALL repos, not just active ones)
    const allUserReposForDuplicateCheck = await DatabaseService.getUserRepositories(userId);
    const duplicateRepo = Array.isArray(allUserReposForDuplicateCheck) 
      ? allUserReposForDuplicateCheck.find(r => r.github_id === github_id)
      : null;
    if (duplicateRepo) {
      return NextResponse.json(
        { error: 'Repository already connected.' },
        { status: 400 }
      );
    }

    // Insert the repository for the user
    let repo;
    try {
      repo = await DatabaseService.addRepository({
        user_id: userId,
        github_id,
        name,
        full_name,
        private: !!isPrivate,
      });
    } catch (error) {
      console.error('Failed to add repository:', error);
      return NextResponse.json(
        { error: 'Failed to add repository.' },
        { status: 400 }
      );
    }

    // Webhook setup
    const token = session.accessToken;
    if (!token) {
      // Clean up the repo if we can't proceed
      await DatabaseService.updateRepository(repo.id, { is_active: false });
      return NextResponse.json(
        { error: 'No GitHub access token found' },
        { status: 401 }
      );
    }

    // Verify webhook URL is valid
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/github`;
    if (!webhookUrl.startsWith('https://')) {
      // Clean up the repo if we can't proceed
      await DatabaseService.updateRepository(repo.id, { is_active: false });
      return NextResponse.json(
        { error: 'Webhook URL must be HTTPS for production' },
        { status: 400 }
      );
    }

    const [owner, repoName] = full_name.split('/');
    
    try {
      // Use the GitHub service with conflict resolution
      const githubService = new GitHubService(token);
      const webhookData = await githubService.createWebhookWithConflictResolution(
        owner, 
        repoName, 
        webhookUrl
      );
      
      // Update repository with webhook ID
      await DatabaseService.updateRepository(repo.id, { 
        webhook_id: webhookData.id,
        is_active: true
      });

      return NextResponse.json({ 
        ...repo, 
        webhook_id: webhookData.id 
      });

    } catch (error) {
      console.error('Webhook creation failed:', error);
      return NextResponse.json(
        { 
          error: 'Failed to create webhook',
          details: typeof error === 'object' && error !== null && 'message' in error ? String((error as { message: unknown }).message) : String(error)
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Repository creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { repoId, action } = body;
    
    if (!repoId || action !== 'recreate-webhook') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Get the repository to verify ownership
    const repository = await DatabaseService.getRepositoryById(repoId);
    
    if (!repository) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

    if (repository.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = session.accessToken;
    if (!token) {
      return NextResponse.json({ error: 'No GitHub access token found' }, { status: 401 });
    }

    // Verify webhook URL is valid
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/github`;
    if (!webhookUrl.startsWith('https://')) {
      return NextResponse.json(
        { error: 'Webhook URL must be HTTPS for production' },
        { status: 400 }
      );
    }

    const [owner, repoName] = repository.full_name.split('/');
    
    try {
      // Delete existing webhook if it exists
      if (repository.webhook_id) {
        try {
          const githubService = new GitHubService(token);
          await githubService.deleteWebhook(owner, repoName, repository.webhook_id);
        } catch (error) {
          console.error('Failed to delete existing webhook:', error);
          // Continue anyway, the new webhook creation will handle conflicts
        }
      }

      // Create new webhook with conflict resolution
      const githubService = new GitHubService(token);
      const webhookData = await githubService.createWebhookWithConflictResolution(
        owner, 
        repoName, 
        webhookUrl
      );
      
      // Update repository with new webhook ID
      await DatabaseService.updateRepository(repoId, { 
        webhook_id: webhookData.id,
        is_active: true
      });

      return NextResponse.json({ 
        message: 'Webhook recreated successfully',
        webhook_id: webhookData.id
      });

    } catch (error) {
      console.error('Webhook recreation failed:', error);
      return NextResponse.json(
        { 
          error: 'Failed to recreate webhook',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in PATCH /api/repositories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const repoId = searchParams.get('id');
    
    if (!repoId) {
      return NextResponse.json({ error: 'Repository ID is required' }, { status: 400 });
    }

    // Get the repository to verify ownership and get webhook info
    const repository = await DatabaseService.getRepositoryById(repoId);
    
    if (!repository) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

    if (repository.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete webhook from GitHub if it exists
    if (repository.webhook_id) {
      try {
        const token = session.accessToken;
        if (token) {
          const [owner, repoName] = repository.full_name.split('/');
          const githubService = new GitHubService(token);
          await githubService.deleteWebhook(owner, repoName, repository.webhook_id);
        }
      } catch (error) {
        console.error('Failed to delete webhook from GitHub:', error);
        // Continue with repository deletion even if webhook deletion fails
      }
    }

    // Delete the repository from database
    await DatabaseService.deleteRepository(repoId);

    return NextResponse.json({ message: 'Repository deleted successfully' });
  } catch (error) {
    console.error('Error deleting repository:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}