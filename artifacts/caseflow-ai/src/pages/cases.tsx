import {
  AlertCircle,
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  FolderOpen,
  RefreshCw,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetDashboardSummaryQueryKey,
  getListCasesQueryKey,
  useListCases,
} from "@workspace/api-client-react";
import { AppShell, FileTypeIcon, MobileNav } from "@/components/app-shell";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type FolderProcessResponse = {
  dataDir?: string;
  imported?: string[];
  skipped?: string[];
  errors?: Array<{
    filename: string;
    error: string;
  }>;
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Folder processing failed";
}

export default function Cases() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [processingFolder, setProcessingFolder] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const params = useMemo(
    () => ({
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(status !== "all" ? { status } : {}),
    }),
    [search, status],
  );

  const query = useListCases(params, {
    query: {
      queryKey: getListCasesQueryKey(params),
    },
  });

  const cases = query.data ?? [];

  const processDataFolder = async () => {
    if (processingFolder) {
      return;
    }

    setProcessingFolder(true);

    try {
      const response = await fetch("/api/cases/process-folder", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      });

      const payload =
        (await response.json().catch(() => ({}))) as FolderProcessResponse & {
          error?: string;
        };

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not process the data folder");
      }

      await query.refetch();

      await queryClient.invalidateQueries({
        queryKey: getGetDashboardSummaryQueryKey(),
      });

      const importedCount = payload.imported?.length ?? 0;
      const skippedCount = payload.skipped?.length ?? 0;
      const errorCount = payload.errors?.length ?? 0;

      if (errorCount > 0) {
        toast({
          title: "Folder processing completed with errors",
          description: `${importedCount} imported, ${skippedCount} skipped, ${errorCount} failed.`,
          variant: "destructive",
        });
      } else if (importedCount > 0) {
        toast({
          title: "Data folder processed",
          description: `${importedCount} new document${importedCount === 1 ? "" : "s"} imported. ${skippedCount} already processed.`,
        });
      } else {
        toast({
          title: "No new documents",
          description: `${skippedCount} document${skippedCount === 1 ? "" : "s"} already processed.`,
        });
      }
    } catch (error) {
      toast({
        title: "Could not process data folder",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setProcessingFolder(false);
    }
  };

  return (
    <AppShell>
      <MobileNav />

      <div className="caseflow-rise flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.2em] text-primary">
            Case register
          </p>

          <h1 className="mt-2 font-serif text-[42px] leading-none tracking-[-.045em]">
            All cases
          </h1>

          <p className="mt-3 text-[13px] text-muted-foreground">
            A searchable record of every processed customer complaint.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <Button
            type="button"
            onClick={() => void processDataFolder()}
            disabled={processingFolder}
            className="h-9 gap-2 rounded-lg px-3.5 text-[11px] font-bold"
            data-testid="button-process-data-folder"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                processingFolder ? "animate-spin" : ""
              }`}
            />
            {processingFolder ? "Processing folder…" : "Process data folder"}
          </Button>

          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {cases.length} {cases.length === 1 ? "case" : "cases"} in view
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-3 sm:p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search filename, customer, or category…"
              data-testid="input-search-cases"
              className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-9 text-[12px] outline-none transition-colors placeholder:text-muted-foreground/65 focus:border-primary focus:ring-2 focus:ring-primary/10"
            />

            {search && (
              <button
                type="button"
                data-testid="button-clear-search"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </label>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="hidden h-4 w-4 text-muted-foreground sm:block" />

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              data-testid="select-case-status"
              className="h-10 min-w-[150px] rounded-lg border border-input bg-background px-3 text-[11px] font-semibold outline-none focus:border-primary"
            >
              <option value="all">All statuses</option>
              <option value="processed">Processed</option>
              <option value="escalated">Escalated</option>
              <option value="review">In review</option>
            </select>
          </div>
        </div>
      </div>

      <section className="mt-5 overflow-hidden rounded-2xl border border-border bg-card">
        {query.isLoading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4, 5].map((row) => (
              <div
                key={row}
                className="h-[67px] animate-pulse rounded-lg bg-muted"
              />
            ))}
          </div>
        ) : query.isError ? (
          <div className="flex flex-col items-center px-6 py-20 text-center">
            <AlertCircle className="h-8 w-8 text-destructive" />

            <p className="mt-3 text-[14px] font-bold">Could not load cases</p>

            <p className="mt-1 text-[12px] text-muted-foreground">
              The register is taking a moment to respond.
            </p>

            <Button
              variant="outline"
              size="sm"
              data-testid="button-retry-cases"
              className="mt-4"
              onClick={() => void query.refetch()}
            >
              Try again
            </Button>
          </div>
        ) : cases.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-20 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
              <FolderOpen className="h-6 w-6 text-muted-foreground" />
            </div>

            <p className="mt-4 text-[14px] font-bold">
              {search || status !== "all"
                ? "No cases match these filters"
                : "No processed cases yet"}
            </p>

            <p className="mt-1 max-w-[300px] text-[12px] leading-relaxed text-muted-foreground">
              {search || status !== "all"
                ? "Try widening your search or clearing the status filter."
                : "Add documents to the data folder, then click Process data folder."}
            </p>

            {(search || status !== "all") && (
              <Button
                variant="outline"
                size="sm"
                data-testid="button-clear-filters"
                className="mt-4"
                onClick={() => {
                  setSearch("");
                  setStatus("all");
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="hidden grid-cols-[minmax(220px,1.5fr)_minmax(130px,.8fr)_minmax(120px,.7fr)_110px_30px] gap-4 border-b border-border px-5 py-3 font-mono text-[9px] uppercase tracking-[.16em] text-muted-foreground md:grid">
              <span>Source document</span>
              <span>Customer</span>
              <span>Category</span>
              <span>Status</span>
              <span />
            </div>

            <div className="divide-y divide-border">
              {cases.map((item) => (
                <Link
                  href={`/cases/${item.id}`}
                  data-testid={`link-case-${item.id}`}
                  key={item.id}
                  className="group grid gap-3 px-4 py-4 transition-colors hover:bg-muted/45 md:grid-cols-[minmax(220px,1.5fr)_minmax(130px,.8fr)_minmax(120px,.7fr)_110px_30px] md:items-center md:gap-4 md:px-5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <FileTypeIcon
                      type={item.fileType || item.filename}
                      className="h-9 w-9 shrink-0"
                    />

                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-bold group-hover:text-primary">
                        {item.filename}
                      </p>

                      <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                        {item.fileType || "document"}
                        <span className="mx-1 text-border">·</span>
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="hidden min-w-0 md:block">
                    <p className="truncate text-[11px] font-semibold">
                      {item.structuredData?.customerName || "Not identified"}
                    </p>

                    <p className="mt-1 truncate text-[10px] text-muted-foreground">
                      {item.structuredData?.email ||
                        item.customerEmail ||
                        "No email found"}
                    </p>
                  </div>

                  <div className="hidden truncate text-[11px] text-muted-foreground md:block">
                    {item.structuredData?.complaintCategory || "Uncategorized"}
                  </div>

                  <div>
                    <StatusPill status={item.status} compact />
                  </div>

                  <ArrowUpRight className="hidden h-4 w-4 text-muted-foreground/50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary md:block" />
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </AppShell>
  );
}