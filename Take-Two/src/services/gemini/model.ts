// Google rejected 2.5 Flash for new users; 3.6 Flash passed a live generation test on 2026-09-11.
export const DEFAULT_MODEL = 'gemini-3.6-flash';

export function resolveModel(saved: string | null | undefined): string {
  return !saved || saved === 'gemini-2.5-flash' ? DEFAULT_MODEL : saved;
}
