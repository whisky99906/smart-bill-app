interface ClayCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
}

export const ClayCard = ({ children, className = '', onClick, onDrop, onDragOver }: ClayCardProps) => {
  return (
    <div
      className={`clay-card ${className}`}
      onClick={onClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      {children}
    </div>
  );
};
