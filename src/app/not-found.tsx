import Nav from '@/components/layout/nav';
import Footer from '@/components/layout/footer';
import { Eyebrow } from '@/components/ui/eyebrow';
import { LinkRule } from '@/components/ui/link-rule';

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="ll-main">
        <div className="ll-section ll-404" style={{ padding: '0 var(--page-x)' }}>
          <Eyebrow>Erro 404</Eyebrow>
          <h1 className="ll-404-title">Quadro<br />sem imagem.</h1>
          <p className="ll-body" style={{ maxWidth: 480 }}>
            A página que você procura não existe ou foi removida. Navegue pelos projetos ou volte ao início.
          </p>
          <div className="ll-404-actions">
            <LinkRule href="/">Voltar ao início</LinkRule>
            <LinkRule href="/projects" muted>Ver projetos</LinkRule>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
