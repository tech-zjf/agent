'use client';

import { ReactNode, startTransition, useEffect, useMemo, useState } from 'react';
import {
    $agentApi,
    AuditEventRecord,
    CreateKnowledgeArticlePayload,
    CreateTicketPayload,
    DraftReplyPayload,
    DraftReplyResult,
    KnowledgeArticle,
    TicketRecord,
} from '@/services';
import { formatDateTime } from '@/utils';

const defaultDraftForm: DraftReplyPayload = {
    conversationId: 'conv_001',
    customerId: 'cus_001',
    question: '我昨天签收，今天还能退吗？',
    channel: 'wechat',
};

const defaultKnowledgeForm: CreateKnowledgeArticlePayload = {
    title: '退换货政策',
    content: '签收后 7 天内可申请退货，商品需不影响二次销售。',
    tags: ['售后', '退货'],
};

const actionMeta = {
    reply: {
        label: '直接回复',
        badge: 'bg-emerald-100 text-emerald-800',
        border: 'border-emerald-200',
    },
    clarify: {
        label: '先澄清',
        badge: 'bg-amber-100 text-amber-800',
        border: 'border-amber-200',
    },
    escalate: {
        label: '升级人工',
        badge: 'bg-rose-100 text-rose-800',
        border: 'border-rose-200',
    },
} as const;

const generationMeta = {
    ai: {
        label: 'AI 生成',
        badge: 'bg-sky-100 text-sky-800',
    },
    rule: {
        label: '规则兜底',
        badge: 'bg-slate-200 text-slate-700',
    },
} as const;

interface ConversationTurn {
    id: string;
    question: string;
    result: DraftReplyResult;
    createdAt: string;
}

export function CopilotWorkbench() {
    const [draftForm, setDraftForm] = useState<DraftReplyPayload>(defaultDraftForm);
    const [knowledgeForm, setKnowledgeForm] = useState<CreateKnowledgeArticlePayload>(defaultKnowledgeForm);
    const [draftResult, setDraftResult] = useState<DraftReplyResult | null>(null);
    const [conversationTurns, setConversationTurns] = useState<ConversationTurn[]>([]);
    const [tickets, setTickets] = useState<TicketRecord[]>([]);
    const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
    const [events, setEvents] = useState<AuditEventRecord[]>([]);
    const [pageError, setPageError] = useState<string | null>(null);
    const [pageHint, setPageHint] = useState<string>('服务已连接，可以直接开始联调。');
    const [isBootstrapping, setIsBootstrapping] = useState(false);
    const [isDraftSubmitting, setIsDraftSubmitting] = useState(false);
    const [isKnowledgeSubmitting, setIsKnowledgeSubmitting] = useState(false);
    const [isTicketSubmitting, setIsTicketSubmitting] = useState(false);

    useEffect(() => {
        void refreshConsole();
    }, []);

    async function refreshConsole() {
        try {
            setIsBootstrapping(true);
            const [nextArticles, nextTickets, nextEvents] = await Promise.all([
                $agentApi.knowledge.list(),
                $agentApi.tickets.list(),
                $agentApi.audit.list(8),
            ]);

            startTransition(() => {
                setArticles(nextArticles);
                setTickets(nextTickets);
                setEvents(nextEvents);
                setPageError(null);
            });
        } catch (error) {
            startTransition(() => {
                setPageError(extractErrorMessage(error));
            });
        } finally {
            setIsBootstrapping(false);
        }
    }

    function updateDraftForm<Key extends keyof DraftReplyPayload>(key: Key, value: DraftReplyPayload[Key]) {
        setDraftForm((current) => ({
            ...current,
            [key]: value,
        }));
    }

    function updateKnowledgeForm<Key extends keyof CreateKnowledgeArticlePayload>(key: Key, value: CreateKnowledgeArticlePayload[Key]) {
        setKnowledgeForm((current) => ({
            ...current,
            [key]: value,
        }));
    }

    function submitDraft() {
        void (async () => {
            try {
                setIsDraftSubmitting(true);
                const question = draftForm.question.trim();
                const result = await $agentApi.copilot.draftReply({
                    ...draftForm,
                    question,
                });

                startTransition(() => {
                    setDraftResult(result);
                    setConversationTurns((current) => [
                        ...current,
                        {
                            id: `${draftForm.conversationId}-${Date.now()}`,
                            question,
                            result,
                            createdAt: new Date().toISOString(),
                        },
                    ]);
                    setPageHint(`已生成草稿，当前策略：${actionMeta[result.action].label}。`);
                });

                await refreshConsole();
            } catch (error) {
                startTransition(() => {
                    setPageError(extractErrorMessage(error));
                });
            } finally {
                setIsDraftSubmitting(false);
            }
        })();
    }

    function submitKnowledge() {
        void (async () => {
            try {
                setIsKnowledgeSubmitting(true);
                await $agentApi.knowledge.create({
                    title: knowledgeForm.title.trim(),
                    content: knowledgeForm.content.trim(),
                    tags: parseTags(knowledgeForm.tags),
                });

                startTransition(() => {
                    setPageHint('知识库已补充，下一次生成草稿会立刻参与检索。');
                });
                await refreshConsole();
            } catch (error) {
                startTransition(() => {
                    setPageError(extractErrorMessage(error));
                });
            } finally {
                setIsKnowledgeSubmitting(false);
            }
        })();
    }

    function createTicketFromDraft() {
        const ticketSuggestion = draftResult?.ticketSuggestion;
        if (!ticketSuggestion) {
            return;
        }

        void (async () => {
            try {
                setIsTicketSubmitting(true);
                const payload: CreateTicketPayload = {
                    conversationId: draftForm.conversationId,
                    customerId: draftForm.customerId,
                    title: ticketSuggestion.title,
                    description: ticketSuggestion.description,
                    priority: ticketSuggestion.priority,
                };

                await $agentApi.tickets.create(payload);
                startTransition(() => {
                    setPageHint('工单已创建，客服可以转给人工二线继续处理。');
                });
                await refreshConsole();
            } catch (error) {
                startTransition(() => {
                    setPageError(extractErrorMessage(error));
                });
            } finally {
                setIsTicketSubmitting(false);
            }
        })();
    }

    const currentAction = draftResult ? actionMeta[draftResult.action] : null;
    const currentGeneration = draftResult ? generationMeta[draftResult.generation.source] : null;
    const latestArticles = useMemo(() => articles.slice(0, 4), [articles]);
    const latestTickets = useMemo(() => tickets.slice(0, 4), [tickets]);
    const latestEvents = useMemo(() => events.slice(0, 5), [events]);

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#f2efe8_0%,#efe8dc_34%,#f7f3ec_100%)] text-slate-900">
            <div className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
                <section className="overflow-hidden rounded-[32px] border border-black/5 bg-[linear-gradient(135deg,rgba(255,250,243,0.96),rgba(255,255,255,0.84))] shadow-[0_24px_80px_-40px_rgba(120,93,49,0.35)]">
                    <div className="grid gap-8 px-6 py-7 sm:px-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
                        <div>
                            <div className="inline-flex items-center gap-3 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs font-medium tracking-[0.24em] text-slate-500 uppercase">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                Customer Copilot Desk
                            </div>
                            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[0.96] tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl">
                                让客服先拿到一份能发出去的答案，再决定要不要升级人工
                            </h1>
                            <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                                这不是演示页，而是一张可联调的客服工作台。左侧处理对话输入，右侧集中看草稿来源、知识命中、工单建议和审计轨迹。
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <MetricCard label="知识条目" value={String(articles.length)} note="可检索内容池" />
                            <MetricCard label="工单" value={String(tickets.length)} note="人工接力池" />
                            <MetricCard label="审计" value={String(events.length)} note="全链路留痕" />
                        </div>
                    </div>
                </section>

                <StatusBar hint={pageHint} error={pageError} loading={isBootstrapping} />

                <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_420px]">
                    <div className="space-y-6">
                        <WorkbenchCard
                            title="对话工作区"
                            description="上面看聊天轨迹，下面直接输入一条客户问题并生成草稿。"
                            actionSlot={
                                <button
                                    type="button"
                                    onClick={submitDraft}
                                    disabled={isDraftSubmitting}
                                    className="inline-flex min-w-32 items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isDraftSubmitting ? '生成中...' : '生成草稿'}
                                </button>
                            }
                        >
                            <div className="rounded-[28px] border border-black/5 bg-[linear-gradient(180deg,#fbfaf7_0%,#f5f0e7_100%)] p-4 shadow-inner sm:p-5">
                                <div className="flex items-center justify-between gap-3 border-b border-black/6 pb-4">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">实时对话</p>
                                        <p className="mt-1 text-xs text-slate-500">当前会话里的客户问题与 Copilot 草稿会追加在这里</p>
                                    </div>
                                    <div className="rounded-full bg-white px-3 py-1 text-xs text-slate-500">{conversationTurns.length} 条</div>
                                </div>

                                <div className="mt-4 flex h-[360px] flex-col gap-4 overflow-y-auto pr-1 sm:h-[420px]">
                                    {conversationTurns.length === 0 ? (
                                        <EmptyState text="先提交一条客户问题，这里会出现“客户消息 -> Copilot 草稿”的联调轨迹。" />
                                    ) : (
                                        conversationTurns
                                            .slice()
                                            .reverse()
                                            .map((turn) => {
                                                const turnAction = actionMeta[turn.result.action];
                                                const turnGeneration = generationMeta[turn.result.generation.source];

                                                return (
                                                    <article key={turn.id} className="space-y-3 rounded-[24px] border border-black/5 bg-white p-4 shadow-[0_18px_40px_-35px_rgba(15,23,42,0.35)]">
                                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                                            <p className="text-xs font-medium tracking-[0.18em] text-slate-400 uppercase">
                                                                {formatDateTime(turn.createdAt)}
                                                            </p>
                                                            <div className="flex flex-wrap gap-2">
                                                                <Badge className={turnGeneration.badge}>{turnGeneration.label}</Badge>
                                                                <Badge className={turnAction.badge}>{turnAction.label}</Badge>
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-end">
                                                            <div className="max-w-[88%] rounded-[24px] rounded-br-md bg-slate-950 px-4 py-3 text-sm leading-7 text-white shadow-sm">
                                                                {turn.question}
                                                            </div>
                                                        </div>

                                                        <div className="max-w-[88%] rounded-[24px] rounded-bl-md border border-[#dcc9a5] bg-[#fcf6ea] px-4 py-3 text-sm leading-7 text-slate-800 shadow-sm">
                                                            {turn.result.draftReply}
                                                        </div>

                                                        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                                                            <span>置信度 {Math.round(turn.result.confidence * 100)}%</span>
                                                            <span>知识命中 {turn.result.citations.length} 条</span>
                                                            <span>
                                                                来源：
                                                                {turn.result.generation.source === 'ai'
                                                                    ? `${turn.result.generation.provider} / ${turn.result.generation.model}`
                                                                    : turn.result.generation.aiEnabled
                                                                      ? 'AI 失败后回退规则'
                                                                      : '规则模式'}
                                                            </span>
                                                        </div>

                                                        {turn.result.generation.fallbackReason ? (
                                                            <InlineNotice tone="warning">AI 回退原因：{turn.result.generation.fallbackReason}</InlineNotice>
                                                        ) : null}
                                                    </article>
                                                );
                                            })
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-2">
                                <Field label="会话 ID">
                                    <input
                                        value={draftForm.conversationId}
                                        onChange={(event) => updateDraftForm('conversationId', event.target.value)}
                                        className={inputClassName}
                                    />
                                </Field>
                                <Field label="客户 ID">
                                    <input
                                        value={draftForm.customerId}
                                        onChange={(event) => updateDraftForm('customerId', event.target.value)}
                                        className={inputClassName}
                                    />
                                </Field>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
                                <Field label="渠道">
                                    <select
                                        value={draftForm.channel}
                                        onChange={(event) => updateDraftForm('channel', event.target.value as DraftReplyPayload['channel'])}
                                        className={inputClassName}
                                    >
                                        <option value="wechat">微信</option>
                                        <option value="webchat">Web Chat</option>
                                        <option value="email">Email</option>
                                        <option value="other">其他</option>
                                    </select>
                                </Field>
                                <Field label="客户问题">
                                    <textarea
                                        rows={4}
                                        value={draftForm.question}
                                        onChange={(event) => updateDraftForm('question', event.target.value)}
                                        className={`${inputClassName} min-h-[132px] resize-y`}
                                    />
                                </Field>
                            </div>
                        </WorkbenchCard>
                    </div>

                    <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
                        <WorkbenchCard
                            title="结果检视"
                            description="这里专门看当前这次草稿的来源、动作、引用和升级建议。"
                            actionSlot={
                                draftResult?.ticketSuggestion ? (
                                    <button
                                        type="button"
                                        onClick={createTicketFromDraft}
                                        disabled={isTicketSubmitting}
                                        className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-950 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {isTicketSubmitting ? '创建中...' : '创建工单'}
                                    </button>
                                ) : null
                            }
                        >
                            {draftResult ? (
                                <div className="space-y-4">
                                    <div className={`rounded-[24px] border bg-white p-4 ${currentAction?.border}`}>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge className={currentAction?.badge}>{currentAction?.label}</Badge>
                                            <Badge className={currentGeneration?.badge}>{currentGeneration?.label}</Badge>
                                            <span className="text-xs text-slate-500">置信度 {Math.round(draftResult.confidence * 100)}%</span>
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                                            <span>AI 开关：{draftResult.generation.aiEnabled ? '开启' : '关闭'}</span>
                                            <span>
                                                来源：
                                                {draftResult.generation.source === 'ai'
                                                    ? `${draftResult.generation.provider} / ${draftResult.generation.model}`
                                                    : draftResult.generation.aiEnabled
                                                      ? 'AI 失败后回退规则'
                                                      : '规则模式'}
                                            </span>
                                        </div>
                                        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-800">{draftResult.draftReply}</p>
                                    </div>

                                    {draftResult.clarifyQuestion ? <InlineNotice tone="default">建议补问：{draftResult.clarifyQuestion}</InlineNotice> : null}
                                    {draftResult.generation.fallbackReason ? (
                                        <InlineNotice tone="warning">AI 回退原因：{draftResult.generation.fallbackReason}</InlineNotice>
                                    ) : null}

                                    <SectionBlock title="引用知识">
                                        {draftResult.citations.length === 0 ? (
                                            <EmptyState text="当前没有命中知识条目。" compact />
                                        ) : (
                                            <div className="space-y-3">
                                                {draftResult.citations.map((citation) => (
                                                    <article key={citation.articleId} className="rounded-[20px] border border-black/5 bg-[#faf7f0] p-3.5">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <h3 className="text-sm font-semibold text-slate-900">{citation.title}</h3>
                                                            <span className="text-xs text-slate-400">{citation.score.toFixed(2)}</span>
                                                        </div>
                                                        <p className="mt-2 text-sm leading-6 text-slate-600">{citation.snippet}</p>
                                                    </article>
                                                ))}
                                            </div>
                                        )}
                                    </SectionBlock>

                                    <SectionBlock title="会话记忆">
                                        <div className="rounded-[20px] border border-black/5 bg-[#faf7f0] p-3.5 text-sm leading-7 text-slate-600">
                                            <p>摘要：{draftResult.memory.conversationSummary}</p>
                                            <p className="mt-2">客户事实：{draftResult.memory.customerFacts.join('；') || '暂无'}</p>
                                        </div>
                                    </SectionBlock>
                                </div>
                            ) : (
                                <EmptyState text="先生成一条草稿，这里才会出现结果检视。" compact />
                            )}
                        </WorkbenchCard>

                        <WorkbenchCard
                            title="知识补录"
                            description="当草稿命中不足时，可以先补一条规则，再立即重试。"
                            actionSlot={
                                <button
                                    type="button"
                                    onClick={submitKnowledge}
                                    disabled={isKnowledgeSubmitting}
                                    className="inline-flex items-center justify-center rounded-full bg-[#b48234] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#9d6f28] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isKnowledgeSubmitting ? '写入中...' : '补知识'}
                                </button>
                            }
                        >
                            <Field label="标题">
                                <input
                                    value={knowledgeForm.title}
                                    onChange={(event) => updateKnowledgeForm('title', event.target.value)}
                                    className={inputClassName}
                                />
                            </Field>
                            <Field label="标签（逗号分隔）">
                                <input
                                    value={Array.isArray(knowledgeForm.tags) ? knowledgeForm.tags.join(', ') : ''}
                                    onChange={(event) => updateKnowledgeForm('tags', event.target.value.split(','))}
                                    className={inputClassName}
                                />
                            </Field>
                            <Field label="正文">
                                <textarea
                                    rows={4}
                                    value={knowledgeForm.content}
                                    onChange={(event) => updateKnowledgeForm('content', event.target.value)}
                                    className={`${inputClassName} min-h-[120px] resize-y`}
                                />
                            </Field>
                            <div className="space-y-2">
                                <p className="text-xs font-medium tracking-[0.16em] text-slate-400 uppercase">最近知识</p>
                                <div className="space-y-2">
                                    {latestArticles.length === 0 ? (
                                        <EmptyState text="还没有知识条目。" compact />
                                    ) : (
                                        latestArticles.map((article) => (
                                            <div key={article.id} className="rounded-[18px] border border-black/5 bg-[#faf7f0] px-3 py-3 text-sm text-slate-600">
                                                <p className="font-semibold text-slate-900">{article.title}</p>
                                                <p className="mt-1 line-clamp-2 leading-6">{article.content}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </WorkbenchCard>

                        <WorkbenchCard title="工单与审计" description="最近的升级单和系统行为会统一留在这里。">
                            <SectionBlock title="最近工单">
                                {latestTickets.length === 0 ? (
                                    <EmptyState text="还没有工单。" compact />
                                ) : (
                                    <div className="space-y-2.5">
                                        {latestTickets.map((ticket) => (
                                            <article key={ticket.id} className="rounded-[20px] border border-black/5 bg-white px-4 py-3.5">
                                                <div className="flex items-center justify-between gap-3">
                                                    <h3 className="text-sm font-semibold text-slate-900">{ticket.title}</h3>
                                                    <Badge className="bg-slate-200 text-slate-700">{ticket.priority}</Badge>
                                                </div>
                                                <p className="mt-2 text-sm leading-6 text-slate-600">{ticket.description}</p>
                                                <p className="mt-2 text-xs text-slate-400">{formatDateTime(ticket.createdAt)}</p>
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </SectionBlock>

                            <SectionBlock title="审计日志">
                                {latestEvents.length === 0 ? (
                                    <EmptyState text="还没有审计事件。" compact />
                                ) : (
                                    <div className="space-y-2.5">
                                        {latestEvents.map((event) => (
                                            <article key={event.id} className="rounded-[20px] border border-black/5 bg-[#1f1b16] px-4 py-3.5 text-[#f7efe3]">
                                                <div className="flex items-center justify-between gap-3">
                                                    <p className="text-sm font-semibold">{event.eventType}</p>
                                                    <span className="text-xs text-[#d3c4ad]">{formatDateTime(event.createdAt)}</span>
                                                </div>
                                                <pre className="mt-3 overflow-x-auto text-xs leading-6 text-[#e6dac9]">
                                                    {JSON.stringify(event.payload, null, 2)}
                                                </pre>
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </SectionBlock>
                        </WorkbenchCard>
                    </div>
                </section>
            </div>
        </div>
    );
}

function WorkbenchCard({
    title,
    description,
    children,
    actionSlot,
}: {
    title: string;
    description: string;
    children: ReactNode;
    actionSlot?: ReactNode;
}) {
    return (
        <section className="rounded-[30px] border border-black/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,249,241,0.94))] p-5 shadow-[0_24px_70px_-42px_rgba(75,58,28,0.28)] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-xl">
                    <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-950">{title}</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
                </div>
                {actionSlot}
            </div>
            <div className="mt-5 space-y-5">{children}</div>
        </section>
    );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            {children}
        </label>
    );
}

function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
    return (
        <article className="rounded-[24px] border border-black/5 bg-[rgba(255,255,255,0.72)] px-4 py-4 shadow-sm backdrop-blur">
            <p className="text-xs tracking-[0.18em] text-slate-400 uppercase">{label}</p>
            <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-slate-950">{value}</p>
            <p className="mt-2 text-xs text-slate-500">{note}</p>
        </article>
    );
}

function StatusBar({ hint, error, loading }: { hint: string; error: string | null; loading: boolean }) {
    if (loading) {
        return <InlineNotice tone="default">正在同步知识库、工单和审计日志...</InlineNotice>;
    }

    if (error) {
        return <InlineNotice tone="warning">当前错误：{error}</InlineNotice>;
    }

    return <InlineNotice tone="success">{hint}</InlineNotice>;
}

function SectionBlock({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="space-y-3">
            <h3 className="text-xs font-medium tracking-[0.18em] text-slate-400 uppercase">{title}</h3>
            {children}
        </section>
    );
}

function EmptyState({ text, compact = false }: { text: string; compact?: boolean }) {
    return (
        <div className={`rounded-[22px] border border-dashed border-[#d8c8ae] bg-[#fbf6ed] text-sm leading-6 text-slate-500 ${compact ? 'px-4 py-4' : 'px-5 py-6'}`}>
            {text}
        </div>
    );
}

function InlineNotice({ children, tone }: { children: ReactNode; tone: 'default' | 'success' | 'warning' }) {
    const toneClassName = {
        default: 'border-slate-200 bg-white text-slate-600',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        warning: 'border-amber-200 bg-amber-50 text-amber-800',
    }[tone];

    return <div className={`rounded-[20px] border px-4 py-3 text-sm leading-6 ${toneClassName}`}>{children}</div>;
}

function Badge({ children, className }: { children: ReactNode; className?: string }) {
    return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${className || ''}`}>{children}</span>;
}

function parseTags(tags: CreateKnowledgeArticlePayload['tags']): string[] {
    if (!Array.isArray(tags)) {
        return [];
    }

    return tags
        .flatMap((tag) => tag.split(','))
        .map((tag) => tag.trim())
        .filter(Boolean);
}

function extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return '请求失败，请检查后端服务或环境变量配置。';
}

const inputClassName =
    'w-full rounded-[18px] border border-[#d8c8ae] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#b48234] focus:ring-4 focus:ring-[#b48234]/10';
