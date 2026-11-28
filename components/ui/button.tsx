import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-card text-label font-medium transition-[background-color,color,box-shadow,transform,border-color] duration-[var(--duration-ui)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:shadow-focus disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-accent-brand text-white hover:brightness-110",
        secondary:
          "border border-line bg-surface-2 text-text hover:bg-surface-3",
        ghost: "text-text-2 hover:bg-surface-2 hover:text-text",
        danger: "bg-danger text-white hover:brightness-110",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-body",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
