function reorderNavItems() {
    const sidebarNav = document.querySelector('#sidebar-nav ul');
    if (!sidebarNav) return;

    const order = [
        'Settings',
        'Data',
        'Pages',
        'Flows',
        'Tasks',
        'Data Model'
    ];

    const items = Array.from(sidebarNav.querySelectorAll('li'));
    const sortedItems = [];

    order.forEach(name => {
        const item = items.find(li => li.textContent.trim() === name);
        if (item) {
            sortedItems.push(item);
        }
    });

    sortedItems.forEach(item => sidebarNav.appendChild(item));
}
