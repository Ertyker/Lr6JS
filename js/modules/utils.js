export function updateBreadcrumbs(text) {
    const breadcrumbsList = document.getElementById('breadcrumbs-list');
    breadcrumbsList.innerHTML = `<a href="#users">Пользователи</a> ${
        text ? '› <span style="color: var(--dark);">' + text + '</span>' : ''
    }`;
}

export function getInitials(name) {
    return name.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}