import UIComponent from './UIComponent.js';

export default class ToDoWidget extends UIComponent {
  constructor(config) {
    super({ ...config, title: 'Сегодня', eyebrow: 'Задачи', accent: 'lime' });
    this.tasks = [];
    this.form = null;
    this.input = null;
    this.list = null;
    this.summary = null;
  }

  render() {
    const element = super.render();
    const body = this.getBody();

    this.form = document.createElement('form');
    this.form.className = 'todo-form';

    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.placeholder = 'Что важно сделать?';
    this.input.maxLength = 80;
    this.input.setAttribute('aria-label', 'Новая задача');

    const addButton = document.createElement('button');
    addButton.className = 'primary-button';
    addButton.type = 'submit';
    addButton.textContent = 'Добавить';

    this.form.append(this.input, addButton);
    this.list = document.createElement('ul');
    this.list.className = 'todo-list';
    this.list.setAttribute('aria-label', 'Список задач');

    this.summary = document.createElement('p');
    this.summary.className = 'todo-summary';

    body.append(this.form, this.list, this.summary);
    this.listen(this.form, 'submit', this.handleSubmit);
    this.listen(this.list, 'click', this.handleListClick);
    this.listen(this.list, 'change', this.handleListChange);
    this.renderTasks();
    return element;
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const text = this.input.value.trim();
    if (!text) return;

    this.tasks.push({ id: crypto.randomUUID(), text, completed: false });
    this.input.value = '';
    this.renderTasks();
    this.input.focus();
  };

  handleListClick = (event) => {
    const button = event.target.closest('[data-delete-task]');
    if (!button) return;
    this.removeTask(button.dataset.deleteTask);
  };

  handleListChange = (event) => {
    const checkbox = event.target.closest('[data-toggle-task]');
    if (!checkbox) return;

    const task = this.tasks.find(({ id }) => id === checkbox.dataset.toggleTask);
    if (!task) return;
    task.completed = checkbox.checked;
    this.renderTasks();
  };

  removeTask(taskId) {
    this.tasks = this.tasks.filter(({ id }) => id !== taskId);
    this.renderTasks();
  }

  renderTasks() {
    this.list.replaceChildren();

    if (this.tasks.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'todo-list__empty';
      empty.textContent = 'Свободный горизонт — добавьте первую задачу.';
      this.list.append(empty);
    }

    this.tasks.forEach((task) => {
      const item = document.createElement('li');
      item.className = 'todo-item';
      item.classList.toggle('todo-item--completed', task.completed);

      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.completed;
      checkbox.dataset.toggleTask = task.id;

      const text = document.createElement('span');
      text.textContent = task.text;
      label.append(checkbox, text);

      const removeButton = document.createElement('button');
      removeButton.className = 'delete-task';
      removeButton.type = 'button';
      removeButton.dataset.deleteTask = task.id;
      removeButton.setAttribute('aria-label', `Удалить задачу: ${task.text}`);
      removeButton.textContent = '×';

      item.append(label, removeButton);
      this.list.append(item);
    });

    const completed = this.tasks.filter((task) => task.completed).length;
    this.summary.textContent = `${completed} из ${this.tasks.length} выполнено`;
  }

}
