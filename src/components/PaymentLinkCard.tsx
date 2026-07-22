export function PaymentLinkCard(props: any) {
  const payload = props?.data?.action?.data;
  const message = props?.data?.message;
  const link = payload?.data?.payment_link;
  if (!link) {
    return (
      <div style={{ padding: '10px 14px', background: '#F5F5F4', borderRadius: 12, fontSize: 14, whiteSpace: 'pre-wrap' }}>
        {message}
      </div>
    );
  }
  return (
    <div style={{ border: '1px solid #E7E5E4', borderRadius: 12, overflow: 'hidden', background: 'white' }}>
      <div style={{ padding: '10px 14px', background: '#0A6E76', color: 'white', fontWeight: 600, fontSize: 14 }}>
        Ready to book
      </div>
      <div style={{ padding: '12px 14px', fontSize: 13, color: '#44403C', whiteSpace: 'pre-wrap' }}>
        {message}
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
