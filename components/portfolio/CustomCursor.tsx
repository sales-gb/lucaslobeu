'use client'

import { useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CustomCursor() {
  const mx = useMotionValue(-200)
  const my = useMotionValue(-200)

  const dotX = useSpring(mx, { stiffness: 1200, damping: 70, mass: 0.3 })
  const dotY = useSpring(my, { stiffness: 1200, damping: 70, mass: 0.3 })

  const ringX = useSpring(mx, { stiffness: 160, damping: 24, mass: 0.6 })
  const ringY = useSpring(my, { stiffness: 160, damping: 24, mass: 0.6 })

  const ringScale = useMotionValue(1)
  const ringScaleSpring = useSpring(ringScale, { stiffness: 280, damping: 26 })
  const dotOpacity = useMotionValue(1)
  const ringOpacity = useMotionValue(0.45)

  useEffect(() => {
    const move = (e: MouseEvent) => {
      mx.set(e.clientX)
      my.set(e.clientY)
    }

    const over = (e: MouseEvent) => {
      if ((e.target as Element).closest('a, button, [data-cursor="hover"]')) {
        ringScale.set(2.4)
        dotOpacity.set(0)
        ringOpacity.set(0.18)
      }
    }

    const out = (e: MouseEvent) => {
      const related = e.relatedTarget as Element | null
      if (
        (e.target as Element).closest('a, button, [data-cursor="hover"]') &&
        !related?.closest('a, button, [data-cursor="hover"]')
      ) {
        ringScale.set(1)
        dotOpacity.set(1)
        ringOpacity.set(0.45)
      }
    }

    window.addEventListener('mousemove', move, { passive: true })
    document.addEventListener('mouseover', over)
    document.addEventListener('mouseout', out)

    return () => {
      window.removeEventListener('mousemove', move)
      document.removeEventListener('mouseover', over)
      document.removeEventListener('mouseout', out)
    }
  }, [mx, my, ringScale, dotOpacity, ringOpacity])

  return (
    <>
      <motion.div className="ll-cursor-dot" style={{ x: dotX, y: dotY, opacity: dotOpacity }} />
      <motion.div
        className="ll-cursor-ring"
        style={{ x: ringX, y: ringY, scale: ringScaleSpring, opacity: ringOpacity }}
      />
    </>
  )
}
