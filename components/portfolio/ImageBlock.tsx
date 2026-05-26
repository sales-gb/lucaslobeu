import Image from 'next/image';

type Tone = 'light' | 'mid' | 'dark';

interface ImageBlockProps {
  tone?: Tone;
  ratio?: string;
  caption?: string;
  src?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

const toneGradients: Record<Tone, string> = {
  light: 'repeating-linear-gradient(135deg, #E9E3D5 0px, #E9E3D5 2px, #DDD7C8 2px, #DDD7C8 12px)',
  mid:   'repeating-linear-gradient(135deg, #9C9183 0px, #9C9183 2px, #8A7F72 2px, #8A7F72 12px)',
  dark:  'repeating-linear-gradient(135deg, #1A1A1A 0px, #1A1A1A 2px, #0A0A0A 2px, #0A0A0A 12px)',
};

export default function ImageBlock({
  tone = 'mid',
  ratio = '4/3',
  caption,
  src,
  alt = '',
  className,
  style,
}: ImageBlockProps) {
  return (
    <figure className={className} style={style}>
      <div
        style={{
          aspectRatio: ratio,
          position: 'relative',
          overflow: 'hidden',
          background: toneGradients[tone],
        }}
      >
        {src && (
          <Image
            src={src}
            alt={alt}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        )}
      </div>
      {caption && (
        <figcaption
          className="ll-mono"
          style={{ fontSize: 11, letterSpacing: '.14em', color: 'var(--muted)', marginTop: 10 }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
