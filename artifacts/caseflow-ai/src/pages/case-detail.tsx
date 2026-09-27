import { ArrowLeft, Check, Clipboard, Clock3, FileText, Mail, Printer, ShieldAlert, Sparkles, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'wouter';
import { useGetCase, getGetCaseQueryKey } from '@workspace/api-client-react';
import { AppShell, FileTypeIcon, MobileNav } from '@/components/app-shell';
import { StatusPill } from '@/components/status-pill';
import { Button } from '@/components/ui/button';

function DetailRow({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return <div className="flex flex-col gap-1.5 border-b border-border/70 py-3 last:border-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6"><span className="font-mono text-[9px] uppercase tracking-[.14em] text-muted-foreground">{label}</span><span className={`text-right text-[12px] ${emphasis ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>{value || 'Not identified'}</span></div>;
}

export default function CaseDetail() {
  const params = useParams<{ id: string }>();
  const caseId = Number(params.id);
  const query = useGetCase(caseId, { query: { queryKey: getGetCaseQueryKey(caseId), enabled: Number.isFinite(caseId) } });
  const item = query.data;
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    if (!item?.customerEmail) return;
    await navigator.clipboard?.writeText(item.customerEmail);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  if (query.isLoading) return <AppShell><MobileNav /><div className="space-y-5"><div className="h-4 w-24 animate-pulse rounded bg-muted" /><div className="h-14 w-2/3 animate-pulse rounded bg-muted" /><div className="grid gap-5 lg:grid-cols-2"><div className="h-[420px] animate-pulse rounded-2xl bg-muted" /><div className="h-[420px] animate-pulse rounded-2xl bg-muted" /></div></div></AppShell>;
  if (query.isError || !item) return <AppShell><MobileNav /><div className="flex min-h-[55vh] flex-col items-center justify-center text-center"><ShieldAlert className="h-9 w-9 text-destructive" /><h1 className="mt-4 text-xl font-bold">Case unavailable</h1><p className="mt-2 text-[12px] text-muted-foreground">This case may have moved or is still being processed.</p><Link href="/cases" data-testid="link-back-cases-error" className="mt-5 inline-flex h-9 items-center rounded-lg border border-border px-4 text-[11px] font-bold hover:bg-muted">Back to cases</Link></div></AppShell>;

  const extracted = item.structuredData;
  return <AppShell><MobileNav />
    <div className="caseflow-rise">
      <Link href="/cases" data-testid="link-back-cases" className="inline-flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground transition-colors hover:text-primary"><ArrowLeft className="h-3.5 w-3.5" />Back to all cases</Link>
      <div className="mt-5 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div className="flex min-w-0 items-start gap-3"><FileTypeIcon type={item.fileType || item.filename} className="mt-1 h-11 w-11 shrink-0" /><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-mono text-[10px] uppercase tracking-[.17em] text-primary">Case CF-{String(item.id).padStart(4, '0')}</p><StatusPill status={item.status} /></div><h1 className="mt-2 truncate font-serif text-[36px] leading-none tracking-[-.04em] sm:text-[44px]">{item.filename}</h1><p className="mt-3 text-[11px] text-muted-foreground">{item.fileType} <span className="mx-1 text-border">·</span>{new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.createdAt))}</p></div></div><div className="flex gap-2"><Button type="button" variant="outline" size="sm" data-testid="button-print-case" onClick={() => window.print()} className="gap-2 text-[11px]"><Printer className="h-3.5 w-3.5" />Print review</Button><Button type="button" size="sm" data-testid="button-copy-email" onClick={() => void copyEmail()} className="gap-2 bg-primary text-[11px] text-primary-foreground hover:bg-primary/90">{copied ? <Check className="h-3.5 w-3.5" /> : <Clipboard className="h-3.5 w-3.5" />}{copied ? 'Copied' : 'Copy email'}</Button></div></div>
    </div>

    <div className="mt-8 grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
      <div className="space-y-5">
        <section className="overflow-hidden rounded-2xl border border-border bg-card"><div className="flex items-center justify-between border-b border-border px-5 py-4"><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /><h2 className="text-[13px] font-bold">Source document</h2></div><span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Evidence</span></div><div data-testid="text-source-preview" className="scrollbar-thin max-h-[350px] overflow-y-auto whitespace-pre-wrap bg-[#f8f7f3] p-5 font-mono text-[11px] leading-[1.8] text-slate-600">{item.sourcePreview || 'No source preview was included with this case.'}</div><div className="flex items-center gap-2 border-t border-border px-5 py-3 text-[10px] text-muted-foreground"><Sparkles className="h-3.5 w-3.5 text-primary" />Source retained for review context</div></section>
        <section className="rounded-2xl border border-border bg-card p-5"><div className="flex items-center gap-2"><UserRound className="h-4 w-4 text-primary" /><h2 className="text-[13px] font-bold">Customer details</h2></div><div className="mt-3"><DetailRow label="Name" value={extracted?.customerName ?? ''} emphasis /><DetailRow label="Email" value={extracted?.email ?? item.customerEmail} /><DetailRow label="Phone" value={extracted?.phoneNumber ?? ''} /></div></section>
      </div>

      <div className="space-y-5">
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6"><div className="flex items-center justify-between"><div><p className="font-mono text-[9px] uppercase tracking-[.17em] text-primary">Structured extraction</p><h2 className="mt-1 text-[17px] font-bold tracking-[-.02em]">The signal, organized</h2></div><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10"><Sparkles className="h-4 w-4 text-primary" /></div></div><div className="mt-5 grid gap-x-8 sm:grid-cols-2"><DetailRow label="Category" value={extracted?.complaintCategory} emphasis /><DetailRow label="Case status" value={extracted?.overallCaseStatus} emphasis /><DetailRow label="Complaint" value={extracted?.complaint ? 'Confirmed' : 'Not confirmed'} /><DetailRow label="Escalation" value={extracted?.escalationRequired ? 'Required' : 'Not required'} /><DetailRow label="Supporting doc" value={extracted?.supportingDocumentAvailable ? 'Available' : 'Not available'} /><DetailRow label="Processing time" value={`${item.processingMs} ms`} /></div><div className="mt-5 grid gap-4"><div className="rounded-xl bg-muted/65 p-4"><p className="font-mono text-[9px] uppercase tracking-[.14em] text-muted-foreground">Issue description</p><p data-testid="text-issue-description" className="mt-2 text-[12px] leading-relaxed text-foreground">{extracted?.issueDescription || 'No issue description extracted.'}</p></div><div className="rounded-xl bg-muted/65 p-4"><p className="font-mono text-[9px] uppercase tracking-[.14em] text-muted-foreground">Resolution provided</p><p className="mt-2 text-[12px] leading-relaxed text-foreground">{extracted?.resolutionProvided || 'No resolution recorded.'}</p></div></div></section>
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6"><div className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /><div><p className="font-mono text-[9px] uppercase tracking-[.17em] text-primary">Customer-ready</p><h2 className="mt-1 text-[17px] font-bold tracking-[-.02em]">Drafted email</h2></div></div><div data-testid="text-customer-email" className="mt-5 whitespace-pre-wrap rounded-xl border border-border bg-[#fbfaf7] p-4 text-[12px] leading-[1.75] text-slate-700">{item.customerEmail || 'No customer email was generated.'}</div></section>
        <section className="rounded-2xl border border-primary/15 bg-primary/[.035] p-5 sm:p-6"><div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-primary" /><div><p className="font-mono text-[9px] uppercase tracking-[.17em] text-primary">Internal handoff</p><h2 className="mt-1 text-[17px] font-bold tracking-[-.02em]">Case summary</h2></div></div><p data-testid="text-case-summary" className="mt-5 text-[13px] leading-[1.75] text-foreground">{item.caseSummary || 'No internal summary was generated.'}</p></section>
      </div>
    </div>
  </AppShell>;
}
