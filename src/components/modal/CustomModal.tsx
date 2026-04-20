"use client";

interface ModalAction {
  label: string;
  onClick: (data?: any) => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

interface CustomModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  actions?: ModalAction[];
  title?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
  showCloseButton?: boolean;
  closeOnOutsideClick?: boolean;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  full: "max-w-full",
};

export const CustomModal: React.FC<CustomModalProps> = ({
  open,
  onClose,
  children,
  actions = [],
  title,
  maxWidth = "3xl",
  showCloseButton = true,
  closeOnOutsideClick = true,
}) => {
  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-xl w-full ${maxWidthClasses[maxWidth]} relative max-h-[90vh] flex flex-col`}
      >
        {(title || showCloseButton) && (
          <div className="flex justify-between items-center p-6 pb-4 ">
            {title && (
              <h2 className="text-xl md:text-2xl font-semibold">{title}</h2>
            )}
          </div>
        )}

        <div className="p-6 overflow-y-auto flex-1">{children}</div>

        {actions.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3 p-4 sm:p-6 pt-2 sm:pt-4">
            {actions.map((btn, i) => (
              <button
                key={i}
                onClick={() => btn.onClick()}
                className={`w-full sm:w-auto px-4 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-medium transition-colors rounded-2xl ${
                  btn.variant === "primary"
                    ? "bg-primary text-white hover:bg-primary/90 transition-all"
                    : "border border-primary text-primary hover:bg-primary transition-colors duration-300 ease-in hover:text-secondary"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
