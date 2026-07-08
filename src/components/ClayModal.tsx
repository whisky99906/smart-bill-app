interface ClayModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const ClayModal = ({ isOpen, onClose, title, children }: ClayModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="clay-modal-overlay" onClick={onClose}>
      <div className="clay-modal-content" onClick={(e) => e.stopPropagation()}>
        {title && (
          <h3 className="text-lg font-bold text-text-primary mb-4">{title}</h3>
        )}
        {children}
      </div>
    </div>
  );
};
