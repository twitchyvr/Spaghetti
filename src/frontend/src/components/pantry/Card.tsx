import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outline' | 'ghost' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ 
  className, 
  variant = 'default', 
  padding = 'md', 
  ...props 
}, ref) => {
  const variantClasses = {
    default: 'bg-white border border-gray-200 shadow-sm',
    elevated: 'bg-white border border-gray-200 shadow-lg',
    outline: 'bg-transparent border-2 border-gray-300',
    ghost: 'bg-transparent border-0 shadow-none',
    filled: 'bg-gray-50 border border-gray-200 shadow-sm'
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };
  
  return (
    <div
      ref={ref}
      className={`rounded-xl transition-all duration-200 ${variantClasses[variant]} ${paddingClasses[padding]} ${className || ''}`}
      {...props}
    />
  );
});
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ 
  className, 
  ...props 
}, ref) => (
  <div ref={ref} className={`flex flex-col space-y-2 pb-4 ${className || ''}`} {...props} />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ 
  className, 
  ...props 
}, ref) => (
  <h3 ref={ref} className={`text-xl font-semibold text-gray-900 leading-none tracking-tight ${className || ''}`} {...props} />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ 
  className, 
  ...props 
}, ref) => (
  <p ref={ref} className={`text-sm text-gray-600 ${className || ''}`} {...props} />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ 
  className, 
  ...props 
}, ref) => (
  <div ref={ref} className={`pt-0 ${className || ''}`} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ 
  className, 
  ...props 
}, ref) => (
  <div ref={ref} className={`flex items-center pt-4 ${className || ''}`} {...props} />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };