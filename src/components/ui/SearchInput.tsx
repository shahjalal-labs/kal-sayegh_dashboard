import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className = "w-full md:w-80",
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <Search className="w-5 h-5" />
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 h-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
      />
    </div>
  );
}
