import { useState } from 'react';
import { useMessages, useWidget, useSessions } from '@opencx/widget-react-headless';
type TourType = 'kayak' | 'boat' | 'both';
const label = { fontSize: 12, fontWeight: 600, color: '#44403C', marginBottom: 4, display: 'block' } as const;
const inputStyle = { width: '100%', padding: '8px 10px', border: '1px solid #E7E5E4', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' as const };
export function IntakeForm() {
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [useDateRange, setUseDateRange] = useState(false);
  const [endDate, setEndDate] = useState(today);
  const [adults, setAdults] = useState(2);
  const [kidsUnder12, setKidsUnder12] = useState(0);
  const [tourType, setTourType] = useState<TourType>('kayak');
  const messagesHook: any = tryHook(useMessages);
  const widgetHook: any = tryHook(useWidget);
  const sessionsHook: any = tryHook(useSessions);
  // Deep exploration
  console.log('[V12] useMessages:', messagesHook, 'keys:', messagesHook && Object.keys(messagesHook));
  console.log('[V12] useWidget:', widgetHook, 'keys:', widgetHook && Object.keys(widgetHook));
  if (widgetHook?.widgetCtx) {
    console.log('[V12] widgetCtx keys:', Object.keys(widgetHook.widgetCtx));
    if (widgetHook.widgetCtx.api) {
      const api = widgetHook.widgetCtx.api;
      console.log('[V12] api keys:', Object.keys(api));
      console.log('[V12] api prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(api) || {}));
    }
  }
  console.log('[V12] useSessions:', sessionsHook, 'keys:', sessionsHook && Object.keys(sessionsHook));
  console.log('[V12] iframe ref:', widgetHook?.contentIframeRef?.current);
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
  const handleSubmit = async () => {
    const message = buildMessage();
    // Path 1: try widgetCtx.api methods
    const api = widgetHook?.widgetCtx?.api;
    if (api) {
      const apiMethods = [
        ...Object.keys(api),
        ...Object.getOwnPropertyNames(Object.getPrototypeOf(api) || {}),
      ];
      console.log('[V12] All api methods:', apiMethods);
      for (const m of apiMethods) {
        if (typeof api[m] !== 'function') continue;
        if (!/send|create|submit|post|message/i.test(m)) continue;
        console.log('[V12] trying api.' + m);
        const attempts = [
          () => api[m](message),
          () => api[m]({ content: message }),
          () => api[m]({ message }),
          () => api[m]({ text: message }),
          () => api[m]({ content: message, type: 'USER' }),
        ];
        for (const a of attempts) {
          try {
            const r = await a();
            console.log('[V12] SUCCESS via api.' + m, r);
            return;
          } catch (e: any) {
            console.log('[V12] api.' + m + ' attempt failed:', e?.message || e);
          }
        }
      }
    }
    // Path 2: try widgetCtx top-level methods
    const ctx = widgetHook?.widgetCtx;
    if (ctx) {
      const ctxMethods = [...Object.keys(ctx), ...Object.getOwnPropertyNames(Object.getPrototypeOf(ctx) || {})];
      console.log('[V12] widgetCtx methods:', ctxMethods);
      for (const m of ctxMethods) {
        if (typeof ctx[m] !== 'function') continue;
        if (!/send|create|submit|post/i.test(m)) continue;
        console.log('[V12] trying widgetCtx.' + m);
        try {
          await ctx[m](message);
          console.log('[V12] SUCCESS via widgetCtx.' + m);
          return;
        } catch (e: any) { console.log('[V12] failed:', e?.message); }
        try {
          await ctx[m]({ content: message });
          console.log('[V12] SUCCESS via widgetCtx.' + m + ' (object)');
          return;
        } catch (e: any) { console.log('[V12] failed:', e?.message); }
      }
    }
    // Path 3: reach into the iframe and drive its input
    const iframe = widgetHook?.contentIframeRef?.current as HTMLIFrameElement | undefined;
    if (iframe && iframe.contentDocument) {
      console.log('[V12] trying iframe DOM path');
      const doc = iframe.contentDocument;
      const inputs = doc.querySelectorAll<HTMLElement>('textarea, input[type="text"], [contenteditable="true"], [role="textbox"]');
      console.log('[V12] iframe inputs found:', inputs.length);
      if (inputs.length > 0) {
        const el = inputs[inputs.length - 1] as HTMLTextAreaElement;
        const proto = el.tagName === 'TEXTAREA'
          ? iframe.contentWindow!.HTMLTextAreaElement.prototype
          : iframe.contentWindow!.HTMLInputElement.prototype;
        const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
        setter?.call(el, message);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        requestAnimationFrame(() => {
          el.focus();
          ['keydown', 'keypress', 'keyup'].forEach(t => {
            el.dispatchEvent(new (iframe.contentWindow as any).KeyboardEvent(t, { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
          });
          const form = el.closest('form');
          if (form) (form as any).requestSubmit?.();
          const btns = Array.from(doc.querySelectorAll<HTMLButtonElement>('button'));
          const sendBtn = btns.find((b) => /send/i.test(b.getAttribute('aria-label') || b.textContent || ''));
          sendBtn?.click();
        });
        console.log('[V12] iframe input driven');
        return;
      }
    }
    alert('Still could not send automatically. Please copy this and paste into the chat:\n\n' + message);
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
function tryHook<T>(hook: () => T): T | null {
  try { return hook(); } catch (e) { console.warn('hook call failed', e); return null; }
}
