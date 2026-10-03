import UIComponent from './UIComponent.js';

export default class QuoteWidget extends UIComponent {
  constructor(config) {
    super({ ...config, title: 'Точка фокуса', eyebrow: 'Пауза', accent: 'violet' });
    this.currentIndex = 0;
    this.quoteElement = null;
    this.authorElement = null;
    this.quotes = [
      { text: 'Большие результаты начинаются с маленького действия.', author: 'Принцип прогресса' },
      { text: 'Фокус — это вежливое «нет» всему неважному.', author: 'Рабочая заметка' },
      { text: 'Сделанное сегодня освобождает завтрашнее внимание.', author: 'Focus Deck' },
      { text: 'Хорошая система поддерживает вас даже без мотивации.', author: 'Принцип среды' },
      { text: 'Ясность приходит в движении, а не в ожидании.', author: 'Практика действия' },
    ];
  }

  render() {
    const element = super.render();
    element.classList.add('widget--quote');
    const body = this.getBody();

    const quoteMark = document.createElement('span');
    quoteMark.className = 'quote-mark';
    quoteMark.setAttribute('aria-hidden', 'true');
    quoteMark.textContent = '“';

    const blockquote = document.createElement('blockquote');
    this.quoteElement = document.createElement('p');
    this.authorElement = document.createElement('cite');
    blockquote.append(this.quoteElement, this.authorElement);

    const refreshButton = document.createElement('button');
    refreshButton.className = 'text-button';
    refreshButton.type = 'button';
    refreshButton.textContent = 'Следующая мысль →';

    body.append(quoteMark, blockquote, refreshButton);
    this.listen(refreshButton, 'click', () => this.showNextQuote());
    this.showQuote();
    return element;
  }

  showQuote() {
    const quote = this.quotes[this.currentIndex];
    this.quoteElement.textContent = quote.text;
    this.authorElement.textContent = quote.author;
  }

  showNextQuote() {
    let nextIndex = this.currentIndex;
    while (nextIndex === this.currentIndex) {
      nextIndex = Math.floor(Math.random() * this.quotes.length);
    }
    this.currentIndex = nextIndex;
    this.showQuote();
  }
}
