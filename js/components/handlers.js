import { storage } from '../modules/storage.js';
import { loadUsers, loadTodos, customUsers, customTodos } from '../modules/ui.js';

const userModal = document.getElementById('user-modal');
const todoModal = document.getElementById('todo-modal');
const userForm = document.getElementById('user-form');
const todoForm = document.getElementById('todo-form');

export function initModalHandlers() {
    document.getElementById('add-user-btn').addEventListener('click', () => {
        userModal.style.display = 'flex';
    });
    
    document.getElementById('cancel-user-btn').addEventListener('click', () => {
        userModal.style.display = 'none';
    });
    
    document.getElementById('cancel-todo-btn').addEventListener('click', () => {
        todoModal.style.display = 'none';
    });
    
    userForm.addEventListener('submit', saveUser);
    todoForm.addEventListener('submit', saveTodo);
    
    window.addEventListener('click', e => {
        if (e.target === userModal) userModal.style.display = 'none';
        if (e.target === todoModal) todoModal.style.display = 'none';
    });
}

export function showTodoModal(userId) {
    window.currentUserId = userId;
    todoModal.style.display = 'flex';
}

export function saveUser(e) {
    e.preventDefault();
    const newUser = {
        id: Date.now(),
        name: document.getElementById('user-name').value,
        email: document.getElementById('user-email').value,
        phone: document.getElementById('user-phone').value,
    };

    customUsers.push(newUser);
    storage.setCustomUsers(customUsers);
    userModal.style.display = 'none';
    userForm.reset();
    loadUsers();
}

export function saveTodo(e) {
    e.preventDefault();
    const newTodo = {
        id: Date.now(),
        userId: window.currentUserId,
        title: document.getElementById('todo-title').value,
        completed: document.getElementById('todo-completed').checked,
    };

    customTodos.push(newTodo);
    storage.setCustomTodos(customTodos);
    todoModal.style.display = 'none';
    todoForm.reset();
    loadTodos(window.currentUserId);
}

export function deleteUser(userId) {
    if (confirm('Удалить пользователя?')) {
        const updatedUsers = customUsers.filter(user => user.id !== userId);
        storage.setCustomUsers(updatedUsers);
        customUsers.length = 0;
        customUsers.push(...updatedUsers);

        const updatedTodos = customTodos.filter(todo => todo.userId !== userId);
        storage.setCustomTodos(updatedTodos);
        customTodos.length = 0;
        customTodos.push(...updatedTodos);

        loadUsers();
    }
}

window.showTodoModal = showTodoModal;
window.deleteUser = deleteUser;