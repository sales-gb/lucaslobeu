'use client';

import { useState, FormEvent } from 'react';

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
      <div className="ll-contact-sent">
        <span className="ll-dot" />
        <h3 style={{ fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 300 }}>
          Mensagem recebida.
        </h3>
        <p className="ll-body">
          Obrigado pelo contato. Retornarei em até 48h úteis para darmos sequência à conversa.
        </p>
        <button
          className="ll-eyebrow"
          style={{ marginTop: 16, textDecoration: 'underline', cursor: 'pointer' }}
          onClick={() => setState('idle')}
        >
          Enviar nova mensagem
        </button>
      </div>
    );
  }

  return (
    <form className="ll-contact-form" onSubmit={handleSubmit} noValidate>
      <div className="ll-contact-field">
        <label className="ll-eyebrow" htmlFor="nome">Nome</label>
        <input
          id="nome"
          type="text"
          placeholder="Seu nome completo"
          required
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
        />
      </div>

      <div className="ll-contact-field">
        <label className="ll-eyebrow" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="seu@email.com"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>

      <div className="ll-contact-field">
        <label className="ll-eyebrow" htmlFor="empresa">Empresa</label>
        <input
          id="empresa"
          type="text"
          placeholder="Nome da empresa ou projeto"
          value={form.empresa}
          onChange={(e) => setForm({ ...form, empresa: e.target.value })}
        />
      </div>

      <div className="ll-contact-field">
        <span className="ll-eyebrow">Tipo de projeto</span>
        <div className="ll-contact-chips">
          {TIPOS.map((tipo) => (
            <label key={tipo} className="ll-contact-chip">
              <input
                type="checkbox"
                checked={form.tipos.includes(tipo)}
                onChange={() => toggleTipo(tipo)}
              />
              {tipo}
            </label>
          ))}
        </div>
      </div>

      <div className="ll-contact-field">
        <label className="ll-eyebrow" htmlFor="sobre">Sobre o projeto</label>
        <textarea
          id="sobre"
          rows={5}
          placeholder="Descreva brevemente o projeto, escopo e prazo estimado"
          required
          value={form.sobre}
          onChange={(e) => setForm({ ...form, sobre: e.target.value })}
          style={{
            resize: 'vertical',
            fontFamily: 'var(--serif)',
            fontSize: 22,
            borderBottom: '.5px solid var(--ink)',
            padding: '8px 0',
          }}
        />
      </div>

      <button
        type="submit"
        className="ll-contact-submit"
        disabled={state === 'sending'}
      >
        <span>{state === 'sending' ? 'Enviando…' : 'Enviar mensagem'}</span>
        <span>{state === 'sending' ? '…' : '→'}</span>
      </button>
    </form>
  );
}
