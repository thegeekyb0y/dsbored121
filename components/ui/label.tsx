import * as React from "react"

import { cn } from "@/lib/utils"

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "text-label font-medium text-text-2 select-none",
        className
      )}
      {...props}
    />
  )
}

export { Label }
