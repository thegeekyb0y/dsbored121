"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { spring } from "@/lib/motion"
import { cn } from "@/lib/utils"

type PressableProps = React.ComponentProps<typeof motion.button>

/** Button-like wrapper that adds the shared press spring. */
export function Pressable({ className, children, ...props }: PressableProps) {
  const reduce = useReducedMotion()

  return (
    <motion.button
      type="button"
      whileTap={reduce ? undefined : { scale: 0.98 }}
      transition={spring.press}
      className={cn(
        "rounded-card focus-visible:outline-none focus-visible:shadow-focus",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
}
