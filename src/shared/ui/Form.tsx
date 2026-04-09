import React from 'react';
import './Form.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className={`ui-form-group ${className || ''}`}>
        {label && <label className="ui-label">{label}</label>}
        <input 
          ref={ref}
          className={`ui-input ${error ? 'ui-input-error' : ''}`}
          {...props} 
        />
        {error && <span className="ui-error-text">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className={`ui-form-group ${className || ''}`}>
        {label && <label className="ui-label">{label}</label>}
        <select 
          ref={ref}
          className={`ui-input ui-select ${error ? 'ui-input-error' : ''}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="ui-error-text">{error}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';

export const DatePicker = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className={`ui-form-group ${className || ''}`}>
        {label && <label className="ui-label">{label}</label>}
        <input 
          type="date"
          ref={ref}
          className={`ui-input ${error ? 'ui-input-error' : ''}`}
          {...props} 
        />
        {error && <span className="ui-error-text">{error}</span>}
      </div>
    );
  }
);
DatePicker.displayName = 'DatePicker';
