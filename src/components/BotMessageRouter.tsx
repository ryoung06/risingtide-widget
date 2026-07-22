import { Markdown } from './Markdown';
import { TourAvailabilityCard } from './TourAvailabilityCard';
import { PaymentLinkCard } from './PaymentLinkCard';
import { IntakeForm } from './IntakeForm';
import { AvailabilityResultsCard } from './AvailabilityResultsCard';
const AVAIL_MARKER = /<<AVAIL_RESULTS>>([\s\S]*?)<<END>>/;
export function BotMessageRouter(props: any) {
  const action = props?.data?.action;
  const message = (props?.data?.message || '').trim();
  // TEMP DEBUG — remove after logging one availability payload
  if (action?.name === 'fare_harbor_action_check_availability') {
    console.log('[FH AVAIL PAYLOAD]', JSON.stringify(action, null, 2));
  }
  if (action?.name === 'fare_harbor_action_get_payment_link') {
    console.log('[FH PAYMENT PAYLOAD]', JSON.stringify(action, null, 2));
  }
  // Multi-tour availability marker — check FIRST
  const availMatch = message.match(AVAIL_MARKER);
  if (availMatch) {
    try {
      const results = JSON.parse(availMatch[1]);
      const lead = message.replace(AVAIL_MARKER, '').trim();
      return <AvailabilityResultsCard results={results} lead={lead} />;
    } catch {
      // fall through to plain render if JSON is malformed
    }
  }
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
