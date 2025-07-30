import { NextRequest, NextResponse } from 'next/server';
import { GitHubService } from '@/lib/github';
import { DatabaseService, supabaseAdmin } from '@/lib/database';
import { EmailService } from '@/lib/email';
import { TABLES } from '@/lib/database';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    // Verify webhook signature
    const githubService = new GitHubService('');
    const isValid = githubService.verifyWebhookSignature(
      body,
      signature,
      process.env.GITHUB_WEBHOOK_SECRET!
    );

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(body);
    
    // Only process push events
    if (payload.ref !== 'refs/heads/main' && payload.ref !== 'refs/heads/master') {
      return NextResponse.json({ message: 'Ignored non-main branch' });
    }

    // Get repository from database
    const { data: repository } = await supabaseAdmin
      .from(TABLES.REPOSITORIES)
      .select('*')
      .eq('github_id', payload.repository.id)
      .eq('is_active', true)
      .single();

    if (!repository) {
      return NextResponse.json({ error: 'Repository not found or inactive' }, { status: 404 });
    }

    // Get user for notifications
    const { data: user } = await supabaseAdmin
      .from(TABLES.USERS)
      .select('*')
      .eq('id', repository.user_id)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Process each commit
    for (const commit of payload.commits) {
      try {
        // Create GitHub service with user's token (you'll need to store this)
        const githubService = new GitHubService(process.env.GITHUB_TOKEN!);
        
        // Scan commit for secrets
        const secrets = await githubService.scanCommit(
          payload.repository.owner.name,
          payload.repository.name,
          commit.id,
          repository.id
        );

        // Send alerts for each secret found
        for (const secret of secrets) {
          // Track secret detection
          trackEvent(AnalyticsEvents.SECRET_DETECTED, {
            secret_type: secret.secretType,
            repository: payload.repository.full_name,
            commit_sha: commit.id.substring(0, 8)
          });
          
          // Create alert record
          await DatabaseService.addAlert({
            user_id: user.id,
            secret_scan_id: secret.id,
            type: 'email',
            status: 'pending'
          });

          // Send email alert
          try {
            await EmailService.sendSecretAlert(user, secret, repository);
            
            // Update alert status
            await DatabaseService.updateAlertStatus(
              secret.id,
              'sent',
              new Date().toISOString()
            );
            
            // Track successful alert
            trackEvent(AnalyticsEvents.ALERT_VIEW, {
              secret_type: secret.secretType,
              repository: payload.repository.full_name,
              alert_type: 'email'
            });
          } catch (error) {
            console.error('Failed to send email alert:', error);
            
            // Update alert status to failed
            await DatabaseService.updateAlertStatus(secret.id, 'failed');
            
            // Track alert failure
            trackEvent(AnalyticsEvents.ERROR_OCCURRED, {
              type: 'alert_failure',
              secret_type: secret.secretType,
              repository: payload.repository.full_name
            });
          }
        }
      } catch (error) {
        console.error(`Error processing commit ${commit.id}:`, error);
        // Continue with other commits
      }
    }

    return NextResponse.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 