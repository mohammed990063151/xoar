"use client";

import { useEffect, useRef, useState, type ReactElement, type ReactNode } from "react";
import Link from "next/link";
import { getApiBaseUrl } from "@/lib/api-base";
import type { Locale } from "@/lib/i18n";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface SearchHit {
  kind: string;
  title: string;
  text: string;
  href: string;
  meta: string;
}

interface SiteAssistantProps {
  readonly locale: Locale;
}

const copy = {
  ar: {
    bubble: "هل يمكنني مساعدتك؟",
    title: "مساعد إكسورا",
    subtitle: "أبحث في الأنشطة والأعمال والفعاليات الحقيقية",
    placeholder: "اكتب سؤالك…",
    send: "إرسال",
    close: "إغلاق المساعد",
    open: "افتح مساعد إكسورا",
    grow: "تكبير الصندوق",
    shrink: "تصغير الصندوق",
    suggestions: ["أنشطة في الرياض", "أعمالنا", "فعالياتنا", "كيف أسجل كشريك؟", "كيف أسجل كعميل؟", "كيف أتواصل معكم؟"],
    error: "تعذر الرد الآن. حاول مرة أخرى.",
  },
  en: {
    bubble: "Can I help you?",
    title: "Xora assistant",
    subtitle: "I search live activities, work, and events",
    placeholder: "Ask a question…",
    send: "Send",
    close: "Close assistant",
    open: "Open Xora assistant",
    grow: "Enlarge chat",
    shrink: "Shrink chat",
    suggestions: ["Activities", "Our work", "Our events", "How do I become a partner?", "How do I create an account?", "How do I contact you?"],
    error: "Could not reply right now. Please try again.",
  },
} as const;

function SparkIcon(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" className="relative z-10 h-7 w-7" fill="none" aria-hidden>
      <path
        d="M12 2.5l1.4 5.2L18.5 9 13.4 10.3 12 15.5 10.6 10.3 5.5 9l4.7-1.3L12 2.5z"
        fill="currentColor"
      />
      <path
        d="M18 13.5l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}

function renderRichText(text: string): ReactNode[] {
  const chunks = text.split(/(\[[^\]]+\]\([^)]+\))/g);

  return chunks.map((chunk, index) => {
    const match = chunk.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (!match) {
      return <span key={index}>{chunk}</span>;
    }

    const href = match[2];
    if (!href.startsWith("/")) {
      return <span key={index}>{match[1]}</span>;
    }

    return (
      <Link key={index} href={href} className="font-semibold text-cyan-300 underline-offset-2 hover:underline">
        {match[1]}
      </Link>
    );
  });
}

export function SiteAssistant({ locale }: SiteAssistantProps): ReactElement {
  const text = copy[locale];
  const [open, setOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [results, setResults] = useState<SearchHit[]>([]);
  const [size, setSize] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowBubble(false), 7000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function ask(question: string): Promise<void> {
    const content = question.trim();
    if (!content || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setDraft("");
    setOpen(true);
    setShowBubble(false);
    setLoading(true);

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/assistant/chat`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ locale, messages: nextMessages.slice(-8) }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        data?: { reply?: string; results?: SearchHit[] };
      };
      const reply = body.data?.reply?.trim() || text.error;
      setMessages([...nextMessages, { role: "assistant", content: reply }]);
      setResults(Array.isArray(body.data?.results) ? body.data.results : []);
    } catch {
      setMessages([...nextMessages, { role: "assistant", content: text.error }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="site-assistant" dir={locale === "ar" ? "rtl" : "ltr"}>
      {open ? (
        <section className={`site-assistant__panel is-size-${size}`} aria-label={text.title}>
          <header className="site-assistant__head">
            <div>
              <strong>{text.title}</strong>
              <p>{text.subtitle}</p>
            </div>
            <div className="site-assistant__actions">
              <button
                type="button"
                onClick={() => setSize((value) => Math.max(0, value - 1))}
                disabled={size === 0}
                aria-label={text.shrink}
              >
                –
              </button>
              <button
                type="button"
                onClick={() => setSize((value) => Math.min(2, value + 1))}
                disabled={size === 2}
                aria-label={text.grow}
              >
                +
              </button>
              <button type="button" className="site-assistant__close" onClick={() => setOpen(false)} aria-label={text.close}>
                ×
              </button>
            </div>
          </header>
          <div ref={listRef} className="site-assistant__log">
            {messages.length === 0 ? (
              <div className="site-assistant__suggestions">
                {text.suggestions.map((item) => (
                  <button key={item} type="button" onClick={() => void ask(item)}>
                    {item}
                  </button>
                ))}
              </div>
            ) : (
              messages.map((message, index) => (
                <p key={`${message.role}-${index}`} className={message.role === "user" ? "is-user" : "is-bot"}>
                  {renderRichText(message.content)}
                </p>
              ))
            )}
            {loading ? <p className="is-bot site-assistant__typing">…</p> : null}
          </div>
          {results.length > 0 ? (
            <div className="site-assistant__hits">
              {results.slice(0, 3).map((hit) => (
                <Link key={hit.href} href={hit.href}>
                  {hit.title}
                </Link>
              ))}
            </div>
          ) : null}
          <form
            className="site-assistant__form"
            onSubmit={(event) => {
              event.preventDefault();
              void ask(draft);
            }}
          >
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={text.placeholder}
              aria-label={text.placeholder}
              maxLength={1000}
            />
            <button type="submit" disabled={loading || draft.trim() === ""}>
              {text.send}
            </button>
          </form>
        </section>
      ) : null}

      <div className="site-assistant__launcher">
        {showBubble && !open ? <span className="site-assistant__bubble">{text.bubble}</span> : null}
        <button
          type="button"
          className="site-assistant__button"
          aria-label={open ? text.close : text.open}
          onClick={() => {
            setOpen((value) => !value);
            setShowBubble(false);
          }}
        >
          <span className="site-assistant__rings" aria-hidden>
            <span />
            <span />
            <span />
          </span>
          <SparkIcon />
        </button>
      </div>
    </div>
  );
}
