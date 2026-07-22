import { TourAvailabilityCard } from './TourAvailabilityCard';
import { PaymentLinkCard } from './PaymentLinkCard';
export function BotMessageRouter(props: any) {
  const action = props?.data?.action;
  const message = props?.data?.message || '';
  console.log('[BotMessageRouter]', {
    actionName: action?.name,
    hasActionData: !!action?.data,
    actionDataKeys: action?.data ? Object.keys(action.data) : null,
    messagePreview: message.slice(0, 80),
  });
  if (action?.name === 'fare_harbor_action_check_availability') {
    return <TourAvailabilityCard {...props} />;
  }
  if (action?.name === 'fare_harbor_action_get_payment_link') {
    return <PaymentLinkCard {...props} />;
  }
  // Auto-linkify URLs in plain text fallback
  const parts = message.split(/(https?:\/\/[^\s]+)/g);
  return (
    <div style={{
      padding: '10px 14px',
      background: '#F5F5F4',
      borderRadius: 12,
      fontSize: 14,
      lineHeight: 1.5,
      whiteSpace: 'pre-wrap',
    }}>
      {parts.map((p: string, i: number) =>
        /^https?:\/\//.test(p)
          ? <a key={i} href={p} target="_blank" rel="noopener noreferrer" style={{ color: '#0A6E76', textDecoration: 'underline' }}>{p}</a>
          : <span key={i}>{p}</span>
      )}
    </div>
  );
}
