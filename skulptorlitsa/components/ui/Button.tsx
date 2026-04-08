'use client';

import React from 'react';
import Link from 'next/link';

type Variant = 'primary' | 'secondary' | 'vk' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  href?: string;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const variantStyles: Record<Variant, string> = {
  primary:   'bg-[#33783e] text-white hover:bg-[#2a6333]',
  secondary: 'border-2 border-[#bf9244] text-[#bf9244] bg-transparent hover:bg-[#bf9244]/10',
  vk:        'bg-[#0077FF] text-white hover:bg-[#0066DD]',
  ghost:     'bg-transparent text-[#33783e] hover:bg-[#33783e]/10',
  danger:    'bg-[#a3212a] text-white hover:bg-[#8a1a22]',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm min-h-[38px]',
  md: 'px-7 py-[14px] text-base min-h-[48px]',
  lg: 'px-9 py-4 text-lg min-h-[56px]',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  href,
  disabled,
  loading,
  fullWidth,
  onClick,
  type = 'button',
  children,
  className = '',
  style,
}: ButtonProps) {
  const base = `
    inline-flex items-center justify-center gap-2 font-semibold
    rounded-full transition-all duration-200 cursor-pointer
    min-w-[48px] select-none
    hover:scale-[1.04] hover:-translate-y-0.5 hover:shadow-lg
    active:scale-[0.97] active:translate-y-0
    disabled:bg-[#ccc] disabled:text-[#888] disabled:cursor-not-allowed disabled:border-0
    disabled:hover:scale-100 disabled:hover:translate-y-0 disabled:hover:shadow-none
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const isDisabled = disabled || loading;

  const content = (
    <>
      {loading && (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </>
  );

  if (href && !isDisabled) {
    return <Link href={href} className={base} style={style}>{content}</Link>;
  }

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={base}
      style={style}
    >
      {content}
    </button>
  );
}
