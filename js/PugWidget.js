import UIComponent from './UIComponent.js';

export default class PugWidget extends UIComponent {
  constructor(config) {
    super({ ...config, title: 'Мопс Борис', eyebrow: 'Антистресс', accent: 'pug' });
    this.currentIndex = 0;
    this.messageElement = null;
    this.moodElement = null;
    this.states = [
      {
        mood: 'Собраться',
        message: 'Борис напоминает: выбери одну задачу и сделай только первый шаг.',
      },
      {
        mood: 'Выдохнуть',
        message: 'Плечи вниз. Вдох на четыре счёта. Даже мопсам иногда нужна пауза.',
      },
      {
        mood: 'Отпраздновать',
        message: 'Маленькая победа тоже победа. Борис официально тобой доволен.',
      },
      {
        mood: 'Не усложнять',
        message: 'Если можно сделать проще — делай проще. У мопсов это философия.',
      },
    ];
  }

  render() {
    const element = super.render();
    element.classList.add('widget--pug-card');
    const body = this.getBody();

    const visual = document.createElement('div');
    visual.className = 'pug-visual';

    const glow = document.createElement('span');
    glow.className = 'pug-glow';
    glow.setAttribute('aria-hidden', 'true');

    const image = document.createElement('img');
    image.src = './assets/focus-pug.png';
    image.alt = 'Мопс Борис в ярко-зелёных круглых очках';
    image.width = 520;
    image.height = 520;
    image.loading = 'lazy';

    this.moodElement = document.createElement('span');
    this.moodElement.className = 'pug-mood';

    visual.append(glow, image, this.moodElement);

    const copy = document.createElement('div');
    copy.className = 'pug-copy';
    this.messageElement = document.createElement('p');

    const button = document.createElement('button');
    button.className = 'primary-button';
    button.type = 'button';
    button.textContent = 'Что скажет Борис?';

    copy.append(this.messageElement, button);
    body.append(visual, copy);
    this.listen(button, 'click', () => this.showNextState());
    this.showState();
    return element;
  }

  showState() {
    const state = this.states[this.currentIndex];
    this.moodElement.textContent = state.mood;
    this.messageElement.textContent = state.message;
  }

  showNextState() {
    this.currentIndex = (this.currentIndex + 1) % this.states.length;
    this.showState();
  }
}
