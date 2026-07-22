import { useMessages } from '@opencx/widget-react-headless';
import { Markdown } from './Markdown';
import { getTourPhoto } from '../data/tourPhotos';
type Result = {
  tour: string;
  date: string;
  time: string;
  item_pk: number;
  availability_pk: number;
  seats: number;
};
export function AvailabilityResultsCard({ results, lead }: { results: Result[]; lead?: string }) {
  const { sendMessage } = useMessages();
  const book = async (r: Result) => {
    const msg = `Get payment link for ${r.tour} on ${r.date} at ${r.time} (availability_pk: ${r.availability_pk})`;
    try {
      await (sendMessage as any)({ content: msg });
    } catch (e1) {
      try { await (sendMessage as any)(msg); } catch (e2) {
        console.error('[AvailabilityResultsCard] sendMessage failed', e1, e2);
      }
    }
  };
  if (!results?.length) return null;
  // Group by tour name, preserving first-appearance order
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
                <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3, color: '#0A6E76' }}>{g.tour}</div>
                <div style={{ fontSize: 11, color: '#78716C', marginTop: 2 }}>
                  {g.slots.length} {g.slots.length === 1 ? 'option' : 'options'}
                </div>
              </div>
            </div>
            <div style={{ padding: '0 14px 8px' }}>
              {g.slots.map((s, si) => (
                <div key={`${s.availability_pk}-${si}`} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0',
                  borderTop: si === 0 ? '1px solid #F5F5F4' : '1px solid #F5F5F4',
                }}>
                  <div style={{ fontSize: 13 }}>
                    <span style={{ fontWeight: 600 }}>{s.date}</span>
                    <span style={{ color: '#78716C' }}> · {s.time} · {s.seats} open</span>
                  </div>
                  <button type="button" onClick={() => book(s)} style={{
                    background: '#0A6E76', color: 'white', border: 'none',
                    padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}>
                    Book →
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
