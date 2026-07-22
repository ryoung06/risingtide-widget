import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TourAvailabilityCard } from './TourAvailabilityCard';
import { PaymentLinkCard } from './PaymentLinkCard';
export function BotMessageRouter(props: any) {
  const action = props?.data?.action;
  const message = props?.data?.message || '';
  console.log('[BotMessageRouter]', {
    actionName: action?.name,
    hasActionData: !!action?.data,
    messagePreview: message.slice(0, 80),
  });
  if (action?.name === 'fare_harbor_action_check_availability') {
    return <TourAvailabilityCard {...props} />;
  }
  if (action?.name === 'fare_harbor_action_get_payment_link') {
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
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#0A6E76', textDecoration: 'underline' }}>{children}</a>
          ),
          p: ({ children }) => <p style={{ margin: '0 0 8px' }}>{children}</p>,
          ul: ({ children }) => <ul style={{ margin: '4px 0 8px', paddingLeft: 18 }}>{children}</ul>,
          li: ({ children }) => <li style={{ margin: '2px 0' }}>{children}</li>,
          strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
        }}
      >
        {message}
      </ReactMarkdown>
    </div>
  );
}
