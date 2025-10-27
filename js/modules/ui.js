import { api } from './api.js';
import { storage } from './storage.js';
import { updateBreadcrumbs, getInitials, debounce } from './utils.js';
import { initModalHandlers, showTodoModal, saveUser, saveTodo, deleteUser } from '../components/handlers.js';

export let users = [];
export let customUsers = storage.getCustomUsers();
export let customTodos = storage.getCustomTodos();

const contentArea = document.getElementById('content-area');
const searchInput = document.getElementById('search-input');

export function initApp() {
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    initModalHandlers();
    
    window.showTodoModal = showTodoModal;
    window.deleteUser = deleteUser;
}

export function handleHashChange() {
    const hash = window.location.hash;

    if (hash === '#users' || hash === '') {
        loadUsers();
    } else if (hash.startsWith('#todos-')) {
        const userId = parseInt(hash.split('-')[1]);
        loadTodos(userId);
    } else if (hash.startsWith('#posts-')) {
        const userId = parseInt(hash.split('-')[1]);
        loadPosts(userId);
    } else if (hash.startsWith('#comments-')) {
        const postId = parseInt(hash.split('-')[1]);
        loadComments(postId);
    }
}

export function handleSearch() {
    const query = searchInput.value.toLowerCase();
    switch (true) {
        case window.location.hash.startsWith('#todos-'):
            const userId = parseInt(window.location.hash.split('-')[1]);
            loadTodos(userId, query);
            break;
        case window.location.hash.startsWith('#posts-'):
            const postUserId = parseInt(window.location.hash.split('-')[1]);
            loadPosts(postUserId, query);
            break;
        default:
            loadUsers(query);
    }
}

export async function loadUsers(query = '') {
    contentArea.innerHTML = '<div class="loading">Загрузка...</div>';

    users = await api.fetchUsers();
    const allUsers = [...users, ...customUsers];
    const filteredUsers = query
        ? allUsers.filter(
              user =>
                  user.name.toLowerCase().includes(query) ||
                  user.email.toLowerCase().includes(query)
          )
        : allUsers;

    displayUsers(filteredUsers);
    updateBreadcrumbs('Пользователи');
}

export function displayUsers(usersToDisplay) {
    if (usersToDisplay.length === 0) {
        contentArea.innerHTML = `
            <div class="card empty-state">
                <h3>Пользователи не найдены</h3>
                <p>Попробуйте изменить параметры поиска</p>
            </div>
        `;
        return;
    }

    let html = '<div class="user-list">';
    usersToDisplay.forEach(user => {
        const isCustom = customUsers.some(cu => cu.id === user.id);
        const initials = getInitials(user.name);

        html += `
            <div class="card user-item">
                <div class="user-header">
                    <div class="user-avatar">${initials}</div>
                    <div>
                        <h3>${user.name}</h3>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Телефон:</strong> ${user.phone || 'Не указан'}</p>
                    </div>
                </div>
                <div class="actions">
                    <a href="#todos-${user.id}" class="btn">📋 Задачи</a>
                    <a href="#posts-${user.id}" class="btn">📝 Посты</a>
                    ${
                        isCustom
                            ? `<button class="btn btn-danger" onclick="window.deleteUser(${user.id})">🗑️ Удалить</button>`
                            : ''
                    }
                </div>
            </div>
        `;
    });
    contentArea.innerHTML = html + '</div>';
}

export async function loadTodos(userId, query = '') {
    contentArea.innerHTML = '<div class="loading">Загрузка задач...</div>';

    let userTodos = [];
    try {
        const apiTodos = await api.fetchTodos();
        userTodos = apiTodos.filter(todo => todo.userId === userId);
    } catch (error) {
        console.error('Ошибка загрузки задач:', error);
    }

    const customUserTodos = customTodos.filter(
        todo => todo.userId === userId
    );
    userTodos = [...userTodos, ...customUserTodos];

    if (query) {
        userTodos = userTodos.filter(todo =>
            todo.title.toLowerCase().includes(query)
        );
    }

    displayTodos(userTodos, userId);

    const user = [...users, ...customUsers].find(u => u.id === userId);
    updateBreadcrumbs(`Задачи ${user?.name || ''}`);
}

export function displayTodos(todosToDisplay, userId) {
    if (todosToDisplay.length === 0) {
        contentArea.innerHTML = `
            <div class="card empty-state">
                <h3>Задачи не найдены</h3>
                <p>У этого пользователя пока нет задач</p>
                <div class="actions" style="justify-content: center; margin-top: 1.5rem;">
                    <button class="btn btn-success" onclick="window.showTodoModal(${userId})">+ Добавить задачу</button>
                </div>
            </div>
        `;
        return;
    }

    let html = `
        <div class="card" style="text-align: center;">
            <button class="btn btn-success" onclick="window.showTodoModal(${userId})">+ Добавить задачу</button>
        </div>
        <div class="todo-list">
    `;

    todosToDisplay.forEach(todo => {
        const statusClass = todo.completed ? 'completed' : 'pending';
        const statusText = todo.completed ? 'Выполнено' : 'В процессе';
        const statusBadge = todo.completed
            ? 'status-completed'
            : 'status-pending';

        html += `
            <div class="card todo-item ${statusClass}">
                <p><strong>${todo.title}</strong></p>
                <p><span class="status-badge ${statusBadge}">${statusText}</span></p>
            </div>
        `;
    });
    contentArea.innerHTML = html + '</div>';
}

export async function loadPosts(userId, query = '') {
    contentArea.innerHTML = '<div class="loading">Загрузка постов...</div>';

    try {
        const posts = await api.fetchPosts();
        let userPosts = posts.filter(post => post.userId === userId);

        if (query) {
            userPosts = userPosts.filter(
                post =>
                    post.title.toLowerCase().includes(query) ||
                    post.body.toLowerCase().includes(query)
            );
        }

        displayPosts(userPosts, userId);

        const user = [...users, ...customUsers].find(u => u.id === userId);
        updateBreadcrumbs(`Посты ${user?.name || ''}`);
    } catch (error) {
        console.error('Ошибка загрузки постов:', error);
        contentArea.innerHTML = `
            <div class="card empty-state">
                <h3>Ошибка загрузки постов</h3>
                <p>Попробуйте обновить страницу</p>
            </div>
        `;
    }
}

export function displayPosts(postsToDisplay, userId) {
    if (postsToDisplay.length === 0) {
        contentArea.innerHTML = `
            <div class="card empty-state">
                <h3>Посты не найдены</h3>
                <p>У этого пользователя пока нет постов</p>
            </div>
        `;
        return;
    }

    let html = '<div class="post-list">';
    postsToDisplay.forEach(post => {
        html += `
            <div class="card post-item">
                <h3>${post.title}</h3>
                <p>${post.body}</p>
                <div class="actions">
                    <a href="#comments-${post.id}" class="btn">💬 Комментарии</a>
                </div>
            </div>
        `;
    });
    contentArea.innerHTML = html + '</div>';
}

export async function loadComments(postId) {
    contentArea.innerHTML = '<div class="loading">Загрузка комментариев...</div>';

    try {
        const comments = await api.fetchComments();
        const postComments = comments.filter(
            comment => comment.postId === postId
        );

        displayComments(postComments);
        updateBreadcrumbs('Комментарии');
    } catch (error) {
        console.error('Ошибка загрузки комментариев:', error);
        contentArea.innerHTML = `
            <div class="card empty-state">
                <h3>Ошибка загрузки комментариев</h3>
                <p>Попробуйте обновить страницу</p>
            </div>
        `;
    }
}

export function displayComments(commentsToDisplay) {
    if (commentsToDisplay.length === 0) {
        contentArea.innerHTML = `
            <div class="card empty-state">
                <h3>Комментарии не найдены</h3>
                <p>К этому посту пока нет комментариев</p>
            </div>
        `;
        return;
    }

    let html = '<div class="comment-list">';
    commentsToDisplay.forEach(comment => {
        const initials = getInitials(comment.name);

        html += `
            <div class="card comment-item">
                <div class="user-header">
                    <div class="user-avatar" style="width: 40px; height: 40px; font-size: 1rem;">${initials}</div>
                    <div>
                        <h3>${comment.name}</h3>
                        <p><strong>Email:</strong> ${comment.email}</p>
                    </div>
                </div>
                <p>${comment.body}</p>
            </div>
        `;
    });
    contentArea.innerHTML = html + '</div>';
}

export function updateCustomUsers(newUsers) {
    customUsers = newUsers;
}

export function updateCustomTodos(newTodos) {
    customTodos = newTodos;
}

export function getAllUsers() {
    return [...users, ...customUsers];
}