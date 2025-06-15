document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const usernameInput = document.getElementById('usernameInput');
    const userHeader = document.getElementById('userHeader');
    const editNameBtn = document.getElementById('editNameBtn');
    const taskInput = document.getElementById('taskInput');
    const dueDateInput = document.getElementById('dueDateInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');

    // --- State ---
    let username = localStorage.getItem('username') || '';
    let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

    // --- Username Logic ---
    function showUsername() {
        if (username) {
            userHeader.textContent = `${username}'s Tasks`;
            userHeader.style.display = '';
            editNameBtn.style.display = '';
            usernameInput.style.display = 'none';
        } else {
            userHeader.style.display = 'none';
            editNameBtn.style.display = 'none';
            usernameInput.style.display = '';
            usernameInput.focus();
        }
    }

    function saveUsername(name) {
        username = name.trim();
        localStorage.setItem('username', username);
        showUsername();
    }

    usernameInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && usernameInput.value.trim()) {
            saveUsername(usernameInput.value);
        }
    });

    editNameBtn.addEventListener('click', () => {
        usernameInput.value = username;
        usernameInput.style.display = '';
        userHeader.style.display = 'none';
        editNameBtn.style.display = 'none';
        usernameInput.focus();
    });

    showUsername();

    // --- Task Logic ---
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // When adding a new task:
    function addTask() {
        const text = taskInput.value.trim();
        if (!text) return;
        // Date is optional
        const dueDate = dueDateInput.value ? dueDateInput.value : '';
        tasks.push({
            id: Date.now(),
            text,
            dueDate,
            completed: false,
            subtasks: []
        });
        saveTasks();
        taskInput.value = '';
        dueDateInput.value = '';
        renderTasks();
    }

    // At the start of renderTasks():
    function renderTasks() {
        // Patch for old tasks missing subtasks
        tasks.forEach(task => {
            if (!Array.isArray(task.subtasks)) task.subtasks = [];
        });

        taskList.innerHTML = '';

        // Separate incomplete and completed tasks
        const incompleteTasks = tasks.filter(task => !task.completed);
        const completedTasks = tasks.filter(task => task.completed);

        function renderTask(task, idx) {
            const li = document.createElement('li');
            li.className = task.completed ? 'completed-task' : 'task';

            // Header row: checkbox, title, date, actions
            const header = document.createElement('div');
            header.className = 'task-header';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'round-checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => {
                if (task.subtasks.length > 0 && !task.subtasks.every(st => st.completed)) {
                    checkbox.checked = false;
                    alert('Complete all subtasks first!');
                    return;
                }
                task.completed = checkbox.checked;
                saveTasks();
                renderTasks();
            });

            const content = document.createElement('div');
            content.className = 'task-content';

            const title = document.createElement('span');
            title.className = 'task-title';
            title.textContent = task.text;
            content.appendChild(title);

            if (task.dueDate) {
                const date = document.createElement('span');
                date.className = 'task-date';
                date.textContent = `Due: ${task.dueDate}`;
                content.appendChild(date);
            }

            // Progress bar for subtasks
            if (task.subtasks.length > 0) {
                const completedCount = task.subtasks.filter(st => st.completed).length;
                const totalCount = task.subtasks.length;
                const progressLabel = document.createElement('div');
                progressLabel.className = 'progress-label';
                progressLabel.textContent = `Progress: ${completedCount}/${totalCount} subtasks`;

                const progressBarContainer = document.createElement('div');
                progressBarContainer.className = 'progress-bar-container';
                const progressBar = document.createElement('div');
                progressBar.className = 'progress-bar';
                progressBar.style.width = `${(completedCount / totalCount) * 100}%`;
                progressBarContainer.appendChild(progressBar);

                content.appendChild(progressLabel);
                content.appendChild(progressBarContainer);
            }

            header.appendChild(checkbox);
            header.appendChild(content);

            // Actions
            const actions = document.createElement('div');
            actions.className = 'task-actions';

            const editBtn = document.createElement('button');
            editBtn.title = "Edit task";
            editBtn.innerHTML = '✏️';
            editBtn.addEventListener('click', () => {
                const newText = prompt('Edit task:', task.text);
                if (newText && newText.trim()) {
                    task.text = newText.trim();
                    saveTasks();
                    renderTasks();
                }
            });

            const delBtn = document.createElement('button');
            delBtn.title = "Delete task";
            delBtn.innerHTML = '🗑️';
            delBtn.addEventListener('click', () => {
                // Animation before removal
                li.classList.add('removing');
                setTimeout(() => {
                    tasks.splice(idx, 1);
                    saveTasks();
                    renderTasks();
                }, 280);
            });

            actions.appendChild(editBtn);
            actions.appendChild(delBtn);

            header.appendChild(actions);
            li.appendChild(header);

            // Subtasks section
            const subtasksDiv = document.createElement('div');
            subtasksDiv.className = 'subtasks';

            // Subtask list
            const subtaskList = document.createElement('ul');
            subtaskList.className = 'subtask-list';

            task.subtasks.forEach((sub, sidx) => {
                const subLi = document.createElement('li');
                subLi.className = 'subtask';

                const subCheck = document.createElement('input');
                subCheck.type = 'checkbox';
                subCheck.className = 'round-checkbox';
                subCheck.checked = sub.completed;
                subCheck.addEventListener('change', () => {
                    sub.completed = subCheck.checked;
                    if (task.subtasks.every(st => st.completed)) {
                        // Optionally, auto-complete main task:
                        // task.completed = true;
                    } else {
                        task.completed = false;
                    }
                    saveTasks();
                    renderTasks();
                });

                const subTitle = document.createElement('span');
                subTitle.className = 'task-title';
                subTitle.textContent = sub.text;
                if (sub.completed) subTitle.style.textDecoration = 'line-through';

                // Subtask actions
                const subActions = document.createElement('div');
                subActions.className = 'subtask-actions';

                const editSubBtn = document.createElement('button');
                editSubBtn.title = "Edit subtask";
                editSubBtn.innerHTML = '✏️';
                editSubBtn.addEventListener('click', () => {
                    const newText = prompt('Edit subtask:', sub.text);
                    if (newText && newText.trim()) {
                        sub.text = newText.trim();
                        saveTasks();
                        renderTasks();
                    }
                });

                const delSubBtn = document.createElement('button');
                delSubBtn.title = "Delete subtask";
                delSubBtn.innerHTML = '🗑️';
                delSubBtn.addEventListener('click', () => {
                    // Animation before removal
                    subLi.classList.add('removing');
                    setTimeout(() => {
                        task.subtasks.splice(sidx, 1);
                        saveTasks();
                        renderTasks();
                    }, 280);
                });

                subActions.appendChild(editSubBtn);
                subActions.appendChild(delSubBtn);

                subLi.appendChild(subCheck);
                subLi.appendChild(subTitle);
                subLi.appendChild(subActions);

                subtaskList.appendChild(subLi);
            });

            subtasksDiv.appendChild(subtaskList);

            // Inline add subtask row
            const addSubtaskRow = document.createElement('div');
            addSubtaskRow.className = 'add-subtask-row';

            const addSubtaskInput = document.createElement('input');
            addSubtaskInput.type = 'text';
            addSubtaskInput.placeholder = 'Add a subtask...';

            const addSubtaskBtn = document.createElement('button');
            addSubtaskBtn.innerHTML = '＋';

            function addSubtask() {
                const subText = addSubtaskInput.value.trim();
                if (subText) {
                    task.subtasks.push({ text: subText, completed: false });
                    saveTasks();
                    renderTasks();
                }
                addSubtaskInput.value = '';
            }

            addSubtaskBtn.addEventListener('click', addSubtask);
            addSubtaskInput.addEventListener('keydown', e => {
                if (e.key === 'Enter') addSubtask();
            });

            addSubtaskRow.appendChild(addSubtaskInput);
            addSubtaskRow.appendChild(addSubtaskBtn);

            subtasksDiv.appendChild(addSubtaskRow);

            li.appendChild(subtasksDiv);

            taskList.appendChild(li);
        }

        incompleteTasks.forEach((task, idx) => renderTask(task, tasks.indexOf(task)));
        completedTasks.forEach((task, idx) => renderTask(task, tasks.indexOf(task)));
    }

    addTaskBtn.addEventListener('click', addTask);


    renderTasks();
});