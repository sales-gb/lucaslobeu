'use client';

import { useEffect, useRef, useState } from 'react';
import ImageBlock from './ImageBlock';

interface Note {
  tag: string;
  label: string;
  detail: string;
}

interface Step {
  num: string;
  label: string;
}

interface Props {
  notes: Note[];
  manifestoText: string;
  manifestoSteps: Step[];
}

// ── Em Prática Section ──────────────────────────────────────
function EmPraticaSection({ notes }: { notes: Note[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const railFillRef = useRef<HTMLDivElement>(null);
  const [scanTop, setScanTop] = useState(50);
  const [activeNote, setActiveNote] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const progress = Math.max(0, Math.min(1, -rect.top / total));
      if (railFillRef.current) {
        railFillRef.current.style.height = `${progress * 100}%`;
      }
      setScanTop(10 + progress * 80);
      setActiveNote(Math.min(notes.length - 1, Math.floor(progress * notes.length)));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [notes.length]);

  return (
    <section className="ll-empratica" ref={sectionRef}>
      <div className="ll-empratica-rail">
        <div className="ll-empratica-railfill" ref={railFillRef} style={{ height: '0%' }} />
      </div>

      <div className="ll-empratica-grid">
        {/* Text column */}
        <div className="ll-empratica-text-col">
          <div className="ll-empratica-text-stuck">
            <span className="ll-eyebrow">Em prática</span>
            <h2 className="ll-empratica-title">
              O processo é o produto.
            </h2>
            <p className="ll-empratica-body">
              Do briefing ao arquivo final, cada etapa do nosso método é desenhada para produzir imagens que resistem ao tempo — e ao feed.
            </p>

            <div className="ll-empratica-notes">
              {notes.map((note, i) => (
                <div
                  key={note.tag}
                  className="ll-empratica-note"
                  style={{
                    opacity: i === activeNote ? 1 : 0.35,
                    transform: i === activeNote ? 'translateX(0)' : 'translateX(-4px)',
                  }}
                >
                  <span className="ll-empratica-note-tag ll-mono small-cap">{note.tag}</span>
                  <span className="ll-empratica-note-label">{note.label}</span>
                  <span className="ll-empratica-note-detail">{note.detail}</span>
                  <span
                    className="ll-empratica-note-line"
                    style={{ transform: i === activeNote ? 'scaleX(1)' : 'scaleX(.3)' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Media column */}
        <div className="ll-empratica-media-col">
          <div className="ll-empratica-media-stuck">
            <div className="ll-empratica-frame">
              <div>
                <ImageBlock tone="dark" ratio="9/16" style={{ height: '100%' }} />
              </div>
              <div className="ll-empratica-frame-meta">
                <span className="ll-mono small-cap" style={{ fontSize: 10 }}>Lucas Lobeu</span>
                <span className="ll-mono small-cap" style={{ fontSize: 10 }}>SP · 2026</span>
              </div>
              <div
                className="ll-empratica-scan"
                style={{ top: `${scanTop}%` }}
              />
              <div className="ll-empratica-frame-corner">
                <span className="ll-dot--red" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#d44', animation: 'll-blink 1.4s ease-in-out infinite' }} />
                <span className="ll-mono small-cap" style={{ fontSize: 10 }}>REC</span>
              </div>
              <div className="ll-empratica-frame-ts">
                <span className="ll-mono" style={{ fontSize: 9 }}>00:00:00:00</span>
              </div>
            </div>

            <div className="ll-empratica-caption">
              <span className="ll-dot" style={{ background: 'var(--accent)', width: 4, height: 4, borderRadius: '50%' }} />
              <span className="ll-empratica-caption-text ll-mono small-cap" style={{ fontSize: 10 }}>
                {notes[activeNote]?.label ?? 'Produção'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Sticky Manifesto Section ────────────────────────────────
function ManifestoSection({ manifestoText, steps }: { manifestoText: string; steps: Step[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [activeFrame, setActiveFrame] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const progress = Math.max(0, Math.min(1, -rect.top / total));
      setActiveStep(Math.min(steps.length - 1, Math.floor(progress * steps.length)));
      setActiveFrame(Math.min(2, Math.floor(progress * 3)));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [steps.length]);

  const frameTones = ['dark', 'mid', 'light'] as const;

  return (
    <section className="ll-sticky-section" ref={sectionRef}>
      <div className="ll-sticky-grid">
        <div className="ll-sticky-left">
          <div className="ll-sticky-stuck">
            <span className="ll-eyebrow">Manifesto</span>
            <h2 className="ll-sticky-title ll-section-title">{manifestoText}</h2>
            <p className="ll-body ll-sticky-body">
              Cada frame é uma decisão. Cada decisão tem origem num pensamento que antecede a técnica.
            </p>

            <div className="ll-sticky-steps">
              {steps.map((step, i) => (
                <div
                  key={step.num}
                  className={`ll-sticky-step${i < activeStep ? ' is-passed' : ''}${i === activeStep ? ' is-active' : ''}`}
                >
                  <span className="ll-sticky-step-num ll-mono small-cap">{step.num}</span>
                  <span className="ll-sticky-step-label">{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="ll-sticky-right">
          <div className="ll-sticky-right-stuck">
            <div className="ll-sticky-stage">
              {frameTones.map((tone, i) => (
                <div
                  key={tone}
                  className="ll-sticky-frame"
                  style={{ opacity: i === activeFrame ? 1 : 0 }}
                >
                  <div className="ll-sticky-frame-inner">
                    <ImageBlock tone={tone} ratio="3/4" style={{ height: '100%', width: 'auto' }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="ll-sticky-stage-meta">
              <span className="ll-eyebrow ll-sticky-stage-detail">
                Frame {String(activeFrame + 1).padStart(2, '0')} / 03
              </span>
              <span className="ll-mono small-cap muted" style={{ fontSize: 10 }}>
                {steps[activeStep]?.label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomeScrollSections({ notes, manifestoText, manifestoSteps }: Props) {
  return (
    <>
      <EmPraticaSection notes={notes} />
      <ManifestoSection manifestoText={manifestoText} steps={manifestoSteps} />
    </>
  );
}
