import Link from 'next/link';

const BrandMark = () => (
  <svg width="22" height="22" viewBox="0 0 200 200" fill="none">
    <path d="M 38 32 L 38 168 L 110 168" stroke="currentColor" strokeWidth="11" strokeLinecap="square" />
    <path d="M 162 168 L 162 32 L 90 32" stroke="currentColor" strokeWidth="11" strokeLinecap="square" />
    <circle cx="100" cy="100" r="6" fill="var(--accent)" />
  </svg>
);

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="ll-footer">
      <div className="ll-footer-grid">
        <div className="ll-footer-col">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <BrandMark />
            <span style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 18, letterSpacing: '.2em', textTransform: 'uppercase' }}>
              Lobeu
            </span>
          </div>
          <p className="muted" style={{ fontFamily: 'var(--sans)', fontSize: 14, lineHeight: 1.55, maxWidth: 220 }}>
            Estúdio de direção audiovisual e fotografia. São Paulo, Brasil.
          </p>
        </div>

        <div className="ll-footer-col">
          <span className="small-cap muted">Contato</span>
          <div className="ll-footer-body">
            <a href="mailto:lucas@lobeu.studio">lucas@lobeu.studio</a>
            <a href="tel:+5511984720418">+55 11 9 8472-0418</a>
            <span className="muted" style={{ fontSize: 14 }}>São Paulo, BR</span>
          </div>
        </div>

        <div className="ll-footer-col">
          <span className="small-cap muted">Redes</span>
          <div className="ll-footer-body">
            <a href="https://instagram.com/lucaslobeu" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
            <a href="https://vimeo.com/lucaslobeu" target="_blank" rel="noopener noreferrer">
              Vimeo
            </a>
            <a href="https://behance.net/lucaslobeu" target="_blank" rel="noopener noreferrer">
              Behance
            </a>
          </div>
        </div>

        <div className="ll-footer-col">
          <span className="small-cap muted">Navegar</span>
          <div className="ll-footer-body">
            <Link href="/">Index</Link>
            <Link href="/projects">Projetos</Link>
            <Link href="/about">Sobre</Link>
            <Link href="/journal">Diário</Link>
            <Link href="/contact">Contato</Link>
            <Link href="/links">Links</Link>
          </div>
        </div>
      </div>

      <div className="ll-footer-watermark" aria-hidden="true">
        <span>LOBEU</span>
      </div>

      <div className="ll-footer-base">
        <span className="ll-mono small-cap" style={{ fontSize: 10 }}>
          © {year} Lucas Lobeu. Todos os direitos reservados.
        </span>
        <Link href="/admin/login" className="ll-mono small-cap" style={{ fontSize: 10, opacity: 0.55 }}>
          Acesso reservado
        </Link>
      </div>
    </footer>
  );
}
