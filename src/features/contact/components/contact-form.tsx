'use client';

import { useState, FormEvent } from 'react';
import { Eyebrow } from '@/components/ui/eyebrow';

type FormState = 'idle' | 'sending' | 'sent' | 'error';

const TIPOS = ['Filme', 'Fotografia', 'Social', 'Outro'] as const;
type Tipo = typeof TIPOS[number];

interface FormData {
  nome: string;
  email: string;
  empresa: string;
  tipos: Tipo[];
  sobre: string;
}

// Campo de input: sans (respeita o override de fonte do design); o textarea usa serif.
const FIELD =
  'w-full border-b-[0.5px] border-ink bg-transparent py-2 text-[22px] font-normal placeholder:font-light placeholder:italic placeholder:text-muted-soft';

export default function ContactForm() {
  const [state, setState] = useState<FormState>('idle');
  const [form, setForm] = useState<FormData>({
    nome: '',
    email: '',
    empresa: '',
    tipos: [],
    sobre: '',
  });

  const toggleTipo = (tipo: Tipo) => {
    setForm((prev) => ({
      ...prev,
      tipos: prev.tipos.includes(tipo)
        ? prev.tipos.filter((t) => t !== tipo)
        : [...prev.tipos, tipo],
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setState('sending');
    // Simulate async send (replace with actual API call)
    await new Promise((r) => setTimeout(r, 1200));
    setState('sent');
  };

  if (state === 'sent') {
    return (
      <div className="flex flex-col gap-4 pt-[60px]">
        <span className="ll-dot" />
        <h3 className="font-serif text-[36px] font-light">Mensagem recebida.</h3>
        <p className="ll-body">
          Obrigado pelo contato. Retornarei em até 48h úteis para darmos sequência à conversa.
        </p>
        <Eyebrow
          as="button"
          className="mt-4 cursor-pointer underline"
          onClick={() => setState('idle')}
        >
          Enviar nova mensagem
        </Eyebrow>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-7" onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-2">
        <Eyebrow as="label" htmlFor="nome">Nome</Eyebrow>
        <input
          id="nome"
          type="text"
          placeholder="Seu nome completo"
          required
          className={`${FIELD} font-sans`}
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Eyebrow as="label" htmlFor="email">Email</Eyebrow>
        <input
          id="email"
          type="email"
          placeholder="seu@email.com"
          required
          className={`${FIELD} font-sans`}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Eyebrow as="label" htmlFor="empresa">Empresa</Eyebrow>
        <input
          id="empresa"
          type="text"
          placeholder="Nome da empresa ou projeto"
          className={`${FIELD} font-sans`}
          value={form.empresa}
          onChange={(e) => setForm({ ...form, empresa: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Eyebrow>Tipo de projeto</Eyebrow>
        <div className="flex flex-wrap gap-2 pt-1">
          {TIPOS.map((tipo) => (
            <label
              key={tipo}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border-[0.5px] border-ink px-[18px] py-[10px] font-mono text-[12px] uppercase tracking-[0.14em] has-[:checked]:bg-ink has-[:checked]:text-paper"
            >
              <input
                type="checkbox"
                className="hidden"
                checked={form.tipos.includes(tipo)}
                onChange={() => toggleTipo(tipo)}
              />
              {tipo}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Eyebrow as="label" htmlFor="sobre">Sobre o projeto</Eyebrow>
        <textarea
          id="sobre"
          rows={5}
          placeholder="Descreva brevemente o projeto, escopo e prazo estimado"
          required
          className={`${FIELD} resize-y font-serif`}
          value={form.sobre}
          onChange={(e) => setForm({ ...form, sobre: e.target.value })}
        />
      </div>

      <button
        type="submit"
        className="inline-flex items-center justify-between gap-[14px] bg-ink px-6 py-[18px] font-mono text-[13px] uppercase tracking-[0.2em] text-paper transition-[gap] duration-300 hover:gap-7"
        disabled={state === 'sending'}
      >
        <span>{state === 'sending' ? 'Enviando…' : 'Enviar mensagem'}</span>
        <span>{state === 'sending' ? '…' : '→'}</span>
      </button>
    </form>
  );
}
