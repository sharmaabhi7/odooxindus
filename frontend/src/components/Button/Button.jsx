import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  icon: Icon,
  ...props 
}) => {
  return (
    <button 
      className={twMerge(clsx('btn', `btn-${variant}`, `btn-${size}`, className))}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 18} />}
      {children}
    </button>
  );
};

export default Button;
