// Start observing the document body for changes
genericObserver.observe(document.body, {
    childList: true,
    subtree: true
});

async function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const timeoutId = setTimeout(() => {
            observer.disconnect();
            reject(`Timeout waiting for element: ${selector}`);
        }, timeout);

        const observer = new MutationObserver(() => {
            if (document.querySelector(selector)) {
                clearTimeout(timeoutId);
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

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
