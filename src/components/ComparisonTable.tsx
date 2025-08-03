'use client';

import { CheckCircle, XCircle, Minus } from 'lucide-react';

interface ComparisonFeature {
  feature: string;
  gitwizard: 'yes' | 'no' | 'partial';
  github: 'yes' | 'no' | 'partial';
  description?: string;
}

const comparisonData: ComparisonFeature[] = [
  {
    feature: 'Real-time scanning',
    gitwizard: 'yes',
    github: 'yes',
    description: 'Scans every commit and pull request automatically'
  },
  {
    feature: 'Instant alerts',
    gitwizard: 'yes',
    github: 'no',
    description: 'Immediate notifications via email, Slack, Discord'
  },
  {
    feature: 'Custom secret patterns',
    gitwizard: 'yes',
    github: 'partial',
    description: 'Add your own detection rules for company-specific secrets'
  },
  {
    feature: 'Historical scanning',
    gitwizard: 'yes',
    github: 'no',
    description: 'Scan existing repositories for past secret leaks'
  },
  {
    feature: 'Detailed reporting',
    gitwizard: 'yes',
    github: 'partial',
    description: 'Comprehensive dashboard with analytics and insights'
  },
  {
    feature: 'Team collaboration',
    gitwizard: 'yes',
    github: 'no',
    description: 'Share security insights with your team members'
  },
  {
    feature: 'Slack/Discord integration',
    gitwizard: 'yes',
    github: 'no',
    description: 'Direct notifications to your team channels'
  },
  {
    feature: 'Secret revocation',
    gitwizard: 'partial',
    github: 'partial',
    description: 'Automatically revoke compromised secrets (coming soon)'
  },
  {
    feature: 'API access',
    gitwizard: 'yes',
    github: 'no',
    description: 'Programmatic access to scanning results and alerts'
  },
  {
    feature: 'Multi-repository monitoring',
    gitwizard: 'yes',
    github: 'yes',
    description: 'Monitor multiple repositories from one dashboard'
  },
  {
    feature: 'Advanced analytics',
    gitwizard: 'yes',
    github: 'no',
    description: 'Security metrics, trends, and improvement recommendations'
  },
  {
    feature: 'Priority support',
    gitwizard: 'yes',
    github: 'partial',
    description: 'Dedicated support for Pro and Business users'
  }
];

const getFeatureIcon = (value: 'yes' | 'no' | 'partial') => {
  switch (value) {
    case 'yes':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'no':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'partial':
      return <Minus className="w-5 h-5 text-yellow-500" />;
  }
};

const getFeatureText = (value: 'yes' | 'no' | 'partial') => {
  switch (value) {
    case 'yes':
      return 'Yes';
    case 'no':
      return 'No';
    case 'partial':
      return 'Limited';
  }
};

export default function ComparisonTable() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            GitWizard vs GitHub Secret Scanning
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how GitWizard provides more comprehensive security monitoring than GitHub&apos;s built-in features
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-sm font-medium text-gray-500">Feature</div>
              <div className="text-center">
                <div className="text-sm font-semibold text-blue-600">GitWizard</div>
                <div className="text-xs text-gray-500">Advanced Security</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-600">GitHub Secret Scanning</div>
                <div className="text-xs text-gray-500">Basic Protection</div>
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {comparisonData.map((feature, index) => (
              <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div>
                    <div className="font-medium text-gray-900">{feature.feature}</div>
                    {feature.description && (
                      <div className="text-sm text-gray-500 mt-1">{feature.description}</div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                      {getFeatureIcon(feature.gitwizard)}
                      <span className="text-sm font-medium text-gray-900">
                        {getFeatureText(feature.gitwizard)}
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                      {getFeatureIcon(feature.github)}
                      <span className="text-sm font-medium text-gray-900">
                        {getFeatureText(feature.github)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="bg-blue-50 px-6 py-4 border-t border-gray-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Why Choose GitWizard?
              </h3>
              <p className="text-blue-800 text-sm">
                While GitHub provides basic secret scanning, GitWizard offers enterprise-grade security monitoring 
                with instant alerts, custom patterns, team collaboration, and comprehensive analytics.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Upgrade Your Security?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join thousands of developers who trust GitWizard for comprehensive repository security monitoring. 
              Get started with our free tier and experience the difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/auth/signin"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Start Free Trial
              </a>
              <a 
                href="#pricing"
                className="border border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                View Pricing
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 