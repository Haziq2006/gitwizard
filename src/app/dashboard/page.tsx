'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Settings, 
  Bell,
  Github,
  TrendingUp,
  Clock,
  Loader2
} from 'lucide-react';
import { trackDashboardView, trackRepositoryAdd } from '@/lib/analytics';

interface DashboardStats {
  totalRepositories: number;
  totalScans: number;
  secretsFound: number;
  resolvedSecrets: number;
  activeAlerts: number;
  scanSuccessRate: number;
}

interface Repository {
  id: string;
  name: string;
  fullName: string;
  private: boolean;
  isActive: boolean;
  createdAt: string;
  webhook_id?: number | null;
}

interface SecretScan {
  id: string;
  commitSha: string;
  commitMessage: string;
  secretType: string;
  filePath: string;
  lineNumber: number;
  isResolved: boolean;
  createdAt: string;
}

// Define a type for GitHub repositories (minimal fields needed)
type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [recentScans, setRecentScans] = useState<SecretScan[]>([]);
  const [loading, setLoading] = useState(true);
  // Repo connect modal state
  const [showRepoModal, setShowRepoModal] = useState(false);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);
  // Billing modal state
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [plan, setPlan] = useState<'free' | 'pro' | 'business'>('free');
  const [planStatus, setPlanStatus] = useState<string>('active');
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [showDocModal, setShowDocModal] = useState(false);
  const [connectingRepo, setConnectingRepo] = useState<number | null>(null);

  // Fetch user subscription plan
  const fetchPlan = async () => {
    try {
      setBillingLoading(true);
      setBillingError(null);
      const res = await fetch('/api/billing/plan');
      if (!res.ok) throw new Error('Failed to fetch plan');
      const data = await res.json();
      setPlan(data.plan || 'free');
      setPlanStatus(data.status || 'active');
    } catch (err: unknown) {
      setBillingError(err instanceof Error ? err.message : 'Failed to fetch plan');
    } finally {
      setBillingLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    
    // Track dashboard view
    trackDashboardView();
    
    fetchDashboardData();
    fetchPlan();
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const statsResponse = await fetch('/api/dashboard/stats');
      if (!statsResponse.ok) {
        console.error('Failed to fetch stats:', statsResponse.status);
        setStats({
          totalRepositories: 0,
          totalScans: 0,
          secretsFound: 0,
          resolvedSecrets: 0,
          activeAlerts: 0,
          scanSuccessRate: 0
        });
      } else {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch repositories
      const reposResponse = await fetch('/api/repositories');
      if (!reposResponse.ok) {
        console.error('Failed to fetch repositories:', reposResponse.status);
        setRepositories([]);
      } else {
        const reposData = await reposResponse.json();
        setRepositories(Array.isArray(reposData) ? reposData : []);
      }

      // Fetch recent scans
      const scansResponse = await fetch('/api/scans/recent');
      if (!scansResponse.ok) {
        console.error('Failed to fetch recent scans:', scansResponse.status);
        setRecentScans([]);
      } else {
        const scansData = await scansResponse.json();
        setRecentScans(Array.isArray(scansData) ? scansData : []);
      }
    } catch (error: unknown) {
      console.error('Error fetching dashboard data:', error instanceof Error ? error.message : error);
      // Set default values on error
      setStats({
        totalRepositories: 0,
        totalScans: 0,
        secretsFound: 0,
        resolvedSecrets: 0,
        activeAlerts: 0,
        scanSuccessRate: 0
      });
      setRepositories([]);
      setRecentScans([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch GitHub repos using the user's access token
  const fetchGithubRepos = async () => {
    setGithubLoading(true);
    setGithubError(null);
    try {
      const res = await fetch('/api/github/repos');
      if (!res.ok) throw new Error('Failed to fetch GitHub repos');
      const data: GitHubRepo[] = await res.json();
      setGithubRepos(data);
    } catch (err: unknown) {
      setGithubError(err instanceof Error ? err.message : 'Failed to fetch GitHub repos');
    } finally {
      setGithubLoading(false);
    }
  };

  // Handle connect repo button
  const handleConnectRepo = () => {
    setShowRepoModal(true);
    fetchGithubRepos();
  };

  // Handle repo selection
  const handleSelectRepo = async (repo: GitHubRepo) => {
    setConnectingRepo(repo.id);
    try {
      const res = await fetch('/api/repositories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          github_id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          private: repo.private,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to connect repository');
      }
      setShowRepoModal(false);
      fetchDashboardData();
      trackRepositoryAdd(); // Track repository add
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to connect repository');
    } finally {
      setConnectingRepo(null);
    }
  };

  // Handle upgrade/downgrade
  const handleUpgrade = async (targetPlan: 'pro' | 'business') => {
    setBillingLoading(true);
    setBillingError(null);
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: targetPlan }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Failed to start checkout');
      window.location.href = data.url;
    } catch (err: unknown) {
      setBillingError(err instanceof Error ? err.message : 'Failed to start checkout');
    } finally {
      setBillingLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setBillingLoading(true);
    setBillingError(null);
    try {
      const res = await fetch('/api/stripe/create-portal-session', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Failed to open billing portal');
      window.location.href = data.url;
    } catch (err: unknown) {
      setBillingError(err instanceof Error ? err.message : 'Failed to open billing portal');
    } finally {
      setBillingLoading(false);
    }
  };

  const getSecretTypeDisplayName = (type: string) => {
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
    return displayNames[type] || type;
  };

  const getSeverityColor = (type: string) => {
    const highSeverity = ['aws_secret_key', 'stripe_secret_key', 'github_token', 'private_key', 'ssh_key'];
    const mediumSeverity = ['aws_access_key', 'database_url', 'jwt_secret', 'api_key'];
    
    if (highSeverity.includes(type)) return 'text-red-600 bg-red-50';
    if (mediumSeverity.includes(type)) return 'text-orange-600 bg-orange-50';
    return 'text-blue-600 bg-blue-50';
  };

  // Plan repo limits
  const getRepoLimit = (plan: 'free' | 'pro' | 'business') => {
    if (plan === 'free') return 1;
    if (plan === 'pro') return 10;
    return Infinity;
  };

  const repoLimit = getRepoLimit(plan);
  const atRepoLimit = repoLimit !== Infinity && repositories.length >= repoLimit;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                <span className="text-blue-600">Git</span>Wizard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                onClick={() => setShowDocModal(true)}
              >
                Documentation
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2">
                <img 
                  src={session?.user?.image || '/default-avatar.png'} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full"
                  width={32}
                  height={32}
                />
                <span className="text-sm font-medium text-gray-700">
                  {session?.user?.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Billing/Upgrade button */}
        <div className="flex justify-end mb-4">
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            onClick={() => { setShowBillingModal(true); fetchPlan(); }}
          >
            Billing & Plan
          </button>
        </div>
        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Scans</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalScans}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Secrets Found</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.secretsFound}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.resolvedSecrets}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.scanSuccessRate ? stats.scanSuccessRate.toFixed(1) : '0.0'}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Repositories */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Repositories</h2>
                  <button
                    className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${atRepoLimit ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleConnectRepo}
                    disabled={atRepoLimit}
                  >
                    <Github className="w-4 h-4 mr-2" />
                    Connect Repository
                  </button>
                </div>
              </div>
              <div className="p-6">
                {/* Above the repo list, show usage */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    Repositories used: {repositories.length} / {repoLimit === Infinity ? 'Unlimited' : repoLimit}
                  </span>
                  {atRepoLimit && (
                    <span className="text-xs text-red-600 font-medium ml-2">Plan limit reached</span>
                  )}
                </div>
                {Array.isArray(repositories) && repositories.length === 0 ? (
                  <div className="text-center py-8">
                    <Github className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No repositories connected</h3>
                    <p className="text-gray-600 mb-4">Connect your first repository to start monitoring for secrets</p>
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      onClick={handleConnectRepo}
                    >
                      Connect Repository
                    </button>
                  </div>
                ) : (
                  Array.isArray(repositories) && (
                    <div className="space-y-4">
                      {repositories.map((repo) => (
                        <div key={repo.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {repo.isActive && repo.webhook_id != null ? (
                              <CheckCircle className="w-5 h-5 text-green-500" aria-label="Connected" />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-gray-300" aria-label="Not connected" />
                            )}
                            <div>
                              <h3 className="font-medium text-gray-900">{repo.name}</h3>
                              <p className="text-sm text-gray-600">
                                {repo.private ? 'Private' : 'Public'} • Added {new Date(repo.createdAt).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500">Full name: {repo.fullName}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="text-gray-400 hover:text-gray-600">
                              <Settings className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Repo Connect Modal */}
          {showRepoModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full mx-4 border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Github className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Connect Repository</h2>
                </div>
                
                {githubLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin mr-2" />
                    <span className="text-gray-600">Loading your repositories...</span>
                  </div>
                )}
                
                {githubError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                      <span className="text-red-800 font-medium">Error loading repositories</span>
                    </div>
                    <p className="text-red-700 text-sm mt-1">{githubError}</p>
                  </div>
                )}
                
                {!githubLoading && !githubError && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-4">Select a repository to connect and start monitoring for secrets:</p>
                    <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                      {githubRepos.length === 0 ? (
                        <div className="text-center py-8">
                          <Github className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600 text-sm">No repositories found</p>
                        </div>
                      ) : (
                        <ul className="divide-y divide-gray-100">
                          {githubRepos.map((repo) => (
                            <li key={repo.id} className="p-3 hover:bg-gray-50 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-2 h-2 rounded-full ${repo.private ? 'bg-orange-400' : 'bg-green-400'}`}></div>
                                  <div>
                                    <p className="font-medium text-gray-900">{repo.name}</p>
                                    <p className="text-xs text-gray-500">{repo.full_name}</p>
                                  </div>
                                </div>
                                <button
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                                    connectingRepo === repo.id
                                      ? 'bg-blue-100 text-blue-700 cursor-not-allowed'
                                      : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
                                  }`}
                                  onClick={() => handleSelectRepo(repo)}
                                  disabled={connectingRepo === repo.id}
                                >
                                  {connectingRepo === repo.id ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      <span>Connecting...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-4 h-4" />
                                      <span>Connect</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
                
                <button
                  className="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
                  onClick={() => setShowRepoModal(false)}
                  disabled={connectingRepo !== null}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              {recentScans.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentScans.map((scan) => (
                    <div key={scan.id} className="border-l-4 border-red-500 pl-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {getSecretTypeDisplayName(scan.secretType)} detected
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {scan.filePath}:{scan.lineNumber}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {scan.commitMessage}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(scan.secretType)}`}>
                            {scan.isResolved ? 'Resolved' : 'Active'}
                          </span>
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {new Date(scan.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Modal */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">How to Use GitWizard</h2>
            <ol className="list-decimal ml-6 text-sm mb-4 space-y-2">
              <li>Sign in with your GitHub account.</li>
              <li>Connect a repository using the &quot;Connect Repository&quot; button.</li>
              <li>GitWizard will automatically scan new commits for secrets (API keys, tokens, etc.).</li>
              <li>If a secret is detected, you will receive an email alert (and Slack/Discord alerts if on Pro/Business, coming soon!).</li>
              <li>View recent secret scans and repository status on your dashboard.</li>
              <li>Upgrade your plan for more repositories and advanced features.</li>
            </ol>
            <div className="text-xs text-gray-500 mb-4">
              For more details, visit our <a href="https://github.com/your-org/gitwizard" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">GitHub repo</a> or contact support.
            </div>
            <button
              className="mt-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-900 py-2 px-4 rounded-lg font-medium"
              onClick={() => setShowDocModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Billing Modal */}
      {showBillingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Your Plan</h2>
            {billingLoading && <div>Loading...</div>}
            {billingError && <div className="text-red-600 mb-2">{billingError}</div>}
            {!billingLoading && !billingError && (
              <div>
                <div className="mb-4">
                  <div className="text-lg font-semibold">Current Plan: <span className="capitalize">{plan}</span></div>
                  <div className="text-sm text-gray-600">Status: {planStatus}</div>
                </div>
                <div className="mb-4">
                  <div className="font-semibold mb-2">Plan Features:</div>
                  <ul className="list-disc ml-6 text-sm">
                    {plan === 'free' && (
                      <>
                        <li>1 repository</li>
                        <li>Delayed email alerts (10 min)</li>
                        <li>Basic secret scanning</li>
                      </>
                    )}
                    {plan === 'pro' && (
                      <>
                        <li>10 repositories</li>
                        <li>Instant email alerts</li>
                        <li>Slack/Discord integration <span className="ml-1 text-xs text-orange-500 font-semibold">(Coming Soon!)</span></li>
                        <li>Custom regex patterns <span className="ml-1 text-xs text-orange-500 font-semibold">(Coming Soon!)</span></li>
                        <li>Priority support</li>
                      </>
                    )}
                    {plan === 'business' && (
                      <>
                        <li>Unlimited repositories</li>
                        <li>Instant alerts</li>
                        <li>Slack/Discord integration <span className="ml-1 text-xs text-orange-500 font-semibold">(Coming Soon!)</span></li>
                        <li>Custom regex patterns <span className="ml-1 text-xs text-orange-500 font-semibold">(Coming Soon!)</span></li>
                        <li>Auto-secret revocation <span className="ml-1 text-xs text-orange-500 font-semibold">(Coming Soon!)</span></li>
                        <li>Team collaboration <span className="ml-1 text-xs text-orange-500 font-semibold">(Coming Soon!)</span></li>
                        <li>Advanced analytics <span className="ml-1 text-xs text-orange-500 font-semibold">(Coming Soon!)</span></li>
                        <li>24/7 support</li>
                      </>
                    )}
                  </ul>
                </div>
                <div className="mb-2 text-sm text-gray-700">
                  Repositories used: {repositories.length} / {repoLimit === Infinity ? 'Unlimited' : repoLimit}
                </div>
                <div className="flex flex-col gap-2">
                  {plan !== 'pro' && (
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                      onClick={() => handleUpgrade('pro')}
                      disabled={billingLoading}
                    >
                      Upgrade to Pro ($19/mo)
                    </button>
                  )}
                  {plan !== 'business' && (
                    <button
                      className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg font-medium"
                      onClick={() => handleUpgrade('business')}
                      disabled={billingLoading}
                    >
                      Upgrade to Business ($99/mo)
                    </button>
                  )}
                  {plan !== 'free' && (
                    <div className="text-xs text-gray-500 mt-2">To downgrade, contact support.</div>
                  )}
                </div>
                <button
                  className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg font-medium mt-2"
                  onClick={handleManageBilling}
                  disabled={billingLoading}
                >
                  Manage Billing (Stripe Portal)
                </button>
              </div>
            )}
            <button
              className="mt-6 w-full bg-gray-200 hover:bg-gray-300 text-gray-900 py-2 px-4 rounded-lg font-medium"
              onClick={() => setShowBillingModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 