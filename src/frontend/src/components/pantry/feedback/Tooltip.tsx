import React from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content?: string | React.ReactNode;
  position?: string;
  maxWidth?: string;
  title?: string;
  description?: string;
  example?: string;
  status?: string;
  lastUpdated?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  children, 
  content, 
  position, 
  maxWidth, 
  title, 
  description, 
  example, 
  status, 
  lastUpdated,
  ...props 
}) => {
  // Create a tooltip text from various props
  let tooltipText = '';
  
  if (typeof content === 'string') {
    tooltipText = content;
  } else if (title) {
    tooltipText = title;
    if (description) tooltipText += ': ' + description;
    if (example) tooltipText += ' (e.g., ' + example + ')';
    if (status) tooltipText += ' - Status: ' + status;
    if (lastUpdated) tooltipText += ' - Updated: ' + lastUpdated;
  }
  
  return (
    <span title={tooltipText} {...props}>
      {children}
    </span>
  );
};