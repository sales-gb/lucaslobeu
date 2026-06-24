'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface TextRevealProps {
  text: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  className?: string
  delay?: number
  stagger?: number
  splitBy?: 'word' | 'char' | 'line'
}

export default function TextReveal({
  text,
  as: Tag = 'span',
  className,
  delay = 0,
  stagger = 0.04,
  splitBy = 'word',
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -40px 0px' })

  const items = splitBy === 'char' ? text.split('') : text.split(' ')

  return (
    // @ts-expect-error polymorphic tag
    <Tag ref={ref} className={className} style={{ display: 'block' }}>
      {items.map((item, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            overflow: 'hidden',
            verticalAlign: 'bottom',
            // Expande a área de recorte à direita e abaixo (sem mexer no
            // layout, via margem negativa) para que a ponta de glifos itálicos
            // e descendentes não sejam cortados pelo overflow:hidden.
            paddingRight: '0.14em',
            marginRight: '-0.14em',
            paddingBottom: '0.08em',
            marginBottom: '-0.08em',
          }}
        >
          <motion.span
            style={{ display: 'inline-block' }}
            initial={{ y: '110%', opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : { y: '110%', opacity: 0 }}
            transition={{
              duration: 0.6,
              delay: delay / 1000 + i * stagger,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {item}{splitBy === 'word' ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}
