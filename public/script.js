document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const newTaskInput = document.getElementById('newTaskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const totalTasksSpan = document.getElementById('totalTasks');
    const completedTasksSpan = document.getElementById('completedTasks');
    const filterAllBtn = document.getElementById('filterAll');
    const filterActiveBtn = document.getElementById('filterActive');
    const filterCompletedBtn = document.getElementById('filterCompleted');

    // --- State Management ---
    // Load tasks from Local Storage, or initialize an empty array
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all'; // 'all', 'active', 'completed'

    // --- Core Functions ---

    // Function to save tasks to local storage
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    // Update progress bar and counts
    const updateProgress = () => {
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        // Calculate percentage
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `${percentage}%`;
        totalTasksSpan.textContent = total;
        completedTasksSpan.textContent = completed;
    };

    // Render tasks based on the current filter
    const renderTasks = () => {
        taskList.innerHTML = ''; // Clear current tasks

        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'active') {
                return !task.completed;
            }
            if (currentFilter === 'completed') {
                return task.completed;
            }
            return true; // 'all' filter
        });

        // Handle empty state message
        if (tasks.length === 0 || filteredTasks.length === 0 && tasks.length > 0) {
            const noTasksMessage = document.createElement('li');
            noTasksMessage.className = 'no-tasks-message';
            
            if (tasks.length === 0) {
                noTasksMessage.textContent = "🥳 Your list is empty! Add a new task above.";
            } else {
                 noTasksMessage.textContent = `Nothing to see here! No ${currentFilter} tasks.`;
            }
            taskList.appendChild(noTasksMessage);
        }
        
        filteredTasks.forEach(task => {
            const listItem = document.createElement('li');
            listItem.className = task.completed ? 'completed' : '';
            // Use task.id (timestamp-based)
            listItem.dataset.id = task.id; 

            listItem.innerHTML = `
                <input type="checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${task.text}</span>
                <div class="task-actions">
                    <button class="edit-btn" title="Edit Task">✏️</button>
                    <button class="delete-btn" title="Delete Task">🗑️</button>
                </div>
            `;
            taskList.appendChild(listItem);
        });

        updateProgress();
    };

    // Add a new task
    const addTask = () => {
        const taskText = newTaskInput.value.trim();
        if (taskText !== '') {
            const newTask = {
                id: Date.now(), // Unique ID (Timestamp)
                text: taskText,
                completed: false
            };
            tasks.push(newTask);
            saveTasks();
            newTaskInput.value = ''; // Clear input
            renderTasks();
        }
    };

    // Toggle task completion
    const toggleTaskCompletion = (id) => {
        tasks = tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        saveTasks();
        renderTasks();
    };

    // Edit a task
    const editTask = (id, oldText) => {
        const newText = prompt('Edit task:', oldText);
        if (newText !== null && newText.trim() !== '') {
            tasks = tasks.map(task =>
                task.id === id ? { ...task, text: newText.trim() } : task
            );
            saveTasks();
            renderTasks();
        }
    };

    // Delete a task (with cool animation)
    const deleteTask = (id) => {
        const listItem = taskList.querySelector(`[data-id="${id}"]`);
        
        // 1. Start the deletion animation
        listItem.classList.add('deleting');

        // 2. Wait for the animation to finish (400ms defined in CSS)
        setTimeout(() => {
            // 3. Perform the actual removal from array and re-render
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks();
        }, 400); 
    };

    // --- Event Listeners ---
    addTaskBtn.addEventListener('click', addTask);
    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Delegate event handling for complete, edit, and delete
    taskList.addEventListener('click', (e) => {
        const listItem = e.target.closest('li[data-id]');
        if (!listItem) return; 

        // Task ID is parsed as an integer since we use Date.now()
        const taskId = parseInt(listItem.dataset.id);
        const taskTextElement = listItem.querySelector('.task-text');

        if (e.target.type === 'checkbox') {
            toggleTaskCompletion(taskId);
        } else if (e.target.classList.contains('edit-btn')) {
            editTask(taskId, taskTextElement.textContent);
        } else if (e.target.classList.contains('delete-btn')) {
            deleteTask(taskId);
        }
    });

    // Filter button event listeners
    [filterAllBtn, filterActiveBtn, filterCompletedBtn].forEach(button => {
        button.addEventListener('click', (e) => {
            // Update active class state on buttons
            filterAllBtn.classList.remove('active');
            filterActiveBtn.classList.remove('active');
            filterCompletedBtn.classList.remove('active');
            e.target.classList.add('active');

            // Set current filter
            if (e.target === filterActiveBtn) {
                currentFilter = 'active';
            } else if (e.target === filterCompletedBtn) {
                currentFilter = 'completed';
            } else {
                currentFilter = 'all';
            }
            renderTasks();
        });
    });

    // Initial render when the page loads
    renderTasks();
});