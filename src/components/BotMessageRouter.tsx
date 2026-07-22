import { Markdown } from './Markdown';
import { TourAvailabilityCard } from './TourAvailabilityCard';
import { PaymentLinkCard } from './PaymentLinkCard';
import { IntakeForm } from './IntakeForm';
import { AvailabilityResultsCard } from './AvailabilityResultsCard';
const AVAIL_MARKER = /<<AVAIL_RESULTS>>([\s\S]*?)<<END>>/;
const INTAKE_MARKER = /^\s*<<\s*INTAKE[_\s]*FORM\s*>>\s*$|^\s*\[\[\s*INTAKE[_\s]*FORM\s*\]\]\s*$/i;
// Some action responses arrive with `data` as a JSON string instead of an object — normalize
function normalizeAction(action: any) {
  if (!action) return action;
  const raw = action.data;
  if (typeof raw === 'string') {
    try {
      return { ...action, data: JSON.parse(raw) };
    } catch {
      return action;
    }
  }
  return action;
}
export function BotMessageRouter(props: any) {
  const rawAction = props?.data?.action;
  const action = normalizeAction(rawAction);
  const message = (props?.data?.message || '').trim();
  console.log('[BOT MSG]', {
    hasAction: !!action,
    actionName: action?.name,
    actionStatus: action?.data?.status,
    dataWasString: typeof rawAction?.data === 'string',
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
  if (INTAKE_MARKER.test(message)) {
    return <IntakeForm />;
  }
  const hasSlots = Array.isArray(action?.data?.data) && action.data.data.length > 0;
  if (action?.name === 'fare_harbor_action_check_availability' && hasSlots) {
    // pass the NORMALIZED action back into the card
    return <TourAvailabilityCard {...props} data={{ ...props.data, action }} />;
  }
  if (action?.name === 'fare_harbor_action_get_payment_link' && action?.data?.data?.payment_link) {
    return <PaymentLinkCard {...props} data={{ ...props.data, action }} />;
  }
  return (
    <div style={{ padding: '10px 14px', background: '#F5F5F4', borderRadius: 12, fontSize: 14, lineHeight: 1.5 }}>
      <Markdown>{message}</Markdown>
    </div>
  );
}
