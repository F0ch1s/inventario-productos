import { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '@nanostores/react';
import { MessageSquare, X, Send, Sparkles, Loader2, Bot, User } from 'lucide-react';
import { $products, $movements } from '../stores/inventoryStore';
import { buildSystemPrompt } from '../lib/inventoryContext';
import { streamChat } from '../lib/groqClient';
import type { ChatMessage } from '../types';

const SUGGESTED_QUESTIONS = [
  '¿Qué producto debería poner en oferta y por qué?',
  '¿Cuánto capital tengo inmovilizado en baja rotación?',
  'Dame un análisis estratégico por categoría',
  '¿Qué productos necesito reabastecer pronto?',
  '¿Qué oportunidades de negocio ves en mi inventario?',
];

/** Renders basic markdown: **bold**, bullet lists, and newlines */
function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    // Bold
    let processed: React.ReactNode[] = [];
    const boldRegex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        processed.push(line.slice(lastIndex, match.index));
      }
      processed.push(<strong key={`b-${i}-${match.index}`}>{match[1]}</strong>);
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < line.length) {
      processed.push(line.slice(lastIndex));
    }
    if (processed.length === 0) processed.push('');

    // Bullet lists
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      elements.push(
        <div key={i} className="flex gap-2 ml-2">
          <span className="text-slate-400 select-none">•</span>
          <span>{processed}</span>
        </div>
      );
    } else if (trimmed === '') {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(<div key={i}>{processed}</div>);
    }
  });

  return <>{elements}</>;
}

export default function ChatBot() {
  const products = useStore($products);
  const movements = useStore($movements);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
    };

    const assistantId = crypto.randomUUID();
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isStreaming: true,
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInput('');
    setIsLoading(true);

    // Build conversation history for the API
    const systemPrompt = buildSystemPrompt(products, movements);
    const conversationHistory = [...messages, userMessage].map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const apiMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory,
    ];

    await streamChat(
      apiMessages,
      // onChunk
      (chunk) => {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: m.content + chunk }
              : m
          )
        );
      },
      // onDone
      () => {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, isStreaming: false }
              : m
          )
        );
        setIsLoading(false);
      },
      // onError
      (error) => {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: `❌ ${error}`, isStreaming: false }
              : m
          )
        );
        setIsLoading(false);
      },
    );
  }, [isLoading, messages, products, movements]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const showSuggestions = messages.length === 0;

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-white shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all hover:scale-110 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] active:scale-95"
          title="Asistente IA"
        >
          <MessageSquare className="h-6 w-6" />
          {/* Pulse animation */}
          <span className="absolute inset-0 animate-ping rounded-full bg-slate-950 opacity-20" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[580px] w-[420px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.18)]"
          style={{ animation: 'chatSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-950 to-slate-800 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">Asistente IA</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-300">GPT-OSS-120B · GROQ</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-white/15"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollBehavior: 'smooth' }}>
            {/* Welcome message */}
            {showSuggestions && (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl rounded-tl-md bg-slate-100 px-4 py-3 text-sm text-slate-700 leading-relaxed">
                    ¡Hola! 👋 Soy tu asistente de inventario. Puedo analizar tus datos y darte <strong>recomendaciones estratégicas</strong> para tu empresa. ¿Qué te gustaría saber?
                  </div>
                </div>

                <div className="ml-11 space-y-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Preguntas sugeridas
                  </div>
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-xs text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat messages */}
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'rounded-tr-md bg-slate-950 text-white'
                      : 'rounded-tl-md bg-slate-100 text-slate-700'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <>
                      {msg.content ? renderMarkdown(msg.content) : null}
                      {msg.isStreaming && (
                        <span className="inline-block h-4 w-1 animate-pulse bg-slate-400 ml-0.5 align-middle rounded-full" />
                      )}
                    </>
                  ) : (
                    msg.content
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-600">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={isLoading ? 'Pensando...' : 'Pregunta sobre tu inventario...'}
                disabled={isLoading}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white transition hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Slide-up animation keyframes */}
      <style>{`
        @keyframes chatSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
}
