import { SecretScanner } from './secret-scanner';
import { DatabaseService } from './database';
import { SecretScan, Repository, GitHubWebhookPayload } from '@/types';
import crypto from 'crypto';

export class GitHubService {
  private scanner = new SecretScanner();
  private githubToken: string;

  constructor(githubToken: string) {
    this.githubToken = githubToken;
  }

  /**
   * Get GitHub API headers
   */
  private getHeaders() {
    return {
      'Authorization': `token ${this.githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitWizard/1.0'
    };
  }

  /**
   * Get user repositories
   */
  async getUserRepositories() {
    const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get repository content
   */
  async getRepositoryContent(owner: string, repo: string, path: string, ref?: string) {
    const url = new URL(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`);
    if (ref) {
      url.searchParams.set('ref', ref);
    }

    const response = await fetch(url.toString(), {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get files changed in a commit
   */
  async getCommitFiles(owner: string, repo: string, commitSha: string) {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits/${commitSha}`,
      { headers: this.getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to get commit: ${response.statusText}`);
    }

    const commit = await response.json();
    return commit.files || [];
  }

  /**
   * Get file content from a specific commit
   */
  async getFileContent(owner: string, repo: string, filePath: string, commitSha: string): Promise<string> {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${commitSha}`,
      { headers: this.getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to get file content: ${response.statusText}`);
    }

    const file = await response.json();
    
    // Handle base64 encoded content
    if (file.content && file.encoding === 'base64') {
      return Buffer.from(file.content, 'base64').toString('utf-8');
    }
    
    return file.content || '';
  }

  /**
   * Scan commit for secrets
   */
  async scanCommit(
    owner: string,
    repo: string,
    commitSha: string,
    repositoryId: string
  ): Promise<SecretScan[]> {
    const files = await this.getCommitFiles(owner, repo, commitSha);
    const secrets: SecretScan[] = [];

    for (const file of files) {
      // Skip deleted files
      if (file.status === 'removed') continue;

      // Skip binary files
      if (file.filename.match(/\.(png|jpg|jpeg|gif|svg|ico|pdf|zip|tar|gz|rar|mp4|mp3|wav|avi|mov)$/i)) {
        continue;
      }

      try {
        // Get file content
        const content = await this.getFileContent(owner, repo, file.filename, commitSha);
        
        // Scan for secrets
        const scanResult = this.scanner.scanContent(content, file.filename);
        
        if (scanResult.found) {
          for (const secret of scanResult.secrets) {
            // Get commit details
            const commitResponse = await fetch(
              `https://api.github.com/repos/${owner}/${repo}/commits/${commitSha}`,
              { headers: this.getHeaders() }
            );
            const commit = await commitResponse.json();

            // Save to database
            const secretScan = await DatabaseService.addSecretScan({
              repository_id: repositoryId,
              commit_sha: commitSha,
              commit_message: commit.commit.message,
              commit_url: commit.html_url,
              secret_type: secret.type,
              secret_value: secret.value,
              line_number: secret.lineNumber,
              file_path: secret.filePath
            });

            secrets.push(secretScan as SecretScan);
          }
        }
      } catch (error) {
        console.error(`Error scanning file ${file.filename}:`, error);
        // Continue with other files
      }
    }

    return secrets;
  }

  /**
   * Create webhook for repository
   */
  async createWebhook(owner: string, repo: string, webhookUrl: string) {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/hooks`, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'web',
        active: true,
        events: ['push'],
        config: {
          url: webhookUrl,
          content_type: 'json',
          secret: process.env.GITHUB_WEBHOOK_SECRET
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create webhook: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(owner: string, repo: string, webhookId: number) {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/hooks/${webhookId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to delete webhook: ${response.statusText}`);
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = 'sha256=' + crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Process webhook event
   */
  async processWebhookEvent(payload: GitHubWebhookPayload, repository: Repository) {
    if (payload.ref !== 'refs/heads/main' && payload.ref !== 'refs/heads/master') {
      return; // Only process main/master branch
    }

    const [owner, repo] = repository.fullName.split('/');
    
    for (const commit of payload.commits) {
      try {
        await this.scanCommit(owner, repo, commit.id, repository.id);
      } catch (error) {
        console.error(`Error processing commit ${commit.id}:`, error);
      }
    }
  }

  /**
   * Get repository details
   */
  async getRepository(owner: string, repo: string) {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Check if user has access to repository
   */
  async checkRepositoryAccess(owner: string, repo: string): Promise<boolean> {
    try {
      await this.getRepository(owner, repo);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user's GitHub profile
   */
  async getUserProfile() {
    const response = await fetch('https://api.github.com/user', {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * List webhooks for repository
   */
  async listWebhooks(owner: string, repo: string) {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/hooks`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to list webhooks: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create webhook with conflict resolution
   */
  async createWebhookWithConflictResolution(owner: string, repo: string, webhookUrl: string) {
    try {
      // First, try to create the webhook
      return await this.createWebhook(owner, repo, webhookUrl);
    } catch (error) {
      // If it's a conflict error, try to find and delete existing webhook
      if (error instanceof Error && error.message.includes('Hook already exists')) {
        console.log('Webhook already exists, attempting to clean up...');
        
        // List existing webhooks
        const webhooks = await this.listWebhooks(owner, repo);
        
        // Find webhook with matching URL
        const existingWebhook = webhooks.find((hook: { config: { url: string }; id: number }) => 
          hook.config.url === webhookUrl
        );
        
        if (existingWebhook) {
          // Delete the existing webhook
          await this.deleteWebhook(owner, repo, existingWebhook.id);
          console.log(`Deleted existing webhook ${existingWebhook.id}`);
          
          // Try to create the webhook again
          return await this.createWebhook(owner, repo, webhookUrl);
        } else {
          // Webhook exists but doesn't match our URL, throw error
          throw new Error('Repository has existing webhooks that do not match our configuration. Please remove them manually from GitHub settings.');
        }
      }
      
      // Re-throw other errors
      throw error;
    }
  }
} 