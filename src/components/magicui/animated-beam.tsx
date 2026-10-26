/**
 * Magic UI · MIT License · Copyright (c) Magic UI.
 * Source: https://github.com/magicuidesign/magicui/tree/efe76fc5755eca1142dd4f74c1d6f0ace2887e3c/apps/www/registry/magicui
 * Local adaptation: scoped CSS, endpoint-based gradient travel, smooth routes and viewport/reduced-motion playback.
 * Full license is retained in licenses/Magic-UI-MIT.txt.
 */
"use client"

import { useEffect, useId, useState, type RefObject } from "react"
import { motion, useAnimationControls, useReducedMotion } from "motion/react"

import { cn } from "./utils"

export interface AnimatedBeamProps {
  className?: string
  containerRef: RefObject<HTMLElement | null> // Container ref
  fromRef: RefObject<HTMLElement | null>
  toRef: RefObject<HTMLElement | null>
  curvature?: number
  reverse?: boolean
  pathColor?: string
  pathWidth?: number
  pathOpacity?: number
  gradientStartColor?: string
  gradientStopColor?: string
  delay?: number
  duration?: number
  repeat?: number
  repeatDelay?: number
  startXOffset?: number
  startYOffset?: number
  endXOffset?: number
  endYOffset?: number
  /** Product playback: pause immediately when the section leaves view. */
  playing?: boolean
  vertical?: boolean
  route?: "legacy" | "smooth"
  beamWidth?: number
  reducedMotion?: boolean
}

export const AnimatedBeam: React.FC<AnimatedBeamProps> = ({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false, // Include the reverse prop
  duration = 5,
  delay = 0,
  pathColor = "gray",
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = "#ffaa40",
  gradientStopColor = "#9c40ff",
  repeat = Infinity,
  repeatDelay = 0,
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
  playing = true,
  vertical = false,
  route = "legacy",
  beamWidth = pathWidth,
  reducedMotion,
}) => {
  const id = useId()
  const controls = useAnimationControls()
  const preference = useReducedMotion()
  const reduced = reducedMotion ?? preference
  const [pathD, setPathD] = useState("")
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 })
  const [endpoints, setEndpoints] = useState({ sx: 0, sy: 0, ex: 0, ey: 0 })

  // A short connection occupies only part of the full SVG. Sweep over that
  // path's real endpoints; viewport percentages hid the pulse for most of each
  // cycle on short wires. Keep the original gradient-driven beam technique.
  const begin = vertical ? endpoints.sy : endpoints.sx
  const end = vertical ? endpoints.ey : endpoints.ex
  const sign = end >= begin ? 1 : -1
  const band = Math.max(20, Math.abs(end - begin) * 0.32)
  const axis = reverse
    ? { a: [end + sign * band, begin], b: [end, begin - sign * band] }
    : { a: [begin - sign * band, end], b: [begin, end + sign * band] }
  const gradientCoordinates = vertical
    ? { x1: [endpoints.sx, endpoints.sx], x2: [endpoints.sx, endpoints.sx], y1: axis.a, y2: axis.b }
    : { x1: axis.a, x2: axis.b, y1: [endpoints.sy, endpoints.sy], y2: [endpoints.sy, endpoints.sy] }

  useEffect(() => {
    if (!playing || reduced) { controls.stop(); return }
    controls.start(gradientCoordinates, {
      delay, duration, ease: "linear", repeat, repeatDelay,
    })
    return () => controls.stop()
  }, [controls, playing, reduced, vertical, reverse, delay, duration, repeat, repeatDelay, endpoints.sx, endpoints.sy, endpoints.ex, endpoints.ey])

  useEffect(() => {
    const updatePath = () => {
      if (containerRef.current && fromRef.current && toRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect()
        const rectA = fromRef.current.getBoundingClientRect()
        const rectB = toRef.current.getBoundingClientRect()

        const svgWidth = containerRect.width
        const svgHeight = containerRect.height
        setSvgDimensions({ width: svgWidth, height: svgHeight })

        const startX =
          rectA.left - containerRect.left + rectA.width / 2 + startXOffset
        const startY =
          rectA.top - containerRect.top + rectA.height / 2 + startYOffset
        const endX =
          rectB.left - containerRect.left + rectB.width / 2 + endXOffset
        const endY =
          rectB.top - containerRect.top + rectB.height / 2 + endYOffset

        const controlY = startY - curvature
        const d = route === "smooth"
          ? vertical
            ? `M ${startX},${startY} C ${startX},${(startY + endY) / 2} ${endX},${(startY + endY) / 2} ${endX},${endY}`
            : `M ${startX},${startY} C ${(startX + endX) / 2},${startY} ${(startX + endX) / 2},${endY} ${endX},${endY}`
          : `M ${startX},${startY} Q ${
          (startX + endX) / 2
        },${controlY} ${endX},${endY}`
        setPathD(d)
        setEndpoints({ sx: startX, sy: startY, ex: endX, ey: endY })
      }
    }

    // Initialize ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      updatePath()
    })

    // Observe the container element
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }
    if (fromRef.current) resizeObserver.observe(fromRef.current)
    if (toRef.current) resizeObserver.observe(toRef.current)

    // Call the updatePath initially to set the initial path
    updatePath()

    // Clean up the observer on component unmount
    return () => {
      resizeObserver.disconnect()
    }
  }, [
    containerRef,
    fromRef,
    toRef,
    curvature,
    startXOffset,
    startYOffset,
    endXOffset,
    endYOffset,
    route,
    vertical,
  ])

  return (
    <svg
      fill="none"
      width={svgDimensions.width}
      height={svgDimensions.height}
      xmlns="http://www.w3.org/2000/svg"
      className={cn("mui-animated-beam", className)}
      viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
      aria-hidden="true"
    >
      <path
        d={pathD}
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        strokeLinecap="round"
      />
      {!reduced && <path d={pathD} stroke={`url(#${id})`} strokeWidth={beamWidth + 4} strokeOpacity=".18" strokeLinecap="round" />}
      {!reduced && <path
        d={pathD}
        strokeWidth={beamWidth}
        stroke={`url(#${id})`}
        strokeOpacity="1"
        strokeLinecap="round"
      />}
      <defs>
        <motion.linearGradient
          id={id}
          gradientUnits={"userSpaceOnUse"}
          initial={{
            x1: "0%",
            x2: "0%",
            y1: "0%",
            y2: "0%",
          }}
          animate={controls}
        >
          <stop stopColor={gradientStartColor} stopOpacity="0"></stop>
          <stop stopColor={gradientStartColor}></stop>
          <stop offset="32.5%" stopColor={gradientStopColor}></stop>
          <stop
            offset="100%"
            stopColor={gradientStopColor}
            stopOpacity="0"
          ></stop>
        </motion.linearGradient>
      </defs>
    </svg>
  )
}
