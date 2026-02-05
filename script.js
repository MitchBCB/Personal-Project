// Color button code (keep this)
document.getElementById('colorButton').addEventListener('click', function() {
    const colors = ['#006b39', '#1a1a2e', '#16213e', '#0f3460', '#533483'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    document.body.style.backgroundColor = randomColor;
});

// To-Do List code
document.getElementById('addButton').addEventListener('click', addTask);

document.getElementById('taskInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Load tasks when page loads
window.addEventListener('load', loadTasks);

function addTask() {
    const input = document.getElementById('taskInput');
    const taskText = input.value.trim();
    
    if (taskText === '') {
        return;
    }
    
    // Create task object
    const task = {
        text: taskText,
        completed: false,
        id: Date.now() // unique ID using timestamp
    };
    
    // Save to storage
    saveTask(task);
    
    // Display the task
    displayTask(task);
    
    // Clear input
    input.value = '';
}

function displayTask(task) {
    const li = document.createElement('li');
    li.dataset.id = task.id;
    
    // Create checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', function() {
        const taskSpan = li.querySelector('span');
        if (checkbox.checked) {
            taskSpan.style.textDecoration = 'line-through';
            taskSpan.style.opacity = '0.5';
        } else {
            taskSpan.style.textDecoration = 'none';
            taskSpan.style.opacity = '1';
        }
        updateTaskStatus(task.id, checkbox.checked);
    });
    
    // Create span for task text
    const taskSpan = document.createElement('span');
    taskSpan.textContent = task.text;
    if (task.completed) {
        taskSpan.style.textDecoration = 'line-through';
        taskSpan.style.opacity = '0.5';
    }
    
    // Create delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'deleteBtn';
    deleteBtn.addEventListener('click', function() {
        li.remove();
        deleteTask(task.id);
    });
    
    // Add everything to list item
    li.appendChild(checkbox);
    li.appendChild(taskSpan);
    li.appendChild(deleteBtn);
    
    // Add to page
    document.getElementById('taskList').appendChild(li);
}

function saveTask(task) {
    let tasks = getTasks();
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function getTasks() {
    const tasks = localStorage.getItem('tasks');
    return tasks ? JSON.parse(tasks) : [];
}

function loadTasks() {
    const tasks = getTasks();
    tasks.forEach(task => displayTask(task));
}

function updateTaskStatus(id, completed) {
    let tasks = getTasks();
    tasks = tasks.map(task => {
        if (task.id === id) {
            task.completed = completed;
        }
        return task;
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function deleteTask(id) {
    let tasks = getTasks();
    tasks = tasks.filter(task => task.id !== id);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Clear All button
document.getElementById('clearButton').addEventListener('click', function() {
    document.getElementById('taskList').innerHTML = '';
    localStorage.removeItem('tasks');
});