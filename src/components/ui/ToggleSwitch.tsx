type ToggleSwitchProps = {
  label: string;
  checked: boolean;
  onToggle: () => void;
  description?: string;
  className?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  switchClassName?: string;
};

export default function ToggleSwitch({
  label,
  checked,
  onToggle,
  description,
  className = "",
  labelClassName = "",
  descriptionClassName = "",
  switchClassName = "",
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center justify-between gap-4 rounded-xl border border-transparent transition hover:border-primary/30 ${className}`}
    >
      <div className="min-w-0 text-left">
        <div className={`text-lg font-semibold text-title ${labelClassName}`}>
          {label}
        </div>
        {description ? (
          <div
            className={`text-sm text-gray-500 leading-relaxed ${descriptionClassName}`}
          >
            {description}
          </div>
        ) : null}
      </div>

      <span
        className={`flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition ${
          checked ? "bg-primary" : "bg-gray-300"
        } ${switchClassName}`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white transition ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}
