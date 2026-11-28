import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-24 w-full rounded-card border border-line bg-surface px-3 py-2 text-body text-text placeholder:text-text-3 transition-[border-color,box-shadow] duration-[var(--duration-ui)] focus-visible:outline-none focus-visible:shadow-focus aria-[invalid=true]:border-danger disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
