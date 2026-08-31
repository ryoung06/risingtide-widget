import { useEffect } from 'react';
import { useMessages } from '@opencx/widget-react-headless';
import { Markdown } from './Markdown';
import { getTourPhoto } from '../data/tourPhotos';
import { saveSearchContext, readSearchContext, contextSnippet } from '../data/searchContext';
type Result = {
  tour: string;
  date: string;
  time: string;
  item_pk: number;
  availability_pk: number;
  seats: number;
};
// Normalize a "Jul 23" or "Aug 15" style string to YYYY-MM-DD using the current or next year
function toIsoDate(dateLabel: string): string | null {
  if (!dateLabel) return null;
  const now = new Date();
  const attempt = new Date(dateLabel + ', ' + now.getFullYear());
  if (isNaN(attempt.getTime())) return null;
  // If parsed date is well in the past, roll to next year
  if (attempt.getTime() < now.getTime() - 30 * 24 * 60 * 60 * 1000) {
    attempt.setFullYear(now.getFullYear() + 1);
  }
  return attempt.toISOString().slice(0, 10);
}
export function AvailabilityResultsCard({ results, lead }: { results: Result[]; lead?: string }) {
  const { sendMessage } = useMessages();
  // Backfill context from results — only if intake form didn't already save richer context
  useEffect(() => {
    if (!results?.length) return;
    const existing = readSearchContext();
    if (existing) return; // don't overwrite intake-form context that has party info
    const iso = toIsoDate(results[0].date);
    if (!iso) return;
    let latest = iso;
    for (const r of results) {
      const d = toIsoDate(r.date);
      if (d && d > latest) latest = d;
    }
    saveSearchContext({ startDate: iso, endDate: latest !== iso ? latest : null });
  }, [results]);
  const send = async (msg: string) => {
    try {
      await (sendMessage as any)({ content: msg });
    } catch (e1) {
      try {
        await (sendMessage as any)(msg);
      } catch (e2) {
        console.error('[AvailabilityResultsCard] sendMessage failed', e1, e2);
      }
    }
  };
  const book = (r: Result) =>
    send('Get payment link for ' + r.tour + ' on ' + r.date + ' at ' + r.time + ' (availability_pk: ' + r.availability_pk + ')');
  const learnMore = (tour: string) => {
    const ctx = readSearchContext();
    const snippet = contextSnippet(ctx);
    const msg = snippet
      ? 'Tell me more about ' + tour + '. Also check availability for the dates I already asked about: ' + snippet + '.'
      : 'Tell me more about ' + tour + '.';
    send(msg);
  };
  if (!results?.length) return null;
  const groups: { tour: string; slots: Result[] }[] = [];
  const seen: Record<string, number> = {};
  for (const r of results) {
    if (seen[r.tour] === undefined) {
      seen[r.tour] = groups.length;
      groups.push({ tour: r.tour, slots: [] });
    }
    groups[seen[r.tour]].slots.push(r);
  }
  return (
    <div style={{ border: '1px solid #E7E5E4', borderRadius: 12, overflow: 'hidden', background: 'white' }}>
      {lead && (
        <div style={{ padding: '10px 14px', fontSize: 13, color: '#57534E', borderBottom: '1px solid #F5F5F4', lineHeight: 1.5 }}>
          <Markdown>{lead}</Markdown>
        </div>
      )}
      {groups.map((g, gi) => {
        const photo = getTourPhoto(g.tour);
        return (
          <div key={g.tour} style={{ borderBottom: gi < groups.length - 1 ? '1px solid #E7E5E4' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'stretch' }}>
              {photo && (
                <img src={photo} alt={g.tour} style={{ width: 88, height: 88, objectFit: 'cover', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, padding: '8px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => learnMore(g.tour)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    textAlign: 'left',
                    fontWeight: 600,
                    fontSize: 14,
                    lineHeight: 1.3,
                    color: '#0A6E76',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    textDecorationStyle: 'dotted',
                    textUnderlineOffset: 3,
                  }}
                  title={'Learn more about ' + g.tour}
                >
                  {g.tour}
                </button>
                <div style={{ fontSize: 11, color: '#78716C', marginTop: 2 }}>
                  {g.slots.length} {g.slots.length === 1 ? 'option' : 'options'} · tap name to learn more
                </div>
              </div>
            </div>
            <div style={{ padding: '0 14px 8px' }}>
              {g.slots.map((s, si) => (
                <div
                  key={s.availability_pk + '-' + si}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderTop: '1px solid #F5F5F4',
                  }}
                >
                  <div style={{ fontSize: 13 }}>
                    <span style={{ fontWeight: 600 }}>{s.date}</span>
                    <span style={{ color: '#78716C' }}> · {s.time} · {s.seats} open</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => book(s)}
                    style={{
                      background: '#0A6E76',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Book →
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      <div
        style={{
          padding: '10px 14px',
          borderTop: '1px solid #E7E5E4',
          background: '#F5F5F4',
          fontSize: 12,
          color: '#57534E',
          lineHeight: 1.5,
        }}
      >
        Don't see the tour you were looking for? Tell me which one you're interested in and I'll find availability closest to your dates.
      </div>
    </div>
  );
}
