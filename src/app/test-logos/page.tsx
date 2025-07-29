'use client';

export default function TestLogos() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Logo Test Page
        </h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'AWS', path: '/logos/aws.svg' },
            { name: 'Stripe', path: '/logos/stripe.svg' },
            { name: 'GitHub', path: '/logos/github.svg' },
            { name: 'OpenAI', path: '/logos/openai.svg' },
            { name: 'Anthropic', path: '/logos/anthropic.svg' },
            { name: 'Hugging Face', path: '/logos/huggingface.svg' },
            { name: 'Cohere', path: '/logos/cohere.svg' },
            { name: 'DeepSeek', path: '/logos/deepseek.svg' },
          ].map((logo) => (
            <div key={logo.name} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium text-gray-900 mb-2">{logo.name}</h3>
              <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center mb-2">
                <img
                  src={logo.path}
                  alt={logo.name}
                  className="w-10 h-10 object-contain"
                />
              </div>
              <p className="text-xs text-gray-500">{logo.path}</p>
              <p className="text-xs text-gray-400 mt-1">
                If you see a gray box with a letter, the logo failed to load.
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="font-semibold text-blue-900 mb-2">What to check:</h2>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Do you see actual company logos or gray boxes with letters?</li>
            <li>• Check the Network tab in dev tools to see if files are loading</li>
            <li>• Look for 404 errors in the Network tab</li>
            <li>• Try refreshing the page (Ctrl+F5) to clear cache</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 