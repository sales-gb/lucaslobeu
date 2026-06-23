import { getDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import Reveal from '@/components/ui/reveal';
import ImageBlock from '@/components/ui/image-block';
import { Eyebrow } from '@/components/ui/eyebrow';
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

// Seções da página (era .ll-section) + linhas das listas (recognition/trajectory).
const SECTION = 'px-[var(--page-x)] py-[var(--section-y)]';
const ROW =
  'group relative grid grid-cols-[80px_1fr_12px] items-center gap-8 border-b-[0.5px] border-rule py-7 font-serif text-[26px] font-normal transition-[padding] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:pl-3';
const DOT =
  'size-1.5 rounded-full bg-rule transition-[background,transform] duration-[400ms] group-hover:scale-[1.6] group-hover:bg-accent';

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
      <div className="px-[var(--page-x)] pt-[120px]">
        <Reveal y={20}>
          <Eyebrow>Sobre o estúdio</Eyebrow>
        </Reveal>
        <div className="flex flex-col gap-7 py-[60px]">
          <div className="flex flex-wrap items-center gap-[14px]">
            <span className="ll-mono small-cap">Lucas Lobeu</span>
            <span className="ll-mono opacity-35">/</span>
            <span className="ll-mono small-cap muted">Direção · Foto · Social</span>
            <span className="ll-mono opacity-35">/</span>
            <span className="ll-mono small-cap muted">São Paulo, BR</span>
          </div>
          <Reveal y={40} delay={60}>
            <h1 className="font-serif font-light text-[clamp(80px,12vw,192px)] leading-[0.9] tracking-[-0.025em]">
              Sobre
            </h1>
          </Reveal>
        </div>
      </div>

      {/* ── Intro + portrait ───────────────────────────── */}
      <div className={`${SECTION} pt-0`}>
        <div className="grid grid-cols-[1fr_1.4fr] items-start gap-20 max-lg:grid-cols-1 max-lg:gap-10">
          <div className="sticky top-[120px]">
            {portraitUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={portraitUrl}
                alt="Lucas Lobeu"
                className="aspect-[3/4] w-full rounded-[2px] object-cover"
              />
            ) : (
              <ImageBlock tone="mid" ratio="3/4" />
            )}
            <div className="mt-4 flex flex-col gap-1.5">
              <Eyebrow>Lucas Lobeu</Eyebrow>
              <span className="font-sans text-[14px] text-muted">
                São Paulo, Brasil · 2019—
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-7">
            <Reveal y={20}>
              <p className="font-sans font-light text-[clamp(22px,2.2vw,30px)] leading-[1.4]">
                {intro}
              </p>
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
              <div className="flex gap-8 pt-2">
                {displayNumbers.map(([val, label]) => (
                  <div key={label} className="flex flex-col gap-1">
                    <span className="font-serif text-[48px] font-light leading-none">{val}</span>
                    <Eyebrow>{label}</Eyebrow>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* ── Trajectory ─────────────────────────────────── */}
      <div className={`${SECTION} border-t-[0.5px] border-rule`}>
        <Reveal y={20}>
          <div className="ll-section-head">
            <h2 className="ll-section-title ll-section-title--sm">Trajetória</h2>
          </div>
        </Reveal>
        <div className="flex flex-col">
          {displayTrajectory.map(([year, text], i) => (
            <Reveal key={year} y={16} delay={i * 50}>
              <div className={ROW}>
                <span className="ll-mono small-cap text-[13px] text-muted">{year}</span>
                <span className="font-sans text-[18px] font-light">{text}</span>
                <div className={DOT} />
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── Selected Clients ───────────────────────────── */}
      <div className={`${SECTION} border-t-[0.5px] border-rule`}>
        <Reveal y={20}>
          <div className="mb-12 flex flex-col gap-2">
            <Eyebrow>Clientes selecionados</Eyebrow>
            <h2 className="ll-section-title ll-section-title--sm">Marcas com quem trabalhamos</h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-4 gap-x-12 gap-y-8 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {displayClients.map((client, i) => (
            <Reveal key={client} y={12} delay={i * 30}>
              <div className="group relative grid cursor-default grid-cols-[28px_1fr_16px] items-baseline gap-[14px] border-b-[0.5px] border-rule py-4 transition-[padding] duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:pl-2 after:absolute after:inset-x-0 after:-bottom-px after:h-[0.5px] after:origin-right after:scale-x-0 after:bg-ink after:transition-transform hover:after:animate-[ll-link-sweep_0.9s_cubic-bezier(0.7,0,0.3,1)_forwards]">
                <span className="ll-mono muted text-[10px]">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-sans text-[20px] font-normal">{client}</span>
                <span className="font-mono text-[12px] text-muted opacity-0 -translate-x-[6px] transition-[opacity,transform] duration-300 group-hover:translate-x-0 group-hover:text-accent group-hover:opacity-100">
                  ↗
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── Recognition ────────────────────────────────── */}
      <div className={`${SECTION} border-t-[0.5px] border-rule`}>
        <Reveal y={20}>
          <div className="mb-12 flex flex-col gap-2">
            <Eyebrow>Reconhecimento</Eyebrow>
            <h2 className="ll-section-title ll-section-title--sm">Prêmios e destaques</h2>
          </div>
        </Reveal>
        <div className="flex flex-col">
          {displayRecognition.map(([year, text], i) => (
            <Reveal key={`${year}-${i}`} y={12} delay={i * 40}>
              <div className={ROW}>
                <span className="ll-mono small-cap text-[13px]">{year}</span>
                <span>{text}</span>
                <div className={DOT} />
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── CTA ────────────────────────────────────────── */}
      <div className={`${SECTION} border-t-[0.5px] border-rule`}>
        <div className="flex flex-col items-start gap-7">
          <Reveal y={30}>
            <p className="ll-body ll-body--large max-w-[600px]">
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
