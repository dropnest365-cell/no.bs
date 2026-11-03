import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight, Bot, CheckCircle2, Loader2, MessageSquarePlus, Send, ShieldAlert, Sparkles, Trash2, UserRound, X,
} from 'lucide-react';
import { api, ApiError } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { AiStatus, ConversationSummary, Message } from '../lib/types';
import { PageHeader, ErrorBlock, LoadingBlock, Badge, EmptyState } from '../components/ui';
import { Markdown } from '../components/Markdown';
import { cn, formatDateTime } from '../lib/format';

const STARTERS = [
  'I have ₹50,000 and 15 hours a week. Which business should I start?',
  'How do I find my first 10 customers for a tutoring business?',
  'What should I check before registering a food business in India?',
  'How should I price a freelance design service?',
  'How do I validate a business idea before spending money?',
];

export function MentorPage() {
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<AiStatus | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(searchParams.get('q') || '');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());
  const [showList, setShowList] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const skipLoadRef = useRef<string | null>(null);

  useEffect(() => {
    api<AiStatus>('/api/mentor/status').then(setStatus).catch(() => setStatus(null));
  }, []);

  async function loadConversations() {
    if (!user) return;
    setLoadingConversations(true);
    try {
      const response = await api<{ items: ConversationSummary[] }>('/api/mentor/conversations');
      setConversations(response.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load conversations.');
    } finally {
      setLoadingConversations(false);
    }
  }

  useEffect(() => {
    if (!user) return;
    void loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    const requested = searchParams.get('conversation');
    if (!requested || activeId === requested) return;
    if (conversations.some((conversation) => conversation.id === requested)) {
      setActiveId(requested);
      setShowList(false);
    }
  }, [searchParams, conversations, activeId]);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    if (skipLoadRef.current === activeId) {
      skipLoadRef.current = null;
      setLoadingMessages(false);
      return;
    }
    let active = true;
    setLoadingMessages(true);
    api<{ messages: Message[] }>(`/api/mentor/conversations/${activeId}`)
      .then((response) => {
        if (active) setMessages(response.messages);
      })
      .catch((err) => {
        if (active) setError(err instanceof ApiError ? err.message : 'Could not load messages.');
      })
      .finally(() => active && setLoadingMessages(false));
    return () => { active = false; };
  }, [activeId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, sending]);

  async function createConversation(select = true) {
    const response = await api<{ conversation: { id: string; title: string } }>('/api/mentor/conversations', {
      method: 'POST',
      body: {},
    });
    const conversation: ConversationSummary = {
      id: response.conversation.id,
      title: response.conversation.title,
      messageCount: 0,
      updatedAt: new Date().toISOString(),
    };
    setConversations((current) => [conversation, ...current]);
    if (select) {
      setActiveId(conversation.id);
      setMessages([]);
      setShowList(false);
    }
    setError('');
    return conversation.id;
  }

  async function send(event?: FormEvent) {
    event?.preventDefault();
    const question = input.trim();
    if (!question || sending) return;
    if (!user) return;

    setSending(true);
    setError('');
    setNotice('');
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      role: 'USER',
      content: question,
      source: 'USER',
      createdAt: new Date().toISOString(),
    };
    setMessages((current) => [...current, optimistic]);
    setInput('');

    try {
      const hadConversation = Boolean(activeId);
      const conversationId = activeId || (await createConversation(false));
      const response = await api<{
        userMessage: Message;
        assistantMessage: Message;
        conversation: { id: string; title: string };
        fallbackReason?: string | null;
      }>(`/api/mentor/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: { content: question },
      });
      setMessages((current) => [
        ...current.filter((message) => message.id !== optimistic.id),
        response.userMessage,
        response.assistantMessage,
      ]);
      if (!hadConversation) {
        skipLoadRef.current = conversationId;
        setActiveId(conversationId);
      }
      setConversations((current) => {
        const rest = current.filter((item) => item.id !== conversationId);
        const existing = current.find((item) => item.id === conversationId);
        return [{
          id: conversationId,
          title: response.conversation.title,
          messageCount: (existing?.messageCount || 0) + 2,
          lastMessage: response.assistantMessage.content.slice(0, 160),
          updatedAt: new Date().toISOString(),
        }, ...rest];
      });
      if (response.fallbackReason) setNotice(response.fallbackReason);
    } catch (err) {
      setMessages((current) => current.filter((message) => message.id !== optimistic.id));
      setInput(question);
      setError(err instanceof ApiError ? err.message : 'The mentor could not answer. Try again.');
    } finally {
      setSending(false);
    }
  }

  async function removeConversation(id: string) {
    if (!window.confirm('Delete this conversation and its messages?')) return;
    try {
      await api(`/api/mentor/conversations/${id}`, { method: 'DELETE' });
      setConversations((current) => current.filter((item) => item.id !== id));
      if (activeId === id) {
        setActiveId(null);
        setMessages([]);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete conversation.');
    }
  }

  async function submitForReview(messageId: string) {
    try {
      await api(`/api/mentor/messages/${messageId}/submit-review`, { method: 'POST', body: {} });
      setSubmitted((current) => new Set(current).add(messageId));
      setNotice('Submitted for admin review. It will not be published unless an admin approves it.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit for review.');
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void send();
    }
  }

  if (authLoading) {
    return <div className="container-page py-20"><LoadingBlock /></div>;
  }

  if (!user) {
    return (
      <div>
        <PageHeader
          eyebrow="AI business mentor"
          title={<>Think it through,<br /><span className="italic text-brand-700">then act.</span></>}
          description="A chat-style mentor for choosing ideas, finding customers, pricing, budgeting and registration basics. Create a free account to keep your conversation history."
          actions={<><Link to="/register" className="btn-primary">Create free account <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link><Link to="/login" className="btn-secondary">Log in</Link></>}
        />
        <div className="container-page grid gap-8 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
          <div>
            <h2 className="font-display text-3xl text-ink-950">What you can ask</h2>
            <div className="mt-5 space-y-3">
              {STARTERS.map((prompt) => (
                <div key={prompt} className="rounded-xl border border-paper-200 bg-white p-4 text-sm leading-6 text-ink-700">
                  “{prompt}”
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-ink-700">
              <p className="flex items-center gap-2 font-semibold text-ink-900">
                <ShieldAlert className="h-4 w-4 text-amber-700" aria-hidden="true" /> Honest limits
              </p>
              <p className="mt-1.5">
                Answers can be wrong or outdated. This is general guidance, not legal, tax or financial advice.
                Verify official requirements on government portals before acting.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-paper-300 bg-white p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
              <Bot className="h-5 w-5 text-brand-600" aria-hidden="true" /> Mentor mode
            </div>
            <p className="mt-3 text-sm leading-6 text-ink-600">
              {status?.note || 'Checking whether an AI provider is configured…'}
            </p>
            <div className="mt-4 divide-y divide-paper-200 border-y border-paper-200">
              <div className="flex items-center justify-between py-3 text-sm">
                <span className="text-ink-500">Provider</span>
                <span className="font-medium text-ink-900">{status?.enabled ? status.provider : 'Built-in rules'}</span>
              </div>
              <div className="flex items-center justify-between py-3 text-sm">
                <span className="text-ink-500">Conversation history</span>
                <span className="font-medium text-ink-900">Saved to your account</span>
              </div>
              <div className="flex items-center justify-between py-3 text-sm">
                <span className="text-ink-500">Admin review</span>
                <span className="font-medium text-ink-900">Optional, before publishing</span>
              </div>
            </div>
            <Link to="/register" className="btn-primary mt-5 w-full">Start a conversation</Link>
            <p className="mt-2 text-center text-[11px] text-ink-400">No credit card. No paid API required.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="AI business mentor"
        title="Ask better questions."
        description="A practical thinking partner for your business. Answers are labelled by source, saved to your account, and never pretend to be verified research."
        actions={
          status && (
            <span className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold', status.enabled ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-paper-300 bg-white text-ink-600')}>
              <span className={cn('h-1.5 w-1.5 rounded-full', status.enabled ? 'bg-emerald-600' : 'bg-amber-500')} aria-hidden="true" />
              {status.enabled ? `AI connected · ${status.model}` : 'Rule-based mode · no API key'}
            </span>
          )
        }
      />

      <div className="container-page py-6 sm:py-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={() => setShowList((open) => !open)} className="btn-secondary btn-sm lg:hidden">
            <MessageSquarePlus className="h-3.5 w-3.5" aria-hidden="true" />
            {showList ? 'Hide conversations' : 'Conversations'}
          </button>
          <p className="hidden text-xs text-ink-500 lg:block">
            {status?.enabled
              ? 'The configured AI provider generates responses. They may still be wrong. Verify important claims.'
              : 'No AI provider configured. Answers come from NO BS rule-based guidance and never leave this server.'}
          </p>
          <button type="button" onClick={() => void createConversation()} className="btn-dark btn-sm">
            <MessageSquarePlus className="h-3.5 w-3.5" aria-hidden="true" /> New conversation
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className={cn('rounded-2xl border border-paper-200 bg-white', showList ? 'block' : 'hidden lg:block')}>
            <div className="border-b border-paper-200 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">Your conversations</p>
            </div>
            {loadingConversations ? (
              <div className="p-4"><LoadingBlock label="Loading…" className="min-h-[120px]" /></div>
            ) : conversations.length === 0 ? (
              <div className="p-4">
                <p className="text-sm leading-6 text-ink-500">No conversations yet. Ask your first question to start one.</p>
              </div>
            ) : (
              <ul className="max-h-[520px] overflow-y-auto p-2">
                {conversations.map((conversation) => (
                  <li key={conversation.id}>
                    <div className={cn('group flex items-start gap-2 rounded-lg p-2.5', activeId === conversation.id ? 'bg-paper-100' : 'hover:bg-paper-50')}>
                      <button
                        type="button"
                        onClick={() => { setActiveId(conversation.id); setShowList(false); setError(''); }}
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className={cn('truncate text-sm', activeId === conversation.id ? 'font-semibold text-ink-900' : 'text-ink-700')}>
                          {conversation.title}
                        </p>
                        <p className="mt-0.5 text-[11px] text-ink-400">
                          {conversation.messageCount} messages · {formatDateTime(conversation.updatedAt)}
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => void removeConversation(conversation.id)}
                        className="rounded p-1 text-ink-300 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-700 group-hover:opacity-100 focus:opacity-100"
                        aria-label={`Delete conversation ${conversation.title}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t border-paper-200 p-3">
              <p className="text-[10px] leading-4 text-ink-400">
                History is private to your account. Admins can review only answers you explicitly submit.
              </p>
            </div>
          </aside>

          <section className="flex min-h-[560px] flex-col overflow-hidden rounded-2xl border border-paper-200 bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-paper-200 bg-paper-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-900 text-white">
                  <Bot className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink-900">NO BS mentor</p>
                  <p className="text-[10px] text-ink-500">{status?.enabled ? 'AI-assisted answers' : 'Rule-based answers'} · unverified</p>
                </div>
              </div>
              {activeId && (
                <button type="button" onClick={() => setActiveId(null)} className="hidden items-center gap-1 text-xs text-ink-500 hover:text-ink-900 sm:inline-flex">
                  <X className="h-3.5 w-3.5" aria-hidden="true" /> Close
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6" aria-live="polite">
              {error && <ErrorBlock message={error} className="mb-4" />}
              {notice && (
                <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800" role="status">
                  {notice}
                </div>
              )}

              {loadingMessages ? (
                <LoadingBlock label="Loading conversation…" />
              ) : messages.length === 0 ? (
                <div className="mx-auto max-w-xl py-6">
                  <div className="mb-5 text-center">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                      <Sparkles className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <h2 className="mt-3 font-display text-3xl text-ink-950">What are you working through?</h2>
                    <p className="mt-2 text-sm leading-6 text-ink-500">Ask about an idea, a price, a customer problem or a registration question.</p>
                  </div>
                  <div className="space-y-2">
                    {STARTERS.slice(0, 4).map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => setInput(prompt)}
                        className="w-full rounded-lg border border-paper-200 bg-paper-50 px-3.5 py-2.5 text-left text-sm text-ink-600 transition-colors hover:border-ink-400 hover:bg-white"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {messages.map((message) => (
                    <div key={message.id} className={cn('flex gap-3', message.role === 'USER' ? 'justify-end' : 'justify-start')}>
                      {message.role === 'ASSISTANT' && (
                        <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-900 text-white">
                          <Bot className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                      )}
                      <div className={cn('max-w-[88%] sm:max-w-[80%]', message.role === 'USER' ? 'rounded-2xl rounded-tr-sm bg-ink-900 px-4 py-3 text-[15px] leading-7 text-paper-100' : 'min-w-0 flex-1')}>
                        {message.role === 'USER' ? (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        ) : (
                          <div className="rounded-2xl rounded-tl-sm border border-paper-200 bg-paper-50 px-4 py-3">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <Badge tone={message.source === 'AI' ? 'brand' : 'neutral'}>
                                {message.source === 'AI' ? 'AI-generated' : 'Rule-based'}
                              </Badge>
                              <span className="text-[10px] text-ink-400">Unverified · {formatDateTime(message.createdAt)}</span>
                            </div>
                            <Markdown content={message.content} />
                            <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-paper-200 pt-2.5">
                              {submitted.has(message.id) ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Submitted for review
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => void submitForReview(message.id)}
                                  className="text-[11px] font-semibold text-ink-500 underline decoration-paper-300 underline-offset-2 hover:text-ink-900"
                                >
                                  Submit this answer for admin review
                                </button>
                              )}
                              <span className="text-[10px] text-ink-400">Only reviewed content can be published.</span>
                            </div>
                          </div>
                        )}
                        {message.role === 'USER' && (
                          <span className="mt-1 flex items-center justify-end gap-1 text-[10px] text-ink-400">
                            <UserRound className="h-3 w-3" aria-hidden="true" /> You
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {sending && (
                    <div className="flex gap-3">
                      <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-900 text-white">
                        <Bot className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <div className="flex items-center gap-2 rounded-xl border border-paper-200 bg-paper-50 px-4 py-3 text-xs text-ink-500">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Thinking through it…
                      </div>
                    </div>
                  )}
                  <div ref={endRef} />
                </div>
              )}
            </div>

            <form onSubmit={send} className="border-t border-paper-200 bg-white p-3 sm:p-4">
              <label htmlFor="mentor-input" className="sr-only">Your question</label>
              <div className="flex items-end gap-2">
                <textarea
                  id="mentor-input"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  placeholder="Ask about starting, customers, pricing, budgeting or registration…"
                  className="textarea min-h-[52px] flex-1 resize-none"
                  maxLength={3000}
                />
                <button type="submit" disabled={!input.trim() || sending} className="btn-primary h-[52px] w-[52px] shrink-0 p-0" aria-label="Send message">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-ink-400">
                <span>Enter to send · Shift+Enter for a new line · {input.length}/3000</span>
                <span>Answers may be wrong. Verify official requirements.</span>
              </div>
            </form>
          </section>
        </div>

        <div className="mt-6 rounded-xl border border-paper-300 bg-paper-50 p-4 text-xs leading-6 text-ink-500">
          <strong className="text-ink-700">What this mentor is not:</strong> a lawyer, chartered accountant, financial adviser or market-research agency.
          It does not guarantee income, approvals or success. Its answers are generated from rules or an AI model and are not verified until a human admin reviews them.
        </div>
      </div>
    </div>
  );
}
