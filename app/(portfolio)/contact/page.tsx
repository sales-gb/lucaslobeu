import Reveal from '@/components/portfolio/Reveal';
import ContactForm from '@/components/portfolio/ContactForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contato — Lucas Lobeu',
  description: 'Fale sobre um projeto com o estúdio Lucas Lobeu.',
};

export default function ContactPage() {
  return (
    <>
      <div className="ll-contact-header">
        <Reveal y={20}>
          <span className="ll-eyebrow">Contato · Projeto</span>
        </Reveal>
        <Reveal y={40} delay={60}>
          <h1 className="ll-contact-title">Contato</h1>
        </Reveal>
      </div>

      <div className="ll-section" style={{ paddingTop: 0 }}>
        <div className="ll-contact-grid">
          {/* Left: info */}
          <div className="ll-contact-left">
            <Reveal y={20}>
              <div>
                <span className="ll-eyebrow" style={{ display: 'block', marginBottom: 12 }}>Email principal</span>
                <a href="mailto:lucas@lobeu.studio" className="ll-contact-mail ll-sweep">
                  lucas@lobeu.studio
                </a>
              </div>
            </Reveal>

            <Reveal y={16} delay={60}>
              <div className="ll-contact-info">
                <div>
                  <span className="ll-eyebrow" style={{ display: 'block', marginBottom: 8 }}>Telefone</span>
                  <a href="tel:+5511984720418" className="ll-sweep" style={{ fontFamily: 'var(--serif)', fontSize: 20 }}>
                    +55 11 9 8472-0418
                  </a>
                </div>
                <div>
                  <span className="ll-eyebrow" style={{ display: 'block', marginBottom: 8 }}>Localização</span>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 20 }}>São Paulo, BR</span>
                </div>
              </div>
            </Reveal>

            <Reveal y={16} delay={100}>
              <div>
                <span className="ll-eyebrow" style={{ display: 'block', marginBottom: 12 }}>Redes</span>
                <div className="ll-contact-socials">
                  <a href="https://instagram.com/lucaslobeu" target="_blank" rel="noopener noreferrer" className="ll-sweep">
                    Instagram
                  </a>
                  <a href="https://vimeo.com/lucaslobeu" target="_blank" rel="noopener noreferrer" className="ll-sweep">
                    Vimeo
                  </a>
                  <a href="https://behance.net/lucaslobeu" target="_blank" rel="noopener noreferrer" className="ll-sweep">
                    Behance
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal y={10} delay={140}>
              <div style={{ padding: '28px 0', borderTop: '.5px solid var(--rule)' }}>
                <span className="ll-eyebrow" style={{ display: 'block', marginBottom: 8 }}>Disponibilidade</span>
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
