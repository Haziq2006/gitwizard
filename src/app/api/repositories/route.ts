import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DatabaseService } from '@/lib/database';

export async function GET(request: NextRequest) {
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
      const webhookRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/hooks`, {
        method: 'POST',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'GitWizard/1.0',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'web',
          active: true,
          events: ['push'],
          config: {
            url: webhookUrl,
            content_type: 'json',
            secret: process.env.GITHUB_WEBHOOK_SECRET,
          },
        }),
      });

      // If webhook creation fails, clean up the repo
      if (!webhookRes.ok) {
        await DatabaseService.updateRepository(repo.id, { is_active: false });
        const errorData = await webhookRes.json();
        console.error('GitHub API Error:', errorData);
        
        // Handle specific webhook errors
        if (webhookRes.status === 422 && errorData.message === 'Validation Failed') {
          const hookError = errorData.errors?.find((e: { resource: string; message: string }) => e.resource === 'Hook');
          if (hookError?.message === 'Hook already exists on this repository') {
            return NextResponse.json(
              { 
                error: 'Webhook already exists for this repository. Please remove it from GitHub settings first.',
                details: 'A webhook for this repository already exists. You may need to remove it manually from the repository settings.'
              },
              { status: 409 }
            );
          }
        }
        
        return NextResponse.json(
          { 
            error: 'Failed to create webhook on GitHub.',
            details: errorData.message || 'Unknown error'
          },
          { status: webhookRes.status }
        );
      }

      const webhookData = await webhookRes.json();
      
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
    console.error('Error in POST /api/repositories:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: typeof error === 'object' && error !== null && 'message' in error ? String((error as { message: unknown }).message) : String(error)
      },
      { status: 500 }
    );
  }
}