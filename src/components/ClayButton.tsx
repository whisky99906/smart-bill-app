interface ClayButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'warning' | 'success';
  disabled?: boolean;
}

export const ClayButton = ({ children, className = '', onClick, variant = 'primary', disabled = false }: ClayButtonProps) => {
  const variantStyles = {
    primary: 'bg-clay-purple text-white',
    secondary: 'bg-clay-bg text-text-primary',
    warning: 'bg-clay-yellow text-text-primary',
    success: 'bg-clay-cyan text-text-primary',
  };

  return (
    <button
      className={`clay-button ${variantStyles[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
