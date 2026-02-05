// Color button code (keep this)
document.getElementById('colorButton').addEventListener('click', function() {
    const colors = ['#006b39', '#1a1a2e', '#16213e', '#0f3460', '#533483'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    document.body.style.backgroundColor = randomColor;
});

// To-Do List code (new!)
document.getElementById('addButton').addEventListener('click', addTask);

// Also add task when you press Enter
document.getElementById('taskInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

function addTask() {
    const input = document.getElementById('taskInput');
    const taskText = input.value.trim();
    
    // Don't add empty tasks
    if (taskText === '') {
        return;
    }
    
    // Create the list item
    const li = document.createElement('li');
    
    // Create checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.addEventListener('change', function() {
        if (checkbox.checked) {
            taskSpan.style.textDecoration = 'line-through';
            taskSpan.style.opacity = '0.5';
        } else {
            taskSpan.style.textDecoration = 'none';
            taskSpan.style.opacity = '1';
        }
    });
    
    // Create span for task text
    const taskSpan = document.createElement('span');
    taskSpan.textContent = taskText;
    
    // Create delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'deleteBtn';
    deleteBtn.addEventListener('click', function() {
        li.remove();
    });
    
    // Add everything to the list item
    li.appendChild(checkbox);
    li.appendChild(taskSpan);
    li.appendChild(deleteBtn);
    
    // Add the list item to the list
    document.getElementById('taskList').appendChild(li);
    
    // Clear the input box
    input.value = '';
}