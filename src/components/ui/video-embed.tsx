'use client';

// Embed de vídeo (Vimeo ou YouTube). O vídeo NÃO fica no nosso servidor: o
// provedor cuida de transcode, formatos adaptativos e banda. Aqui só detectamos
// o provedor pelo link colado no CRM e renderizamos um iframe lazy 16:9.

type Parsed = { provider: 'youtube' | 'vimeo'; id: string };

export function parseVideoUrl(input?: string | null): Parsed | null {
  if (!input) return null;
  const url = input.trim();
  // YouTube: watch?v=, youtu.be/, /embed/, /shorts/
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/,
  );
  if (yt) return { provider: 'youtube', id: yt[1] };
  // Vimeo: vimeo.com/123, player.vimeo.com/video/123, vimeo.com/channels/x/123
  const vm = url.match(/vimeo\.com\/(?:[\w-]+\/)*(\d+)/);
  if (vm) return { provider: 'vimeo', id: vm[1] };
  return null;
}

/** true se a string é um link de vídeo embutível (usado para escolher entre <video>/embed). */
export function isVideoEmbedUrl(input?: string | null): boolean {
  return parseVideoUrl(input) !== null;
}

export function VideoEmbed({
  url,
  title = 'Vídeo',
  className,
  background = false,
}: {
  url: string;
  title?: string;
  className?: string;
  /** Modo fundo: autoplay mudo em loop, sem controles, cobrindo o container. */
  background?: boolean;
}) {
  const parsed = parseVideoUrl(url);
  if (!parsed) return null;

  const src =
    parsed.provider === 'youtube'
      ? background
        ? `https://www.youtube-nocookie.com/embed/${parsed.id}?autoplay=1&mute=1&loop=1&playlist=${parsed.id}&controls=0&modestbranding=1&playsinline=1&rel=0&showinfo=0`
        : `https://www.youtube-nocookie.com/embed/${parsed.id}?rel=0&modestbranding=1`
      : background
        ? `https://player.vimeo.com/video/${parsed.id}?background=1&muted=1&autoplay=1&loop=1&dnt=1`
        : `https://player.vimeo.com/video/${parsed.id}?title=0&byline=0&portrait=0&dnt=1`;

  if (background) {
    // Cobre o container (truque de iframe full-bleed: 16:9 escalado para cobrir).
    return (
      <div className={`absolute inset-0 overflow-hidden bg-ink ${className ?? ''}`}>
        <iframe
          src={src}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 border-0"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden bg-ink-soft ${className ?? ''}`}
    >
      <iframe
        src={src}
        title={title}
        loading="lazy"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
