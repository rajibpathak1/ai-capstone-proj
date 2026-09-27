import { Check, CircleAlert, Clock3, LoaderCircle } from 'lucide-react';

export function StatusPill({ status, compact = false }: { status: string; compact?: boolean }) {
  const value = status.toLowerCase();
  const isEscalated = value.includes('escalat');
  const isProcessed = value.includes('process') || value.includes('complete') || value.includes('resolved');
  const isPending = value.includes('pending') || value.includes('review') || value.includes('queue');
  const label = isEscalated ? 'Escalated' : isProcessed ? 'Processed' : isPending ? 'In review' : status || 'Unknown';
  const styles = isEscalated ? 'bg-orange-100 text-orange-800 ring-orange-200' : isProcessed ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : isPending ? 'bg-amber-50 text-amber-800 ring-amber-200' : 'bg-muted text-muted-foreground ring-border';
  const Icon = isEscalated ? CircleAlert : isProcessed ? Check : isPending ? Clock3 : LoaderCircle;
  return <span data-testid={`status-${label.toLowerCase().replaceAll(' ', '-')}`} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wide ring-1 ring-inset ${styles} ${compact ? 'px-2 py-0.5 text-[9px]' : ''}`}><Icon className="h-3 w-3" strokeWidth={2.2} />{label}</span>;
}
