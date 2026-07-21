import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Widget } from '@opencx/widget-react';
import { TourAvailabilityCard } from './components/TourAvailabilityCard';
import { LoggerComponent } from './components/LoggerComponent';
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
          // Diagnostic: intercept the default bot message renderer so we can see the `component` value on every AI message
          { key: 'bot_message', component: LoggerComponent },
          // Real target — kept for when we learn the correct key
          { key: 'fare_harbor_action_check_availability', component: TourAvailabilityCard },
          { key: 'fareHarborActionCheckAvailability', component: TourAvailabilityCard },
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
