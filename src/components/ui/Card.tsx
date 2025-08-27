import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
                                            variant = 'default',
                                            padding = 'md',
                                            interactive = false,
                                            className,
                                            children,
                                            ...props
                                          }) => {
  const baseStyles = 'bg-white rounded-lg';

  const variants = {
    default: 'border border-gray-200 shadow-sm',
    bordered: 'border-2 border-gray-300',
    elevated: 'shadow-lg',
    flat: 'border border-gray-100',
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const interactiveStyles = interactive
    ? 'transition-all hover:shadow-md hover:border-gray-300 cursor-pointer'
    : '';

  return (
    <div
      className={clsx(
        baseStyles,
        variants[variant],
        paddings[padding],
        interactiveStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Card subcomponents for better composition
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
                                                                             className,
                                                                             children,
                                                                             ...props
                                                                           }) => {
  return (
    <div
      className={clsx('pb-4 border-b border-gray-200', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
                                                                                className,
                                                                                children,
                                                                                ...props
                                                                              }) => {
  return (
    <h3
      className={clsx('text-lg font-semibold text-gray-900', className)}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
                                                                                        className,
                                                                                        children,
                                                                                        ...props
                                                                                      }) => {
  return (
    <p
      className={clsx('mt-1 text-sm text-gray-500', className)}
      {...props}
    >
      {children}
    </p>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
                                                                              className,
                                                                              children,
                                                                              ...props
                                                                            }) => {
  return (
    <div
      className={clsx('pt-4', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
                                                                             className,
                                                                             children,
                                                                             ...props
                                                                           }) => {
  return (
    <head
      className={clsx('pt-4 mt-4 border-t border-gray-200', className)}
      {...props}
    >
      {children}
    </head>
  );
};