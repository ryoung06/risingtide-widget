import { useState } from 'react';
import * as HeadlessMod from '@opencx/widget-react-headless';
type TourType = 'kayak' | 'boat' | 'both';
const label = { fontSize: 12, fontWeight: 600, color: '#44403C', marginBottom: 4, display: 'block' } as const;
const inputStyle = { width: '100%', padding: '8px 10px', border: '1px solid #E7E5E4', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' as const };
// Log every export from the headless package so we can see which hook exists
console.log('[Headless exports]', Object.keys(HeadlessMod));
export function IntakeForm() {
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [useDateRange, setUseDateRange] = useState(false);
  const [endDate, setEndDate] = useState(today);
  const [adults, setAdults] = useState(2);
  const [kidsUnder12, setKidsUnder12] = useState(0);
  const [tourType, setTourType] = useState<TourType>('kayak');
  // Try to grab a send hook — we don't know the name yet, so try common ones
  const anyHeadless = HeadlessMod as any;
  const sendHook =
    anyHeadless.useSendMessage ||
    anyHeadless.useChat ||
    anyHeadless.useWidget ||
    anyHeadless.useMessages ||
    null;
  let hookResult: any = null;
  if (sendHook) {
    try { hookResult = sendHook(); } catch (e) { console.warn('[IntakeForm] hook call failed', e); }
  }
  console.log('[IntakeForm] sendHook name:', sendHook?.name, 'hookResult:', hookResult);
  const stepper = (value: number, setValue: (n: number) => void, min = 0, max = 20) => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <button type="button" onClick={() => setValue(Math.max(min, value - 1))}
        style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #E7E5E4', background: 'white', fontSize: 16, cursor: 'pointer' }}>−</button>
      <div style={{ minWidth: 32, textAlign: 'center', fontWeight: 600 }}>{value}</div>
      <button type="button" onClick={() => setValue(Math.min(max, value + 1))}
        style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #E7E5E4', background: 'white', fontSize: 16, cursor: 'pointer' }}>+</button>
    </div>
  );
  const typeBtn = (id: TourType, text: string) => (
    <button type="button" onClick={() => setTourType(id)}
      style={{
        flex: 1, padding: '8px 10px', borderRadius: 6,
        border: '1px solid ' + (tourType === id ? '#0A6E76' : '#E7E5E4'),
        background: tourType === id ? '#0A6E76' : 'white',
        color: tourType === id ? 'white' : '#44403C',
        fontSize: 13, fontWeight: 600, cursor: 'pointer',
      }}>{text}</button>
  );
  const buildMessage = () => {
    const fmtDate = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const dateText = useDateRange && endDate !== startDate
      ? `between ${fmtDate(startDate)} and ${fmtDate(endDate)}`
      : `on ${fmtDate(startDate)}`;
    const typeText = tourType === 'kayak' ? 'kayak tours' : tourType === 'boat' ? 'boat tours' : 'kayak and boat tours';
    const kidText = kidsUnder12 > 0 ? ` and ${kidsUnder12} ${kidsUnder12 === 1 ? 'child' : 'children'} under 12` : '';
    return `Check availability for ${typeText} ${dateText}. Party: ${adults} ${adults === 1 ? 'adult' : 'adults'}${kidText}. Show me every tour with openings.`;
  };
  const handleSubmit = () => {
    const message = buildMessage();
    // Path A: Try hook-based send
    const send =
      hookResult?.sendMessage ||
      hookResult?.send ||
      hookResult?.submit ||
      (typeof hookResult === 'function' ? hookResult : null);
    if (typeof send === 'function') {
      try {
        console.log('[IntakeForm] using hook.sendMessage');
        send(message);
        return;
      } catch (e) { console.warn('[IntakeForm] hook send failed, falling back to DOM', e); }
    }
    // Path B: Deep DOM scan (including shadow roots)
    const inputs = deepFindInputs(document.body);
    console.log('[IntakeForm] deep scan found:', inputs.length, inputs.map(el => ({ tag: el.tagName, ph: (el as any).placeholder, role: el.getAttribute('role'), ce: el.getAttribute('contenteditable') })));
    if (inputs.length === 0) {
      alert('Could not find the chat input. Please copy this message and paste it into the chat:\n\n' + message);
      return;
    }
    // Prefer the last visible one
    const el = inputs[inputs.length - 1];
    typeAndSubmit(el, message);
  };
  return (
    <div style={{ border: '1px solid #E7E5E4', borderRadius: 12, overflow: 'hidden', background: 'white' }}>
      <div style={{ padding: '10px 14px', background: '#0A6E76', color: 'white', fontWeight: 600, fontSize: 14 }}>
        Check Availability
      </div>
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={label}>{useDateRange ? 'Start date' : 'Date'}</label>
          <input type="date" value={startDate} min={today} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#57534E', cursor: 'pointer' }}>
          <input type="checkbox" checked={useDateRange} onChange={(e) => setUseDateRange(e.target.checked)} />
          I'm flexible — check a date range
        </label>
        {useDateRange && (
          <div>
            <label style={label}>End date</label>
            <input type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} />
          </div>
        )}
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
        <button type="button" onClick={handleSubmit}
          style={{
            padding: '10px 14px', background: '#0A6E76', color: 'white',
            border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14,
            cursor: 'pointer', marginTop: 4,
          }}>
          Check Availability →
        </button>
      </div>
    </div>
  );
}
// Recursively walk the DOM including shadow roots to find message input candidates
function deepFindInputs(root: Element | ShadowRoot, out: HTMLElement[] = []): HTMLElement[] {
  const treeWalker = (root as any).querySelectorAll ? root : null;
  if (treeWalker) {
    const nodes = (root as Element).querySelectorAll<HTMLElement>('textarea, input[type="text"], input:not([type]), [contenteditable="true"], [role="textbox"]');
    nodes.forEach(n => {
      const r = n.getBoundingClientRect();
      // Accept anything with any width (relax the filter)
      if (r.width > 0 || (n as any).offsetParent !== null || n.getAttribute('contenteditable') === 'true') {
        out.push(n);
      }
    });
  }
  // Recurse into shadow roots
  const allEls = (root as Element).querySelectorAll ? (root as Element).querySelectorAll<HTMLElement>('*') : [];
  allEls.forEach(el => {
    if ((el as any).shadowRoot) {
      deepFindInputs((el as any).shadowRoot, out);
    }
  });
  return out;
}
function typeAndSubmit(el: HTMLElement, message: string) {
  if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
    const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    setter?.call(el, message);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  } else {
    el.textContent = message;
    el.dispatchEvent(new InputEvent('input', { bubbles: true, data: message }));
  }
  requestAnimationFrame(() => {
    el.focus();
    ['keydown', 'keypress', 'keyup'].forEach(type => {
      el.dispatchEvent(new KeyboardEvent(type, { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
    });
    const form = el.closest('form');
    if (form) {
      form.requestSubmit?.();
    }
    const allBtns = Array.from(document.querySelectorAll<HTMLButtonElement>('button'));
    const sendBtn = allBtns.find((b) => {
      const l = (b.getAttribute('aria-label') || b.textContent || '').toLowerCase();
      return l.includes('send') || b.querySelector('svg[data-icon="send"], svg[class*="send" i]');
    });
    sendBtn?.click();
  });
}
