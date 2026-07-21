import { WidgetComponentProps } from '@opencx/widget-react-headless';
type Slot = {
  availability_pk: number;
  start_at: string;
  end_at: string;
  capacity: number;
  ticket_types: Array<{
    customer_type_rate_pk: number;
    type: string;
    price: string;
    capacity: number;
  }>;
};
type Payload = {
  status: 'success' | 'error';
  data?: Slot[];
  message?: string;
};
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
export function TourAvailabilityCard({ data }: WidgetComponentProps<Payload>) {
  const payload = data?.action?.data;
  if (!payload) return null;
  if (payload.status === 'error' || !payload.data || payload.data.length === 0) {
    return (
      <div style={{
        padding: '12px 16px', borderRadius: '12px',
        background: '#F5F5F4', color: '#57534E', fontSize: '14px',
      }}>
        {payload.message || 'No openings for that date.'}
      </div>
    );
  }
  const slots = payload.data;
  return (
    <div style={{
      border: '1px solid #E7E5E4', borderRadius: '12px',
      overflow: 'hidden', background: 'white',
    }}>
      <div style={{
        padding: '10px 14px', background: '#0A6E76',
        color: 'white', fontWeight: 600, fontSize: '14px',
      }}>
        {fmtDate(slots[0].start_at)}
      </div>
      <div style={{ padding: '4px 14px' }}>
        {slots.map((slot) => {
          const total = slot.ticket_types.reduce((s, t) => s + t.capacity, 0);
          const summary = slot.ticket_types
            .map((t) => `${t.capacity} ${t.type.toLowerCase()}`)
            .join(', ');
          return (
            <div key={slot.availability_pk} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', padding: '10px 0',
              borderBottom: '1px solid #F5F5F4',
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>
                  {fmtTime(slot.start_at)}
                </div>
                <div style={{ fontSize: '12px', color: '#78716C' }}>
                  {summary}
                </div>
              </div>
              <div style={{
                background: '#0A6E76', color: 'white',
                padding: '4px 10px', borderRadius: '6px',
                fontSize: '12px', fontWeight: 600,
              }}>
                {total} open
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
