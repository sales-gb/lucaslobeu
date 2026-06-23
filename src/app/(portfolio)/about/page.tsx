import { getDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import Reveal from '@/components/ui/reveal';
import ImageBlock from '@/components/ui/image-block';
import type { AboutContent } from '@/lib/db/schema';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre — Lucas Lobeu',
  description: 'Diretor audiovisual e fotógrafo baseado em São Paulo.',
};

async function getAbout(): Promise<AboutContent | null> {
  try {
    const db = getDb();
    const [row] = await db.select().from(schema.aboutContent).where(eq(schema.aboutContent.id, 1)).limit(1);
    return row ?? null;
  } catch {
    return null;
  }
}

const DEFAULT_INTRO = 'Acredito que a fotografia e o cinema compartilham um segredo: a melhor imagem é sempre aquela que o espectador completa.';
const DEFAULT_CLIENTS = ['Natura', 'Itaú', 'Volkswagen', 'Havaianas', 'Heineken', 'Ambev', 'O Boticário', 'Claro'];
const DEFAULT_RECOGNITION: [string, string][] = [
  ['2024', 'Melhor Direção — Festival ABC'],
  ['2023', 'Finalista — Cannes Lions'],
  ['2022', 'Prêmio Caboré — Categoria Digital'],
  ['2021', 'Destaque — Anuário do Clube de Criação'],
];
const DEFAULT_TRAJECTORY: [string, string][] = [
  ['2019', 'Início como assistente de câmera em São Paulo'],
  ['2020', 'Primeiros trabalhos autorais, pandemia e reinvenção'],
  ['2021', 'Primeiro projeto internacional — Lisboa'],
  ['2023', 'Estúdio próprio consolidado'],
  ['2026', 'Presente'],
];
const DEFAULT_NUMBERS: [string, string][] = [
  ['72', 'Projetos'],
  ['08', 'Países'],
  ['3—4', 'Projetos por trimestre'],
];

export default async function AboutPage() {
  const about = await getAbout();

  const intro = about?.intro || DEFAULT_INTRO;
  const bodyParagraphs: string[] = (() => {
    try { return JSON.parse(about?.body ?? '[]') as string[]; } catch { return []; }
  })();
  const clients: string[] = (() => {
    try { return JSON.parse(about?.selectedClients ?? '[]') as string[]; } catch { return DEFAULT_CLIENTS; }
  })();
  const recognition: [string, string][] = (() => {
    try { return JSON.parse(about?.recognition ?? '[]') as [string, string][]; } catch { return DEFAULT_RECOGNITION; }
  })();
  const trajectory: [string, string][] = (() => {
    try { return JSON.parse(about?.trajectory ?? '[]') as [string, string][]; } catch { return DEFAULT_TRAJECTORY; }
  })();
  const numbers: [string, string][] = (() => {
    try { return JSON.parse(about?.numbers ?? '[]') as [string, string][]; } catch { return DEFAULT_NUMBERS; }
  })();

  const displayClients = clients.length > 0 ? clients : DEFAULT_CLIENTS;
  const displayRecognition = recognition.length > 0 ? recognition : DEFAULT_RECOGNITION;
  const displayTrajectory = trajectory.length > 0 ? trajectory : DEFAULT_TRAJECTORY;
  const displayNumbers = numbers.length > 0 ? numbers : DEFAULT_NUMBERS;
  const portraitUrl = about?.portraitImageUrl || '';

  return (
    <>
      {/* ── Header ─────────────────────────────────────── */}
      <div className="ll-about-header">
        <Reveal y={20}>
          <span className="ll-eyebrow">Sobre o estúdio</span>
        </Reveal>
        <div className="ll-about-display">
          <div className="ll-about-meta">
            <span className="ll-mono small-cap">Lucas Lobeu</span>
            <span className="ll-about-meta-sep ll-mono">/</span>
            <span className="ll-mono small-cap muted">Direção · Foto · Social</span>
            <span className="ll-about-meta-sep ll-mono">/</span>
            <span className="ll-mono small-cap muted">São Paulo, BR</span>
          </div>
          <Reveal y={40} delay={60}>
            <h1 className="ll-about-title">Sobre</h1>
          </Reveal>
        </div>
      </div>

      {/* ── Intro + portrait ───────────────────────────── */}
      <div className="ll-section" style={{ paddingTop: 0 }}>
        <div className="ll-about-intro">
          <div className="ll-about-portrait">
            {portraitUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={portraitUrl}
                alt="Lucas Lobeu"
                style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: 2 }}
              />
            ) : (
              <ImageBlock tone="mid" ratio="3/4" />
            )}
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="ll-eyebrow">Lucas Lobeu</span>
              <span className="muted" style={{ fontFamily: 'var(--sans)', fontSize: 14 }}>
                São Paulo, Brasil · 2019—
              </span>
            </div>
          </div>

          <div className="ll-about-intro-body">
            <Reveal y={20}>
              <p className="ll-about-lede">{intro}</p>
            </Reveal>

            {bodyParagraphs.map((para, i) => (
              <Reveal key={i} y={16} delay={i * 60}>
                <p className="ll-body">{para}</p>
              </Reveal>
            ))}

            {bodyParagraphs.length === 0 && (
              <>
                <Reveal y={16} delay={60}>
                  <p className="ll-body">
                    Fundei o estúdio em 2019 depois de alguns anos como assistente em sets de publicidade. Desde então, construímos um portfólio que transita entre o cinema, a fotografia editorial e a produção nativa para social.
                  </p>
                </Reveal>
                <Reveal y={16} delay={120}>
                  <p className="ll-body">
                    O que nos diferencia não é a câmera — é o método. Cada projeto começa por uma ideia que precisa existir independente do suporte. A técnica serve à narrativa, nunca o contrário.
                  </p>
                </Reveal>
              </>
            )}

            <Reveal y={10} delay={180}>
              <div style={{ display: 'flex', gap: 32, paddingTop: 8 }}>
                {displayNumbers.map(([val, label]) => (
                  <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontFamily: 'var(--serif)', fontSize: 48, fontWeight: 300, lineHeight: 1 }}>{val}</span>
                    <span className="ll-eyebrow">{label}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* ── Trajectory ─────────────────────────────────── */}
      <div className="ll-section" style={{ borderTop: '.5px solid var(--rule)' }}>
        <Reveal y={20}>
          <div className="ll-section-head">
            <h2 className="ll-section-title ll-section-title--sm">Trajetória</h2>
          </div>
        </Reveal>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {displayTrajectory.map(([year, text], i) => (
            <Reveal key={year} y={16} delay={i * 50}>
              <div className="ll-about-recognition-row">
                <span className="ll-mono small-cap" style={{ fontSize: 13, color: 'var(--muted)' }}>{year}</span>
                <span style={{ fontFamily: 'var(--sans)', fontSize: 18, fontWeight: 300 }}>{text}</span>
                <div className="ll-about-recognition-dot" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── Selected Clients ───────────────────────────── */}
      <div className="ll-section" style={{ borderTop: '.5px solid var(--rule)' }}>
        <Reveal y={20}>
          <div className="ll-about-clients-head">
            <span className="ll-eyebrow">Clientes selecionados</span>
            <h2 className="ll-section-title ll-section-title--sm">Marcas com quem trabalhamos</h2>
          </div>
        </Reveal>
        <div className="ll-about-clients-grid">
          {displayClients.map((client, i) => (
            <Reveal key={client} y={12} delay={i * 30}>
              <div className="ll-about-client-cell">
                <span className="ll-mono muted" style={{ fontSize: 10 }}>{String(i + 1).padStart(2, '0')}</span>
                <span className="ll-about-client-name">{client}</span>
                <span className="ll-about-client-arrow">↗</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── Recognition ────────────────────────────────── */}
      <div className="ll-section" style={{ borderTop: '.5px solid var(--rule)' }}>
        <Reveal y={20}>
          <div className="ll-about-recognition-head">
            <span className="ll-eyebrow">Reconhecimento</span>
            <h2 className="ll-section-title ll-section-title--sm">Prêmios e destaques</h2>
          </div>
        </Reveal>
        <div className="ll-about-recognition-list">
          {displayRecognition.map(([year, text], i) => (
            <Reveal key={`${year}-${i}`} y={12} delay={i * 40}>
              <div className="ll-about-recognition-row">
                <span className="ll-mono small-cap" style={{ fontSize: 13 }}>{year}</span>
                <span>{text}</span>
                <div className="ll-about-recognition-dot" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── CTA ────────────────────────────────────────── */}
      <div className="ll-section" style={{ borderTop: '.5px solid var(--rule)' }}>
        <div className="ll-about-cta">
          <Reveal y={30}>
            <p className="ll-body ll-body--large" style={{ maxWidth: 600 }}>
              {about?.contactBlurb || 'O estúdio aceita três a quatro projetos por trimestre. Se o seu projeto faz sentido, vamos conversar.'}
            </p>
          </Reveal>
          <Reveal y={10} delay={80}>
            <Link href="/contact" className="ll-link-rule">
              Iniciar conversa <span>→</span>
            </Link>
          </Reveal>
        </div>
      </div>
    </>
  );
}
