"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { spring } from "@/lib/motion"

type RevealProps = {
  children: React.ReactNode
  className?: string
  delay?: number
}

/**
 * Fades and lifts content into view once. Collapses to a plain div when the
 * user prefers reduced motion.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const reduce = useReducedMotion()

  if (reduce) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ ...spring.reveal, delay }}
    >
      {children}
    </motion.div>
  )
}
