'use client'

import { useState } from 'react'
import { AnimationOptions, motion, useAnimate } from 'framer-motion'
import debounce from 'lodash/debounce'

/**
 * Troca de letras com stagger SEQUENCIAL (esquerda → direita, letra a letra até
 * o fim) — variação do efeito "random letter swap", mas com índices em ordem em
 * vez de embaralhados. Usado nos links do header.
 *
 * Cada letra tem uma cópia "secundária" empilhada acima; no hover a letra
 * principal desce e a secundária entra, dando o efeito de troca por rolagem.
 */
interface LetterSwapProps {
  label: string
  reverse?: boolean
  transition?: AnimationOptions
  staggerDuration?: number
  className?: string
  onClick?: () => void
}

const DEFAULT_TRANSITION: AnimationOptions = {
  type: 'spring',
  duration: 0.7,
}

/** Hover-in toca a animação até o fim (uma passada). */
export function LetterSwapForward({
  label,
  reverse = true,
  transition = DEFAULT_TRANSITION,
  staggerDuration = 0.03,
  className,
  onClick,
  ...props
}: LetterSwapProps) {
  const [scope, animate] = useAnimate()
  const [blocked, setBlocked] = useState(false)

  const mergeTransition = (t: AnimationOptions, i: number): AnimationOptions => ({
    ...t,
    delay: i * staggerDuration,
  })

  const hoverStart = debounce(
    () => {
      if (blocked) return
      setBlocked(true)

      for (let i = 0; i < label.length; i++) {
        animate('.letter-' + i, { y: reverse ? '100%' : '-100%' }, mergeTransition(transition, i)).then(
          () => {
            animate('.letter-' + i, { y: 0 }, { duration: 0 })
          },
        )

        animate('.letter-secondary-' + i, { top: '0%' }, mergeTransition(transition, i))
          .then(() => {
            animate('.letter-secondary-' + i, { top: reverse ? '-100%' : '100%' }, { duration: 0 })
          })
          .then(() => {
            if (i === label.length - 1) setBlocked(false)
          })
      }
    },
    100,
    { leading: true, trailing: true },
  )

  return (
    <motion.span
      className={`relative flex items-center justify-center overflow-hidden ${className ?? ''}`}
      onHoverStart={hoverStart}
      onClick={onClick}
      ref={scope}
      {...props}
    >
      <span className="sr-only">{label}</span>

      {label.split('').map((letter, i) => (
        <span className="relative flex whitespace-pre" key={i} aria-hidden>
          <motion.span className={`relative letter-${i}`} style={{ top: 0 }}>
            {letter}
          </motion.span>
          <motion.span
            className={`absolute letter-secondary-${i}`}
            style={{ top: reverse ? '-100%' : '100%' }}
          >
            {letter}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}

/** Hover-in anima para o estado trocado; hover-out reverte (ping-pong). */
export function LetterSwapPingPong({
  label,
  reverse = true,
  transition = DEFAULT_TRANSITION,
  staggerDuration = 0.03,
  className,
  onClick,
  ...props
}: LetterSwapProps) {
  const [scope, animate] = useAnimate()
  const [blocked, setBlocked] = useState(false)

  const mergeTransition = (t: AnimationOptions, i: number): AnimationOptions => ({
    ...t,
    delay: i * staggerDuration,
  })

  const hoverStart = debounce(
    () => {
      if (blocked) return
      setBlocked(true)

      for (let i = 0; i < label.length; i++) {
        animate('.letter-' + i, { y: reverse ? '100%' : '-100%' }, mergeTransition(transition, i))
        animate('.letter-secondary-' + i, { top: '0%' }, mergeTransition(transition, i))
      }
    },
    100,
    { leading: true, trailing: true },
  )

  const hoverEnd = debounce(
    () => {
      setBlocked(false)

      for (let i = 0; i < label.length; i++) {
        animate('.letter-' + i, { y: 0 }, mergeTransition(transition, i))
        animate('.letter-secondary-' + i, { top: reverse ? '-100%' : '100%' }, mergeTransition(transition, i))
      }
    },
    100,
    { leading: true, trailing: true },
  )

  return (
    <motion.span
      className={`relative flex items-center justify-center overflow-hidden ${className ?? ''}`}
      onHoverStart={hoverStart}
      onHoverEnd={hoverEnd}
      onClick={onClick}
      ref={scope}
      {...props}
    >
      <span className="sr-only">{label}</span>

      {label.split('').map((letter, i) => (
        <span className="relative flex whitespace-pre" key={i} aria-hidden>
          <motion.span className={`relative letter-${i}`} style={{ top: 0 }}>
            {letter}
          </motion.span>
          <motion.span
            className={`absolute letter-secondary-${i}`}
            style={{ top: reverse ? '-100%' : '100%' }}
          >
            {letter}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}
