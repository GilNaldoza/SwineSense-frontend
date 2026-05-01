import React, { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  defaultValue?: string;
  className?: string;
  children: ReactNode;
  onValueChange?: (value: string) => void;
}

interface TabsListProps {
  className?: string;
  children: ReactNode;
}

interface TabsTriggerProps {
  value: string;
  className?: string;
  children: ReactNode;
  disabled?: boolean;
}

interface TabsContentProps {
  value: string;
  className?: string;
  children: ReactNode;
}

const TabsContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
}>({ value: "", onValueChange: () => {} });

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ defaultValue = "", className, children, onValueChange }, ref) => {
    const [value, setValue] = useState(defaultValue);

    const handleValueChange = (newValue: string) => {
      setValue(newValue);
      onValueChange?.(newValue);
    };

    return (
      <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
        <div ref={ref} className={cn("w-full", className)}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  },
);
Tabs.displayName = "Tabs";

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children }, ref) => (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-gray-100 p-1",
        className,
      )}
      role="tablist"
    >
      {children}
    </div>
  ),
);
TabsList.displayName = "TabsList";

export const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  TabsTriggerProps
>(({ value, className, children, disabled }, ref) => {
  const { value: selectedValue, onValueChange } = React.useContext(TabsContext);
  const isActive = selectedValue === value;

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => !disabled && onValueChange(value)}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-white text-gray-900 shadow-sm"
          : "text-gray-600 hover:text-gray-900",
        className,
      )}
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${value}`}
    >
      {children}
    </button>
  );
});
TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, className, children }, ref) => {
    const { value: selectedValue } = React.useContext(TabsContext);
    const isActive = selectedValue === value;

    if (!isActive) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
          className,
        )}
        role="tabpanel"
        id={`tabpanel-${value}`}
      >
        {children}
      </div>
    );
  },
);
TabsContent.displayName = "TabsContent";
