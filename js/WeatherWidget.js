import UIComponent from './UIComponent.js';

const WEATHER_CODES = new Map([
  [0, ['Ясно', '☀']],
  [1, ['Преимущественно ясно', '🌤']],
  [2, ['Переменная облачность', '⛅']],
  [3, ['Пасмурно', '☁']],
  [45, ['Туман', '≋']],
  [48, ['Изморозь', '≋']],
  [51, ['Лёгкая морось', '🌦']],
  [53, ['Морось', '🌦']],
  [55, ['Сильная морось', '🌧']],
  [61, ['Небольшой дождь', '🌦']],
  [63, ['Дождь', '🌧']],
  [65, ['Сильный дождь', '🌧']],
  [71, ['Небольшой снег', '🌨']],
  [73, ['Снег', '🌨']],
  [75, ['Сильный снег', '❄']],
  [80, ['Ливень', '🌦']],
  [81, ['Ливень', '🌧']],
  [82, ['Сильный ливень', '⛈']],
  [95, ['Гроза', '⛈']],
]);

export default class WeatherWidget extends UIComponent {
  constructor(config) {
    super({ ...config, title: 'Погода сейчас', eyebrow: 'Open-Meteo API', accent: 'blue' });
    this.form = null;
    this.input = null;
    this.content = null;
  }

  render() {
    const element = super.render();
    element.classList.add('widget--weather');
    const body = this.getBody();

    this.form = document.createElement('form');
    this.form.className = 'search-form';

    this.input = document.createElement('input');
    this.input.type = 'search';
    this.input.value = 'Москва';
    this.input.placeholder = 'Введите город';
    this.input.setAttribute('aria-label', 'Город для прогноза');

    const button = document.createElement('button');
    button.className = 'primary-button';
    button.type = 'submit';
    button.textContent = 'Найти';
    this.form.append(this.input, button);

    this.content = document.createElement('div');
    this.content.className = 'weather-content';

    body.append(this.form, this.content);
    this.listen(this.form, 'submit', this.handleSubmit);
    this.loadWeather(this.input.value);
    return element;
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this.loadWeather(this.input.value.trim());
  };

  async loadWeather(city) {
    const signal = this.resetAbortController();

    if (!city) {
      this.showStatus('Введите название города.', 'empty');
      return;
    }

    this.showStatus('Проверяем атмосферу…');

    try {
      const geoUrl = new URL('https://geocoding-api.open-meteo.com/v1/search');
      geoUrl.search = new URLSearchParams({ name: city, count: '1', language: 'ru', format: 'json' });
      const geoResponse = await fetch(geoUrl, { signal });
      if (!geoResponse.ok) throw new Error('Сервис поиска города недоступен');

      const geoData = await geoResponse.json();
      const place = geoData.results?.[0];
      if (!place) {
        this.showStatus('Город не найден. Проверьте написание.', 'empty');
        return;
      }

      const weatherUrl = new URL('https://api.open-meteo.com/v1/forecast');
      weatherUrl.search = new URLSearchParams({
        latitude: String(place.latitude),
        longitude: String(place.longitude),
        current: 'temperature_2m,apparent_temperature,weather_code,wind_speed_10m',
        timezone: 'auto',
      });
      const weatherResponse = await fetch(weatherUrl, { signal });
      if (!weatherResponse.ok) throw new Error('Сервис погоды недоступен');

      const data = await weatherResponse.json();
      if (!data.current) {
        this.showStatus('Нет актуальных данных для этого города.', 'empty');
        return;
      }
      this.renderWeather(place, data.current);
    } catch (error) {
      if (error.name !== 'AbortError') {
        this.showStatus('Не удалось загрузить погоду. Попробуйте ещё раз.', 'error');
      }
    }
  }

  showStatus(message, type = 'loading') {
    this.content.replaceChildren(this.createStatus(message, type));
  }

  renderWeather(place, current) {
    this.content.replaceChildren();
    const [description, icon] = WEATHER_CODES.get(current.weather_code) ?? ['Неизвестно', '◌'];

    const location = document.createElement('p');
    location.className = 'weather-location';
    location.textContent = [place.name, place.country].filter(Boolean).join(', ');

    const main = document.createElement('div');
    main.className = 'weather-main';
    const symbol = document.createElement('span');
    symbol.className = 'weather-symbol';
    symbol.setAttribute('aria-hidden', 'true');
    symbol.textContent = icon;
    const temperature = document.createElement('strong');
    temperature.textContent = `${Math.round(current.temperature_2m)}°`;
    main.append(symbol, temperature);

    const condition = document.createElement('p');
    condition.className = 'weather-condition';
    condition.textContent = description;

    const details = document.createElement('dl');
    details.className = 'weather-details';
    this.appendDetail(details, 'Ощущается', `${Math.round(current.apparent_temperature)}°`);
    this.appendDetail(details, 'Ветер', `${Math.round(current.wind_speed_10m)} км/ч`);

    this.content.append(location, main, condition, details);
  }

  appendDetail(list, termText, valueText) {
    const group = document.createElement('div');
    const term = document.createElement('dt');
    const value = document.createElement('dd');
    term.textContent = termText;
    value.textContent = valueText;
    group.append(term, value);
    list.append(group);
  }
}
