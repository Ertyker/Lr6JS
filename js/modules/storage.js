export const storage = {
    getCustomUsers() {
        return JSON.parse(localStorage.getItem('customUsers')) || [];
    },

    setCustomUsers(users) {
        localStorage.setItem('customUsers', JSON.stringify(users));
    },

    getCustomTodos() {
        return JSON.parse(localStorage.getItem('customTodos')) || [];
    },

    setCustomTodos(todos) {
        localStorage.setItem('customTodos', JSON.stringify(todos));
    }
};