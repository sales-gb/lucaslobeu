import Link from 'next/link';
import Nav from '@/components/layout/nav';
import Footer from '@/components/layout/footer';

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="ll-main">
        <div className="ll-section ll-404" style={{ padding: '0 var(--page-x)' }}>
          <span className="ll-eyebrow">Erro 404</span>
          <h1 className="ll-404-title">Quadro<br />sem imagem.</h1>
          <p className="ll-body" style={{ maxWidth: 480 }}>
            A página que você procura não existe ou foi removida. Navegue pelos projetos ou volte ao início.
          </p>
          <div className="ll-404-actions">
            <Link href="/" className="ll-link-rule">
              Voltar ao início <span>→</span>
            </Link>
            <Link href="/projects" className="ll-link-rule muted">
              Ver projetos <span>→</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
