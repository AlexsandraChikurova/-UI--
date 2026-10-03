import Dashboard from './js/Dashboard.js';

const dashboardElement = document.querySelector('#dashboard-grid');
const emptyStateElement = document.querySelector('#empty-state');
const widgetCountElement = document.querySelector('#widget-count');
const announcerElement = document.querySelector('#announcer');
const pickerElement = document.querySelector('.widget-picker');
const currentDateElement = document.querySelector('#current-date');

const dashboard = new Dashboard({
  container: dashboardElement,
  emptyState: emptyStateElement,
  counter: widgetCountElement,
  announcer: announcerElement,
});

const formatCurrentDate = () => {
  const formatter = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  });

  currentDateElement.textContent = formatter.format(new Date());
};

const handleAddWidget = (event) => {
  const button = event.target.closest('[data-widget-type]');
  if (!button) return;

  dashboard.addWidget(button.dataset.widgetType);
};

pickerElement.addEventListener('click', handleAddWidget);
formatCurrentDate();

['todo', 'weather', 'currency', 'pug', 'quote'].forEach((type) => {
  dashboard.addWidget(type, { announce: false });
});

window.addEventListener(
  'beforeunload',
  () => {
    pickerElement.removeEventListener('click', handleAddWidget);
    dashboard.destroy();
  },
  { once: true },
);
