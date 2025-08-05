import React from 'react';
import { cn } from '@/lib/utils';

interface FormattedTextProps {
  text: string;
  className?: string;
}

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