'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Github, Shield, Eye, Bell, Zap } from 'lucide-react';
import { trackSignIn } from '@/lib/analytics';

export default function SignInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    // If user is already authenticated, redirect to dashboard
    if (session) {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  const handleGitHubSignIn = () => {
    // Track sign-in attempt
    trackSignIn();
    // NextAuth will handle the redirect to dashboard automatically
    signIn('github');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-md mx-auto pt-20 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <span className="text-blue-600">Git</span>Wizard
          </h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back
            </h2>
            <p className="text-gray-600">
              Connect with GitHub to start protecting your repositories
            </p>
          </div>

          <button
            onClick={handleGitHubSignIn}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            <Github className="w-5 h-5 mr-3" />
            Continue with GitHub
          </button>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              What you&apos;ll get:
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-green-500 mr-3" />
                <span className="text-gray-700">Real-time secret detection</span>
              </div>
              <div className="flex items-center">
                <Eye className="w-5 h-5 text-blue-500 mr-3" />
                <span className="text-gray-700">Instant security alerts</span>
              </div>
              <div className="flex items-center">
                <Bell className="w-5 h-5 text-purple-500 mr-3" />
                <span className="text-gray-700">Email & Slack notifications</span>
              </div>
              <div className="flex items-center">
                <Zap className="w-5 h-5 text-orange-500 mr-3" />
                <span className="text-gray-700">Auto-secret revocation</span>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              By signing in, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 