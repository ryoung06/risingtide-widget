import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Widget } from '@opencx/widget-react';
import { BotMessageRouter } from './components/BotMessageRouter';
const WIDGET_TOKEN = 'fce061543ff027fee380c05938e3128e';
function mount() {
  const container = document.createElement('div');
  container.id = 'risingtide-widget-root';
  document.body.appendChild(container);
  createRoot(container).render(
    <StrictMode>
      <Widget
        options={{ token: WIDGET_TOKEN }}
        components={[
          { key: 'bot_message', component: BotMessageRouter },
        ]}
      />
    </StrictMode>
  );
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
