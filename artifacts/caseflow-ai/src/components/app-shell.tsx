import { Bell, BriefcaseBusiness, ChevronRight, CircleHelp, FileText, Gauge, ListFilter, Settings2, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { type ReactNode } from 'react';

const navigation = [
  { href: '/', label: 'Workspace', icon: Gauge },
  { href: '/cases', label: 'All cases', icon: BriefcaseBusiness },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return (
    <div className="grain min-h-[100dvh] bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex h-[84px] items-center gap-3 border-b border-sidebar-border px-7">
          <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
            <Sparkles className="h-[18px] w-[18px]" strokeWidth={2.4} />
          </div>
          <div>
            <p className="font-serif text-[20px] leading-none tracking-[-.03em] text-sidebar-primary-foreground">caseflow</p>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[.22em] text-sidebar-foreground/60">support operations</p>
          </div>
        </div>

        <div className="px-4 pt-7">
          <p className="px-3 pb-3 font-mono text-[10px] uppercase tracking-[.18em] text-sidebar-foreground/40">Command center</p>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const active = item.href === '/' ? location === '/' : location.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`}
                  className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-colors ${active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground'}`}
                >
                  <span className="flex items-center gap-3"><Icon className="h-[17px] w-[17px]" strokeWidth={1.8} />{item.label}</span>
                  {active && <ChevronRight className="h-3.5 w-3.5 text-sidebar-primary" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-8 px-4">
          <p className="px-3 pb-3 font-mono text-[10px] uppercase tracking-[.18em] text-sidebar-foreground/40">Workspace</p>
          <Link href="/settings" data-testid="link-nav-settings" className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-colors ${location === '/settings' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground'}`}>
            <Settings2 className="h-[17px] w-[17px]" strokeWidth={1.8} />Processing settings
          </Link>
        </div>

        <div className="mt-auto p-5">
          <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-4">
            <div className="flex items-center gap-2 text-[11px] font-bold text-sidebar-accent-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Processing engine ready
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-sidebar-foreground/55">Documents are handled securely and retained for your team.</p>
            <Link href="/settings" data-testid="link-engine-settings" className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-sidebar-primary hover:underline">View readiness <ChevronRight className="h-3 w-3" /></Link>
          </div>
          <div className="mt-5 flex items-center gap-3 border-t border-sidebar-border pt-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary/15 font-mono text-[11px] font-bold text-sidebar-primary">SO</div>
            <div className="min-w-0"><p className="truncate text-[12px] font-bold text-sidebar-foreground">Support Operations</p><p className="truncate text-[10px] text-sidebar-foreground/45">Team workspace</p></div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-[70px] items-center justify-between border-b border-border/80 bg-background/90 px-5 backdrop-blur-md sm:px-8 lg:px-10">
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <div className="flex items-center gap-2 lg:hidden"><Sparkles className="h-4 w-4 text-primary" /><span className="font-serif text-lg text-foreground">caseflow</span></div>
            <span className="hidden lg:inline">Operations workspace</span>
            <span className="hidden text-border lg:inline">/</span>
            <span className="hidden font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70 lg:inline">{location === '/' ? 'Overview' : location.slice(1).split('/')[0]}</span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" data-testid="button-help" aria-label="Help" className="hidden rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:block"><CircleHelp className="h-[17px] w-[17px]" /></button>
            <button type="button" data-testid="button-notifications" aria-label="Notifications" className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><Bell className="h-[17px] w-[17px]" /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" /></button>
            <div className="ml-2 hidden h-7 w-px bg-border sm:block" />
            <div className="ml-1 flex items-center gap-2.5"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-mono text-[10px] font-bold text-primary">SO</div><span className="hidden text-[12px] font-semibold text-foreground sm:inline">Support Ops</span></div>
          </div>
        </header>
        <main className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 sm:py-9 lg:px-10">{children}</main>
      </div>
    </div>
  );
}

export function MobileNav() {
  const [location] = useLocation();
  return (
    <div className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-border bg-card/95 p-1.5 shadow-xl backdrop-blur lg:hidden">
      {navigation.map(({ href, label, icon: Icon }) => {
        const active = href === '/' ? location === '/' : location.startsWith(href);
        return <Link key={href} href={href} data-testid={`link-mobile-${label.toLowerCase().replaceAll(' ', '-')}`} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-[11px] font-bold ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}><Icon className="h-4 w-4" />{label}</Link>;
      })}
      <Link href="/settings" data-testid="link-mobile-settings" className={`rounded-xl p-2.5 ${location === '/settings' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}><Settings2 className="h-4 w-4" /></Link>
    </div>
  );
}

export function FileTypeIcon({ type, className = 'h-5 w-5' }: { type: string; className?: string }) {
  const normalized = type.toLowerCase();
  return <div className={`flex items-center justify-center rounded-md ${normalized.includes('pdf') ? 'bg-rose-100 text-rose-600' : normalized.includes('doc') ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-700'} ${className}`}><FileText className="h-[55%] w-[55%]" strokeWidth={2} /></div>;
}
