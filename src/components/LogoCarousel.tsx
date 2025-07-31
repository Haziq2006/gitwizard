'use client';

import { useEffect, useState } from 'react';

const logos = [
  {
    name: 'AWS',
    logo: '/logos/aws.svg',
    apiLogo: '/api/logos/aws.svg',
    alt: 'Amazon Web Services',
    category: 'Cloud Provider'
  },
  {
    name: 'Stripe',
    logo: '/logos/stripe.svg',
    apiLogo: '/api/logos/stripe.svg',
    alt: 'Stripe Payment Processing',
    category: 'Payment'
  },
  {
    name: 'GitHub',
    logo: '/logos/github.svg',
    apiLogo: '/api/logos/github.svg',
    alt: 'GitHub',
    category: 'Version Control'
  },
  {
    name: 'OpenAI',
    logo: '/logos/openai.svg',
    apiLogo: '/api/logos/openai.svg',
    alt: 'OpenAI',
    category: 'AI'
  },
  {
    name: 'Anthropic',
    logo: '/logos/anthropic.svg',
    apiLogo: '/api/logos/anthropic.svg',
    alt: 'Anthropic Claude',
    category: 'AI'
  },
  {
    name: 'Hugging Face',
    logo: '/logos/huggingface.svg',
    apiLogo: '/api/logos/huggingface.svg',
    alt: 'Hugging Face',
    category: 'AI'
  },
  {
    name: 'Cohere',
    logo: '/logos/cohere.svg',
    apiLogo: '/api/logos/cohere.svg',
    alt: 'Cohere AI',
    category: 'AI'
  },
  {
    name: 'DeepSeek',
    logo: '/logos/deepseek.svg',
    apiLogo: '/api/logos/deepseek.svg',
    alt: 'DeepSeek AI',
    category: 'AI'
  },
  {
    name: 'Azure',
    logo: '/logos/azure.svg',
    apiLogo: '/api/logos/azure.svg',
    alt: 'Microsoft Azure',
    category: 'Cloud Provider'
  },
  {
    name: 'Google Cloud',
    logo: '/logos/googlecloud.svg',
    apiLogo: '/api/logos/googlecloud.svg',
    alt: 'Google Cloud Platform',
    category: 'Cloud Provider'
  },
  {
    name: 'Firebase',
    logo: '/logos/firebase.svg',
    apiLogo: '/api/logos/firebase.svg',
    alt: 'Firebase',
    category: 'Backend'
  },
  {
    name: 'SendGrid',
    logo: '/logos/sendgrid.svg',
    apiLogo: '/api/logos/sendgrid.svg',
    alt: 'SendGrid Email',
    category: 'Communication'
  },
  {
    name: 'Twilio',
    logo: '/logos/twilio.svg',
    apiLogo: '/api/logos/twilio.svg',
    alt: 'Twilio Communication',
    category: 'Communication'
  },
  {
    name: 'Mailgun',
    logo: '/logos/mailgun.svg',
    apiLogo: '/api/logos/mailgun.svg',
    alt: 'Mailgun Email',
    category: 'Communication'
  },
  {
    name: 'MongoDB',
    logo: '/logos/mongodb.svg',
    apiLogo: '/api/logos/mongodb.svg',
    alt: 'MongoDB Database',
    category: 'Database'
  },
  {
    name: 'PostgreSQL',
    logo: '/logos/postgresql.svg',
    apiLogo: '/api/logos/postgresql.svg',
    alt: 'PostgreSQL Database',
    category: 'Database'
  },
  {
    name: 'Redis',
    logo: '/logos/redis.svg',
    apiLogo: '/api/logos/redis.svg',
    alt: 'Redis Cache',
    category: 'Cache'
  },
  {
    name: 'MySQL',
    logo: '/logos/mysql.svg',
    apiLogo: '/api/logos/mysql.svg',
    alt: 'MySQL Database',
    category: 'Database'
  },
  {
    name: 'JWT',
    logo: '/logos/jwt.svg',
    apiLogo: '/api/logos/jwt.svg',
    alt: 'JSON Web Tokens',
    category: 'Authentication'
  },
  {
    name: 'SSH',
    logo: '/logos/ssh.svg',
    apiLogo: '/api/logos/ssh.svg',
    alt: 'SSH Keys',
    category: 'Security'
  },
  {
    name: 'API Keys',
    logo: '/logos/api.svg',
    apiLogo: '/api/logos/api.svg',
    alt: 'Generic API Keys',
    category: 'Integration'
  }
];

const cyclingTexts = [
  "Trusted by 10,000+ developers",
  "Always monitoring your repos for leaks",
  "Supports over 20+ Tech Stacks"
];

export default function LogoCarousel() {
  const [logoErrors, setLogoErrors] = useState<{[key: string]: boolean}>({});
  const [logoFallbacks, setLogoFallbacks] = useState<{[key: string]: boolean}>({});
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Cycling text animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentTextIndex((prev) => (prev + 1) % cyclingTexts.length);
        setIsVisible(true);
      }, 300);
    }, 3000); // Change text every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const handleImageError = (logoName: string, logoPath: string) => {
    console.error(`❌ Failed to load logo: ${logoName} from ${logoPath}`);
    
    // If this is the first attempt (static path), try the API route
    if (!logoFallbacks[logoName]) {
      console.log(`🔄 Trying API route for ${logoName}...`);
      setLogoFallbacks(prev => ({ ...prev, [logoName]: true }));
    } else {
      // If API route also failed, show fallback letter
      setLogoErrors(prev => ({ ...prev, [logoName]: true }));
    }
  };

  const handleImageLoad = (logoName: string) => {
    console.log(`✅ Successfully loaded logo: ${logoName}`);
  };

  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            <div 
              className={`inline-block transition-all duration-500 ease-in-out ${
                isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
              }`}
            >
              {cyclingTexts[currentTextIndex]}
            </div>
          </h3>
          <p className="text-sm text-gray-500">
            Detecting secrets across all major platforms and services
          </p>
        </div>
        
        <div className="relative overflow-hidden">
          {/* Smooth flowing logo carousel */}
          <div 
            className="flex items-center space-x-8 animate-scroll"
            style={{ 
              width: `${logos.length * 240}px` // Double width for seamless loop
            }}
          >
            {/* Duplicate logos for seamless loop */}
            {[...logos, ...logos].map((logo, index) => (
              <div
                key={`${logo.name}-${index}`}
                className="flex flex-col items-center min-w-[80px] hover:scale-105 transition-transform duration-200"
              >
                <div 
                  className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mb-3 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200"
                >
                  {!logoErrors[logo.name] ? (
                    <img
                      src={logoFallbacks[logo.name] ? logo.apiLogo : logo.logo}
                      alt={logo.alt}
                      width={40}
                      height={40}
                      className="w-10 h-10 object-contain"
                      onError={() => handleImageError(logo.name, logoFallbacks[logo.name] ? logo.apiLogo : logo.logo)}
                      onLoad={() => handleImageLoad(logo.name)}
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