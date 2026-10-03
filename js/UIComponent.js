export default class UIComponent {
  constructor({ id, title, eyebrow = 'Виджет', accent = 'lime' }) {
    if (new.target === UIComponent) {
      throw new TypeError('UIComponent — абстрактный класс');
    }

    this.id = id;
    this.title = title;
    this.eyebrow = eyebrow;
    this.accent = accent;
    this.element = null;
    this.isMinimized = false;
    this.abortController = new AbortController();
    this.listeners = [];
    this.onRemove = null;
    this.onMove = null;
  }

  render() {
    const article = document.createElement('article');
    article.className = `widget widget--${this.accent}`;
    article.dataset.widgetId = this.id;
    article.tabIndex = -1;

    const header = document.createElement('header');
    header.className = 'widget__header';

    const headingGroup = document.createElement('div');
    const eyebrow = document.createElement('p');
    eyebrow.className = 'widget__eyebrow';
    eyebrow.textContent = this.eyebrow;

    const title = document.createElement('h3');
    title.id = `${this.id}-title`;
    title.textContent = this.title;
    article.setAttribute('aria-labelledby', title.id);

    headingGroup.append(eyebrow, title);

    const actions = document.createElement('div');
    actions.className = 'widget__actions';
    actions.append(
      this.createActionButton('←', 'Переместить влево', () => this.onMove?.(this.id, -1)),
      this.createActionButton('→', 'Переместить вправо', () => this.onMove?.(this.id, 1)),
      this.createActionButton('−', 'Свернуть виджет', () => this.minimize()),
      this.createActionButton('×', 'Удалить виджет', () => this.onRemove?.(this.id)),
    );

    header.append(headingGroup, actions);

    const body = document.createElement('div');
    body.className = 'widget__body';
    body.dataset.widgetBody = '';

    article.append(header, body);
    this.element = article;
    return article;
  }

  createActionButton(symbol, label, handler) {
    const button = document.createElement('button');
    button.className = 'icon-button';
    button.type = 'button';
    button.textContent = symbol;
    button.setAttribute('aria-label', label);
    this.listen(button, 'click', handler);
    return button;
  }

  listen(target, eventName, handler, options) {
    target.addEventListener(eventName, handler, options);
    this.listeners.push({ target, eventName, handler, options });
  }

  getBody() {
    return this.element?.querySelector('[data-widget-body]') ?? null;
  }

  minimize() {
    if (!this.element) return;

    this.isMinimized = !this.isMinimized;
    this.element.classList.toggle('widget--minimized', this.isMinimized);
    const toggle = this.element.querySelector('[aria-label^="Свернуть"], [aria-label^="Развернуть"]');

    if (toggle) {
      toggle.textContent = this.isMinimized ? '+' : '−';
      toggle.setAttribute(
        'aria-label',
        this.isMinimized ? 'Развернуть виджет' : 'Свернуть виджет',
      );
      toggle.setAttribute('aria-expanded', String(!this.isMinimized));
    }
  }

  createStatus(message, type = 'loading') {
    const status = document.createElement('div');
    status.className = `widget-status widget-status--${type}`;
    status.setAttribute('role', type === 'error' ? 'alert' : 'status');
    status.textContent = message;
    return status;
  }

  resetAbortController() {
    this.abortController.abort();
    this.abortController = new AbortController();
    return this.abortController.signal;
  }

  destroy() {
    this.abortController.abort();
    this.listeners.forEach(({ target, eventName, handler, options }) => {
      target.removeEventListener(eventName, handler, options);
    });
    this.listeners = [];
    this.element?.remove();
    this.element = null;
  }
}
