"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { spring } from "@/lib/motion"
import { cn } from "@/lib/utils"

type HoverLiftProps = React.ComponentProps<typeof motion.div>

/** Raises an element 2px and deepens its shadow on hover. */
export function HoverLift({ className, children, ...props }: HoverLiftProps) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      whileHover={reduce ? undefined : { y: -2 }}
      transition={spring.ui}
      className={cn("shadow-card hover:shadow-lift", className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}
