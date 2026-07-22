export function PaymentLinkCard(props: any) {
  const payload = props?.data?.action?.data;
  const rawMessage = props?.data?.message || '';
  const link = payload?.data?.payment_link;
  // Strip the payment link out of the message body (we render it as a button below)
  const cleanMessage = link
    ? rawMessage.replace(link, '').replace(/\s+\n/g, '\n').trim()
    : rawMessage;
  // Simple linkify for any remaining URLs
  const parts = cleanMessage.split(/(https?:\/\/[^\s]+)/g);
  if (!link) {
    return (
      <div style={{ padding: '10px 14px', background: '#F5F5F4', borderRadius: 12, fontSize: 14, whiteSpace: 'pre-wrap' }}>
        {renderLinkified(parts)}
      </div>
    );
  }
  return (
    <div style={{ border: '1px solid #E7E5E4', borderRadius: 12, overflow: 'hidden', background: 'white' }}>
      <div style={{ padding: '10px 14px', background: '#0A6E76', color: 'white', fontWeight: 600, fontSize: 14 }}>
        Ready to book
      </div>
      <div style={{ padding: '12px 14px', fontSize: 13, color: '#44403C', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
        {renderLinkified(parts)}
      </div>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block',
          margin: '0 14px 14px',
          padding: '10px 14px',
          background: '#0A6E76',
          color: 'white',
          textAlign: 'center',
          borderRadius: 8,
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        Complete booking →
      </a>
    </div>
  );
}
function renderLinkified(parts: string[]) {
  return parts.map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: '#0A6E76', textDecoration: 'underline' }}>
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}
