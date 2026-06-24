'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eyebrow } from '@/components/ui/eyebrow'
import { FlowButton } from '@/components/ui/flow-button'
import { LetterSwapPingPong } from '@/components/ui/letter-swap'
import { cn } from '@/lib/utils/cn'

const BrandMark = () => (
  <Link href="/" className="ll-brandmark" aria-label="Lobeu — início">
    <svg width="24" height="24" viewBox="0 0 200 200" fill="none">
      <path d="M 38 32 L 38 168 L 110 168" stroke="currentColor" strokeWidth="11" strokeLinecap="square" />
      <path d="M 162 168 L 162 32 L 90 32" stroke="currentColor" strokeWidth="11" strokeLinecap="square" />
      <circle cx="100" cy="100" r="6" fill="var(--accent)" />
    </svg>
    <div className="ll-brand-word">
      <span className="ll-brand-name">Lobeu</span>
      <span className="ll-brand-sub">Estúdio · SP</span>
    </div>
  </Link>
)

const navLinks = [
  { href: '/', label: 'Index', sub: '00' },
  { href: '/projects', label: 'Projetos', sub: '01' },
  { href: '/about', label: 'Sobre', sub: '02' },
  { href: '/contact', label: 'Contato', sub: '03' },
]

const panelVariants = {
  closed: { x: '100%' },
  open: { x: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 40 } },
  exit: { x: '100%', transition: { duration: 0.3, ease: [0.32, 0, 0.67, 0] as [number, number, number, number] } },
}

const linkVariants = {
  closed: { opacity: 0, y: 24 },
  open: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 + i * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
}

export default function Nav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  // Header oculta ao rolar para baixo; reaparece ao rolar para cima ou ao parar.
  const lastY = useRef(0)
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const openRef = useRef(open)
  openRef.current = open

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (openRef.current || y < 80) {
        setHidden(false)
      } else if (y > lastY.current + 4) {
        setHidden(true)
      } else if (y < lastY.current - 4) {
        setHidden(false)
      }
      lastY.current = y
      if (stopTimer.current) clearTimeout(stopTimer.current)
      stopTimer.current = setTimeout(() => setHidden(false), 250)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (stopTimer.current) clearTimeout(stopTimer.current)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Fecha ao trocar de rota
  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <>
      <header className={cn('ll-nav', hidden && !open && 'is-hidden')}>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center px-[var(--page-x)] py-5">
          {/* Esquerda: logo */}
          <div className="flex justify-start">
            <BrandMark />
          </div>

          {/* Centro: links (desktop) */}
          <nav className="hidden items-center justify-center gap-9 lg:flex" aria-label="Navegação principal">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative inline-flex font-mono text-[12px] uppercase tracking-[0.18em] whitespace-nowrap transition-colors duration-200',
                  isActive(link.href) ? 'text-paper' : 'text-paper/70 hover:text-paper',
                )}
              >
                <LetterSwapPingPong label={link.label} staggerDuration={0.025} />
                {isActive(link.href) && (
                  <span className="absolute -bottom-1 left-0 right-0 h-[1px] bg-accent" aria-hidden />
                )}
              </Link>
            ))}
          </nav>

          {/* Direita: CTA (desktop) + hambúrguer (mobile) */}
          <div className="flex items-center justify-end gap-4">
            <div className="hidden lg:block">
              <FlowButton text="Vamos conversar" href="/contact" className="py-2.5 text-[13px]" />
            </div>
            <button
              className={`ll-ham-trigger lg:hidden${open ? ' is-open' : ''}`}
              onClick={() => setOpen(!open)}
              aria-label={open ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={open}
            >
              <span className={`ll-ham-icon${open ? ' is-open' : ''}`}>
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Painel mobile */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="ll-ham-overlay is-open"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="ll-ham-panel"
              variants={panelVariants}
              initial="closed"
              animate="open"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="ll-ham-close"
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
              >
                <span />
                <span />
              </button>

              <ul className="ll-ham-list" role="list">
                {navLinks.map((link, i) => (
                  <motion.li
                    key={link.href}
                    custom={i}
                    variants={linkVariants}
                    initial="closed"
                    animate="open"
                  >
                    <Link
                      href={link.href}
                      className={`ll-ham-link${isActive(link.href) ? ' is-active' : ''}`}
                      onClick={() => setOpen(false)}
                    >
                      <span className="ll-ham-num ll-mono small-cap">{link.sub}</span>
                      <span className="ll-ham-label ll-serif">{link.label}</span>
                      <span className="ll-ham-arrow ll-mono">↗</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <motion.div
                className="ll-ham-foot"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.45, duration: 0.4 } }}
              >
                <div className="ll-ham-rule" />
                <Eyebrow>São Paulo · Brasil · 2026</Eyebrow>
                <a href="mailto:lucas@lobeu.studio" className="ll-sweep ll-mono small-cap">
                  lucas@lobeu.studio
                </a>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
