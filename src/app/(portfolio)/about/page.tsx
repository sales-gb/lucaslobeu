import { getDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import Reveal from '@/components/ui/reveal';
import ImageBlock from '@/components/ui/image-block';
import { Eyebrow } from '@/components/ui/eyebrow';
import { SectionMarker } from '@/components/ui/section-marker';
import { AboutStatement } from '@/features/about/components/about-statement';
import { TrajectoryList } from '@/features/about/components/trajectory-list';
import { CompaniesList } from '@/features/about/components/companies-list';
import type { Company, TrajectoryItem } from '@/features/about/types';
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

// ── Defaults (usados quando o CMS está vazio) ───────────────────
const DEFAULT_INTRO =
  'Acredito que a fotografia e o cinema compartilham um segredo: a melhor imagem é sempre aquela que o espectador completa.';
const DEFAULT_TRAJECTORY: TrajectoryItem[] = [
  { year: '2019', title: 'O primeiro estúdio', description: 'Um porão na Vila Madalena e a teimosia de não separar foto de filme.' },
  { year: '2021', title: 'Primeira capa', description: 'Direção e fotografia para a Pano nº 07 — o método encontra um público.' },
  { year: '2023', title: 'Mudança para o Bom Retiro', description: 'Estúdio próprio, equipe enxuta e os primeiros contratos recorrentes de marca.' },
  { year: '2026', title: 'Hoje', description: 'Três a quatro projetos por trimestre, entre filme, ensaio e direção de conteúdo.' },
];
const DEFAULT_COMPANIES: Company[] = [
  { name: 'Natura' },
  { name: 'Itaú' },
  { name: 'Havaianas' },
  { name: 'Heineken' },
];
const DEFAULT_NUMBERS: [string, string][] = [
  ['72', 'Projetos'],
  ['08', 'Países'],
  ['3—4', 'Por trimestre'],
];

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  try {
    const v = JSON.parse(raw ?? '');
    return Array.isArray(v) ? (v as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Aceita tanto o formato antigo [ano, texto][] quanto { year, title, description }[]. */
function normalizeTrajectory(raw: string | null | undefined): TrajectoryItem[] {
  const arr = parseJson<unknown[]>(raw, []);
  if (arr.length === 0) return [];
  return arr
    .map((row): TrajectoryItem | null => {
      if (Array.isArray(row)) return { year: String(row[0] ?? ''), title: String(row[1] ?? '') };
      if (row && typeof row === 'object') {
        const r = row as Record<string, unknown>;
        return { year: String(r.year ?? ''), title: String(r.title ?? ''), description: r.description ? String(r.description) : undefined };
      }
      return null;
    })
    .filter((x): x is TrajectoryItem => !!x && (!!x.year || !!x.title));
}

/** companies do CMS; cai para selectedClients (só nomes) e depois para o default. */
function normalizeCompanies(about: AboutContent | null): Company[] {
  const companies = parseJson<Company[]>(about?.companies, []);
  if (companies.length > 0) return companies.filter((c) => c.name);
  const legacy = parseJson<string[]>(about?.selectedClients, []);
  if (legacy.length > 0) return legacy.map((name) => ({ name }));
  return DEFAULT_COMPANIES;
}

const SECTION = 'px-[var(--page-x)] py-[var(--section-y)]';

export default async function AboutPage() {
  const about = await getAbout();

  const intro = about?.intro || DEFAULT_INTRO;
  const bodyParagraphs = parseJson<string[]>(about?.body, []);
  const trajectory = (() => {
    const t = normalizeTrajectory(about?.trajectory);
    return t.length > 0 ? t : DEFAULT_TRAJECTORY;
  })();
  const companies = normalizeCompanies(about);
  const numbers = (() => {
    const n = parseJson<[string, string][]>(about?.numbers, []);
    return n.length > 0 ? n : DEFAULT_NUMBERS;
  })();
  const portraitUrl = about?.portraitImageUrl || '';

  return (
    <>
      {/* ── Header (escuro) ─────────────────────────────── */}
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

      {/* ── Intro + portrait + statement (escuro) ───────── */}
      <div className={`${SECTION} pt-0`}>
        <div className="grid grid-cols-[1fr_1.4fr] items-start gap-20 max-lg:grid-cols-1 max-lg:gap-10">
          <div className="sticky top-[120px] max-lg:static">
            {portraitUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={portraitUrl}
                alt="Lucas Lobeu"
                className="aspect-[3/4] w-full rounded-[2px] object-cover"
              />
            ) : (
              <ImageBlock tone="dark" ratio="3/4" />
            )}
            <div className="mt-4 flex flex-col gap-1.5">
              <Eyebrow>Lucas Lobeu</Eyebrow>
              <span className="font-sans text-[14px] text-muted">São Paulo, Brasil · 2019—</span>
            </div>
          </div>

          <div className="flex flex-col gap-7">
            <AboutStatement
              text={intro}
              className="font-sans font-light text-[clamp(24px,2.6vw,40px)] leading-[1.3] tracking-[-0.01em]"
            />

            {bodyParagraphs.map((para, i) => (
              <Reveal key={i} y={16} delay={i * 60}>
                <p className="ll-body">{para}</p>
              </Reveal>
            ))}

            <Reveal y={10} delay={120}>
              <div className="mt-2 flex gap-12 max-sm:gap-8">
                {numbers.map(([val, label]) => (
                  <div key={label} className="flex flex-col gap-1">
                    <span className="font-serif text-[clamp(40px,5vw,60px)] font-light leading-none">{val}</span>
                    <Eyebrow>{label}</Eyebrow>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* ── Trajetória (quebra clara) ───────────────────── */}
      <section className={`surface-light bg-paper text-ink ${SECTION}`}>
        <Reveal y={20}>
          <div className="mb-16 flex flex-col gap-3">
            <SectionMarker>Trajetória</SectionMarker>
            <h2 className="font-serif font-light text-[clamp(40px,6vw,84px)] leading-[0.95] tracking-[-0.02em]">
              Como chegamos aqui
            </h2>
          </div>
        </Reveal>
        <TrajectoryList items={trajectory} />
      </section>

      {/* ── Empresas (quebra escura — imagens brilham) ──── */}
      <section className={`relative bg-ink text-paper ${SECTION}`}>
        <span className="ll-crosshair ll-crosshair--tl" aria-hidden />
        <span className="ll-crosshair ll-crosshair--tr" aria-hidden />
        <Reveal y={20}>
          <div className="mb-16 flex max-w-[680px] flex-col gap-4">
            <SectionMarker tone="light">Empresas</SectionMarker>
            <h2 className="font-serif font-light text-[clamp(40px,6vw,84px)] leading-[0.95] tracking-[-0.02em]">
              Marcas com quem trabalhamos
            </h2>
            <p className="ll-body max-w-[52ch]">
              Passe o cursor para ver o trabalho. Clique para abrir o projeto no Instagram da marca.
            </p>
          </div>
        </Reveal>
        <CompaniesList companies={companies} />
      </section>

      {/* ── CTA (quebra clara) ──────────────────────────── */}
      <section className={`surface-light bg-paper text-ink ${SECTION}`}>
        <div className="flex flex-col items-start gap-7">
          <Reveal y={30}>
            <p className="ll-body ll-body--large max-w-[640px]">
              {about?.contactBlurb ||
                'O estúdio aceita três a quatro projetos por trimestre. Se o seu projeto faz sentido, vamos conversar.'}
            </p>
          </Reveal>
          <Reveal y={10} delay={80}>
            <Link href="/contact" className="ll-link-rule">
              Iniciar conversa <span>→</span>
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
