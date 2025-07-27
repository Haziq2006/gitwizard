import { Resend } from 'resend';
import { SecretScan, Repository, User } from '@/types';

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  /**
   * Send secret detection alert
   */
  static async sendSecretAlert(
    user: User,
    secretScan: SecretScan,
    repository: Repository
  ) {
    const secretType = this.getSecretTypeDisplayName(secretScan.secretType);
    const severity = this.getSecretSeverity(secretScan.secretType);
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>🚨 Secret Detected in ${repository.name}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; }
            .content { background: white; padding: 30px; border-radius: 10px; margin-top: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .alert { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .secret-info { background: #f3f4f6; border-radius: 8px; padding: 15px; margin: 15px 0; font-family: 'Monaco', 'Menlo', monospace; font-size: 14px; }
            .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .btn-danger { background: #ef4444; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            .severity-high { border-left: 4px solid #ef4444; }
            .severity-medium { border-left: 4px solid #f59e0b; }
            .severity-low { border-left: 4px solid #10b981; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 Secret Detected</h1>
              <p>GitWizard found a potential security issue in your repository</p>
            </div>
            
            <div class="content">
              <div class="alert severity-${severity}">
                <h2>⚠️ ${secretType} Found</h2>
                <p>A <strong>${secretType}</strong> was detected in your repository <strong>${repository.fullName}</strong>.</p>
              </div>
              
              <h3>📋 Details</h3>
              <div class="secret-info">
                <strong>Repository:</strong> ${repository.fullName}<br>
                <strong>File:</strong> ${secretScan.filePath}<br>
                <strong>Line:</strong> ${secretScan.lineNumber}<br>
                <strong>Commit:</strong> ${secretScan.commitSha.substring(0, 8)}<br>
                <strong>Message:</strong> ${secretScan.commitMessage}
              </div>
              
              <h3>🔗 Quick Actions</h3>
              <a href="${secretScan.commitUrl}" class="btn">View Commit</a>
              <a href="https://github.com/${repository.fullName}/blob/main/${secretScan.filePath}#L${secretScan.lineNumber}" class="btn">View File</a>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="btn">View Dashboard</a>
              
              <h3>🛡️ Recommended Actions</h3>
              <ol>
                <li><strong>Immediately revoke</strong> the exposed secret/key</li>
                <li><strong>Rotate</strong> any related credentials</li>
                <li><strong>Check</strong> your Git history for other instances</li>
                <li><strong>Use environment variables</strong> for sensitive data</li>
                <li><strong>Add the file</strong> to your .gitignore</li>
              </ol>
              
              <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <strong>💡 Pro Tip:</strong> Consider upgrading to GitWizard Pro for instant alerts and automatic secret revocation.
              </div>
            </div>
            
            <div class="footer">
              <p>This alert was sent by GitWizard - Your security guardian</p>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${user.email}">Unsubscribe</a> | <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings">Settings</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      const { data, error } = await resend.emails.send({
        from: 'GitWizard <alerts@gitwizard.com>',
        to: [user.email],
        subject: `🚨 Secret Detected: ${secretType} in ${repository.name}`,
        html: html
      });

      if (error) {
        console.error('Email send error:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  /**
   * Get display name for secret type
   */
  static getSecretTypeDisplayName(secretType: string): string {
    const displayNames: Record<string, string> = {
      'aws_access_key': 'AWS Access Key',
      'aws_secret_key': 'AWS Secret Key',
      'stripe_secret_key': 'Stripe Secret Key',
      'stripe_publishable_key': 'Stripe Publishable Key',
      'github_token': 'GitHub Token',
      'github_personal_access_token': 'GitHub Personal Access Token',
      'database_url': 'Database URL',
      'jwt_secret': 'JWT Secret',
      'api_key': 'API Key',
      'openai_api_key': 'OpenAI API Key',
      'anthropic_api_key': 'Anthropic Claude API Key',
      'deepseek_api_key': 'DeepSeek API Key',
      'google_ai_api_key': 'Google AI API Key',
      'huggingface_api_key': 'Hugging Face API Key',
      'cohere_api_key': 'Cohere API Key',
      'replicate_api_key': 'Replicate API Key',
      'together_ai_api_key': 'Together AI API Key',
      'azure_openai_api_key': 'Azure OpenAI API Key',
      'google_cloud_api_key': 'Google Cloud API Key',
      'firebase_api_key': 'Firebase API Key',
      'sendgrid_api_key': 'SendGrid API Key',
      'twilio_api_key': 'Twilio API Key',
      'mailgun_api_key': 'Mailgun API Key',
      'algolia_api_key': 'Algolia API Key',
      'private_key': 'Private Key',
      'ssh_key': 'SSH Key'
    };
    return displayNames[secretType] || secretType;
  }

  /**
   * Get severity level for secret type
   */
  static getSecretSeverity(secretType: string): 'high' | 'medium' | 'low' {
    const highSeverity = [
      'aws_secret_key',
      'stripe_secret_key',
      'github_token',
      'github_personal_access_token',
      'private_key',
      'ssh_key',
      'database_url'
    ];
    const mediumSeverity = [
      'aws_access_key',
      'jwt_secret',
      'api_key',
      'openai_api_key',
      'anthropic_api_key',
      'deepseek_api_key'
    ];
    
    if (highSeverity.includes(secretType)) return 'high';
    if (mediumSeverity.includes(secretType)) return 'medium';
    return 'low';
  }

  /**
   * Send welcome email
   */
  static async sendWelcomeEmail(user: User) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to GitWizard</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; }
            .content { background: white; padding: 30px; border-radius: 10px; margin-top: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to GitWizard!</h1>
              <p>Your security guardian is ready to protect your repositories</p>
            </div>
            
            <div class="content">
              <h2>Hello ${user.name || 'Developer'}!</h2>
              <p>Welcome to GitWizard - the intelligent secret detection platform that keeps your repositories secure.</p>
              
              <h3>🚀 Getting Started</h3>
              <ol>
                <li><strong>Connect your first repository</strong> from your dashboard</li>
                <li><strong>GitWizard will automatically scan</strong> new commits for secrets</li>
                <li><strong>Receive instant alerts</strong> when potential secrets are detected</li>
                <li><strong>Take action</strong> to secure your codebase</li>
              </ol>
              
              <h3>🛡️ What We Detect</h3>
              <ul>
                <li>AWS Access & Secret Keys</li>
                <li>Stripe API Keys</li>
                <li>GitHub Tokens</li>
                <li>Database URLs</li>
                <li>JWT Secrets</li>
                <li>AI API Keys (OpenAI, Claude, DeepSeek, etc.)</li>
                <li>And much more...</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="btn">Go to Dashboard</a>
              </div>
              
              <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <strong>💡 Pro Tip:</strong> Start with a public repository to see GitWizard in action, then add your private repositories.
              </div>
            </div>
            
            <div class="footer">
              <p>This email was sent by GitWizard - Your security guardian</p>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${user.email}">Unsubscribe</a> | <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings">Settings</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      const { data, error } = await resend.emails.send({
        from: 'GitWizard <welcome@gitwizard.com>',
        to: [user.email],
        subject: '🎉 Welcome to GitWizard - Your Security Guardian',
        html: html
      });

      if (error) {
        console.error('Welcome email send error:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw error;
    }
  }
} 