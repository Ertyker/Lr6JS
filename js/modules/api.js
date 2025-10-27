export const api = {
    async fetchUsers() {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/users');
            return await response.json();
        } catch (error) {
            console.error('Ошибка загрузки пользователей:', error);
            return [];
        }
    },

    async fetchTodos() {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/todos');
            return await response.json();
        } catch (error) {
            console.error('Ошибка загрузки задач:', error);
            return [];
        }
    },

    async fetchPosts() {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts');
            return await response.json();
        } catch (error) {
            console.error('Ошибка загрузки постов:', error);
            return [];
        }
    },

    async fetchComments() {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/comments');
            return await response.json();
        } catch (error) {
            console.error('Ошибка загрузки комментариев:', error);
            return [];
        }
    }
};