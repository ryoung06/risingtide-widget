import { useState } from 'react';
type TourType = 'kayak' | 'boat' | 'both';
const label = { fontSize: 12, fontWeight: 600, color: '#44403C', marginBottom: 4, display: 'block' } as const;
const input = { width: '100%', padding: '8px 10px', border: '1px solid #E7E5E4', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' as const };
const row = { display: 'flex', gap: 8, alignItems: 'center' };
export function IntakeForm() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [adults, setAdults] = useState(2);
  const [kidsUnder12, setKidsUnder12] = useState(0);
  const [tourType, setTourType] = useState<TourType>('kayak');
  const stepper = (value: number, setValue: (n: number) => void, min = 0, max = 20) => (
    <div style={row}>
      <button
        type="button"
        onClick={() => setValue(Math.max(min, value - 1))}
        style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #E7E5E4', background: 'white', fontSize: 16, cursor: 'pointer' }}
      >−</button>
      <div style={{ minWidth: 32, textAlign: 'center', fontWeight: 600 }}>{value}</div>
      <button
        type="button"
        onClick={() => setValue(Math.min(max, value + 1))}
        style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #E7E5E4', background: 'white', fontSize: 16, cursor: 'pointer' }}
      >+</button>
    </div>
  );
  const typeBtn = (id: TourType, text: string) => (
    <button
      type="button"
      onClick={() => setTourType(id)}
      style={{
        flex: 1,
        padding: '8px 10px',
        borderRadius: 6,
        border: '1px solid ' + (tourType === id ? '#0A6E76' : '#E7E5E4'),
        background: tourType === id ? '#0A6E76' : 'white',
        color: tourType === id ? 'white' : '#44403C',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      {text}
    </button>
  );
  const handleSubmit = () => {
    const total = adults + kidsUnder12;
    const kidNote = kidsUnder12 > 0 ? ` (including ${kidsUnder12} ${kidsUnder12 === 1 ? 'child' : 'children'} under 12 — will need tandem with adult)` : '';
    const typeText = tourType === 'kayak' ? 'kayak tours' : tourType === 'boat' ? 'boat tours' : 'kayak and boat tours';
    const dateFmt = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const message = `Check availability for ${typeText} on ${dateFmt}. ${adults} ${adults === 1 ? 'adult' : 'adults'}${kidsUnder12 > 0 ? ` and ${kidsUnder12} ${kidsUnder12 === 1 ? 'child' : 'children'} under 12` : ''}${kidNote ? '.' : '.'} Show me all options with openings.`;
    sendMessageToWidget(message);
  };
  return (
    <div style={{ border: '1px solid #E7E5E4', borderRadius: 12, overflow: 'hidden', background: 'white' }}>
      <div style={{ padding: '10px 14px', background: '#0A6E76', color: 'white', fontWeight: 600, fontSize: 14 }}>
        Check Availability
      </div>
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={label}>Date</label>
          <input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} style={input} />
        </div>
        <div>
          <label style={label}>Tour type</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {typeBtn('kayak', 'Kayak Tours')}
            {typeBtn('boat', 'Boat Tours')}
            {typeBtn('both', 'Both')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={label}>Adults</label>
            {stepper(adults, setAdults, 1)}
          </div>
          <div style={{ flex: 1 }}>
            <label style={label}>Children under 12</label>
            {stepper(kidsUnder12, setKidsUnder12, 0)}
          </div>
        </div>
        {kidsUnder12 > 0 && tourType !== 'boat' && (
          <div style={{ fontSize: 12, color: '#78716C', padding: '6px 8px', background: '#F5F5F4', borderRadius: 6 }}>
            Heads up: children under 12 must ride in a tandem kayak with an adult.
          </div>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          style={{
            padding: '10px 14px',
            background: '#0A6E76',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            marginTop: 4,
          }}
        >
          Check Availability →
        </button>
      </div>
    </div>
  );
}
// Programmatically type + submit into the widget's message input
function sendMessageToWidget(message: string) {
  // Find the widget's textarea (or input). The default OpenCX widget uses a textarea.
  const textarea = document.querySelector<HTMLTextAreaElement>('#risingtide-widget-root textarea, #risingtide-widget-root input[type="text"]');
  if (!textarea) {
    console.error('[IntakeForm] Could not find widget input textarea');
    alert('Something went wrong — please type your question in the chat.');
    return;
  }
  // React overrides the value setter — need to use the native setter to trigger onChange
  const nativeSetter = Object.getOwnPropertyDescriptor(
    textarea.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype,
    'value'
  )?.set;
  nativeSetter?.call(textarea, message);
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  // Wait a frame for React to update, then submit by simulating Enter
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));
    textarea.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter', code: 'Enter', bubbles: true }));
    // Fallback: find and click the send button
    const sendBtn = document.querySelector<HTMLButtonElement>('#risingtide-widget-root button[type="submit"], #risingtide-widget-root button[aria-label*="end" i]');
    sendBtn?.click();
  });
}
