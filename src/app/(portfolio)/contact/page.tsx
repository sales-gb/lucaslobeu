import Reveal from '@/components/ui/reveal';
import { Eyebrow } from '@/components/ui/eyebrow';
import ContactForm from '@/features/contact/components/contact-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contato — Lucas Lobeu',
  description: 'Fale sobre um projeto com o estúdio Lucas Lobeu.',
};

export default function ContactPage() {
  return (
    <>
      <div className="px-[var(--page-x)] pt-[120px] pb-[60px]">
        <Reveal y={20}>
          <Eyebrow>Contato · Projeto</Eyebrow>
        </Reveal>
        <Reveal y={40} delay={60}>
          <h1 className="mt-12 font-serif font-light text-[clamp(80px,12vw,192px)] leading-[0.9] tracking-[-0.03em]">
            Contato
          </h1>
        </Reveal>
      </div>

      <div className="px-[var(--page-x)] pb-[var(--section-y)]">
        <div className="grid grid-cols-2 gap-24 max-lg:grid-cols-1 max-lg:gap-10">
          {/* Left: info */}
          <div className="flex flex-col gap-6">
            <Reveal y={20}>
              <div>
                <Eyebrow className="mb-3 block">Email principal</Eyebrow>
                <a
                  href="mailto:lucas@lobeu.studio"
                  className="ll-sweep border-b-[0.5px] border-ink pb-1 font-sans text-[26px]"
                >
                  lucas@lobeu.studio
                </a>
              </div>
            </Reveal>

            <Reveal y={16} delay={60}>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <Eyebrow className="mb-2 block">Telefone</Eyebrow>
                  <a href="tel:+5511984720418" className="ll-sweep font-serif text-[20px]">
                    +55 11 9 8472-0418
                  </a>
                </div>
                <div>
                  <Eyebrow className="mb-2 block">Localização</Eyebrow>
                  <span className="font-serif text-[20px]">São Paulo, BR</span>
                </div>
              </div>
            </Reveal>

            <Reveal y={16} delay={100}>
              <div>
                <Eyebrow className="mb-3 block">Redes</Eyebrow>
                <div className="flex flex-wrap gap-4">
                  {[
                    { href: 'https://instagram.com/lucaslobeu', label: 'Instagram' },
                    { href: 'https://vimeo.com/lucaslobeu', label: 'Vimeo' },
                    { href: 'https://behance.net/lucaslobeu', label: 'Behance' },
                  ].map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ll-sweep border-b-[0.5px] border-rule font-sans text-[20px]"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal y={10} delay={140}>
              <div className="border-t-[0.5px] border-rule py-7">
                <Eyebrow className="mb-2 block">Disponibilidade</Eyebrow>
                <p className="ll-body">
                  O estúdio aceita três a quatro projetos por trimestre. Atualmente com agenda aberta para o segundo semestre de 2026.
                </p>
              </div>
            </Reveal>
          </div>

          {/* Right: form */}
          <Reveal y={20} delay={80}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </>
  );
}
