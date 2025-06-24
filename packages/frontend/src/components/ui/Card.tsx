import { HTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "gradient" | "outline";
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className,
      variant = "default",
      hover = false,
      padding = "md",
      ...props
    },
    ref
  ) => {
    const baseStyles = "rounded-2xl transition-all duration-300";

    const variants = {
      default: "card-glass",
      gradient:
        "bg-gradient-to-br from-primary-500/20 to-secondary-500/20 backdrop-blur-xl border border-white/10",
      outline: "border-2 border-white/20 bg-transparent",
    };

    const paddings = {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    };

    return (
      <div
        ref={ref}
        className={clsx(
          baseStyles,
          variants[variant],
          paddings[padding],
          hover && "hover-lift",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

// Card subcomponents
export const CardHeader = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx("pb-4 border-b border-white/10", className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={clsx("text-xl font-semibold text-white", className)}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={clsx("text-sm text-white/60 mt-1", className)} {...props}>
    {children}
  </p>
);

export const CardContent = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx("pt-4", className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={clsx("pt-4 border-t border-white/10 mt-4", className)}
    {...props}
  >
    {children}
  </div>
);


export default Card;