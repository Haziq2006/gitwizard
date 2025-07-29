'use client';

import { MessageSquare } from 'lucide-react';

export default function FeedbackButton() {
  const handleClick = () => {
    // Get the Tally form URL from environment variable or use a default
    const tallyFormUrl = process.env.NEXT_PUBLIC_TALLY_FORM_URL || 'https://tally.so/r/your-form-id';
    
    // Open the Tally form in a new tab
    window.open(tallyFormUrl, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      data-feedback-button
      className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40 group"
      aria-label="Send feedback"
    >
      <MessageSquare className="w-6 h-6" />
      
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
        Send Feedback
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    </button>
  );
} 