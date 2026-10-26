/**
 * Magic UI · MIT License · Copyright (c) Magic UI.
 * Source: https://github.com/magicuidesign/magicui/tree/efe76fc5755eca1142dd4f74c1d6f0ace2887e3c/apps/www/registry/magicui
 * Local adaptation: scoped CSS and resumable viewport/background/media playback.
 * Full license is retained in licenses/Magic-UI-MIT.txt.
 */
"use client"

import { animate, motion, useMotionValue, type MotionStyle, type Transition } from "motion/react"
import { useEffect, useRef } from "react"

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
  const frame = useRef<HTMLDivElement>(null)
  const playingRef = useRef(playing)
  playingRef.current = playing
  const syncPlayback = useRef<(() => void) | null>(null)
  const offsetDistance = useMotionValue(`${initialOffset}%`)

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)")
    // Preserve the upstream offset-path/gradient technique. A playback handle,
    // rather than a one-shot animation controller, can resume the same phase.
    const animation = animate(offsetDistance, reverse
      ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
      : [`${initialOffset}%`, `${100 + initialOffset}%`],
    { ease: "linear", duration, delay: -delay, ...transition, repeat: Infinity })
    animation.pause()
    const sync = () => {
      const active = playingRef.current && !document.hidden && !media.matches
      if (active) animation.play()
      else animation.pause()
      if (frame.current) frame.current.dataset.playing = String(active)
    }
    syncPlayback.current = sync
    // Listen directly: runtime preference changes must not depend on Motion's
    // cached reduced-motion hook or a parent React render catching up.
    document.addEventListener("visibilitychange", sync)
    media.addEventListener("change", sync)
    sync()
    return () => {
      syncPlayback.current = null
      document.removeEventListener("visibilitychange", sync)
      media.removeEventListener("change", sync)
      animation.stop()
    }
  }, [offsetDistance, reverse, initialOffset, duration, delay, transition])

  useEffect(() => { syncPlayback.current?.() }, [playing])

  return (
    <div
      ref={frame}
      className="mui-border-beam"
      data-playing="false"
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
            offsetPath: "rect(0 auto auto 0 round var(--beam-corner, 28px))",
            offsetDistance,
            "--color-from": colorFrom,
            "--color-to": colorTo,
            ...style,
          } as MotionStyle
        }
      />
    </div>
  )
}
