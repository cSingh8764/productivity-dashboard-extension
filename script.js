// --- Google Search ---

const search = document.getElementById('search');

search.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    const query = search.value.trim();
    if (query) {
      window.location.href = 'https://www.google.com/search?q=' + encodeURIComponent(query);
    }
  }
});

// --- Calendar ---

const events = [
  { title: "Team standup",        datetime: "2026-05-10T09:00:00" },
  { title: "Lunch with Sarah",    datetime: "2026-05-10T12:30:00" },
  { title: "Design review",       datetime: "2026-05-11T14:00:00" },
  { title: "Client call",         datetime: "2026-05-13T16:00:00" },
  { title: "Dentist appointment", datetime: "2026-05-15T10:30:00" },
];

function formatEventTime(date) {
  return date.toLocaleString(undefined, {
    weekday: "short",
    month:   "short",
    day:     "numeric",
    hour:    "numeric",
    minute:  "2-digit",
  });
}

function renderCalendar() {
  const now      = new Date();
  const year     = now.getFullYear();
  const month    = now.getMonth();
  const today    = now.getDate();

  // Month label pill
  document.getElementById('cal-month-label').textContent =
    now.toLocaleString(undefined, { month: 'long', year: 'numeric' });

  // Build day grid
  const grid     = document.getElementById('cal-grid');
  const firstDay = new Date(year, month, 1).getDay();       // 0 = Sun
  const lastDay  = new Date(year, month + 1, 0).getDate();  // total days

  grid.innerHTML = '';

  // Empty cells before the 1st
  for (let i = 0; i < firstDay; i++) {
    grid.appendChild(document.createElement('span'));
  }

  // Numbered day cells
  for (let d = 1; d <= lastDay; d++) {
    const cell = document.createElement('span');
    cell.className = 'cal-day' + (d === today ? ' today' : '');
    const inner = document.createElement('span');
    inner.textContent = d;
    cell.appendChild(inner);
    grid.appendChild(cell);
  }

  // Next 2 upcoming events
  const eventsEl = document.getElementById('cal-events');
  const upcoming = events
    .map(function (e) { return { title: e.title, date: new Date(e.datetime) }; })
    .filter(function (e) { return e.date > now; })
    .sort(function (a, b) { return a.date - b.date; })
    .slice(0, 2);

  eventsEl.innerHTML = '';

  if (!upcoming.length) {
    eventsEl.innerHTML = '<span class="cal-empty">No upcoming events</span>';
    return;
  }

  const dotColors = ['#8ab4f8', '#c084fc'];
  upcoming.forEach(function (event, i) {
    const row = document.createElement('div');
    row.className = 'cal-event';
    row.innerHTML =
      '<span class="cal-event-dot" style="background:' + dotColors[i] + '"></span>' +
      '<div class="cal-event-info">' +
        '<span class="cal-event-title">' + event.title + '</span>' +
        '<span class="cal-event-time">' + formatEventTime(event.date) + '</span>' +
      '</div>';
    eventsEl.appendChild(row);
  });
}

renderCalendar();

// --- Task List ---

const taskInput = document.getElementById('task-input');
const taskBtn = document.getElementById('task-btn');
const taskList = document.getElementById('task-list');

// Load saved tasks from localStorage, or start with an empty array.
// localStorage only stores strings, so we use JSON.parse to convert
// the saved string back into a JavaScript array.
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

function saveTasks() {
  // JSON.stringify converts the array to a string so localStorage can store it.
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach(function (task, index) {
    const li = document.createElement('li');
    li.className = 'task-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.done;
    checkbox.addEventListener('change', function () {
      li.classList.add('removing');
      li.addEventListener('animationend', function () {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
      }, { once: true });
    });

    const label = document.createElement('span');
    label.textContent = task.text;

    li.appendChild(checkbox);
    li.appendChild(label);
    taskList.appendChild(li);
  });
}

function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;
  tasks.push({ text: text, done: false });
  saveTasks();
  renderTasks();
  taskInput.value = '';
}

taskBtn.addEventListener('click', addTask);

taskInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') addTask();
});

// Render tasks on page load
renderTasks();
