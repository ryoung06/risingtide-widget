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
    const msg = `Get payment link for ${r.tour} on ${r.date} at ${r.time} (availability_pk: ${r.availability_pk}, item_pk: ${r.item_pk})`;
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
  if (!results?.length) return null;
  return (
    <div style={{ border: '1px solid #E7E5E4', borderRadius: 12, overflow: 'hidden', background: 'white' }}>
      {lead && (
        <div style={{ padding: '10px 14px', fontSize: 13, color: '#57534E', borderBottom: '1px solid #F5F5F4', lineHeight: 1.5 }}>
          <Markdown>{lead}</Markdown>
        </div>
      )}
      {results.map((r, i) => {
        const photo = getTourPhoto(r.tour);
        return (
          <div key={`${r.availability_pk}-${i}`} style={{
            display: 'flex', alignItems: 'stretch',
            borderBottom: i < results.length - 1 ? '1px solid #F5F5F4' : 'none',
          }}>
            {photo && (
              <img src={photo} alt={r.tour} style={{ width: 88, height: 88, objectFit: 'cover', flexShrink: 0 }} />
            )}
            <div style={{ flex: 1, padding: '10px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>{r.tour}</div>
                <div style={{ fontSize: 12, color: '#78716C', marginTop: 2 }}>
                  {r.date} · {r.time} · {r.seats} open
                </div>
              </div>
              <button type="button" onClick={() => book(r)} style={{
                alignSelf: 'flex-start', marginTop: 6,
                background: '#0A6E76', color: 'white', border: 'none',
                padding: '6px 12px', borderRadius: 6,
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>
                Book this →
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
