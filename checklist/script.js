// Minimal refactor: cached DOM refs, storage key, event delegation.
// Behavior preserved (add / delete / complete / clear, color button, Enter to add).

const STORAGE_KEY = 'tasks';
const colorButton = document.getElementById('colorButton');
const addButton = document.getElementById('addButton');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const clearButton = document.getElementById('clearButton');

// Color button
colorButton.addEventListener('click', () => {
    const colors = ['#006b39', '#1a1a2e', '#16213e', '#0f3460', '#533483'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    document.body.style.backgroundColor = randomColor;
});

// Add task
addButton.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

// Load tasks on page load
window.addEventListener('load', loadTasks);

// Event delegation for checkbox and delete button
taskList.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    const id = Number(li.dataset.id);

    // Delete button
    if (e.target.classList.contains('deleteBtn')) {
        li.remove();
        deleteTask(id);
        return;
    }

    // Checkbox toggle
    if (e.target.matches('input[type="checkbox"]')) {
        const checked = e.target.checked;
        const span = li.querySelector('span');
        if (span) {
            span.style.textDecoration = checked ? 'line-through' : 'none';
            span.style.opacity = checked ? '0.5' : '1';
        }
        updateTaskStatus(id, checked);
    }
});

function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText === '') return;

    const task = {
        text: taskText,
        completed: false,
        id: Date.now()
    };

    saveTask(task);
    displayTask(task);
    taskInput.value = '';
}

function displayTask(task) {
    const li = document.createElement('li');
    li.dataset.id = task.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;

    const taskSpan = document.createElement('span');
    taskSpan.textContent = task.text;
    if (task.completed) {
        taskSpan.style.textDecoration = 'line-through';
        taskSpan.style.opacity = '0.5';
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'deleteBtn';

    li.appendChild(checkbox);
    li.appendChild(taskSpan);
    li.appendChild(deleteBtn);

    taskList.appendChild(li);
}

function saveTask(task) {
    const tasks = getTasks();
    tasks.push(task);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function getTasks() {
    const tasks = localStorage.getItem(STORAGE_KEY);
    return tasks ? JSON.parse(tasks) : [];
}

function loadTasks() {
    const tasks = getTasks();
    tasks.forEach(displayTask);
}

function updateTaskStatus(id, completed) {
    const tasks = getTasks().map(task => {
        if (task.id === id) task.completed = completed;
        return task;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function deleteTask(id) {
    const tasks = getTasks().filter(task => task.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Clear All
clearButton.addEventListener('click', () => {
    taskList.innerHTML = '';
    localStorage.removeItem(STORAGE_KEY);
});