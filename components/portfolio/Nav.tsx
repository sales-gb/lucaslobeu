'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const BrandMark = () => (
  <Link href="/" className="ll-brandmark">
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
  { href: '/journal', label: 'Diário', sub: '03' },
  { href: '/contact', label: 'Contato', sub: '04' },
]

const overlayVariants = {
  closed: { opacity: 0, pointerEvents: 'none' as const },
  open: { opacity: 1, pointerEvents: 'auto' as const },
}

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
  const [scrolled, setScrolled] = useState(false)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Close on route change
  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <>
      <nav className={`ll-nav${scrolled ? ' is-scrolled' : ''}`}>
        <div className="ll-nav--top">
          <BrandMark />

          <button
            className={`ll-ham-trigger${open ? ' is-open' : ''}`}
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
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            className="ll-ham-overlay is-open"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
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
              {/* Close button inside panel */}
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
                <span className="ll-eyebrow">São Paulo · Brasil · 2026</span>
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
