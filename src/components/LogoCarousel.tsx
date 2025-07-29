'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const logos = [
  {
    name: 'AWS',
    logo: '/logos/aws.svg',
    alt: 'Amazon Web Services',
    category: 'Cloud Provider'
  },
  {
    name: 'Stripe',
    logo: '/logos/stripe.svg', 
    alt: 'Stripe Payment Processing',
    category: 'Payment'
  },
  {
    name: 'GitHub',
    logo: '/logos/github.svg',
    alt: 'GitHub',
    category: 'Version Control'
  },
  {
    name: 'OpenAI',
    logo: '/logos/openai.svg',
    alt: 'OpenAI',
    category: 'AI'
  },
  {
    name: 'Anthropic',
    logo: '/logos/anthropic.svg',
    alt: 'Anthropic Claude',
    category: 'AI'
  },
  {
    name: 'Hugging Face',
    logo: '/logos/huggingface.svg',
    alt: 'Hugging Face',
    category: 'AI'
  },
  {
    name: 'Cohere',
    logo: '/logos/cohere.svg',
    alt: 'Cohere AI',
    category: 'AI'
  },
  {
    name: 'DeepSeek',
    logo: '/logos/deepseek.svg',
    alt: 'DeepSeek AI',
    category: 'AI'
  },
  {
    name: 'Azure',
    logo: '/logos/azure.svg',
    alt: 'Microsoft Azure',
    category: 'Cloud Provider'
  },
  {
    name: 'Google Cloud',
    logo: '/logos/googlecloud.svg',
    alt: 'Google Cloud Platform',
    category: 'Cloud Provider'
  },
  {
    name: 'Firebase',
    logo: '/logos/firebase.svg',
    alt: 'Firebase',
    category: 'Backend'
  },
  {
    name: 'SendGrid',
    logo: '/logos/sendgrid.svg',
    alt: 'SendGrid Email',
    category: 'Communication'
  },
  {
    name: 'Twilio',
    logo: '/logos/twilio.svg',
    alt: 'Twilio Communication',
    category: 'Communication'
  },
  {
    name: 'Mailgun',
    logo: '/logos/mailgun.svg',
    alt: 'Mailgun Email',
    category: 'Communication'
  },
  {
    name: 'MongoDB',
    logo: '/logos/mongodb.svg',
    alt: 'MongoDB Database',
    category: 'Database'
  },
  {
    name: 'PostgreSQL',
    logo: '/logos/postgresql.svg',
    alt: 'PostgreSQL Database',
    category: 'Database'
  },
  {
    name: 'Redis',
    logo: '/logos/redis.svg',
    alt: 'Redis Cache',
    category: 'Cache'
  },
  {
    name: 'MySQL',
    logo: '/logos/mysql.svg',
    alt: 'MySQL Database',
    category: 'Database'
  },
  {
    name: 'JWT',
    logo: '/logos/jwt.svg',
    alt: 'JSON Web Tokens',
    category: 'Authentication'
  },
  {
    name: 'SSH',
    logo: '/logos/ssh.svg',
    alt: 'SSH Keys',
    category: 'Security'
  },
  {
    name: 'API Keys',
    logo: '/logos/api.svg',
    alt: 'Generic API Keys',
    category: 'Integration'
  }
];

export default function LogoCarousel() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [logoErrors, setLogoErrors] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setScrollPosition((prev) => {
        // Move by 100px every 2.5 seconds for smoother scrolling
        const newPosition = prev + 100;
        // Reset when we've scrolled through all logos
        return newPosition >= logos.length * 120 ? 0 : newPosition;
      });
    }, 2500); // Change every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleImageError = (logoName: string) => {
    setLogoErrors(prev => ({ ...prev, [logoName]: true }));
  };

  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Trusted by developers worldwide
          </h3>
          <p className="text-sm text-gray-500">
            Detecting secrets across all major platforms and services
          </p>
        </div>
        
        <div className="relative overflow-hidden">
          {/* Continuous scrolling carousel */}
          <div 
            className="flex items-center space-x-8 transition-transform duration-2500 ease-in-out"
            style={{ 
              transform: `translateX(-${scrollPosition}px)`,
              width: `${logos.length * 120}px` // 120px per logo (80px logo + 40px spacing)
            }}
          >
            {/* Duplicate logos for seamless loop */}
            {[...logos, ...logos].map((logo, index) => (
              <div
                key={`${logo.name}-${index}`}
                className="flex flex-col items-center min-w-[80px]"
              >
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mb-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  {!logoErrors[logo.name] ? (
                    <Image
                      src={logo.logo}
                      alt={logo.alt}
                      width={40}
                      height={40}
                      className="w-10 h-10 object-contain"
                      onError={() => handleImageError(logo.name)}
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-500">
                        {logo.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-600 font-medium text-center">
                  {logo.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 