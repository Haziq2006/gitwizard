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
    
    // Count current repos
    const userRepos = await DatabaseService.getUserRepositories(userId);
    const repoCount = Array.isArray(userRepos) ? userRepos.length : 0;
    
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

    // Insert the repository for the user
    const repo = await DatabaseService.addRepository({
      user_id: userId,
      github_id,
      name,
      full_name,
      private: !!isPrivate,
    });

    // Webhook setup
    const token = session.accessToken;
    if (!token) {
      return NextResponse.json(
        { error: 'No GitHub access token found' },
        { status: 401 }
      );
    }

    // Verify webhook URL is valid
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/github`;
    if (!webhookUrl.startsWith('https://')) {
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

      if (!webhookRes.ok) {
        const errorData = await webhookRes.json();
        console.error('GitHub API Error:', errorData);
        return NextResponse.json(
          { 
            error: 'Failed to create webhook',
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
          details: typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error)
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/repositories:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error)
      },
      { status: 500 }
    );
  }
}