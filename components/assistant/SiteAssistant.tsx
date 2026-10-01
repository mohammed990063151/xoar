"use client";

import { useEffect, useRef, useState, type ReactElement, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getApiBaseUrl } from "@/lib/api-base";
import type { Locale } from "@/lib/i18n";
import { normalizeStorageImageUrl } from "@/lib/image-url";

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
  image?: string;
}

interface SiteAssistantProps {
  readonly locale: Locale;
}

const copy = {
  ar: {
    bubble: "هلا، أنا نورة. أقدر أساعدك؟",
    title: "نورة",
    subtitle: "أشرح لك أي شيء في المنصة",
    status: "متصلة الآن",
    hello: "هلا والله، أنا نورة. اسألني عن الأنشطة، أو الأعمال، أو الفعاليات، أو كيف تسجّل، وأشرحها لك. وإذا سألت عن شيء معيّن أوريك صورته.",
    typing: "نورة تكتب…",
    placeholder: "اكتب سؤالك…",
    send: "إرسال",
    close: "إغلاق المساعد",
    open: "افتح مساعد إكسورا",
    grow: "تكبير الصندوق",
    shrink: "تصغير الصندوق",
    suggestions: ["أنشطة في الرياض", "أعمالنا", "أبي أسوي فعالية", "كيف أسجل كشريك؟", "كيف أسجل كعميل؟", "كيف أتواصل معكم؟"],
    error: "تعذر الرد الآن. حاول مرة أخرى.",
  },
  en: {
    bubble: "Hi, I'm Noura. Need a hand?",
    title: "Noura",
    subtitle: "I explain anything on the site",
    status: "Online",
    hello: "Hi, I'm Noura. Ask me about activities, our work, events, or how to register, and I'll explain it. If you ask about something specific, I'll show you its photo.",
    typing: "Noura is writing…",
    placeholder: "Ask a question…",
    send: "Send",
    close: "Close assistant",
    open: "Open Xora assistant",
    grow: "Enlarge chat",
    shrink: "Shrink chat",
    suggestions: ["Activities", "Our work", "I want to create an event", "How do I become a partner?", "How do I create an account?", "How do I contact you?"],
    error: "Could not reply right now. Please try again.",
  },
} as const;

function SendIcon(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path d="M4 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NouraFace(): ReactElement {
  return (
    <span className="site-assistant__face">
      <img src="/noura-avatar.jpg" alt="" />
      <span className="site-assistant__shine" />
    </span>
  );
}

function visibleAssistantText(content: string): string {
  return content.replace(/\s*\[\[noura:[a-z]+:[a-z_]+:[A-Za-z0-9+/=]+\]\]/g, "").trim();
}

function messageDir(content: string): "rtl" | "ltr" {
  const arabic = content.match(/[\u0600-\u06FF]/g)?.length ?? 0;
  const latin = content.match(/[A-Za-z]/g)?.length ?? 0;
  return latin > arabic ? "ltr" : "rtl";
}

function renderRichText(text: string, onOpen?: () => void): ReactNode[] {
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
      <Link key={index} href={href} className="font-semibold text-cyan-300 underline-offset-2 hover:underline" onClick={() => onOpen?.()}>
        {match[1]}
      </Link>
    );
  });
}

export function SiteAssistant({ locale }: SiteAssistantProps): ReactElement {
  const text = copy[locale];
  const router = useRouter();
  const pathname = usePathname();
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
        body: JSON.stringify({ locale, messages: nextMessages.slice(-12) }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        data?: { reply?: string; results?: SearchHit[]; open?: string | null };
        message?: string;
      };
      const fallbackError = messageDir(content) === "ltr" ? copy.en.error : copy.ar.error;
      const reply = body.data?.reply?.trim() || body.message?.trim() || fallbackError;
      const hits = Array.isArray(body.data?.results) ? body.data.results : [];
      const target = body.data?.open;
      setMessages([...nextMessages, { role: "assistant", content: reply }]);
      setResults(hits);
      if (typeof target === "string" && target.startsWith("/") && target !== pathname) {
        setOpen(false);
        router.push(target);
      }
    } catch {
      setMessages([...nextMessages, { role: "assistant", content: messageDir(content) === "ltr" ? copy.en.error : copy.ar.error }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`site-assistant is-size-${size}`} dir={locale === "ar" ? "rtl" : "ltr"}>
      {open ? (
        <section className="site-assistant__panel" aria-label={text.title}>
          <header className="site-assistant__head">
            <div className="site-assistant__identity">
              <span className="site-assistant__avatar" aria-hidden>
                <img src="/noura-avatar.jpg" alt="" />
              </span>
              <div>
                <strong>{text.title}</strong>
                <p>
                  <span className="site-assistant__online" />
                  {text.status}
                </p>
              </div>
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
            <p className="is-bot" dir={messageDir(text.hello)}>{text.hello}</p>
            {messages.length === 0 ? (
              <div className="site-assistant__suggestions">
                {text.suggestions.map((item) => (
                  <button key={item} type="button" onClick={() => void ask(item)}>
                    {item}
                  </button>
                ))}
              </div>
            ) : (
              messages.map((message, index) => {
                const shown = message.role === "assistant" ? visibleAssistantText(message.content) : message.content;
                return (
                  <p key={`${message.role}-${index}`} className={message.role === "user" ? "is-user" : "is-bot"} dir={messageDir(shown)}>
                    {renderRichText(shown, () => setOpen(false))}
                  </p>
                );
              })
            )}
            {results.length > 0 ? (
              <div className="site-assistant__cards">
                {results.slice(0, 3).map((hit) => {
                  const image = hit.image ? normalizeStorageImageUrl(hit.image) : "";
                  return (
                    <Link
                      key={hit.href}
                      href={hit.href}
                      className="site-assistant__card"
                      onClick={() => setOpen(false)}
                    >
                      {image.startsWith("/storage/") || image.startsWith("https://") ? (
                        <img src={image} alt="" />
                      ) : (
                        <span className="site-assistant__card-fallback" aria-hidden />
                      )}
                      <span>
                        <strong>{hit.title}</strong>
                        {hit.meta ? <small>{hit.meta}</small> : null}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : null}
            {loading ? <p className="is-bot site-assistant__typing">{text.typing}</p> : null}
          </div>
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
            <button type="submit" disabled={loading || draft.trim() === ""} aria-label={text.send}>
              <SendIcon />
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
          <NouraFace />
          <span className="site-assistant__live" aria-hidden />
        </button>
      </div>
    </div>
  );
}
