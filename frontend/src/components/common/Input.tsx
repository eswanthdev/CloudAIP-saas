import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, fullWidth = false, className = '', ...props }, ref) => {
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-medium text-secondary-700 mb-1.5">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2">{icon}</div>}
          <input
            ref={ref}
            className={`
              w-full px-4 py-2.5 text-sm rounded-lg border-2 transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
              placeholder:text-secondary-400
              disabled:bg-secondary-100 disabled:cursor-not-allowed
              ${icon ? 'pl-10' : ''}
              ${
                error
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-secondary-300 focus:border-primary-500'
              }
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        {helperText && !error && <p className="text-secondary-500 text-sm mt-1">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
