import { Markdown } from './Markdown';
import { TourAvailabilityCard } from './TourAvailabilityCard';
import { PaymentLinkCard } from './PaymentLinkCard';
import { IntakeForm } from './IntakeForm';
import { AvailabilityResultsCard } from './AvailabilityResultsCard';
const AVAIL_MARKER = /<<AVAIL_RESULTS>>([\s\S]*?)<<END>>/;
// Tightened: only match the exact standalone marker, not the words "intake form" in prose
const INTAKE_MARKER = /^\s*<<\s*INTAKE[_\s]*FORM\s*>>\s*$|^\s*\[\[\s*INTAKE[_\s]*FORM\s*\]\]\s*$/i;
export function BotMessageRouter(props: any) {
  const action = props?.data?.action;
  const message = (props?.data?.message || '').trim();
  // DEBUG — log every bot message so we can see all action shapes
  console.log('[BOT MSG]', {
    hasAction: !!action,
    actionName: action?.name,
    actionStatus: action?.data?.status,
    actionKeys: action?.data ? Object.keys(action.data) : null,
    messageLen: message.length,
    messagePreview: message.slice(0, 120),
    matchesIntakeMarker: INTAKE_MARKER.test(message),
    matchesAvailMarker: AVAIL_MARKER.test(message),
  });
  if (action?.name === 'fare_harbor_action_check_availability') {
    console.log('[FH AVAIL FULL]', JSON.stringify(action, null, 2));
  }
  if (action?.name === 'fare_harbor_action_get_payment_link') {
    console.log('[FH PAYMENT FULL]', JSON.stringify(action, null, 2));
  }
  const availMatch = message.match(AVAIL_MARKER);
  if (availMatch) {
    try {
      const results = JSON.parse(availMatch[1]);
      const lead = message.replace(AVAIL_MARKER, '').trim();
      return <AvailabilityResultsCard results={results} lead={lead} />;
    } catch {
      // fall through
    }
  }
  // Tightened intake match — only fires on standalone marker
  if (INTAKE_MARKER.test(message)) {
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
    <div style={{ padding: '10px 14px', background: '#F5F5F4', borderRadius: 12, fontSize: 14, lineHeight: 1.5 }}>
      <Markdown>{message}</Markdown>
    </div>
  );
}
