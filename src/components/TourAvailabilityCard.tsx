import { useMessages } from '@opencx/widget-react-headless';
import { Markdown } from './Markdown';
import { getTourPhoto, TOUR_PHOTOS } from '../data/tourPhotos';
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
const fmtDateShort = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
function extractTourName(message: string): string | undefined {
  if (!message) return undefined;
  const lower = message.toLowerCase();
  for (const name of Object.keys(TOUR_PHOTOS)) {
    const candidates = [
      name.toLowerCase(),
      name.toLowerCase().replace(' & ', ' and '),
      name.toLowerCase().replace("'", ''),
      name.toLowerCase().replace("'s", 's'),
    ];
    if (candidates.some(c => lower.includes(c))) return name;
  }
  return undefined;
}
export function TourAvailabilityCard(props: any) {
  const actionData = props?.data?.action?.data;
  const message = props?.data?.message || '';
  const { sendMessage } = useMessages();
  const slots: any[] | undefined =
    Array.isArray(actionData?.data) ? actionData.data
    : Array.isArray(actionData) ? actionData
    : Array.isArray(actionData?.data?.data) ? actionData.data.data
    : undefined;
  const tourName = extractTourName(message);
  const photo = getTourPhoto(tourName);
  const book = async (slot: any) => {
    const time = fmtTime(slot.start_at);
    const date = fmtDateShort(slot.start_at);
    const tour = tourName || 'this tour';
    const msg = 'Get payment link for ' + tour + ' on ' + date + ' at ' + time + ' (availability_pk: ' + slot.availability_pk + ')';
    try {
      await (sendMessage as any)({ content: msg });
    } catch (e1) {
      try {
        await (sendMessage as any)(msg);
      } catch (e2) {
        console.error('[TourAvailabilityCard] sendMessage failed', e1, e2);
      }
    }
  };
  if (!slots || slots.length === 0) {
    return (
      <div style={{ padding: '10px 14px', background: '#F5F5F4', borderRadius: 12, fontSize: 14, lineHeight: 1.5 }}>
        <Markdown>{message || actionData?.message || 'No openings for that date.'}</Markdown>
      </div>
    );
  }
  return (
    <div style={{ border: '1px solid #E7E5E4', borderRadius: 12, overflow: 'hidden', background: 'white' }}>
      {photo && (
        <img src={photo} alt={tourName || 'Tour'} style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
      )}
      <div style={{ padding: '10px 14px', background: '#0A6E76', color: 'white', fontWeight: 600, fontSize: 14 }}>
        {tourName ? tourName + ' — ' + fmtDate(slots[0].start_at) : fmtDate(slots[0].start_at)}
      </div>
      <div style={{ padding: '4px 14px' }}>
        {slots.map((slot: any, i: number) => {
          const seatsOpen = typeof slot.capacity === 'number' ? slot.capacity : 0;
          const types = slot.ticket_types || [];
          return (
            <div key={slot.availability_pk} style={{
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
              padding: '12px 0',
              borderBottom: i < slots.length - 1 ? '1px solid #F5F5F4' : 'none',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: '#1C1917', marginBottom: 6 }}>
                  {fmtTime(slot.start_at)}
                </div>
                {types.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', columnGap: 12, rowGap: 3 }}>
                    {types.map((t: any) => (
                      <>
                        <div key={t.customer_type_rate_pk + '-name'} style={{ fontSize: 12, color: '#57534E' }}>{t.type}</div>
                        <div key={t.customer_type_rate_pk + '-price'} style={{ fontSize: 12, color: '#1C1917', fontVariantNumeric: 'tabular-nums', textAlign: 'right', fontWeight: 500 }}>{t.price}</div>
                      </>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 6, flexShrink: 0, minWidth: 90 }}>
                <div style={{ background: '#F5F5F4', color: '#57534E', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, textAlign: 'center' }}>
                  {seatsOpen} open
                </div>
                <button type="button" onClick={() => book(slot)} style={{
                  background: '#0A6E76',
                  color: 'white',
                  border: 'none',
                  padding: '7px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}>
                  Book this →
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {message && (
        <div style={{ padding: '10px 14px', fontSize: 13, color: '#57534E', borderTop: '1px solid #F5F5F4', lineHeight: 1.5 }}>
          <Markdown>{message}</Markdown>
        </div>
      )}
    </div>
  );
}
