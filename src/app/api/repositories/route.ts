import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DatabaseService } from '@/lib/database';
import { GitHubService } from '@/lib/github';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

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
    try {
      const token = await DatabaseService.getUserToken(userId);
      if (!token) {
        throw new Error('No GitHub access token found');
      }

      const githubService = new GitHubService(token);
      const [owner, repoName] = full_name.split('/');
      const webhookUrl = `${process.env.NEXTAUTH_URL}/api/webhook/github`;
      
      const webhookData = await githubService.createWebhookWithConflictResolution(owner, repoName, webhookUrl);
      
      // Update repository with webhook ID
      await DatabaseService.updateRepository(repo.id, { 
        webhook_id: webhookData.id, 
        is_active: true 
      });
      
      // Track successful repository addition
      trackEvent(AnalyticsEvents.REPOSITORY_ADD, { 
        repository: full_name,
        plan: plan,
        is_private: !!isPrivate
      });
      
      // Track webhook creation
      trackEvent(AnalyticsEvents.WEBHOOK_CREATE, { 
        repository: full_name 
      });
      
      return NextResponse.json({ 
        message: 'Repository connected successfully',
        repository: {
          ...repo,
          webhook_id: webhookData.id,
          is_active: true
        }
      });
    } catch (error) {
      console.error('Webhook setup failed:', error);
      
      // Track webhook error
      trackEvent(AnalyticsEvents.WEBHOOK_ERROR, { 
        repository: full_name,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Clean up the repository entry since webhook failed
      await DatabaseService.deleteRepository(repo.id);
      
      return NextResponse.json(
        { error: 'Failed to set up webhook. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error adding repository:', error);
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
          
          // Track webhook deletion
          trackEvent(AnalyticsEvents.WEBHOOK_DELETE, { 
            repository: repository.full_name 
          });
        }
      } catch (error) {
        console.error('Failed to delete webhook from GitHub:', error);
        // Continue with repository deletion even if webhook deletion fails
      }
    }

    // Delete the repository from database
    await DatabaseService.deleteRepository(repoId);
    
    // Track repository removal
    trackEvent(AnalyticsEvents.REPOSITORY_REMOVE, { 
      repository: repository.full_name,
      had_webhook: !!repository.webhook_id
    });

    return NextResponse.json({ message: 'Repository deleted successfully' });
  } catch (error) {
    console.error('Error deleting repository:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}