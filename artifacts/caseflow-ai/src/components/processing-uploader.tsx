import { FileUp, LoaderCircle, Plus, X, Zap } from 'lucide-react';
import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useProcessBatch, useProcessCase, getListCasesQueryKey, getGetDashboardSummaryQueryKey } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type PendingFile = { file: File; content: string; encoding: 'text' | 'base64' };

function readFile(file: File): Promise<PendingFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const isText = file.name.toLowerCase().endsWith('.txt');
    reader.onload = () => {
      const result = String(reader.result ?? '');
      resolve({ file, content: isText ? result : (result.split(',').pop() ?? ''), encoding: isText ? 'text' : 'base64' });
    };
    reader.onerror = () => reject(reader.error);
    if (isText) reader.readAsText(file); else reader.readAsDataURL(file);
  });
}

export function ProcessingUploader({ compact = false }: { compact?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [reading, setReading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const processCase = useProcessCase();
  const processBatch = useProcessBatch();

  const addFiles = async (incoming: FileList | File[]) => {
    const accepted = Array.from(incoming).filter((file) => /\.(txt|pdf|docx)$/i.test(file.name));
    if (!accepted.length) {
      toast({ title: 'Unsupported file', description: 'Choose a .txt, .pdf, or .docx complaint document.', variant: 'destructive' });
      return;
    }
    setReading(true);
    try {
      const next = await Promise.all(accepted.map(readFile));
      setFiles((current) => [...current, ...next].slice(0, 12));
    } catch {
      toast({ title: 'Could not read document', description: 'Try the file again or choose another document.', variant: 'destructive' });
    } finally { setReading(false); }
  };

  const process = () => {
    if (!files.length || processCase.isPending || processBatch.isPending) return;
    const documents = files.map(({ file, content, encoding }) => ({ filename: file.name, content, encoding }));
    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: getListCasesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      setFiles([]);
      toast({ title: 'Case ready for review', description: `${documents.length} document${documents.length === 1 ? '' : 's'} processed successfully.` });
    };
    if (documents.length === 1) processCase.mutate({ data: documents[0] }, { onSuccess });
    else processBatch.mutate({ data: { documents } }, { onSuccess });
  };

  const busy = reading || processCase.isPending || processBatch.isPending;
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/[.045] ${compact ? 'p-4' : 'p-5 sm:p-6'}`}>
      <div className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div><div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Zap className="h-4 w-4" /></div><h2 className="text-[15px] font-bold tracking-[-.01em]">Process new evidence</h2></div><p className="mt-2 max-w-[560px] text-[12px] leading-relaxed text-muted-foreground">Drop complaint documents here. Caseflow extracts the signal, drafts a customer reply, and prepares your internal handoff.</p></div>
          {!compact && <span className="hidden rounded-full bg-card px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground ring-1 ring-border sm:inline">AI assisted</span>}
        </div>
        <button type="button" data-testid="button-upload-documents" onClick={() => inputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void addFiles(event.dataTransfer.files); }} className={`mt-5 flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-primary/30 bg-card/65 text-center transition-colors hover:border-primary/60 hover:bg-card ${compact ? 'min-h-[110px] p-4' : 'min-h-[142px] p-5'}`}>
          {busy ? <LoaderCircle className="h-6 w-6 animate-spin text-primary" /> : <FileUp className="h-6 w-6 text-primary" />}
          <span className="mt-2 text-[12px] font-bold">{busy ? (reading ? 'Reading documents…' : 'Processing cases…') : 'Drop files or browse'}</span>
          <span className="mt-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">TXT · PDF · DOCX · up to 12 files</span>
        </button>
        <input ref={inputRef} type="file" accept=".txt,.pdf,.docx" multiple className="hidden" data-testid="input-document-file" onChange={(event) => { if (event.target.files) void addFiles(event.target.files); event.target.value = ''; }} />
        {files.length > 0 && <div className="mt-3 space-y-1.5">{files.map(({ file }, index) => <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2"><span className="min-w-0 truncate text-[11px] font-semibold">{file.name}</span><button type="button" data-testid={`button-remove-file-${index}`} onClick={() => setFiles((current) => current.filter((_, i) => i !== index))} className="ml-2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"><X className="h-3.5 w-3.5" /></button></div>)}</div>}
        <div className="mt-4 flex items-center justify-between gap-3"><span className="font-mono text-[10px] text-muted-foreground">{files.length ? `${files.length} document${files.length === 1 ? '' : 's'} queued` : 'Secure · structured · reviewable'}</span><Button type="button" data-testid="button-process-documents" onClick={process} disabled={!files.length || busy} className="h-9 gap-2 rounded-lg bg-primary px-3.5 text-[11px] font-bold text-primary-foreground hover:bg-primary/90"><Plus className="h-3.5 w-3.5" />Process {files.length > 1 ? 'documents' : 'case'}</Button></div>
      </div>
    </div>
  );
}
