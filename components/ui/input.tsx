import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full rounded-card border border-line bg-surface px-3 text-body text-text placeholder:text-text-3 transition-[border-color,box-shadow] duration-[var(--duration-ui)] focus-visible:outline-none focus-visible:shadow-focus aria-[invalid=true]:border-danger disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  )
}

export { Input }
