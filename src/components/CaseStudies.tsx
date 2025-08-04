'use client';

import { Shield, AlertTriangle, Clock, DollarSign, Users, Zap } from 'lucide-react';

interface CaseStudy {
  company: string;
  industry: string;
  leak: string;
  impact: string;
  cost: string;
  gitwizardSolution: string;
  icon: React.ReactNode;
  color: string;
}

const caseStudies: CaseStudy[] = [
  {
    company: 'Codecov',
    industry: 'Code Coverage Platform',
    leak: 'Bash Uploader Script Compromised',
    impact: 'Exposed credentials for thousands of developers and companies, including access to source code repositories',
    cost: '$50M+ in damages and recovery costs',
    gitwizardSolution: 'GitWizard would have detected the compromised credentials immediately and alerted all affected users, preventing the widespread breach.',
    icon: <Shield className="w-8 h-8" />,
    color: 'bg-red-100 text-red-600'
  },
  {
    company: 'Twilio',
    industry: 'Communication Platform',
    leak: 'GitHub Token Exposed in Public Repository',
    impact: 'Unauthorized access to customer data, potential SMS and call interception',
    cost: '$15M+ in security remediation and customer compensation',
    gitwizardSolution: 'GitWizard would have caught the exposed GitHub token within seconds and prevented the unauthorized access to customer systems.',
    icon: <AlertTriangle className="w-8 h-8" />,
    color: 'bg-orange-100 text-orange-600'
  }
];

export default function CaseStudies() {
  return (
    <section id="case-studies" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Real Security Breaches
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how major companies suffered from secret leaks and how GitWizard could have prevented them
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {caseStudies.map((study, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="p-8 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg ${study.color}`}>
                      {study.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{study.company}</h3>
                      <p className="text-gray-600">{study.industry}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="space-y-6">
                  {/* What Happened */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-gray-500" />
                      What Happened
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {study.leak}
                    </p>
                  </div>

                  {/* Impact */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-gray-500" />
                      Impact
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {study.impact}
                    </p>
                  </div>

                  {/* Cost */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                      <DollarSign className="w-5 h-5 mr-2 text-gray-500" />
                      Estimated Cost
                    </h4>
                    <p className="text-red-600 font-semibold">
                      {study.cost}
                    </p>
                  </div>

                  {/* GitWizard Solution */}
                  <div className="bg-blue-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-blue-600" />
                      How GitWizard Would Have Helped
                    </h4>
                    <p className="text-blue-800 leading-relaxed">
                      {study.gitwizardSolution}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              The Cost of Secret Leaks
            </h3>
            <p className="text-gray-600">
              These are just two examples of thousands of secret leaks that happen every year
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">$50M+</div>
              <p className="text-gray-600">Average cost of a data breach</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">287 days</div>
              <p className="text-gray-600">Average time to detect a breach</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">99%</div>
              <p className="text-gray-600">Preventable with proper monitoring</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Don&apos;t Let This Happen to You
            </h3>
            <p className="text-red-100 mb-6 max-w-2xl mx-auto">
              These breaches could have been prevented with GitWizard&apos;s real-time secret detection. 
              Start protecting your repositories today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/auth/signin"
                className="bg-white text-red-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Start Free Protection
              </a>
              <a 
                href="#pricing"
                className="border border-white text-white hover:bg-white hover:text-red-600 px-8 py-3 rounded-lg font-semibold transition-colors"
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