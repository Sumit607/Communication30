import { useEffect, useRef, useState } from 'react';
/** Explicit actions only. Unmount cancels transport; no retries or background uploads. */
export function useAction(refresh: () => void) {
  const controller = useRef<AbortController | null>(null), mounted = useRef(true);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; controller.current?.abort(); }; }, []);
  async function run(action: (signal: AbortSignal) => Promise<unknown>) {
    if (controller.current) return;
    const current = new AbortController(); controller.current = current; setBusy(true); setError('');
    try { await action(current.signal); if (mounted.current) refresh(); }
    catch (e) { if (mounted.current) setError(e instanceof Error ? e.message : 'This action could not finish.'); }
    finally { controller.current = null; if (mounted.current) setBusy(false); }
  }
  return { busy, error, run, cancel: () => controller.current?.abort() };
}
