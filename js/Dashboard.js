import CurrencyWidget from './CurrencyWidget.js';
import QuoteWidget from './QuoteWidget.js';
import PugWidget from './PugWidget.js';
import ToDoWidget from './ToDoWidget.js';
import WeatherWidget from './WeatherWidget.js';

const WIDGET_TYPES = new Map([
  ['todo', ToDoWidget],
  ['quote', QuoteWidget],
  ['weather', WeatherWidget],
  ['currency', CurrencyWidget],
  ['pug', PugWidget],
]);

export default class Dashboard {
  constructor({ container, emptyState, counter, announcer }) {
    this.container = container;
    this.emptyState = emptyState;
    this.counter = counter;
    this.announcer = announcer;
    this.widgets = [];
  }

  addWidget(widgetType, { announce = true } = {}) {
    const WidgetClass = WIDGET_TYPES.get(widgetType);
    if (!WidgetClass) throw new TypeError(`Неизвестный тип виджета: ${widgetType}`);

    const id = `${widgetType}-${crypto.randomUUID()}`;
    const widget = new WidgetClass({ id });
    widget.onRemove = (widgetId) => this.removeWidget(widgetId);
    widget.onMove = (widgetId, direction) => this.moveWidget(widgetId, direction);

    this.widgets.push(widget);
    this.container.append(widget.render());
    this.updateInterface();

    if (announce) {
      this.announce(`Добавлен виджет «${widget.title}»`);
      widget.element.focus({ preventScroll: true });
    }
    return widget;
  }

  removeWidget(widgetId) {
    const index = this.widgets.findIndex(({ id }) => id === widgetId);
    if (index === -1) return;

    const [widget] = this.widgets.splice(index, 1);
    const title = widget.title;
    widget.destroy();
    this.updateInterface();
    this.announce(`Удалён виджет «${title}»`);
  }

  moveWidget(widgetId, direction) {
    const currentIndex = this.widgets.findIndex(({ id }) => id === widgetId);
    const targetIndex = currentIndex + direction;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= this.widgets.length) {
      this.announce('Виджет уже находится у края панели');
      return;
    }

    [this.widgets[currentIndex], this.widgets[targetIndex]] = [
      this.widgets[targetIndex],
      this.widgets[currentIndex],
    ];
    this.renderOrder();
    this.announce(`Виджет перемещён на позицию ${targetIndex + 1}`);
    this.widgets[targetIndex].element.focus({ preventScroll: true });
  }

  renderOrder() {
    const fragment = document.createDocumentFragment();
    this.widgets.forEach((widget) => fragment.append(widget.element));
    this.container.append(fragment);
  }

  updateInterface() {
    const count = this.widgets.length;
    this.counter.textContent = String(count).padStart(2, '0');
    this.emptyState.hidden = count > 0;
    this.container.hidden = count === 0;
  }

  announce(message) {
    this.announcer.textContent = '';
    window.requestAnimationFrame(() => {
      this.announcer.textContent = message;
    });
  }

  destroy() {
    this.widgets.forEach((widget) => widget.destroy());
    this.widgets = [];
    this.updateInterface();
  }
}
