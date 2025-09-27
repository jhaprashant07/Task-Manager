document.addEventListener('DOMContentLoaded', () => {
    const newTaskInput = document.getElementById('newTaskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList= document.getElementById ('taskList');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const totalTasksSpan = document.getElementById('totalTasks');
    const completedTasksSpan = document.getElementById('completedTasks');
    const filterAllBtn = document.getElementById('filterAll');
    const filterActiveBtn = document.getElementById('filterActive');
    const filterCompletedBtn = document.getElementById('filterCompleted');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all'; // 'all', 'active', 'completed'

    // Function to save tasks to local storage
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    // Function to render tasks
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

        if (filteredTasks.length === 0 && tasks.length > 0) {
            // If tasks exist but none match the filter, show a message
            const noTasksMessage = document.createElement('li');
            noTasksMessage.className = 'no-tasks-message';
            noTasksMessage.textContent = `No ${currentFilter} tasks to show.`;
            taskList.appendChild(noTasksMessage);
        } else if (tasks.length === 0) {
            // If no tasks at all
            const noTasksMessage = document.createElement('li');
            noTasksMessage.className = 'no-tasks-message';
            noTasksMessage.textContent = "No tasks yet! Add one above.";
            taskList.appendChild(noTasksMessage);
        }

        filteredTasks.forEach(task => {
            const listItem = document.createElement('li');
            listItem.className = task.completed ? 'completed' : '';
            listItem.dataset.id = task.id; // Store ID for easy reference

            listItem.innerHTML = `
                <input type="checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${task.text}</span>
                <div class="task-actions">
                    <button class="edit-btn">✏️</button>
                    <button class="delete-btn">🗑️</button>
                </div>
            `;
            taskList.appendChild(listItem);
        });

        updateProgress();
    };

    // Function to add a new task
    const addTask = () => {
        const taskText = newTaskInput.value.trim();
        if (taskText !== '') {
            const newTask = {
                id: Date.now(), // Unique ID
                text: taskText,
                completed: false
            };
            tasks.push(newTask);
            saveTasks();
            newTaskInput.value = ''; // Clear input
            renderTasks();
        }
    };

    // Function to toggle task completion
    const toggleTaskCompletion = (id) => {
        tasks = tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        saveTasks();
        renderTasks();
    };

    // Function to edit a task
    const editTask = (id, oldText) => {
        const newText = prompt('Edit task:', oldText);
        if (newText !== null && newText.trim() !== 'Edit your task') {
            tasks = tasks.map(task =>
                task.id === id ? { ...task, text: newText.trim() } : task
            );
            saveTasks();
            renderTasks();
        }
    };

    // Function to delete a task
    const deleteTask = (id) => {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    };

    // Function to update progress bar and counts
    const updateProgress = () => {
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `${percentage}%`;
        totalTasksSpan.textContent = total;
        completedTasksSpan.textContent = completed;
    };

    // Event Listeners
    addTaskBtn.addEventListener('click', addTask);
    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    taskList.addEventListener('click', (e) => {
        const listItem = e.target.closest('li');
        if (!listItem) return; // Clicked outside a task item

        const taskId = parseInt(listItem.dataset.id);

        if (e.target.type === 'checkbox') {
            toggleTaskCompletion(taskId);
        } else if (e.target.classList.contains('edit-btn')) {
            const taskTextElement = listItem.querySelector('.task-text');
            editTask(taskId, taskTextElement.textContent);
        } else if (e.target.classList.contains('delete-btn')) {
            deleteTask(taskId);
        }
    });

    // Filter button event listeners
    [filterAllBtn, filterActiveBtn, filterCompletedBtn].forEach(button => {
        button.addEventListener('click', (e) => {
            // Remove active class from all filters
            filterAllBtn.classList.remove('active');
            filterActiveBtn.classList.remove('active');
            filterCompletedBtn.classList.remove('active');

            // Add active class to the clicked button
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
});// Function to delete a task (MODIFIED)
const deleteTask = (id) => {
    const listItem = taskList.querySelector(`[data-id="${id}"]`);
    
    // 1. Add the deleting class to start the animation
    listItem.classList.add('deleting');

    // 2. Wait for the animation to finish (400ms defined in CSS)
    setTimeout(() => {
        // 3. Perform the actual removal from the array and DOM update
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks(); // Rerender to ensure clean list and progress update
    }, 400); // Must match the animation duration
};