import React from 'react';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'brand';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  className = '', 
  disabled = false,
  type = 'button'
}) => {
  const baseStyle = "px-4 py-2 rounded-full font-medium transition-transform active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-gray-900 text-white hover:bg-black disabled:bg-gray-300",
    brand: "bg-black text-white hover:bg-gray-800 shadow-md disabled:bg-gray-400 disabled:shadow-none",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:shadow-md disabled:opacity-50 disabled:hover:shadow-none",
    danger: "bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 disabled:opacity-50"
  };
  
  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

