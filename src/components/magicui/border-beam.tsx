/**
 * Magic UI · MIT License · Copyright (c) Magic UI.
 * Source: https://github.com/magicuidesign/magicui/tree/efe76fc5755eca1142dd4f74c1d6f0ace2887e3c/apps/www/registry/magicui
 * Local adaptation: product CSS, finite playback and reduced-motion support.
 * Full license is retained in licenses/Magic-UI-MIT.txt.
 */
"use client"

import { motion, useAnimationControls, useReducedMotion, type MotionStyle, type Transition } from "motion/react"
import { useEffect } from "react"

import { cn } from "./utils"

interface BorderBeamProps {
  /**
   * The size of the border beam.
   */
  size?: number
  /**
   * The duration of the border beam.
   */
  duration?: number
  /**
   * The delay of the border beam.
   */
  delay?: number
  /**
   * The color of the border beam from.
   */
  colorFrom?: string
  /**
   * The color of the border beam to.
   */
  colorTo?: string
  /**
   * The motion transition of the border beam.
   */
  transition?: Transition
  /**
   * The class name of the border beam.
   */
  className?: string
  /**
   * The style of the border beam.
   */
  style?: React.CSSProperties
  /**
   * Whether to reverse the animation direction.
   */
  reverse?: boolean
  /**
   * The initial offset position (0-100).
   */
  initialOffset?: number
  /**
   * The border width of the beam.
   */
  borderWidth?: number
  playing?: boolean
}

export const BorderBeam = ({
  className,
  size = 50,
  delay = 0,
  duration = 6,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  transition,
  style,
  reverse = false,
  initialOffset = 0,
  borderWidth = 1,
  playing = true,
}: BorderBeamProps) => {
  const controls = useAnimationControls()
  const reduced = useReducedMotion()
  useEffect(() => {
    if (!playing || reduced) { controls.stop(); return }
    controls.start({
      offsetDistance: reverse
        ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
        : [`${initialOffset}%`, `${100 + initialOffset}%`],
    }, { repeat: 0, ease: "linear", duration, delay: -delay, ...transition })
    return () => controls.stop()
  }, [controls, playing, reduced, reverse, initialOffset, duration, delay, transition])
  if (reduced) return null
  return (
    <div
      className="mui-border-beam"
      aria-hidden="true"
      style={
        {
          "--border-beam-width": `${borderWidth}px`,
        } as React.CSSProperties
      }
    >
      <motion.div
        className={cn(
          "mui-border-light",
          className
        )}
        style={
          {
            width: size,
            offsetPath: `rect(0 auto auto 0 round ${size}px)`,
            "--color-from": colorFrom,
            "--color-to": colorTo,
            ...style,
          } as MotionStyle
        }
        initial={{ offsetDistance: `${initialOffset}%` }}
        animate={controls}
      />
    </div>
  )
}
