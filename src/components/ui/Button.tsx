import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserPermissions } from '../../types';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  requiredPermission?: keyof UserPermissions;
  hideIfNoPermission?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  requiredPermission,
  hideIfNoPermission = true,
  disabled,
  className = '',
  ...props
}) => {
  const { hasPermission, branding } = useApp();

  const isAllowed = requiredPermission ? hasPermission(requiredPermission) : true;

  if (!isAllowed && hideIfNoPermission) {
    return null;
  }

  const radiusClass = branding?.buttonRadius || 'rounded-xl';
  const weightClass = branding?.buttonFontWeight || 'font-semibold';

  const shadowClass =
    branding?.buttonShadowStyle === 'none'
      ? 'shadow-none'
      : branding?.buttonShadowStyle === 'sm'
      ? 'shadow-sm'
      : branding?.buttonShadowStyle === 'xl'
      ? 'shadow-xl'
      : 'shadow-md';

  const hoverClass =
    branding?.buttonHoverEffect === 'scale'
      ? 'hover:scale-[1.02] active:scale-[0.98]'
      : branding?.buttonHoverEffect === 'lift'
      ? 'hover:-translate-y-0.5'
      : branding?.buttonHoverEffect === 'glow'
      ? 'hover:brightness-110 hover:shadow-lg'
      : '';

  const baseStyles = `inline-flex items-center justify-center ${weightClass} ${radiusClass} transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${hoverClass}`;

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-xs md:text-sm gap-2',
    lg: 'px-5 py-2.5 text-sm md:text-base gap-2.5',
  };

  const variantStyles = {
    primary: `bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 ${shadowClass} shadow-amber-500/20 focus:ring-amber-500`,
    secondary: `bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white ${shadowClass} focus:ring-slate-700`,
    outline: 'border border-slate-300 hover:bg-slate-100 text-slate-700 focus:ring-slate-400 bg-white',
    danger: `bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white ${shadowClass} shadow-rose-600/20 focus:ring-rose-500`,
    ghost: 'text-slate-600 hover:bg-slate-100 active:bg-slate-200 focus:ring-slate-300',
  };

  const customStyle: React.CSSProperties = {
    fontFamily: (branding?.buttonFontFamily || branding?.fontFamily)
      ? `'${branding.buttonFontFamily || branding.fontFamily}', sans-serif`
      : 'inherit',
    ...(variant === 'primary' && branding?.buttonBgHex
      ? {
          backgroundColor: branding.buttonBgHex,
          color: branding.buttonTextHex || '#0f172a',
        }
      : {}),
    ...props.style,
  };

  return (
    <button
      disabled={disabled || isLoading || !isAllowed}
      style={customStyle}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="flex items-center">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="flex items-center">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
