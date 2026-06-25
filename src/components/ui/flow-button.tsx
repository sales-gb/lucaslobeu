'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

/**
 * Botão "flow" — pílula com seta dupla + círculo que preenche no hover.
 * Tematizado via CSS vars (--btn-*), revertidas em .surface-light, então o
 * mesmo componente funciona sobre fundo escuro (padrão) e nas seções brancas.
 *
 * Polimórfico: vira <Link> para rota interna, <a> para link externo
 * (http/mailto/tel) e <button> quando não há href (ex.: submit de formulário).
 */
const ROOT =
  'group relative inline-flex items-center justify-center gap-1 overflow-hidden rounded-[100px] border-[1.5px] border-[var(--btn-border)] bg-transparent px-8 py-3 text-sm font-medium text-[var(--btn-fg)] no-underline cursor-pointer transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:rounded-[12px] hover:border-transparent active:scale-[0.95] disabled:pointer-events-none disabled:opacity-50'

function FlowInner({ text }: { text: string }) {
  return (
    <>
      {/* Seta esquerda (entra no hover) */}
      <ArrowRight
        aria-hidden
        className="absolute left-[-25%] z-[9] h-4 w-4 fill-none stroke-[var(--btn-fg)] transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:left-4 group-hover:stroke-[var(--btn-fg-hover)]"
      />

      {/* Texto — cor controlada por group-hover (o hover: no root perde do base) */}
      <span className="relative z-[1] -translate-x-3 text-[var(--btn-fg)] transition-all duration-[800ms] ease-out group-hover:translate-x-3 group-hover:text-[var(--btn-fg-hover)]">
        {text}
      </span>

      {/* Círculo de preenchimento */}
      <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--btn-fill)] opacity-0 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:h-[220px] group-hover:w-[220px] group-hover:opacity-100" />

      {/* Seta direita (sai no hover) */}
      <ArrowRight
        aria-hidden
        className="absolute right-4 z-[9] h-4 w-4 fill-none stroke-[var(--btn-fg)] transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:right-[-25%] group-hover:stroke-[var(--btn-fg-hover)]"
      />
    </>
  )
}

type FlowButtonProps = {
  text: string
  href?: string
  type?: 'button' | 'submit' | 'reset'
  onClick?: React.MouseEventHandler
  disabled?: boolean
  target?: React.HTMLAttributeAnchorTarget
  rel?: string
  className?: string
  'aria-label'?: string
}

export function FlowButton({
  text,
  href,
  type = 'button',
  onClick,
  disabled,
  target,
  rel,
  className,
  ...rest
}: FlowButtonProps) {
  const classes = cn(ROOT, className)

  if (href) {
    const isExternal = /^(https?:|mailto:|tel:)/.test(href)
    if (isExternal) {
      return (
        <a
          href={href}
          target={target}
          rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)}
          onClick={onClick}
          className={classes}
          {...rest}
        >
          <FlowInner text={text} />
        </a>
      )
    }
    return (
      <Link href={href} onClick={onClick} className={classes} {...rest}>
        <FlowInner text={text} />
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes} {...rest}>
      <FlowInner text={text} />
    </button>
  )
}
