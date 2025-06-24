export interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "outline" | "secondary";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  className = "",
}) => {
  const baseClasses =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

  const variantClasses = {
    default:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    outline:
      "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300",
    secondary: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};
