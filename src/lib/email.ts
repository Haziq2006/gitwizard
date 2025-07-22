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
   * Send welcome email
   */
  static async sendWelcomeEmail(user: User) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to GitWizard!</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; }
            .content { background: white; padding: 30px; border-radius: 10px; margin-top: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .feature { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 15px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to GitWizard!</h1>
              <p>Your security guardian is now active</p>
            </div>
            
            <div class="content">
              <h2>Hello ${user.name}!</h2>
              <p>Welcome to GitWizard! We're excited to help you keep your repositories secure by automatically detecting and alerting you about exposed secrets and API keys.</p>
              
              <h3>🚀 What's Next?</h3>
              <div class="feature">
                <h4>1. Connect Your Repository</h4>
                <p>Add your first repository to start monitoring for secrets.</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="btn">Go to Dashboard</a>
              </div>
              
              <div class="feature">
                <h4>2. Configure Alerts</h4>
                <p>Set up email notifications for instant security alerts.</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" class="btn">Configure Settings</a>
              </div>
              
              <div class="feature">
                <h4>3. Explore Features</h4>
                <p>Discover advanced features like custom patterns and team collaboration.</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/docs" class="btn">View Documentation</a>
              </div>
              
              <h3>🛡️ What We Monitor</h3>
              <ul>
                <li>AWS Access Keys & Secret Keys</li>
                <li>Stripe API Keys</li>
                <li>GitHub Tokens</li>
                <li>Database URLs</li>
                <li>JWT Secrets</li>
                <li>Private Keys</li>
                <li>And many more...</li>
              </ul>
              
              <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <strong>💡 Free Plan Includes:</strong> 1 repository, delayed alerts, basic scanning
              </div>
            </div>
            
            <div class="footer">
              <p>Questions? Contact us at support@gitwizard.com</p>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${user.email}">Unsubscribe</a></p>
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

  /**
   * Get display name for secret type
   */
  private static getSecretTypeDisplayName(secretType: string): string {
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
      'private_key': 'Private Key',
      'ssh_key': 'SSH Key',
      'custom': 'Custom Secret'
    };

    return displayNames[secretType] || secretType;
  }

  /**
   * Get severity level for secret type
   */
  private static getSecretSeverity(secretType: string): 'high' | 'medium' | 'low' {
    const highSeverity = ['aws_secret_key', 'stripe_secret_key', 'github_token', 'private_key', 'ssh_key'];
    const mediumSeverity = ['aws_access_key', 'database_url', 'jwt_secret', 'api_key'];
    const lowSeverity = ['stripe_publishable_key', 'github_personal_access_token'];

    if (highSeverity.includes(secretType)) return 'high';
    if (mediumSeverity.includes(secretType)) return 'medium';
    if (lowSeverity.includes(secretType)) return 'low';
    
    return 'medium'; // Default
  }
} 