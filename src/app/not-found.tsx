import Nav from '@/components/layout/nav';
import Footer from '@/components/layout/footer';
import { Eyebrow } from '@/components/ui/eyebrow';
import { LinkRule } from '@/components/ui/link-rule';

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="min-h-screen pt-[72px]">
        <div className="flex min-h-[60vh] flex-col items-start justify-center gap-6 px-[var(--page-x)]">
          <Eyebrow>Erro 404</Eyebrow>
          <h1 className="font-serif font-light text-[clamp(96px,14vw,240px)] leading-[0.88] tracking-[-0.03em]">
            Quadro<br />sem imagem.
          </h1>
          <p className="ll-body max-w-[480px]">
            A página que você procura não existe ou foi removida. Navegue pelos projetos ou volte ao início.
          </p>
          <div className="mt-3 flex gap-8">
            <LinkRule href="/">Voltar ao início</LinkRule>
            <LinkRule href="/projects" muted>Ver projetos</LinkRule>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
