import { Markdown } from './Markdown';
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
export function TourAvailabilityCard(props: any) {
  const actionData = props?.data?.action?.data;
  const message = props?.data?.message;
  const slots: any[] | undefined =
    Array.isArray(actionData?.data) ? actionData.data
    : Array.isArray(actionData) ? actionData
    : Array.isArray(actionData?.data?.data) ? actionData.data.data
    : undefined;
  if (!slots || slots.length === 0) {
    return (
      <div style={{ padding: '10px 14px', background: '#F5F5F4', borderRadius: 12, fontSize: 14, lineHeight: 1.5 }}>
        <Markdown>{message || actionData?.message || 'No openings for that date.'}</Markdown>
      </div>
    );
  }
  return (
    <div style={{ border: '1px solid #E7E5E4', borderRadius: 12, overflow: 'hidden', background: 'white' }}>
      <div style={{ padding: '10px 14px', background: '#0A6E76', color: 'white', fontWeight: 600, fontSize: 14 }}>
        {fmtDate(slots[0].start_at)}
      </div>
      <div style={{ padding: '4px 14px' }}>
        {slots.map((slot: any) => {
          const total = (slot.ticket_types || []).reduce((s: number, t: any) => s + (t.capacity || 0), 0);
          const summary = (slot.ticket_types || []).map((t: any) => `${t.capacity} ${t.type.toLowerCase()}`).join(', ');
          return (
            <div key={slot.availability_pk} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F5F5F4' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{fmtTime(slot.start_at)}</div>
                <div style={{ fontSize: 12, color: '#78716C' }}>{summary}</div>
              </div>
              <div style={{ background: '#0A6E76', color: 'white', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                {total} open
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
