import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md px-4 font-sans text-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "h-11 bg-primary text-primary-foreground hover:bg-primary-hover",
        secondary: "h-11 border border-input bg-card text-foreground hover:bg-secondary",
        destructive: "h-11 bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant }), className)} {...props} />;
}
