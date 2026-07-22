import { Markdown } from './Markdown';
import { TourAvailabilityCard } from './TourAvailabilityCard';
import { PaymentLinkCard } from './PaymentLinkCard';
import { IntakeForm } from './IntakeForm';
export function BotMessageRouter(props: any) {
  const action = props?.data?.action;
  const rawMessage = props?.data?.message || '';
  const message = rawMessage.trim();
  console.log('[BotMessageRouter]', {
    actionName: action?.name,
    rawLength: rawMessage.length,
    messageStart: message.slice(0, 120),
    charCodes: message.slice(0, 20).split('').map((c: string) => c.charCodeAt(0)),
    hasIntakeMarker: /INTAKE[_\s]*FORM/i.test(message),
  });
  // Detect intake form marker — permissive to catch AI variations
  if (/INTAKE[_\s]*FORM/i.test(message)) {
    return <IntakeForm />;
  }
  const hasSlots = Array.isArray(action?.data?.data) && action.data.data.length > 0;
  if (action?.name === 'fare_harbor_action_check_availability' && hasSlots) {
    return <TourAvailabilityCard {...props} />;
  }
  if (action?.name === 'fare_harbor_action_get_payment_link' && action?.data?.data?.payment_link) {
    return <PaymentLinkCard {...props} />;
  }
  return (
    <div style={{
      padding: '10px 14px',
      background: '#F5F5F4',
      borderRadius: 12,
      fontSize: 14,
      lineHeight: 1.5,
    }}>
      <Markdown>{message}</Markdown>
    </div>
  );
}
