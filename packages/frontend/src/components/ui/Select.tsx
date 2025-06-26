// src/components/ui/Select.tsx
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export interface SelectItemProps {
  children: React.ReactNode;
  value: string;
  onSelect?: (value: string) => void;
}

export interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export interface SelectValueProps {
  placeholder?: string;
}

export interface SelectContentProps {
  children: React.ReactNode;
}

// Context para manejar el estado del select
const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
}>({
  isOpen: false,
  setIsOpen: () => {},
  disabled: false,
});

export const Select: React.FC<SelectProps> = ({
  children,
  value,
  onValueChange,
  disabled = false,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const contextValue = {
    value,
    onValueChange,
    isOpen,
    setIsOpen,
    placeholder,
    disabled,
  };

  return (
    <SelectContext.Provider value={contextValue}>
      <div ref={selectRef} className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger: React.FC<SelectTriggerProps> = ({
  children,
  className = "",
}) => {
  const { isOpen, setIsOpen, disabled } = React.useContext(SelectContext);

  return (
    <button
      type="button"
      onClick={() => !disabled && setIsOpen(!isOpen)}
      disabled={disabled}
      className={`flex items-center justify-between w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
      <ChevronDown
        className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
      />
    </button>
  );
};

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => {
  const { value, placeholder: contextPlaceholder } =
    React.useContext(SelectContext);

  return (
    <span
      className={
        value
          ? "text-gray-900 dark:text-white"
          : "text-gray-500 dark:text-gray-400"
      }
    >
      {value || placeholder || contextPlaceholder || "Seleccionar..."}
    </span>
  );
};

export const SelectContent: React.FC<SelectContentProps> = ({ children }) => {
  const { isOpen } = React.useContext(SelectContext);

  if (!isOpen) return null;

  return (
    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
      {children}
    </div>
  );
};

export const SelectItem: React.FC<SelectItemProps> = ({ children, value }) => {
  const {
    onValueChange,
    setIsOpen,
    value: selectedValue,
  } = React.useContext(SelectContext);

  const handleSelect = () => {
    onValueChange?.(value);
    setIsOpen(false);
  };

  const isSelected = selectedValue === value;

  return (
    <div
      onClick={handleSelect}
      className={`px-3 py-2 cursor-pointer transition-colors ${
        isSelected
          ? "bg-purple-100 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100"
          : "hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
      }`}
    >
      {children}
    </div>
  );
};
