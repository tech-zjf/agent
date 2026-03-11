export default function Home() {
    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_0%_0%,#dff5f1_0%,#f5f7fb_48%,#eef2ff_100%)] px-6 py-12">
            <main className="mx-auto w-full max-w-5xl space-y-8">
                <section className="rounded-2xl border border-border/80 bg-card p-8 shadow-[0_20px_60px_-40px_rgba(15,118,110,0.45)]">
                    <p className="text-sm font-medium text-brand">Agent Desktop</p>
                    <h1 className="mt-2 text-3xl font-semibold text-card-foreground">客服 Copilot 前端模块骨架已就绪</h1>
                    <p className="mt-4 text-sm leading-7 text-muted">
                        已完成目录分层、API 客户端、services 模块、tools 与 Tailwind 主题变量。下一步可直接实现「客服工作台」页面并接入
                        `/api/copilot/draft-reply`。
                    </p>
                </section>

                <section className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-border/80 bg-card p-6">
                        <h2 className="text-lg font-semibold text-card-foreground">当前前端分层</h2>
                        <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950/95 p-4 text-xs leading-6 text-slate-100">
                            {`src/
  app/
  config/
  lib/http/
  services/modules/
  tools/
  utils/
  types/`}
                        </pre>
                    </div>
                    <div className="rounded-2xl border border-border/80 bg-card p-6">
                        <h2 className="text-lg font-semibold text-card-foreground">已封装 API 模块</h2>
                        <ul className="mt-4 space-y-2 text-sm text-muted">
                            <li>`knowledge`: 知识库 CRUD/检索</li>
                            <li>`copilot`: 草稿回复生成</li>
                            <li>`tickets`: 工单列表/创建</li>
                            <li>`audit`: 审计事件查询</li>
                        </ul>
                    </div>
                </section>
            </main>
        </div>
    );
}
