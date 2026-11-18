import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, MessageSquare, RotateCcw, Send, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { StarMark } from './LyreLogo';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  modelUsed?: string;
}

interface StudioChatProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

const STARTER_PROMPTS = [
  'Recommend a scope for a launch film & brand identity',
  'How do your four creative stages work together?',
  'What deliverables are included in Brand Strategy?',
];

export function StudioChat({ isOpen, onClose, onNavigate }: StudioChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [modelMode, setModelMode] = useState<'gemini-4-hydrogen' | 'gemini-3.1-flash-lite'>(
    'gemini-4-hydrogen'
  );
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const threadRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  const sendMessage = async (textOverride?: string) => {
    const trimmed = (textOverride ?? input).trim();
    if (!trimmed || isSending) return;

    const userTurn: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    const historySnapshot = messages.map((m) => ({
      role: m.role,
      text: m.text,
    }));

    setMessages((prev) => [...prev, userTurn]);
    if (!textOverride) setInput('');
    setErrorMsg(null);
    setIsSending(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: historySnapshot,
          model: modelMode,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        reply?: string;
        model?: string;
        error?: string;
      };

      if (!response.ok || !data.reply) {
        setErrorMsg(
          data.error || `Unable to reach studio concierge (HTTP ${response.status}).`
        );
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}`,
          role: 'model',
          text: data.reply!,
          modelUsed: data.model,
        },
      ]);
    } catch {
      setErrorMsg('Network interruption while reaching the studio concierge.');
    } finally {
      setIsSending(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setErrorMsg(null);
    setInput('');
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Orpheus Studios Creative Concierge"
          data-testid="studio-chat-drawer"
        >
          {/* Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-obsidian/55"
          />

          {/* Slide-over editorial panel */}
          <motion.aside
            initial={shouldReduceMotion ? { opacity: 1 } : { x: '100%' }}
            animate={{ x: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { x: '100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-[440px] h-full bg-canvas text-ink border-l border-ink/20 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-ink/15 flex items-center justify-between gap-3 bg-canvas-elevated">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <StarMark className="w-3 h-3 text-accent shrink-0" />
                  <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-accent font-medium">
                    Orpheus Concierge
                  </p>
                </div>
                <h2 className="font-serif text-lg text-ink truncate mt-0.5">
                  Brief &amp; Creative Advisory
                </h2>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleReset}
                  title="New conversation"
                  aria-label="Clear conversation"
                  className="editorial-btn-hover inline-flex items-center justify-center w-9 h-9 border border-ink/20 text-ink/75 hover:border-ink hover:text-ink cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close concierge drawer"
                  className="editorial-btn-hover inline-flex items-center justify-center w-9 h-9 border border-ink/20 text-ink/75 hover:border-accent hover:text-accent cursor-pointer"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Mode Switcher Bar */}
            <div className="px-5 py-2.5 border-b border-ink/12 flex items-center justify-between gap-3 text-[11px] font-sans">
              <span className="uppercase tracking-[0.16em] text-ink/60">Response Mode</span>
              <div className="inline-flex border border-ink/20">
                <button
                  type="button"
                  onClick={() => setModelMode('gemini-4-hydrogen')}
                  className={`px-2.5 py-1 uppercase tracking-[0.14em] transition-colors cursor-pointer ${
                    modelMode === 'gemini-4-hydrogen'
                      ? 'bg-btn text-btn-ink'
                      : 'text-ink/70 hover:text-ink'
                  }`}
                >
                  Studio Depth
                </button>
                <button
                  type="button"
                  onClick={() => setModelMode('gemini-3.1-flash-lite')}
                  className={`px-2.5 py-1 uppercase tracking-[0.14em] transition-colors cursor-pointer ${
                    modelMode === 'gemini-3.1-flash-lite'
                      ? 'bg-btn text-btn-ink'
                      : 'text-ink/70 hover:text-ink'
                  }`}
                >
                  Quick
                </button>
              </div>
            </div>

            {/* Scrollable Conversation Thread */}
            <div
              ref={threadRef}
              className="flex-1 overflow-y-auto px-5 py-5 space-y-5"
            >
              {messages.length === 0 ? (
                <div className="space-y-6">
                  <div className="border-b border-ink/12 pb-5 space-y-2.5">
                    <p className="font-serif text-2xl leading-snug text-ink">
                      Ask about disciplines, scope, or creative direction.
                    </p>
                    <p className="font-sans text-sm text-ink/70 leading-relaxed">
                      Explore how Orpheus Studios shapes films, brand systems, and digital
                      flagships from Islamabad for teams worldwide.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink/55">
                      Suggested Starting Questions
                    </p>
                    <div className="space-y-2">
                      {STARTER_PROMPTS.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => void sendMessage(prompt)}
                          className="w-full text-left px-3.5 py-2.5 border border-ink/20 bg-canvas-elevated/60 hover:border-ink hover:bg-canvas-elevated text-xs font-sans text-ink/85 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                        >
                          <span>{prompt}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 shrink-0 text-accent" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-ink/50 mb-1.5">
                        {isUser ? 'You' : 'Orpheus Studios'}
                      </span>
                      <div
                        className={`max-w-[90%] px-4 py-3 text-sm font-sans leading-relaxed whitespace-pre-wrap border ${
                          isUser
                            ? 'bg-btn text-btn-ink border-btn'
                            : 'bg-canvas-elevated text-ink border-ink/15'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}

              {isSending ? (
                <div className="flex flex-col items-start">
                  <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-ink/50 mb-1.5">
                    Orpheus Studios
                  </span>
                  <div className="px-4 py-3 border border-ink/15 bg-canvas-elevated text-xs font-sans text-ink/65 italic">
                    Drafting response...
                  </div>
                </div>
              ) : null}

              {errorMsg ? (
                <div
                  role="alert"
                  className="p-3.5 border border-accent/40 bg-accent/[0.06] text-xs font-sans text-ink space-y-2"
                >
                  <p className="text-accent uppercase tracking-[0.16em] font-medium">
                    Concierge Notice
                  </p>
                  <p className="text-ink/85 leading-relaxed">{errorMsg}</p>
                </div>
              ) : null}
            </div>

            {/* Footer Input & Direct Brief CTA */}
            <div className="border-t border-ink/15 p-4 bg-canvas-elevated space-y-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void sendMessage();
                }}
                className="flex items-end gap-2"
              >
                <label htmlFor="studio-chat-input" className="sr-only">
                  Ask the Orpheus Studio Concierge
                </label>
                <textarea
                  ref={inputRef}
                  id="studio-chat-input"
                  rows={2}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      void sendMessage();
                    }
                  }}
                  placeholder="Describe your film, brand or digital project..."
                  className="flex-1 bg-canvas border border-ink/25 focus:border-ink px-3 py-2 text-sm font-sans text-ink placeholder:text-ink/40 focus:outline-none resize-none"
                />
                <button
                  type="submit"
                  disabled={isSending || !input.trim()}
                  aria-label="Send message"
                  className="editorial-btn-hover inline-flex items-center justify-center w-11 h-11 bg-btn text-btn-ink hover:bg-accent hover:text-parchment disabled:opacity-45 shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                </button>
              </form>

              <div className="flex items-center justify-between text-[11px] font-sans text-ink/65">
                <span className="inline-flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3 text-accent" aria-hidden="true" />
                  <span>Multi-turn Studio Advisor</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate('/contact');
                  }}
                  className="editorial-link uppercase tracking-[0.14em] text-ink hover:text-accent cursor-pointer"
                >
                  <span>Open Contact Brief</span>
                  <span aria-hidden="true">↗</span>
                </button>
              </div>
            </div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
