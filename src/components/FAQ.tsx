'use client';

import { useState } from 'react';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "How does GitWizard detect secrets?",
    answer: "GitWizard uses advanced regex patterns to scan your code for API keys, tokens, passwords, and other sensitive data. It monitors your GitHub repositories in real-time and alerts you instantly when secrets are detected in commits."
  },
  {
    question: "What types of secrets can GitWizard detect?",
    answer: "GitWizard detects 20+ types of secrets including OpenAI, Anthropic, AWS, Google Cloud, Stripe, GitHub tokens, database credentials, and many more. Our scanner is constantly updated to catch the latest security threats."
  },
  {
    question: "Is my code safe with GitWizard?",
    answer: "Absolutely! GitWizard only reads your code to scan for secrets - we never store your code or access your repositories beyond what's needed for security scanning. Your code remains private and secure."
  },
  {
    question: "How quickly do I get alerts?",
    answer: "GitWizard provides instant alerts via email as soon as secrets are detected in your commits. You'll be notified immediately, allowing you to take action before any damage is done."
  },
  {
    question: "Can I use GitWizard for private repositories?",
    answer: "Yes! GitWizard works with both public and private repositories. Simply connect your GitHub account and select which repositories you want to monitor for secrets."
  },
  {
    question: "What happens if I accidentally commit a secret?",
    answer: "GitWizard will immediately detect the secret and send you an email alert with details about what was found and where. You can then quickly remove the secret from your repository and rotate any compromised keys."
  },
  {
    question: "Do I need to install anything?",
    answer: "No installation required! GitWizard works entirely through GitHub webhooks. Just connect your GitHub account and select your repositories - we handle the rest automatically."
  },
  {
    question: "Can I customize the secret detection rules?",
    answer: "Currently, GitWizard uses our comprehensive set of detection patterns. We're working on custom rule support for Pro and Business users - coming soon!"
  },
  {
    question: "How much does GitWizard cost?",
    answer: "GitWizard offers a free tier for up to 3 repositories, with Pro ($9/month) and Business ($29/month) plans for teams and larger organizations. All plans include unlimited secret detection and instant alerts."
  },
  {
    question: "What if I need help setting up GitWizard?",
    answer: "Our setup process is designed to be simple - just connect your GitHub account and select repositories. If you need help, our documentation covers everything, and you can reach out through our feedback system."
  }
];

export default function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    const isOpening = !openItems.includes(index);
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
    
    // Track FAQ toggle
    if (isOpening) {
      trackEvent(AnalyticsEvents.FAQ_TOGGLE, { 
        question: faqData[index].question.substring(0, 50) 
      });
    }
  };

  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about GitWizard and keeping your repositories secure
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
              >
                <span className="font-medium text-gray-900">{item.question}</span>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                    openItems.includes(index) ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              
              {openItems.includes(index) && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Still have questions? We&apos;re here to help!
          </p>
          <button
            onClick={() => {
              const feedbackButton = document.querySelector('[data-feedback-button]') as HTMLElement;
              if (feedbackButton) {
                feedbackButton.click();
              }
            }}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
          >
            Contact Us
          </button>
        </div>
      </div>
    </section>
  );
} 