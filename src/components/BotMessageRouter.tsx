import { TourAvailabilityCard } from './TourAvailabilityCard';
import { PaymentLinkCard } from './PaymentLinkCard';
export function BotMessageRouter(props: any) {
  const action = props?.data?.action;
  const message = props?.data?.message;
  if (action?.name === 'fare_harbor_action_check_availability') {
    return <TourAvailabilityCard {...props} />;
  }
  if (action?.name === 'fare_harbor_action_get_payment_link') {
    return <PaymentLinkCard {...props} />;
  }
  // Default: plain text bubble
  return (
    <div style={{
      padding: '10px 14px',
      background: '#F5F5F4',
      borderRadius: 12,
      fontSize: 14,
      lineHeight: 1.5,
      whiteSpace: 'pre-wrap',
    }}>
      {message}
    </div>
  );
}
