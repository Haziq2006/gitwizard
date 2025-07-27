export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  github_id?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Repository {
  id: string;
  userId: string;
  github_id: number;
  name: string;
  fullName: string;
  private: boolean;
  webhookId?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SecretScan {
  id: string;
  repositoryId: string;
  commitSha: string;
  commitMessage: string;
  commitUrl: string;
  secretType: SecretType;
  secretValue: string;
  lineNumber: number;
  filePath: string;
  isResolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Alert {
  id: string;
  userId: string;
  secretScanId: string;
  type: AlertType;
  status: AlertStatus;
  sentAt?: Date;
  createdAt: Date;
}

export interface WebhookEvent {
  id: string;
  repositoryId: string;
  eventType: string;
  payload: Record<string, unknown>;
  processed: boolean;
  createdAt: Date;
}

export enum SecretType {
  AWS_ACCESS_KEY = 'aws_access_key',
  AWS_SECRET_KEY = 'aws_secret_key',
  STRIPE_SECRET_KEY = 'stripe_secret_key',
  STRIPE_PUBLISHABLE_KEY = 'stripe_publishable_key',
  GITHUB_TOKEN = 'github_token',
  GITHUB_PERSONAL_ACCESS_TOKEN = 'github_personal_access_token',
  DATABASE_URL = 'database_url',
  JWT_SECRET = 'jwt_secret',
  API_KEY = 'api_key',
  OPENAI_API_KEY = 'openai_api_key',
  ANTHROPIC_API_KEY = 'anthropic_api_key',
  DEEPSEEK_API_KEY = 'deepseek_api_key',
  GOOGLE_AI_API_KEY = 'google_ai_api_key',
  HUGGINGFACE_API_KEY = 'huggingface_api_key',
  COHERE_API_KEY = 'cohere_api_key',
  REPLICATE_API_KEY = 'replicate_api_key',
  TOGETHER_AI_API_KEY = 'together_ai_api_key',
  AZURE_OPENAI_API_KEY = 'azure_openai_api_key',
  GOOGLE_CLOUD_API_KEY = 'google_cloud_api_key',
  FIREBASE_API_KEY = 'firebase_api_key',
  SENDGRID_API_KEY = 'sendgrid_api_key',
  TWILIO_API_KEY = 'twilio_api_key',
  MAILGUN_API_KEY = 'mailgun_api_key',
  ALGOLIA_API_KEY = 'algolia_api_key',
  PRIVATE_KEY = 'private_key',
  SSH_KEY = 'ssh_key',
  CUSTOM = 'custom'
}

export enum SubscriptionPlan {
  FREE = 'free',
  PRO = 'pro',
  BUSINESS = 'business'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  UNPAID = 'unpaid'
}

export enum AlertType {
  EMAIL = 'email',
  SLACK = 'slack',
  DISCORD = 'discord'
}

export enum AlertStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed'
}

export interface SecretPattern {
  type: SecretType;
  pattern: RegExp;
  description: string;
  examples: string[];
}

export interface ScanResult {
  found: boolean;
  secrets: Array<{
    type: SecretType;
    value: string;
    lineNumber: number;
    filePath: string;
  }>;
}

export interface GitHubWebhookPayload {
  ref: string;
  before: string;
  after: string;
  repository: {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
  };
  commits: Array<{
    id: string;
    message: string;
    url: string;
    added: string[];
    modified: string[];
    removed: string[];
  }>;
}

export interface DashboardStats {
  totalRepositories: number;
  totalScans: number;
  secretsFound: number;
  resolvedSecrets: number;
  activeAlerts: number;
  scanSuccessRate: number;
}

export interface RepositoryStats {
  repositoryId: string;
  repositoryName: string;
  totalCommits: number;
  secretsFound: number;
  lastScan: Date;
  scanSuccessRate: number;
} 