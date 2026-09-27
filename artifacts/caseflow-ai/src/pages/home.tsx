import { ArrowUpRight, BarChart3, ChevronRight, Clock3, FileCheck2, FolderOpen, RefreshCw, ShieldCheck, TriangleAlert } from 'lucide-react';
import { Link } from 'wouter';
import { useGetDashboardSummary, useListCases, getGetDashboardSummaryQueryKey } from '@workspace/api-client-react';
import { AppShell, FileTypeIcon, MobileNav } from '@/components/app-shell';
import { ProcessingUploader } from '@/components/processing-uploader';
import { StatusPill } from '@/components/status-pill';
import { Button } from '@/components/ui/button';

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date);
}

function SummarySkeleton() {
  return <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-[116px] animate-pulse rounded-2xl border border-border bg-card"><div className="m-5 h-3 w-20 rounded bg-muted" /><div className="mx-5 mt-4 h-7 w-12 rounded bg-muted" /></div>)}</div>;
}

export default function Home() {
  const summaryQuery = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  const casesQuery = useListCases();
  const summary = summaryQuery.data;
  const cases = casesQuery.data ?? [];
  const recentCases = cases.slice(0, 5);
  const statusEntries = Object.entries(summary?.statusCounts ?? {});
  const categoryEntries = Object.entries(summary?.categoryCounts ?? {}).slice(0, 5);
  const maxCategory = Math.max(...categoryEntries.map(([, value]) => value), 1);

  return <AppShell><MobileNav />
    <div className="caseflow-rise flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div><div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.2em] text-primary"><span className="h-1.5 w-1.5 rounded-full bg-primary" />Live workspace</div><h1 className="font-serif text-[40px] leading-[.98] tracking-[-.045em] text-foreground sm:text-[50px]">Make every case<br /><em className="text-primary not-italic">legible.</em></h1><p className="mt-4 max-w-[530px] text-[13px] leading-relaxed text-muted-foreground">Turn unstructured customer evidence into a clear next move for your team.</p></div>
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground"><span className="h-2 w-2 rounded-full bg-emerald-500" />Engine operational <span className="font-mono text-[10px] text-muted-foreground/60">/ v2.4</span></div>
    </div>

    <div className="mt-8"><ProcessingUploader /></div>

    <section className="mt-8">
      <div className="mb-3 flex items-end justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">At a glance</p><h2 className="mt-1 text-[18px] font-bold tracking-[-.02em]">Your operation, today</h2></div><Button variant="ghost" size="sm" data-testid="button-refresh-dashboard" onClick={() => void summaryQuery.refetch()} className="gap-2 text-[11px] text-muted-foreground"><RefreshCw className="h-3.5 w-3.5" />Refresh</Button></div>
      {summaryQuery.isLoading ? <SummarySkeleton /> : summaryQuery.isError ? <div className="flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-[12px]"><span className="flex items-center gap-2 text-destructive"><TriangleAlert className="h-4 w-4" />Dashboard metrics are unavailable right now.</span><Button variant="outline" size="sm" data-testid="button-retry-dashboard" onClick={() => void summaryQuery.refetch()}>Retry</Button></div> : <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: 'Total cases', value: summary?.totalCases ?? 0, helper: 'all time', icon: FolderOpen, tone: 'text-primary' },
          { label: 'Processed today', value: summary?.processedToday ?? 0, helper: 'since midnight', icon: FileCheck2, tone: 'text-emerald-600' },
          { label: 'Need escalation', value: summary?.escalations ?? 0, helper: 'needs attention', icon: TriangleAlert, tone: 'text-orange-600' },
          { label: 'Avg. processing', value: summary?.avgProcessingMs ? `${(summary.avgProcessingMs / 1000).toFixed(1)}s` : '—', helper: 'per document', icon: Clock3, tone: 'text-primary' },
        ].map(({ label, value, helper, icon: Icon, tone }, index) => <div key={label} data-testid={`metric-${label.toLowerCase().replaceAll(' ', '-')}`} className={`caseflow-rise-delay-${index + 1} rounded-2xl border border-border bg-card p-4 shadow-[0_1px_0_hsl(var(--border))] sm:p-5`}><div className="flex items-start justify-between"><p className="font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground">{label}</p><Icon className={`h-4 w-4 ${tone}`} strokeWidth={1.7} /></div><p className="mt-4 text-[28px] font-bold tracking-[-.05em] text-foreground">{value}</p><p className="mt-1 text-[10px] text-muted-foreground">{helper}</p></div>)}
      </div>}
    </section>

    <div className="mt-8 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-start justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Latest activity</p><h2 className="mt-1 text-[17px] font-bold tracking-[-.02em]">Recent cases</h2></div><Link href="/cases" data-testid="link-view-all-cases" className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline">View all <ArrowUpRight className="h-3.5 w-3.5" /></Link></div>
        {casesQuery.isLoading ? <div className="mt-5 space-y-3">{[1, 2, 3].map((row) => <div key={row} className="h-14 animate-pulse rounded-xl bg-muted" />)}</div> : casesQuery.isError ? <div className="mt-5 rounded-xl bg-muted p-5 text-center text-[12px] text-muted-foreground">Recent cases could not be loaded.</div> : recentCases.length === 0 ? <div className="mt-5 flex flex-col items-center rounded-xl border border-dashed border-border bg-muted/40 px-5 py-10 text-center"><FolderOpen className="h-7 w-7 text-muted-foreground/50" /><p className="mt-3 text-[13px] font-bold">Your queue is clear</p><p className="mt-1 max-w-[260px] text-[11px] leading-relaxed text-muted-foreground">Process your first complaint document above to create a reviewable case.</p></div> : <div className="mt-4 divide-y divide-border">{recentCases.map((item) => <Link href={`/cases/${item.id}`} data-testid={`link-recent-case-${item.id}`} key={item.id} className="group flex items-center gap-3 py-3.5 first:pt-2 last:pb-0"><FileTypeIcon type={item.fileType || item.filename} className="h-9 w-9 shrink-0" /><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-[12px] font-bold group-hover:text-primary">{item.filename}</p><StatusPill status={item.status} compact /></div><p className="mt-1 truncate text-[10px] text-muted-foreground">{item.structuredData?.customerName || 'Customer not identified'} <span className="mx-1 text-border">·</span>{formatDate(item.createdAt)}</p></div><ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" /></Link>)}</div>}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-start justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Case mix</p><h2 className="mt-1 text-[17px] font-bold tracking-[-.02em]">What is coming in</h2></div><BarChart3 className="h-4 w-4 text-primary" /></div>
        {categoryEntries.length === 0 ? <div className="mt-8 rounded-xl bg-muted p-5 text-center text-[11px] text-muted-foreground">Category data will appear as cases are processed.</div> : <div className="mt-6 space-y-4">{categoryEntries.map(([category, count], index) => <div key={category} data-testid={`category-${index}`}><div className="mb-1.5 flex justify-between gap-3 text-[11px]"><span className="truncate font-semibold">{category}</span><span className="font-mono text-muted-foreground">{count}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${index === 0 ? 'bg-primary' : index === 1 ? 'bg-accent' : 'bg-primary/45'}`} style={{ width: `${Math.max((count / maxCategory) * 100, 7)}%` }} /></div></div>)}</div>}
        <div className="mt-7 border-t border-border pt-5"><p className="mb-3 font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">Workflow health</p><div className="space-y-2.5">{statusEntries.length ? statusEntries.map(([status, count]) => <div key={status} className="flex items-center justify-between text-[11px]"><span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary/60" />{status}</span><span className="font-mono text-muted-foreground">{count}</span></div>) : <p className="text-[11px] text-muted-foreground">No status data yet.</p>}</div></div>
      </section>
    </div>
    <div className="mt-6 flex items-center gap-2 rounded-xl border border-border/70 bg-card/50 px-4 py-3 text-[11px] text-muted-foreground"><ShieldCheck className="h-4 w-4 text-emerald-600" />Customer data stays within your processing workspace. <Link href="/settings" data-testid="link-privacy-settings" className="font-bold text-primary hover:underline">Review settings</Link></div>
  </AppShell>;
}
