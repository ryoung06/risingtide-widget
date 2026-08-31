export type SearchContext = {
  startDate: string;         // YYYY-MM-DD
  endDate?: string | null;   // YYYY-MM-DD or null
  adults?: number;
  kidsUnder12?: number;
  savedAt: number;           // ms since epoch
};
const KEY = 'rte_search_context';
const TTL_MS = 30 * 60 * 1000; // 30 minutes
export function saveSearchContext(ctx: Omit<SearchContext, 'savedAt'>): void {
  try {
    const payload: SearchContext = { ...ctx, savedAt: Date.now() };
    window.localStorage.setItem(KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('[searchContext] save failed', e);
  }
}
export function readSearchContext(): SearchContext | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SearchContext;
    if (!parsed || typeof parsed.savedAt !== 'number') return null;
    if (Date.now() - parsed.savedAt > TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}
// Format YYYY-MM-DD as a human phrase like "August 15, 2026"
export function fmtHuman(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
// Build a natural-language snippet describing the saved context.
// Returns empty string when there is no usable context.
export function contextSnippet(ctx: SearchContext | null): string {
  if (!ctx) return '';
  const dateText = ctx.endDate && ctx.endDate !== ctx.startDate
    ? 'between ' + fmtHuman(ctx.startDate) + ' and ' + fmtHuman(ctx.endDate)
    : 'on ' + fmtHuman(ctx.startDate);
  const partyText = typeof ctx.adults === 'number'
    ? ' for ' + ctx.adults + ' ' + (ctx.adults === 1 ? 'adult' : 'adults')
      + (ctx.kidsUnder12 && ctx.kidsUnder12 > 0
          ? ' and ' + ctx.kidsUnder12 + ' ' + (ctx.kidsUnder12 === 1 ? 'child' : 'children') + ' under 12'
          : '')
    : '';
  return dateText + partyText;
}
