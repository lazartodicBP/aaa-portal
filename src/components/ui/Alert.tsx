import React from 'react';
import { clsx } from 'clsx';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
                                              variant = 'info',
                                              title,
                                              message,
                                              dismissible = false,
                                              onDismiss,
                                              icon,
                                              className,
                                              ...props
                                            }) => {
  const variants = {
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-400',
      title: 'text-blue-800',
      message: 'text-blue-700',
      defaultIcon: <Info className="h-5 w-5" />,
    },
    success: {
      container: 'bg-green-50 border-green-200',
      icon: 'text-green-400',
      title: 'text-green-800',
      message: 'text-green-700',
      defaultIcon: <CheckCircle className="h-5 w-5" />,
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-400',
      title: 'text-yellow-800',
      message: 'text-yellow-700',
      defaultIcon: <AlertCircle className="h-5 w-5" />,
    },
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-400',
      title: 'text-red-800',
      message: 'text-red-700',
      defaultIcon: <XCircle className="h-5 w-5" />,
    },
  };

  const styles = variants[variant];

  return (
    <div
      className={clsx(
        'rounded-md border p-4',
        styles.container,
        className
      )}
      role="alert"
      {...props}
    >
      <div className="flex">
        <div className={clsx('flex-shrink-0', styles.icon)}>
          {icon || styles.defaultIcon}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={clsx('text-sm font-medium', styles.title)}>
              {title}
            </h3>
          )}
          <div className={clsx('text-sm', styles.message, title && 'mt-1')}>
            {message}
          </div>
        </div>
        {dismissible && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className={clsx(
                '-m-1.5 inline-flex h-8 w-8 rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                'hover:bg-gray-100 focus:ring-gray-400',
                styles.icon
              )}
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};