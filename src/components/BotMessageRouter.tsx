import { Markdown } from './Markdown';
import { TourAvailabilityCard } from './TourAvailabilityCard';
import { PaymentLinkCard } from './PaymentLinkCard';
import { IntakeForm } from './IntakeForm';
export function BotMessageRouter(props: any) {
  const action = props?.data?.action;
  const message = (props?.data?.message || '').trim();
  console.log('[BotMessageRouter]', {
    actionName: action?.name,
    hasAction: !!action?.data,
    messagePreview: message.slice(0, 60),
  });
  // Intake form marker
  if (message === '<<INTAKE_FORM>>' || message.includes('<<INTAKE_FORM>>')) {
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
