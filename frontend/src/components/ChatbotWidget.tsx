import { useEffect, useMemo, useRef, useState } from 'react';
import { FiMessageCircle, FiMinus, FiSend, FiTrash2, FiX } from 'react-icons/fi';
import api from '../utils/api';

type Role = 'user' | 'assistant';

type Message = {
  id: string;
  role: Role;
  text: string;
  createdAt: number;
};

const STORAGE_KEY = 'echowave.chatbot.local.v1';

function nowId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function safeTrim(text: string) {
  return (text || '').trim();
}

export default function ChatbotWidget({
  bottomOffsetPx = 24,
  rightOffsetPx = 24,
}: {
  bottomOffsetPx?: number;
  rightOffsetPx?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const initialMessages = useMemo<Message[]>(
    () => [
      {
        id: nowId(),
        role: 'assistant',
        text: "Hi! I’m EchoWave Help. Ask me how to use the app (playlists, uploads, favorites, community, account).",
        createdAt: Date.now(),
      },
    ],
    []
  );

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return initialMessages;
      const parsed = JSON.parse(raw) as { messages?: Message[] } | undefined;
      if (!parsed?.messages?.length) return initialMessages;
      return parsed.messages;
    } catch {
      return initialMessages;
    }
  });

  const listRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages }));
    } catch {
      // ignore
    }
  }, [messages]);

  useEffect(() => {
    if (!isOpen || isMinimized) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  function clearChat() {
    setMessages(initialMessages);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  async function send(text: string) {
    const trimmed = safeTrim(text);
    if (!trimmed || sending) return;

    const userMsg: Message = { id: nowId(), role: 'user', text: trimmed, createdAt: Date.now() };
    const placeholderId = nowId();
    const placeholder: Message = {
      id: placeholderId,
      role: 'assistant',
      text: 'Thinking...',
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg, placeholder]);
    setDraft('');
    setIsOpen(true);
    setIsMinimized(false);
    setSending(true);

    const history = messages
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.text }))
      .concat([{ role: 'user', content: trimmed }]);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await api.post('/chat', { message: trimmed, history }, { signal: controller.signal });
      const reply = safeTrim(res.data?.reply) || "Sorry, I couldn't generate a reply.";
      setMessages((prev) => prev.map((m) => (m.id === placeholderId ? { ...m, text: reply } : m)));
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Chat request failed';
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? { ...m, text: `Sorry, I couldn't reach EchoWave Help. (${String(serverMsg)})` }
            : m
        )
      );
    } finally {
      setSending(false);
    }
  }

  const panelBottomPx = bottomOffsetPx + 72;

  return (
    <>
      {isOpen && !isMinimized && (
        <div
          className="fixed z-50 w-[360px] max-w-[calc(100vw-32px)] rounded-2xl border border-white/10 bg-[#0b0b18]/95 shadow-2xl backdrop-blur-md"
          style={{ right: rightOffsetPx, bottom: panelBottomPx }}
          role="dialog"
          aria-label="Chat assistant"
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">EchoWave Assistant</div>
              <div className="truncate text-xs text-white/70">EchoWave help</div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"
                onClick={() => setIsMinimized(true)}
                aria-label="Minimize chat"
              >
                <FiMinus />
              </button>
              <button
                type="button"
                className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"
                onClick={clearChat}
                aria-label="Clear chat"
              >
                <FiTrash2 />
              </button>
              <button
                type="button"
                className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                <FiX />
              </button>
            </div>
          </div>

          <div ref={listRef} className="max-h-[360px] overflow-y-auto px-3 py-3">
            <div className="flex flex-col gap-2">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={[
                    'max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
                    m.role === 'user'
                      ? 'ml-auto bg-indigo-600 text-white'
                      : 'mr-auto bg-white/10 text-white',
                  ].join(' ')}
                >
                  {m.text}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 px-3 py-3">
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(draft);
              }}
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask a question..."
                className="h-10 w-full rounded-xl bg-white/5 px-3 text-sm text-white placeholder:text-white/50 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
                aria-label="Chat message"
              />
              <button
                type="submit"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
                disabled={!draft.trim() || sending}
                aria-label="Send message"
              >
                <FiSend />
              </button>
            </form>

            <div className="mt-2 flex flex-wrap gap-2">
              {['How do I create a playlist?', 'Recommend chill music', 'How do I upload a song?'].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/80 ring-1 ring-white/10 hover:bg-white/10"
                  disabled={sending}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isOpen && isMinimized && (
        <button
          type="button"
          className="fixed z-50 inline-flex items-center gap-2 rounded-full bg-[#0b0b18]/90 px-3 py-2 text-xs font-medium text-white shadow-lg ring-1 ring-white/10 backdrop-blur-md hover:bg-[#0b0b18]"
          style={{ right: rightOffsetPx, bottom: panelBottomPx }}
          onClick={() => setIsMinimized(false)}
          aria-label="Restore chat"
        >
          <FiMessageCircle />
          Chat
        </button>
      )}

      <button
        type="button"
        className="fixed z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-fuchsia-500 text-white shadow-xl hover:from-indigo-400 hover:to-fuchsia-400 active:scale-95"
        style={{ right: rightOffsetPx, bottom: bottomOffsetPx }}
        onClick={() => {
          setIsOpen((v) => !v);
          setIsMinimized(false);
        }}
        aria-label="Open assistant"
      >
        <FiMessageCircle className="text-2xl" />
      </button>
    </>
  );
}
