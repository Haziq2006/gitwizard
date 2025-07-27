'use client';

import { useEffect, useState } from 'react';

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
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % logos.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

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
          {/* Main carousel */}
          <div className="flex justify-center items-center space-x-6">
            {logos.map((logo, index) => (
              <div
                key={logo.name}
                className={`flex flex-col items-center transition-all duration-700 ${
                  index === currentIndex
                    ? 'opacity-100 scale-110'
                    : index === (currentIndex + 1) % logos.length || index === (currentIndex - 1 + logos.length) % logos.length
                    ? 'opacity-80 scale-100'
                    : index === (currentIndex + 2) % logos.length || index === (currentIndex - 2 + logos.length) % logos.length
                    ? 'opacity-60 scale-90'
                    : 'opacity-30 scale-80'
                }`}
              >
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mb-3 shadow-sm border border-gray-200">
                  <img 
                    src={logo.logo} 
                    alt={logo.alt}
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <span className="text-xs text-gray-600 font-medium">
                  {logo.category}
                </span>
              </div>
            ))}
          </div>
          
          {/* Dots indicator */}
          <div className="flex justify-center mt-6 space-x-2">
            {logos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
        

      </div>
    </div>
  );
} 