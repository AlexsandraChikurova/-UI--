import UIComponent from './UIComponent.js';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CNY', 'JPY', 'RUB'];

export default class CurrencyWidget extends UIComponent {
  constructor(config) {
    super({ ...config, title: 'Конвертер', eyebrow: 'Currency API', accent: 'orange' });
    this.form = null;
    this.amountInput = null;
    this.fromSelect = null;
    this.toSelect = null;
    this.content = null;
  }

  render() {
    const element = super.render();
    element.classList.add('widget--currency');
    const body = this.getBody();

    this.form = document.createElement('form');
    this.form.className = 'currency-form';
    this.amountInput = this.createAmountInput();
    this.fromSelect = this.createCurrencySelect('Исходная валюта', 'EUR');
    this.toSelect = this.createCurrencySelect('Целевая валюта', 'RUB');

    const swapButton = document.createElement('button');
    swapButton.className = 'swap-button';
    swapButton.type = 'button';
    swapButton.textContent = '⇄';
    swapButton.setAttribute('aria-label', 'Поменять валюты местами');

    const submitButton = document.createElement('button');
    submitButton.className = 'primary-button';
    submitButton.type = 'submit';
    submitButton.textContent = 'Рассчитать';

    const fields = document.createElement('div');
    fields.className = 'currency-fields';
    fields.append(this.amountInput, this.fromSelect, swapButton, this.toSelect);
    this.form.append(fields, submitButton);

    this.content = document.createElement('div');
    this.content.className = 'currency-result';
    body.append(this.form, this.content);

    this.listen(this.form, 'submit', this.handleSubmit);
    this.listen(swapButton, 'click', this.handleSwap);
    this.loadRate();
    return element;
  }

  createAmountInput() {
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0.01';
    input.step = '0.01';
    input.value = '100';
    input.setAttribute('aria-label', 'Сумма');
    return input;
  }

  createCurrencySelect(label, selected) {
    const select = document.createElement('select');
    select.setAttribute('aria-label', label);
    CURRENCIES.forEach((currency) => {
      const option = document.createElement('option');
      option.value = currency;
      option.textContent = currency;
      option.selected = currency === selected;
      select.append(option);
    });
    return select;
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this.loadRate();
  };

  handleSwap = () => {
    const previous = this.fromSelect.value;
    this.fromSelect.value = this.toSelect.value;
    this.toSelect.value = previous;
    this.loadRate();
  };

  async loadRate() {
    const amount = Number(this.amountInput.value);
    const from = this.fromSelect.value;
    const to = this.toSelect.value;
    const signal = this.resetAbortController();

    if (!Number.isFinite(amount) || amount <= 0) {
      this.showStatus('Введите сумму больше нуля.', 'empty');
      return;
    }

    if (from === to) {
      this.renderRate({ amount, from, to, converted: amount, date: 'без пересчёта' });
      return;
    }

    this.showStatus('Получаем свежий курс…');

    try {
      const url = `https://latest.currency-api.pages.dev/v1/currencies/${from.toLowerCase()}.json`;
      const response = await fetch(url, { signal });
      if (!response.ok) throw new Error('Сервис курсов недоступен');

      const data = await response.json();
      const rate = data[from.toLowerCase()]?.[to.toLowerCase()];
      if (typeof rate !== 'number') {
        this.showStatus('Для выбранной пары нет данных.', 'empty');
        return;
      }

      this.renderRate({ amount, from, to, converted: amount * rate, date: data.date });
    } catch (error) {
      if (error.name !== 'AbortError') {
        this.showStatus('Не удалось получить курс. Попробуйте позже.', 'error');
      }
    }
  }

  showStatus(message, type = 'loading') {
    this.content.replaceChildren(this.createStatus(message, type));
  }

  renderRate({ amount, from, to, converted, date }) {
    this.content.replaceChildren();
    const source = document.createElement('span');
    source.textContent = `${this.formatNumber(amount)} ${from}`;
    const equals = document.createElement('span');
    equals.className = 'currency-result__equals';
    equals.textContent = '=';
    const result = document.createElement('strong');
    result.textContent = `${this.formatNumber(converted)} ${to}`;
    const dateElement = document.createElement('small');
    dateElement.textContent = `Данные: ${date}`;
    this.content.append(source, equals, result, dateElement);
  }

  formatNumber(value) {
    return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(value);
  }
}
