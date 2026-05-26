'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence, type MotionValue } from 'framer-motion'
import Reveal from './Reveal'
import TextReveal from './TextReveal'
import ImageBlock from './ImageBlock'
import Marquee from './Marquee'
import type { Project } from '@/lib/db/schema'

interface Props {
  projects: Project[]
  manifestoText: string
  ctaHeadline: string
  ctaSub: string
}

// ─── Ease tokens ─────────────────────────────────────────────
const EASE_OUT = [0.22, 1, 0.36, 1] as [number, number, number, number]

// ─── HERO ─────────────────────────────────────────────────────
function HeroSection() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -80])

  return (
    <section className="ll-h3-hero" ref={ref}>
      <div className="ll-h3-hero-top">
        <span className="ll-eyebrow">São Paulo · Brasil</span>
        <span className="ll-eyebrow">Estúdio · 2019—</span>
      </div>

      <motion.div className="ll-h3-hero-title-block" style={{ y: titleY }}>
        <TextReveal
          text="Lucas"
          as="h1"
          className="ll-h3-hero-name ll-h3-hero-name--first"
          delay={80}
          stagger={0.06}
          splitBy="char"
        />
        <TextReveal
          text="Lobeu."
          as="h1"
          className="ll-h3-hero-name ll-h3-hero-name--last"
          delay={240}
          stagger={0.06}
          splitBy="char"
        />
      </motion.div>

      <div className="ll-h3-hero-bottom">
        <Reveal y={12} delay={600}>
          <p className="ll-h3-hero-desc">
            Diretor audiovisual e fotógrafo. Narrativas visuais que movem marcas, produtos e pessoas.
          </p>
        </Reveal>
        <Reveal y={8} delay={720}>
          <div className="ll-h3-hero-actions">
            <Link href="/projects" className="ll-btn-outline">Ver projetos</Link>
            <Link href="/contact" className="ll-link-rule">Falar sobre um projeto <span>→</span></Link>
          </div>
        </Reveal>
      </div>

      {/* Scroll line */}
      <motion.div
        className="ll-h3-scroll-line"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 1, duration: 1.4, ease: EASE_OUT }}
      />

      {/* Rule bottom */}
      <div className="ll-h3-hero-rule" />
    </section>
  )
}

// ─── ABOUT ────────────────────────────────────────────────────
function AboutWord({ word, index, total, scrollYProgress }: {
  word: string; index: number; total: number; scrollYProgress: MotionValue<number>
}) {
  const pct = index / total
  const opacity = useTransform(scrollYProgress, [Math.max(0, pct - 0.1), Math.min(1, pct + 0.1)], [0, 1])
  return <motion.span className="ll-h3-about-word" style={{ opacity }}>{word}{' '}</motion.span>
}

function AboutSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.95', 'end 0.25'] })

  // Text reveal word by word
  const words = 'O estúdio nasceu da crença de que toda boa imagem começa por uma ideia boa o suficiente para sobreviver sem câmera. Construímos projetos para marcas que entendem a diferença entre conteúdo e comunicação.'.split(' ')

  return (
    <section className="ll-h3-about">
      <div className="ll-h3-about-grid" ref={ref}>

        {/* Big statement text — cols 1-2, rows 1-3 */}
        <div className="ll-h3-about-text">
          <Reveal y={0} delay={0}>
            <div className="ll-section-marker" style={{ marginBottom: 32 }}>
              <span className="ll-accent-dot" />
              <span className="ll-eyebrow">Sobre o estúdio</span>
            </div>
          </Reveal>
          <p className="ll-h3-about-statement">
            {words.map((word, i) => (
              <AboutWord key={i} word={word} index={i} total={words.length} scrollYProgress={scrollYProgress} />
            ))}
          </p>
          <Reveal y={16} delay={200}>
            <Link href="/about" className="ll-link-rule" style={{ marginTop: 40, display: 'inline-flex' }}>
              Conhecer o estúdio <span>→</span>
            </Link>
          </Reveal>
        </div>

        {/* Small portrait — col 4 row 1 */}
        <div className="ll-h3-about-portrait-sm">
          <Reveal y={20}>
            <ImageBlock tone="mid" ratio="4/5" style={{ height: '100%' }} />
          </Reveal>
        </div>

        {/* Portrait label — col 4 row 2 */}
        <div className="ll-h3-about-portrait-label">
          <Reveal y={12} delay={80}>
            <span className="ll-eyebrow" style={{ display: 'block', marginBottom: 6 }}>Lucas Lobeu</span>
            <span className="ll-mono small-cap muted" style={{ fontSize: 10 }}>São Paulo · Diretor & Fotógrafo</span>
          </Reveal>
        </div>

        {/* Main portrait — cols 1-2 rows 4-6 */}
        <div className="ll-h3-about-portrait-main">
          <Reveal y={32}>
            <ImageBlock tone="dark" ratio="4/5" style={{ height: '100%' }} />
          </Reveal>
        </div>

        {/* Image caption — cols 3-4 rows 4-5 */}
        <div className="ll-h3-about-portrait-caption">
          <Reveal y={16} delay={120}>
            <p className="ll-body" style={{ maxWidth: 320 }}>
              Em set, Amazônia — 2024. Produção de conteúdo para campanha de
              reflorestamento de marca global.
            </p>
            <div style={{ marginTop: 24 }}>
              <span className="ll-eyebrow">Dir. Lucas Lobeu · 2024</span>
            </div>
          </Reveal>
        </div>

      </div>
    </section>
  )
}

// ─── STATS ────────────────────────────────────────────────────
function StatsSection() {
  const STATS = [
    { val: '72+', label: 'Projetos realizados', col: 1 },
    { val: '8', label: 'Países atendidos', col: 2 },
    { val: '3–4', label: 'Projetos por trimestre', col: 3 },
    { val: '2019', label: 'Ano de fundação', col: 4 },
  ]

  return (
    <div className="ll-h3-stats">
      {STATS.map((s, i) => (
        <Reveal key={s.label} y={20} delay={i * 60}>
          <div className="ll-h3-stat">
            <span className="ll-h3-stat-val">{s.val}</span>
            <span className="ll-eyebrow">{s.label}</span>
          </div>
        </Reveal>
      ))}
    </div>
  )
}

// ─── HORIZONTAL PROJECTS ──────────────────────────────────────
function HorizontalProjects({ projects }: { projects: Project[] }) {
  const outerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [xRange, setXRange] = useState<[string, string]>(['0px', '0px'])

  useEffect(() => {
    const update = () => {
      const track = trackRef.current
      const container = containerRef.current
      if (!track || !container) return
      const diff = track.scrollWidth - container.clientWidth
      setXRange(['0px', diff > 0 ? `${-diff}px` : '0px'])
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [projects])

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ['start start', 'end start'],
  })

  const x = useTransform(scrollYProgress, [0, 1], xRange)
  const progressScaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

  const trackHeight = `${Math.max(projects.length * 30, 250)}vh`

  return (
    <div ref={outerRef} className="ll-hscroll" style={{ height: trackHeight }}>
      <div className="ll-hscroll-sticky" ref={containerRef}>
        <div className="ll-hscroll-header">
          <div>
            <Reveal y={0}>
              <div className="ll-section-marker" style={{ marginBottom: 16 }}>
                <span className="ll-accent-dot" />
                <span className="ll-eyebrow">Trabalhos</span>
              </div>
            </Reveal>
            <TextReveal
              text="Cada projeto, uma linguagem."
              as="h2"
              className="ll-hscroll-headline"
              stagger={0.03}
              delay={60}
            />
          </div>
          <Reveal y={12} delay={120}>
            <Link href="/projects" className="ll-link-rule">
              Ver todos <span>→</span>
            </Link>
          </Reveal>
        </div>

        <motion.div className="ll-hscroll-track" ref={trackRef} style={{ x }}>
          {projects.map((p, i) => (
            <Link
              key={p.id}
              href={`/projects/${p.slug}`}
              className="ll-hscroll-card"
            >
              <div className="ll-hscroll-card-img">
                <div>
                  <ImageBlock
                    tone={(p.coverTone as 'dark' | 'mid' | 'light') ?? 'mid'}
                    ratio="3/4"
                    style={{ height: '100%' }}
                  />
                </div>
              </div>
              <div className="ll-hscroll-card-meta">
                <span className="ll-hscroll-card-title">{p.title}</span>
                <span className="ll-eyebrow muted">{p.category} · {p.year}</span>
              </div>
            </Link>
          ))}
        </motion.div>

        <div className="ll-hscroll-progress">
          <span className="ll-mono small-cap muted" style={{ fontSize: 10 }}>
            {projects.length} projetos
          </span>
          <div className="ll-hscroll-progress-bar">
            <motion.div className="ll-hscroll-progress-fill" style={{ scaleX: progressScaleX }} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── SHOWCASE · scroll reveal ─────────────────────────────────
function ShowcaseLetter({ letter, index, scrollYProgress }: {
  letter: string; index: number; scrollYProgress: MotionValue<number>
}) {
  const opacity = useTransform(scrollYProgress, [index / 8 * 0.3, (index / 8 * 0.3) + 0.08], [0, 1])
  return <motion.span className="ll-h3-showcase-letter" style={{ opacity }}>{letter}</motion.span>
}

function ShowcaseSection({ projects }: { projects: Project[] }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })

  const letters = 'SHOWCASE'.split('')
  const wordOpacity = useTransform(scrollYProgress, [0, 0.35], [0, 1])
  const wordScale = useTransform(scrollYProgress, [0, 0.4], [0.92, 1])
  const wordY = useTransform(scrollYProgress, [0, 0.4], [40, 0])
  const wordExit = useTransform(scrollYProgress, [0.55, 0.75], [0, 1])
  const contentOpacity = useTransform(scrollYProgress, [0.55, 0.7], [0, 1])
  const contentY = useTransform(scrollYProgress, [0.55, 0.75], [48, 0])
  const showcaseBlur = useTransform(scrollYProgress, [0.5, 0.75], [0, 12])
  const wordWrapOpacity = useTransform(wordExit, [0, 1], [1, 0])
  const wordWrapFilter = useTransform(showcaseBlur, (v: number) => `blur(${v}px)`)

  // Big project + two below
  const [big, ...rest] = projects
  const proj1 = rest[0]
  const proj2 = rest[1]

  return (
    <div ref={sectionRef} className="ll-h3-showcase-track">
      <div className="ll-h3-showcase-sticky">
        {/* "SHOWCASE" text reveal */}
        <motion.div
          className="ll-h3-showcase-word-wrap"
          style={{ opacity: wordWrapOpacity, filter: wordWrapFilter }}
        >
          <motion.div className="ll-h3-showcase-word" style={{ opacity: wordOpacity, scale: wordScale, y: wordY }}>
            {letters.map((l, i) => (
              <ShowcaseLetter key={i} letter={l} index={i} scrollYProgress={scrollYProgress} />
            ))}
          </motion.div>
        </motion.div>

        {/* Projects content */}
        <motion.div
          className="ll-h3-showcase-content"
          style={{ opacity: contentOpacity, y: contentY }}
        >
          {/* Header */}
          <div className="ll-h3-showcase-header">
            <div className="ll-h3-showcase-header-left">
              <div className="ll-section-marker">
                <span className="ll-accent-dot" />
                <span className="ll-eyebrow">Trabalhos selecionados</span>
              </div>
              <TextReveal
                text="Projetos que definem o estúdio."
                as="h2"
                className="ll-h3-showcase-title"
                stagger={0.025}
              />
            </div>
            <div className="ll-h3-showcase-header-right">
              <p className="ll-body" style={{ maxWidth: 280 }}>
                Execução precisa. Design que realmente funciona para marcas que levam comunicação a sério.
              </p>
              <Link href="/projects" className="ll-link-rule" style={{ marginTop: 24, display: 'inline-flex' }}>
                Ver todos <span>→</span>
              </Link>
            </div>
          </div>

          {/* Big project */}
          {big && (
            <Reveal y={24}>
              <Link href={`/projects/${big.slug}`} className="ll-h3-proj-big">
                <div className="ll-h3-proj-big-image">
                  <ImageBlock tone={(big.coverTone as 'dark' | 'mid' | 'light') ?? 'mid'} ratio="21/9" style={{ height: '100%' }} />
                  <div className="ll-h3-proj-big-overlay" />
                  <div className="ll-h3-proj-big-meta">
                    <span className="ll-mono small-cap">{big.category} · {big.year}</span>
                    <h3 className="ll-h3-proj-big-title">{big.title}</h3>
                    <span className="ll-eyebrow">{big.client}</span>
                  </div>
                </div>
              </Link>
            </Reveal>
          )}

          {/* Two smaller projects */}
          <div className="ll-h3-proj-row">
            {proj1 && (
              <Reveal y={20} delay={0}>
                <Link href={`/projects/${proj1.slug}`} className="ll-h3-proj-sm ll-h3-proj-sm--left">
                  <div className="ll-h3-proj-sm-image">
                    <ImageBlock tone={(proj1.coverTone as 'dark' | 'mid' | 'light') ?? 'mid'} ratio="4/5" style={{ height: '100%' }} />
                    <div className="ll-h3-proj-sm-overlay" />
                  </div>
                  <div className="ll-h3-proj-sm-meta">
                    <span className="ll-eyebrow muted">{proj1.category} · {proj1.year}</span>
                    <h3 className="ll-h3-proj-sm-title">{proj1.title}</h3>
                    <span className="ll-mono small-cap muted" style={{ fontSize: 11 }}>{proj1.client}</span>
                  </div>
                </Link>
              </Reveal>
            )}
            {proj2 && (
              <Reveal y={20} delay={80}>
                <Link href={`/projects/${proj2.slug}`} className="ll-h3-proj-sm ll-h3-proj-sm--right">
                  <div className="ll-h3-proj-sm-image">
                    <ImageBlock tone={(proj2.coverTone as 'dark' | 'mid' | 'light') ?? 'mid'} ratio="3/4" style={{ height: '100%' }} />
                    <div className="ll-h3-proj-sm-overlay" />
                  </div>
                  <div className="ll-h3-proj-sm-meta">
                    <span className="ll-eyebrow muted">{proj2.category} · {proj2.year}</span>
                    <h3 className="ll-h3-proj-sm-title">{proj2.title}</h3>
                    <span className="ll-mono small-cap muted" style={{ fontSize: 11 }}>{proj2.client}</span>
                  </div>
                </Link>
              </Reveal>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ─── TESTIMONIALS ─────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: 'Lucas tem uma sensibilidade rara para transformar briefings complexos em imagens que realmente comunicam. O resultado superou todas as nossas expectativas.',
    name: 'Ana Cavalcanti',
    role: 'Head de Marketing',
    company: 'Studio Branding Co.',
  },
  {
    quote: 'Trabalhar com o estúdio foi diferente de tudo que já fizemos. A metodologia editorial deles garante que cada frame tenha propósito.',
    name: 'Rafael Moura',
    role: 'Diretor Criativo',
    company: 'Agência Forma',
  },
  {
    quote: 'Entregaram antes do prazo, dentro do budget, e o conteúdo ainda gera engajamento seis meses depois da campanha. Parceria contínua garantida.',
    name: 'Beatriz Lemos',
    role: 'CEO',
    company: 'Marca Premium Ltda.',
  },
]

function TestimonialsSection() {
  const [active, setActive] = useState(0)

  return (
    <section className="ll-h3-testimonials">
      <div className="ll-h3-testimonials-inner">
        <Reveal y={0}>
          <div className="ll-section-marker" style={{ marginBottom: 48 }}>
            <span className="ll-accent-dot" />
            <span className="ll-eyebrow">O que dizem</span>
          </div>
        </Reveal>

        <div className="ll-h3-test-layout">
          {/* Quote display */}
          <div className="ll-h3-test-quote-wrap">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
                className="ll-h3-test-quote"
              >
                <span className="ll-h3-test-mark">"</span>
                <blockquote className="ll-h3-test-text">{TESTIMONIALS[active].quote}</blockquote>
                <div className="ll-h3-test-author">
                  <span className="ll-h3-test-name">{TESTIMONIALS[active].name}</span>
                  <span className="ll-eyebrow muted">{TESTIMONIALS[active].role} · {TESTIMONIALS[active].company}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Selector */}
          <div className="ll-h3-test-selector">
            {TESTIMONIALS.map((t, i) => (
              <button
                key={i}
                className={`ll-h3-test-item${active === i ? ' is-active' : ''}`}
                onClick={() => setActive(i)}
              >
                <motion.div
                  className="ll-h3-test-item-line"
                  animate={{ scaleX: active === i ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: EASE_OUT }}
                />
                <div className="ll-h3-test-item-info">
                  <span className="ll-h3-test-item-name">{t.name}</span>
                  <span className="ll-eyebrow muted">{t.company}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: 'Como funciona o processo de contratação?',
    a: 'Começamos com uma conversa de descoberta de 30 minutos para entender seu projeto. Em seguida, enviamos uma proposta detalhada com escopo, timeline e investimento. Após aprovação, iniciamos com o briefing editorial.',
  },
  {
    q: 'Qual o prazo médio de um projeto?',
    a: 'Projetos de foto editorial levam entre 2 e 4 semanas da aprovação ao entregável final. Produções audiovisuais variam de 4 a 10 semanas, dependendo da complexidade.',
  },
  {
    q: 'O estúdio trabalha com clientes fora de São Paulo?',
    a: 'Sim. Já produzimos em 8 países e atendemos clientes remotamente em todo o Brasil. Custos de deslocamento são incluídos no orçamento quando aplicável.',
  },
  {
    q: 'É possível contratar apenas fotografia ou apenas audiovisual?',
    a: 'Sim. Trabalhamos tanto com projetos isolados quanto com contratos mensais de produção de conteúdo. O escopo é sempre definido conforme sua necessidade.',
  },
  {
    q: 'Como vocês garantem que o resultado vai refletir nossa marca?',
    a: 'A metodologia editorial começa por imersão na marca antes de qualquer câmera ser acionada. Desenvolvemos um moodboard e brief visual aprovado por você antes do início da produção.',
  },
]

function FaqItem({ item, index }: { item: typeof FAQ_ITEMS[0]; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="ll-h3-faq-item">
      <button className="ll-h3-faq-trigger" onClick={() => setOpen(!open)}>
        <span className="ll-mono small-cap muted" style={{ fontSize: 10 }}>{String(index + 1).padStart(2, '0')}</span>
        <span className="ll-h3-faq-question">{item.q}</span>
        <motion.span
          className="ll-h3-faq-icon"
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
        >+</motion.span>
      </button>

      {/* Grid row trick — animates height without page jump */}
      <div className={`ll-h3-faq-body${open ? ' is-open' : ''}`}>
        <div className="ll-h3-faq-answer">
          <p className="ll-body" style={{ padding: '16px 0 24px', maxWidth: 640 }}>{item.a}</p>
        </div>
      </div>
    </div>
  )
}

function FaqSection() {
  return (
    <section className="ll-h3-faq">
      <div className="ll-h3-faq-inner">
        <div className="ll-h3-faq-head">
          <Reveal y={0}>
            <div className="ll-section-marker" style={{ marginBottom: 16 }}>
              <span className="ll-accent-dot" />
              <span className="ll-eyebrow">Perguntas frequentes</span>
            </div>
          </Reveal>
          <Reveal y={24} delay={60}>
            <TextReveal text="Tudo o que você precisa saber." as="h2" className="ll-h3-faq-title" stagger={0.03} />
          </Reveal>
        </div>

        <div className="ll-h3-faq-list">
          {FAQ_ITEMS.map((item, i) => (
            <Reveal key={i} y={12} delay={i * 40}>
              <FaqItem item={item} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CLIENTS ──────────────────────────────────────────────────
const CLIENTS = [
  { name: 'Studio Branding Co.', category: 'Branding' },
  { name: 'Agência Forma', category: 'Publicidade' },
  { name: 'Marca Premium', category: 'Moda' },
  { name: 'Coletivo Visual', category: 'Arte' },
  { name: 'Grupo Mídia SP', category: 'Entretenimento' },
  { name: 'Tech Forward', category: 'Tecnologia' },
]

function ClientRow({ client, index }: { client: typeof CLIENTS[0]; index: number }) {
  const [hovered, setHovered] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const rowRef = useRef<HTMLDivElement>(null)

  const handleMove = (e: React.MouseEvent) => {
    const rect = rowRef.current?.getBoundingClientRect()
    if (!rect) return
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <Reveal y={16} delay={index * 50}>
      <div
        ref={rowRef}
        className="ll-h3-client-row"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseMove={handleMove}
      >
        <span className="ll-mono small-cap muted" style={{ fontSize: 10 }}>{String(index + 1).padStart(2, '0')}</span>
        <span className="ll-h3-client-name">{client.name}</span>
        <span className="ll-eyebrow muted">{client.category}</span>
        <AnimatePresence>
          {hovered && (
            <motion.div
              className="ll-h3-client-logo"
              style={{ left: pos.x, top: pos.y }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.18, ease: EASE_OUT }}
            >
              <ImageBlock tone="mid" ratio="16/9" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Reveal>
  )
}

function ClientsSection() {
  return (
    <section className="ll-h3-clients">
      <div className="ll-h3-clients-inner">
        <div className="ll-h3-clients-head">
          <Reveal y={0}>
            <div className="ll-section-marker">
              <span className="ll-accent-dot" />
              <span className="ll-eyebrow">Clientes selecionados</span>
            </div>
          </Reveal>
        </div>

        <div className="ll-h3-clients-list">
          {CLIENTS.map((client, i) => (
            <ClientRow key={i} client={client} index={i} />
          ))}
        </div>

        <Reveal y={16} delay={200}>
          <div className="ll-h3-clients-cta">
            <div>
              <p className="ll-body" style={{ maxWidth: 400 }}>
                Disponível para novos projetos. Conversas abertas para início imediato.
              </p>
            </div>
            <Link href="/contact" className="ll-btn-outline ll-btn-outline--dark">
              Book a call →
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ─── JOURNAL · sticky scroll ──────────────────────────────────
type JournalEntry = { title: string; date: string; readTime: string; excerpt: string; tone: 'light' | 'mid' | 'dark'; slug: string }

const JOURNAL_ENTRIES = [
  { title: 'Sobre o caderno que precede a câmera', date: 'Mar 2026', readTime: '4 min', excerpt: 'Toda imagem boa tem um peso antes de ter uma forma. O planejamento editorial define tudo.', tone: 'light' as const, slug: 'sobre-o-caderno' },
  { title: 'O que a luz natural de inverno ensina', date: 'Fev 2026', readTime: '3 min', excerpt: 'A qualidade da luz muda a percepção do produto. Fotografar no inverno paulistano tem nuances que nenhum estúdio replica.', tone: 'mid' as const, slug: 'luz-natural-inverno' },
  { title: 'Por que todo projeto começa por um briefing editorial', date: 'Jan 2026', readTime: '6 min', excerpt: 'Antes de qualquer câmera ligada, o projeto precisa existir em palavras. A metodologia que usamos para cada cliente.', tone: 'dark' as const, slug: 'metodo-editorial' },
]

function JournalTextItem({ entry, index, total, scrollYProgress }: {
  entry: JournalEntry; index: number; total: number; scrollYProgress: MotionValue<number>
}) {
  const start = index / total
  const end = (index + 1) / total
  const opacity = useTransform(scrollYProgress, [Math.max(0, start - 0.05), start + 0.05, end - 0.05, Math.min(1, end + 0.05)], [0, 1, 1, 0])
  const y = useTransform(scrollYProgress, [start, start + 0.1, end - 0.1, end], [24, 0, 0, -24])
  return (
    <motion.div className="ll-h3-journal-text-item" style={{ opacity, y }}>
      <div className="ll-h3-journal-entry-meta">
        <span className="ll-mono small-cap muted" style={{ fontSize: 10 }}>{String(index + 1).padStart(2, '0')}</span>
        <span className="ll-eyebrow muted">{entry.date} · {entry.readTime} leitura</span>
      </div>
      <h3 className="ll-h3-journal-entry-title">{entry.title}</h3>
      <p className="ll-body ll-h3-journal-entry-excerpt">{entry.excerpt}</p>
      <Link href={`/journal/${entry.slug}`} className="ll-link-rule" style={{ marginTop: 24, display: 'inline-flex' }}>
        Ler entrada <span>→</span>
      </Link>
    </motion.div>
  )
}

function JournalImageItem({ entry, index, total, scrollYProgress }: {
  entry: JournalEntry; index: number; total: number; scrollYProgress: MotionValue<number>
}) {
  const start = index / total
  const end = (index + 1) / total
  const opacity = useTransform(scrollYProgress, [Math.max(0, start - 0.04), start + 0.06, end - 0.06, Math.min(1, end + 0.04)], [0, 1, 1, 0])
  const y = useTransform(scrollYProgress, [end - 0.08, end + 0.08], ['0%', '-8%'])
  return (
    <motion.div className="ll-h3-journal-image-item" style={{ opacity, y }}>
      <div className="ll-h3-journal-image-inner">
        <ImageBlock tone={entry.tone} ratio="3/4" />
      </div>
    </motion.div>
  )
}

function JournalSection() {
  const trackRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] })
  const total = JOURNAL_ENTRIES.length

  return (
    <section className="ll-h3-journal-section">
      <div className="ll-h3-journal-header">
        <Reveal y={0}>
          <div className="ll-section-marker">
            <span className="ll-accent-dot" />
            <span className="ll-eyebrow">Diário · Processo</span>
          </div>
        </Reveal>
        <TextReveal text="Bastidores." as="h2" className="ll-h3-journal-headline" stagger={0.06} delay={60} />
      </div>

      {/* Sticky scroll track */}
      <div ref={trackRef} className="ll-h3-journal-track">
        <div className="ll-h3-journal-sticky">

          {/* Left: text entries */}
          <div className="ll-h3-journal-texts">
            {JOURNAL_ENTRIES.map((entry, i) => (
              <JournalTextItem key={i} entry={entry} index={i} total={total} scrollYProgress={scrollYProgress} />
            ))}
          </div>

          {/* Right: images */}
          <div className="ll-h3-journal-images">
            {JOURNAL_ENTRIES.map((entry, i) => (
              <JournalImageItem key={i} entry={entry} index={i} total={total} scrollYProgress={scrollYProgress} />
            ))}
          </div>
        </div>
      </div>

      <Reveal y={12}>
        <div className="ll-h3-journal-footer">
          <Link href="/journal" className="ll-link-rule">
            Ler todos os diários <span>→</span>
          </Link>
        </div>
      </Reveal>
    </section>
  )
}

// ─── MARQUEE ──────────────────────────────────────────────────
function MarqueeSection() {
  return (
    <div className="ll-h3-marquee">
      <Marquee speed={40}>
        {['LOBEU', '·', 'DIREÇÃO', '·', 'FOTOGRAFIA', '·', 'SP', '·', 'LOBEU', '·', '2019—', '·'].map((w, i) => (
          <span key={i} className={w === '·' ? 'll-marquee-sep' : 'll-marquee-word'}>{w}</span>
        ))}
      </Marquee>
    </div>
  )
}

// ─── CTA ──────────────────────────────────────────────────────
function CtaSection({ headline, sub }: { headline: string; sub: string }) {
  return (
    <section className="ll-h3-cta">
      <div className="ll-h3-cta-inner">
        <div className="ll-section-marker ll-section-marker--light">
          <span className="ll-accent-dot" />
          <span className="ll-eyebrow" style={{ color: 'rgba(244,241,234,.5)' }}>Próximo passo</span>
        </div>
        <TextReveal text={headline} as="h2" className="ll-h3-cta-title" stagger={0.055} delay={60} />
        <Reveal y={20} delay={200}>
          <p className="ll-h3-cta-sub">{sub}</p>
        </Reveal>
        <Reveal y={16} delay={300}>
          <div className="ll-h3-cta-actions">
            <a href="mailto:lucas@lobeu.studio" className="ll-btn-light">
              lucas@lobeu.studio
            </a>
            <Link href="/contact" className="ll-btn-ghost-light">
              Ver disponibilidade →
            </Link>
          </div>
        </Reveal>
      </div>

      <span className="ll-crosshair ll-crosshair--tl" aria-hidden />
      <span className="ll-crosshair ll-crosshair--tr" aria-hidden />
      <span className="ll-crosshair ll-crosshair--bl" aria-hidden />
      <span className="ll-crosshair ll-crosshair--br" aria-hidden />
    </section>
  )
}

// ─── ROOT ─────────────────────────────────────────────────────
export default function HomeClient({ projects, manifestoText, ctaHeadline, ctaSub }: Props) {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <StatsSection />
      <HorizontalProjects projects={projects} />
      <ShowcaseSection projects={projects} />
      <TestimonialsSection />
      <FaqSection />
      <ClientsSection />
      <JournalSection />
      <MarqueeSection />
      <CtaSection headline={ctaHeadline} sub={ctaSub} />
    </>
  )
}
