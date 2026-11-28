import * as React from "react"

import { cn } from "@/lib/utils"

function FieldError({ className, children, ...props }: React.ComponentProps<"p">) {
  if (!children) {
    return null
  }

  return (
    <p
      role="alert"
      data-slot="field-error"
      className={cn("text-label text-danger", className)}
      {...props}
    >
      {children}
    </p>
  )
}

export { FieldError }
