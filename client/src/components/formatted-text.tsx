import React from 'react';
import { cn } from '@/lib/utils';

interface FormattedTextProps {
  text: string;
  className?: string;
}

// Security: Validate URLs to prevent XSS attacks
const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols to prevent javascript: and other malicious protocols
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

const FormattedText: React.FC<FormattedTextProps> = ({ text, className }) => {
  if (!text) return null;

  // Process the text to handle line breaks and basic formatting
  const processedText = text
    .split('\n')
    .map((line, index) => {
      // Handle empty lines
      if (!line.trim()) {
        return <br key={index} />;
      }

      // Simple link detection (basic URL regex)
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      
      if (urlRegex.test(line)) {
        const parts = line.split(urlRegex);
        return (
          <span key={index}>
            {parts.map((part, partIndex) => {
              if (urlRegex.test(part)) {
                // Security: Only render links for validated URLs
                if (isValidUrl(part)) {
                  return (
                    <a
                      key={partIndex}
                      href={part}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sollo-red hover:text-sollo-red/80 underline transition-colors"
                    >
                      {part}
                    </a>
                  );
                } else {
                  // Render as plain text if URL is invalid/potentially malicious
                  return (
                    <span key={partIndex} className="text-gray-500">
                      {part}
                    </span>
                  );
                }
              }
              return part;
            })}
            {index < text.split('\n').length - 1 && <br />}
          </span>
        );
      }

      return (
        <span key={index}>
          {line}
          {index < text.split('\n').length - 1 && <br />}
        </span>
      );
    });

  return (
    <div className={cn("whitespace-pre-wrap", className)}>
      {processedText}
    </div>
  );
};

export default FormattedText;