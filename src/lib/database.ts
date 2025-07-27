import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for server-side operations (with service role key)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Client for client-side operations (with anon key)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Database table names
export const TABLES = {
  USERS: 'users',
  REPOSITORIES: 'repositories',
  SECRET_SCANS: 'secret_scans',
  SUBSCRIPTIONS: 'subscriptions',
  ALERTS: 'alerts',
  WEBHOOK_EVENTS: 'webhook_events'
} as const;

export class DatabaseService {
  static async createUser(userData: {
    email: string;
    name: string;
    image?: string;
    github_id?: string;
  }) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.USERS)
      .insert(userData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async getUserByEmail(email: string) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.USERS)
      .select('*')
      .eq('email', email)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async upsertUser(userData: {
    email: string;
    name: string;
    image?: string;
    github_id?: string;
  }) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.USERS)
      .upsert(userData, { onConflict: 'email' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async getUsers() {
    const { data, error } = await supabaseAdmin
      .from(TABLES.USERS)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  static async getUserById(userId: string) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.USERS)
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  }

  static async updateUser(userId: string, updates: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.USERS)
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async deleteUser(userId: string) {
    const { error } = await supabaseAdmin
      .from(TABLES.USERS)
      .delete()
      .eq('id', userId);
    if (error) throw error;
  }

  static async getUserRepositories(userId: string) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.REPOSITORIES)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  static async addRepository(repoData: {
    user_id: string;
    github_id: number;
    name: string;
    full_name: string;
    private: boolean;
    webhook_id?: number;
  }) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.REPOSITORIES)
      .insert(repoData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async getRepositories() {
    const { data, error } = await supabaseAdmin
      .from(TABLES.REPOSITORIES)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  static async updateRepository(repoId: string, updates: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.REPOSITORIES)
      .update(updates)
      .eq('id', repoId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async deleteRepository(repoId: string) {
    const { error } = await supabaseAdmin
      .from(TABLES.REPOSITORIES)
      .delete()
      .eq('id', repoId);
    if (error) throw error;
  }

  static async getRepositoryById(repoId: string) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.REPOSITORIES)
      .select('*')
      .eq('id', repoId)
      .single();
    if (error) throw error;
    return data;
  }

  static async getRepositoryScans(repositoryId: string, limit = 50) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.SECRET_SCANS)
      .select('*')
      .eq('repository_id', repositoryId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  }

  static async addSecretScan(scanData: {
    repository_id: string;
    commit_sha: string;
    commit_message: string;
    commit_url: string;
    secret_type: string;
    secret_value: string;
    line_number: number;
    file_path: string;
  }) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.SECRET_SCANS)
      .insert(scanData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async resolveSecretScan(scanId: string) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.SECRET_SCANS)
      .update({ is_resolved: true })
      .eq('id', scanId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async getUserSubscription(userId: string) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.SUBSCRIPTIONS)
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async upsertSubscription(subscriptionData: {
    user_id: string;
    stripe_customer_id?: string;
    stripe_subscription_id?: string;
    plan: string;
    status: string;
    current_period_start: string;
    current_period_end: string;
  }) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.SUBSCRIPTIONS)
      .upsert(subscriptionData, { onConflict: 'user_id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async addAlert(alertData: {
    user_id: string;
    secret_scan_id: string;
    type: string;
    status: string;
  }) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.ALERTS)
      .insert(alertData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async updateAlertStatus(alertId: string, status: string, sentAt?: string) {
    const updates: Record<string, string> = { status };
    if (sentAt) updates.sent_at = sentAt;
    const { data, error } = await supabaseAdmin
      .from(TABLES.ALERTS)
      .update(updates)
      .eq('id', alertId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async getDashboardStats(userId: string) {
    // Get all repository IDs for the user first
    const { data: userRepos } = await supabaseAdmin
      .from(TABLES.REPOSITORIES)
      .select('id')
      .eq('user_id', userId);

    const repoIds = userRepos?.map(repo => repo.id) || [];

    // Count repositories
    const { count: repoCount } = await supabaseAdmin
      .from(TABLES.REPOSITORIES)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Count scans for the user's repositories
    const { count: scanCount } = await supabaseAdmin
      .from(TABLES.SECRET_SCANS)
      .select('*', { count: 'exact', head: true })
      .in('repository_id', repoIds);

    // Count secrets found
    const { count: secretsCount } = await supabaseAdmin
      .from(TABLES.SECRET_SCANS)
      .select('*', { count: 'exact', head: true })
      .in('repository_id', repoIds);

    // Count resolved secrets
    const { count: resolvedCount } = await supabaseAdmin
      .from(TABLES.SECRET_SCANS)
      .select('*', { count: 'exact', head: true })
      .in('repository_id', repoIds)
      .eq('is_resolved', true);

    // Count active alerts
    const { count: alertsCount } = await supabaseAdmin
      .from(TABLES.ALERTS)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'pending');

    // Calculate scan success rate (simplified - assume 95% if no scans, otherwise based on resolved vs total)
    const scanSuccessRate = scanCount === 0 ? 95 : Math.round(((resolvedCount || 0) / (secretsCount || 1)) * 100);

    return {
      totalRepositories: repoCount || 0,
      totalScans: scanCount || 0,
      secretsFound: secretsCount || 0,
      resolvedSecrets: resolvedCount || 0,
      activeAlerts: alertsCount || 0,
      scanSuccessRate: Math.max(0, Math.min(100, scanSuccessRate))
    };
  }

  static async storeUserToken(userId: string, accessToken: string) {
    const { error } = await supabaseAdmin
      .from(TABLES.USERS)
      .update({ github_access_token: accessToken })
      .eq('id', userId);
    if (error) throw error;
  }

  static async getUserToken(userId: string): Promise<string | null> {
    const { data, error } = await supabaseAdmin
      .from(TABLES.USERS)
      .select('github_access_token')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data?.github_access_token || null;
  }
}

export const getUserByEmail = DatabaseService.getUserByEmail.bind(DatabaseService);