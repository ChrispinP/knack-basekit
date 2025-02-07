//Kneuron extension by Cortex R&D Inc.

function injectCSS(css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
}

const ERROR_COLOR = '#e7c8e2';

const css = `
[data-tippy-root]:not(:has(.kn-help-tip)) {
    display: none !important;
}

@keyframes highlightElement {
    0% { box-shadow: inset 0 0 0 2px #45003a; }
    50% { box-shadow: inset 0 0 10px 2px #45003a; }
    100% { box-shadow: inset 0 0 0 2px #45003a; }
}

.highlight-before-click {
    animation: highlightElement 0.3s ease-in-out;
}

#pages-toolbox form > div textarea {
   height: 300px;
}

#pages-toolbox form > div .redactor-editor {
   max-height: 30em;
   height: 30em;
}

#objects-nav .vue-recycle-scroller__item-view {
    transform: none !important;
    position: relative !important;
}

#records-history .kn-table-element {
    height: 78vh;
}

#records-history .kn-table-element thead th {
    position: sticky;
    top: 0;
    background: white;
    z-index: 1;
}

.idTextStyle {
    color: #9b9b9b !important;
    font-size: small;
    font-weight: 400 !important;
    white-space: pre;
    font-family: Inter,sans-serif;
}

.truncate-cell {
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-height: 20px;
    transition: all 0.5s ease;
}

/* Target both types of spans */
#kn-records-table .kn-table-cell.truncate-cell span[index],
div.kn-view .kn-table-cell.truncate-cell span {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-height: 20px;
}

.truncate-cell.open {
    overflow: visible;
    white-space: normal;
    background: white;
    z-index: 100;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    padding-bottom: 25px;
    max-height: 500px;
    opacity: 1;
}

/* Reset spans when cell is open */
#kn-records-table .kn-table-cell.truncate-cell.open span[index] {
    white-space: normal;
    overflow: visible;
    max-height: none;
}

.truncate-cell .view-more-btn {
    position: absolute;
    right: 5px;
    bottom: 0px;
    transform: none;
    color: blue;
    text-decoration: none;
    cursor: pointer;
    font-size: 12px;
    z-index: 101;
    background: inherit;
    padding: 5px 5px 0 5px;
}

.monaco-list:not(.equation-editor .monaco-list) .monaco-list-rows {
  background-color: #efeaed !important;
}
.monaco-list:not(.equation-editor .monaco-list) .monaco-list-row:hover:not(.selected):not(.focused) {
 background-color: #fff5fa !important;
}
.monaco-list:not(.equation-editor .monaco-list) .monaco-list-row.focused {
 background-color: #edd5e1 !important;
}
.quick-input-list .monaco-keybinding > .monaco-keybinding-key {
 color: black !important;
}
`;
injectCSS(css);

// Generic MutationObserver to watch for HTML changes and take action.
const genericObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
            if (mutation.target.querySelector('#sidebar-nav ul')) {
                reorderNavItems();
            }

            if (mutation.target.querySelector('.toggle-content:not(.auto-open-processed)')) {
                autoExpandHiddenTogglers();
            }

            if (mutation.target.querySelector('.kn-table-element:not(.reduce-processed)')) {
                reduceGrids();
            }

            if (mutation.target.querySelector('.kn-list-items:not(.reduce-processed)')) {
                reduceLists('.kn-list-items');
            }

            if (mutation.target.querySelector('.kn-search-list-wrapper:not(.reduce-processed)')) {
                reduceLists('.kn-search-list-wrapper');
            }

            if (mutation.target.querySelector('#objects-nav h3.text-emphasis')) {
                addTablesFilter();
            }

            if (mutation.target.querySelector('#view-add-items')) {
                addFieldsFilter();
            }

            if (mutation.target.querySelector('select[data-cy="movecopy-select"]:not(.filter-processed)')) {
                addMoveCopyViewFilter();
                mutation.target.querySelector('select[data-cy="movecopy-select"]').classList.add('filter-processed');
            }

            if (mutation.target.querySelector('h3[data-cy="page-filter-menu"]:not(.filter-processed)')) {
                addPagesFilter();
                mutation.target.querySelector('h3[data-cy="page-filter-menu"]').classList.add('filter-processed');
            }

            if (mutation.target.querySelector('.vue-recycle-scroller__item-view .nav-item:not(:has(.idTextStyle))')) {
                addIDsToElements('.vue-recycle-scroller__item-view .nav-item', 'id', '.label, .transition');
            }

            if (mutation.target.querySelector('.page-list-sortable .nav-item:not(:has(.idTextStyle))')) {
                addIDsToElements('.page-list-sortable .nav-item', 'data-key', '.name span');
            }

            if (mutation.target.querySelector('.view[data-view-key]:not(:has(.idTextStyle))')) {
                addIDsToElements('.view[data-view-key]', 'data-view-key', 'h2');
            }

            if (mutation.target.querySelector('.kn-table-element td:not(.truncate-cell)')) {
                truncateCellText();
            }
        }
    });
});

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
        'Data',
        'Pages',
        'Tasks',
        'Flows',
        'Settings',
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

function highlightAndClick(element) {
    if (!element) return;

    element.classList.add('highlight-before-click');
    element.focus();
    setTimeout(() => {
        element.classList.remove('highlight-before-click');
        element.click();
    }, 300);
}

document.addEventListener('keydown', async function (event) {
    const activeElement = document.activeElement;
    const knackSearch = document.querySelector('input[type="search"]');

    // First check if we're in an input field
    if (event.altKey &&
        event.code.startsWith('Digit') &&
        event.code.replace('Digit', '') >= 1 &&
        event.code.replace('Digit', '') <= 5) {
        if ((activeElement.tagName === 'INPUT' && !activeElement.id.startsWith('incremental-filter-') && activeElement !== knackSearch) ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.isContentEditable) {
            return; // Exit early, allowing default Alt+number behavior
        }
    }

    let element;
    let keyPressed = event.code;

    if (keyPressed === 'Enter') {
        if (document.querySelector('.multiselect--active')) //Allow Enter in a dropdown.
            return;

        element = document.querySelector('[data-cy=confirm]')
            || document.querySelector('.kn-popover .knButton[type=submit]')
            || document.querySelector('[data-cy=save-filters]')
            || document.querySelector('[data-cy=save]')
            || document.querySelector('[data-cy=save-view-add]')
            || document.querySelector('a.save')
            || document.querySelector('.kn-input[type=submit]');

        //If on a multi-line object...
        const isMultiLineInput = event.target.tagName === 'TEXTAREA' || !!event.target.closest('.redactor-editor');
        if (isMultiLineInput && !event.ctrlKey) {
            //Just enter: let it insert its line break
            return;
        } else if (isMultiLineInput && event.ctrlKey) {
            //Ctrl+Enter: Save if we're on a multiline object.
            //Exceptions:
            //  1- if in the Javascript or CSS editor(Use Alt + S in that case)
            //  2- if we're on a redactor-editor, where ctrl+enter can't be trapped.  So we need to click save with the mouse.
            if (element) {
                if (!!element.closest('#settings-js') || !!element.closest('#settings-css')) {
                    return; //Ignore Enter in the Javascript and CSS editors.  Use Alt-S to save, see below KeyS.
                }
            }
        }

        event.preventDefault();
    } else if (keyPressed === 'Escape') {
        element = document.querySelector('[data-cy=cancel]') || document.querySelector('.modal_close') || document.querySelector('a.cancel') || document.querySelector('.header_close');
    } else if (event.altKey) {
        if (keyPressed.includes('Digit')) {
            keyPressed = keyPressed.replace('Digit', '');
        }

        if (keyPressed >= 1 && keyPressed <= 6) {
            let pageIndex = Number(keyPressed);
            element = document.querySelector(`#sidebar-nav li:nth-child(${pageIndex}) a`);

            //This is to prevent the annoying message "You have unsaved changes" that keeps popping up for no reason.
            if (pageIndex === 4) {
                setTimeout(async () => {
                    try {
                        const cancelButton = await waitForElement('a.cancel');
                        cancelButton && cancelButton.click();
                    } catch (error) { }
                }, 0);
            }
        } else if (['KeyW', 'KeyE', 'KeyR'].includes(keyPressed)) {
            const tabLinks = document.querySelectorAll('.tabLink');
            let tabIndex = ['KeyW', 'KeyE', 'KeyR'].indexOf(keyPressed);
            if (tabLinks[tabIndex]) {
                event.preventDefault();
                element = tabLinks[tabIndex];
            }
        } else if (keyPressed === 'Backquote') {
            element = document.querySelector('.toolbox-back') || document.querySelector('.ast-button');
        } else if (['KeyQ', 'KeyA', 'KeyZ', 'KeyX'].includes(keyPressed)) {
            let toolIndex = ['KeyQ', 'KeyA', 'KeyZ', 'KeyX'].indexOf(keyPressed) + 1;
            element = document.querySelector(`[data-cy=toolbox-links] li:nth-child(${toolIndex}) a`);
            if (element) {
                highlightAndClick(element);
            } else {
                //Go back to view's settings.
                element = document.querySelector('.is-active a.settings');
                if (element) highlightAndClick(element);
                try {
                    const toolboxSelector = `[data-cy=toolbox-links] li:nth-child(${toolIndex}) a`;
                    await waitForElement(toolboxSelector);
                    element = document.querySelector(toolboxSelector);
                } catch (error) {
                    console.error('Error encountered in key processing:', error);
                    return;
                }
            }
        } else if (keyPressed === 'KeyS') {
            event.preventDefault(); //Prevent the added "ß" char on Mac.

            //Does three things, depending on context:
            // 1- Activate the Settings toolbox, when a view is selected
            // 2- Puts cursor on the Filter box when it is visible, or on Knack's Field Filter (toggling between both)
            // 3- Click on Save, when Javascript or CSS editor is active
            if (activeElement === document.querySelector('#incremental-filter-tables')) {
                element = knackSearch;
            } else {
                element = document.querySelector('[id^=incremental-filter-]')
                    || document.querySelector('.is-active a.settings')
                    || document.querySelector('a.save')
                    || document.querySelector('input[type="search"]');
            }
        } else if (keyPressed === 'KeyM') {
            toggleDividerMinMax();
        }
    }

    if (element) highlightAndClick(element);
});

//Auto-detect closed "togglers" and open them.  We have them in list views' settings.
async function autoExpandHiddenTogglers() {
    try {
        await waitForElement('.toggle-content:not(.auto-open-processed)');

        const hiddenToggles = Array.from(document.querySelectorAll('.toggle-content:not(.auto-open-processed)')).filter(el => {
            const style = window.getComputedStyle(el);
            return style.visibility === 'hidden' || style.maxHeight === '0px';
        });

        hiddenToggles.forEach(toggle => {
            const wrapper = toggle.closest('.toggle-wrapper');
            const trigger = wrapper.querySelector('.toggle-trigger');
            trigger.click();
            toggle.classList.add('auto-open-processed');
        });
    } catch (error) { }
}

async function reduceGrids() {
    try {
        await waitForElement('.kn-table-element:not(.reduce-processed)');

        document.querySelectorAll('#pages .kn-table-element:not(.reduce-processed)').forEach(table => {
            table.classList.add('reduce-processed');

            let groupCount = 0;
            let rowsPerGroupCount = 0;

            table.querySelectorAll('tbody tr').forEach(row => {
                if (row.classList.contains('kn-table-group')) {
                    groupCount++;
                    rowsPerGroupCount = 0;

                    if (groupCount === 2) {
                        row.style.opacity = '75%';
                    } else if (groupCount === 3) {
                        row.style.opacity = '50%';
                    } else if (groupCount >= 4) {
                        row.style.display = 'none';
                    }
                } else if (!row.classList.contains('kn-table-totals')) {
                    if (groupCount > 3) {
                        row.style.display = 'none';
                    } else {
                        rowsPerGroupCount++;

                        if (rowsPerGroupCount === 2) {
                            row.style.opacity = '50%';
                        } else if (rowsPerGroupCount === 3) {
                            row.style.opacity = '25%';
                        } else if (rowsPerGroupCount >= 4) {
                            row.style.display = 'none';
                        }
                    }
                }
            });
        });
    } catch (error) {
        console.error('Error in reduceGrids:', error);
    }
}

async function reduceLists(selector) {
    try {
        await waitForElement(`#pages ${selector}:not(.reduce-processed)`);

        document.querySelectorAll(`#pages ${selector}:not(.reduce-processed)`).forEach(list => {
            list.classList.add('reduce-processed');
            let listCount = 0;
            list.querySelectorAll('#pages .list-item-wrapper').forEach(listRecord => {
                listCount++;
                if (listCount === 1) {
                    listRecord.style.opacity = '50%';
                } else if (listCount === 2) {
                    listRecord.style.opacity = '25%';
                } else if (listCount >= 3) {
                    listRecord.style.display = 'none';
                }
            });
        });
    } catch (error) {
        console.error('Error in reduceLists:', error);
    }
}

function addTablesFilter() {
    const tablesTitle = document.querySelector('#objects-nav h3.text-emphasis');
    if (tablesTitle && !document.querySelector('#incremental-filter-tables')) {
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Filter tables...';
        searchInput.style.marginLeft = '30px';
        searchInput.style.padding = '2px 5px';
        searchInput.style.fontSize = '14px';
        searchInput.style.borderRadius = '4px';
        searchInput.style.border = '1px solid #ccc';
        searchInput.style.height = '35px';
        searchInput.style.width = '140px';
        searchInput.id = 'incremental-filter-tables';

        let currentFocusIndex = 0;
        let currentSelectionIndex = -1;
        let searchEmpty = true;
        let tableScroller;

        searchInput.addEventListener('focus', () => {
            const filteredListItems = getFilteredListItems(searchEmpty);
            updateListItemFocusStyles(currentFocusIndex, currentSelectionIndex, filteredListItems);
        });

        searchInput.addEventListener('input', (e) => {
            document.querySelector('.left-toolbox').scrollTop = 0;
            tableScroller = document.querySelector('.vue-recycle-scroller');

            const hasMatches = filterListItems(e.target.value);
            searchInput.style.backgroundColor = hasMatches ? 'white' : ERROR_COLOR;

            searchEmpty = e.target.value === "";
            const filteredListItems = getFilteredListItems(searchEmpty);

            // Calculate height dynamically based on items
            const itemHeight = 42;
            const calculatedHeight = filteredListItems.length * itemHeight;

            // Adjust scroller styles
            tableScroller.style.height = searchEmpty ? 'unset' : `${calculatedHeight}px`;
            tableScroller.style.overflow = searchEmpty ? 'unset' : 'hidden';

            currentFocusIndex = 0;
            updateListItemFocusStyles(currentFocusIndex, currentSelectionIndex, filteredListItems);
        });

        searchInput.addEventListener('keydown', (e) => {
            const filteredListItems = getFilteredListItems(searchEmpty);
            currentFocusIndex = handleFilterKeydown(e, {
                filteredListItems,
                currentFocusIndex,
                currentSelectionIndex,
                onFocusChange: updateListItemFocusStyles,
                tableScroller
            });
        });

        searchInput.addEventListener('blur', () => {
            const filteredListItems = getFilteredListItems(searchEmpty);
            updateListItemFocusStyles(-1, currentSelectionIndex, filteredListItems);
        });

        tablesTitle.appendChild(searchInput);
    }

    function filterListItems(searchText) {
        const listItems = document.querySelectorAll('[id^=object-li-object_].nav-item, [id^=role-object-nav-object_].nav-item');
        const searchLower = searchText.toLowerCase();
        let matchFound = false;

        listItems.forEach(item => {
            const spanContent = item.querySelector('span[content]')?.textContent || '';
            const isMatch = spanContent.toLowerCase().includes(searchLower);
            item.style.display = isMatch ? 'block' : 'none';
            item.style.position = isMatch ? 'relative' : 'absolute';
            item.style.height = isMatch ? '' : '0';
            item.style.margin = isMatch ? '' : '0';
            item.style.padding = isMatch ? '' : '0';
            if (isMatch) matchFound = true;
        });

        return matchFound;
    }
}

function addMoveCopyViewFilter() {
    const selectElement = document.querySelector('select[data-cy="movecopy-select"]');
    if (selectElement && !document.querySelector('#incremental-filter-movecopy')) {
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Filter pages...';
        searchInput.style.marginBottom = '10px';
        searchInput.style.padding = '2px 5px';
        searchInput.style.fontSize = '14px';
        searchInput.style.borderRadius = '4px';
        searchInput.style.border = '1px solid #ccc';
        searchInput.style.height = '35px';
        searchInput.style.width = '100%';
        searchInput.id = 'incremental-filter-movecopy';

        const resultsPopup = document.createElement('div');
        resultsPopup.id = 'filter-results-popup';
        resultsPopup.style.position = 'absolute';
        resultsPopup.style.maxHeight = '200px';
        resultsPopup.style.top = '84px';
        resultsPopup.style.overflowY = 'auto';
        resultsPopup.style.backgroundColor = 'white';
        resultsPopup.style.border = '1px solid #ccc';
        resultsPopup.style.borderRadius = '4px';
        resultsPopup.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        resultsPopup.style.zIndex = '1000';
        resultsPopup.style.display = 'none';
        resultsPopup.style.width = 'max-content';

        searchInput.addEventListener('input', (e) => {
            const hasMatches = filterOptions(e.target.value);
            searchInput.style.backgroundColor = hasMatches ? 'white' : ERROR_COLOR;

            resultsPopup.style.display = e.target.value ? 'block' : 'none';
        });

        searchInput.addEventListener('keydown', (e) => {
            handleFilterKeydown(e, {
                resultsPopup
            });
        });

        const container = document.createElement('div');
        container.style.position = 'relative';
        container.appendChild(searchInput);
        container.appendChild(resultsPopup);
        selectElement.parentNode.insertBefore(container, selectElement);
    }

    function filterOptions(searchText) {
        const options = document.querySelectorAll('select[data-cy="movecopy-select"] option');
        const searchLower = searchText.toLowerCase();
        let matchFound = false;
        let matchingResults = [];

        options.forEach(option => {
            const optionText = option.textContent || '';
            const isMatch = optionText.toLowerCase().includes(searchLower);
            option.style.display = isMatch ? '' : 'none';
            if (isMatch) {
                matchFound = true;
                matchingResults.push(optionText);
            }
        });

        const resultsPopup = document.querySelector('#filter-results-popup');
        if (resultsPopup) {
            resultsPopup.innerHTML = matchingResults.map(text =>
                `<div style="font-size: medium; padding: 5px 10px; cursor: pointer; hover:background-color: #f5f5f5;">${text}</div>`
            ).join('');

            resultsPopup.querySelectorAll('div').forEach((div, index) => {
                div.addEventListener('mouseover', () => {
                    div.style.backgroundColor = '#f5f5f5';
                });
                div.addEventListener('mouseout', () => {
                    div.style.backgroundColor = 'white';
                });
                div.addEventListener('click', () => {
                    const options = Array.from(document.querySelectorAll('select[data-cy="movecopy-select"] option'));
                    const matchingOption = options.find(opt => opt.textContent === div.textContent);
                    if (matchingOption) {
                        matchingOption.selected = true;
                        resultsPopup.style.display = 'none';
                        const selectElement = document.querySelector('select[data-v-6eadacf6]');
                        if (selectElement) {
                            selectElement.value = matchingOption.value;
                            const event = new Event('change', { bubbles: true });
                            selectElement.dispatchEvent(event);
                        }
                    }
                });
            });
        }

        return matchFound;
    }
}

function addPagesFilter() {
    const filterTitle = document.querySelector('h3[data-cy="page-filter-menu"]');
    if (filterTitle && !document.querySelector('#incremental-filter-pages')) {
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Filter pages...';
        searchInput.style.marginLeft = '10px';
        searchInput.style.padding = '2px 5px';
        searchInput.style.fontSize = '14px';
        searchInput.style.borderRadius = '4px';
        searchInput.style.border = '1px solid #ccc';
        searchInput.style.height = '35px';
        searchInput.style.width = '110px';
        searchInput.id = 'incremental-filter-pages';

        searchInput.addEventListener('mousedown', (e) => e.stopPropagation());
        searchInput.addEventListener('click', (e) => e.stopPropagation());
        searchInput.addEventListener('input', (e) => {
            const hasMatches = filterPages(e.target.value);
            searchInput.style.backgroundColor = hasMatches ? 'white' : ERROR_COLOR;
        });
        searchInput.addEventListener('keydown', (e) => {
            handleFilterKeydown(e);
        });

        filterTitle.appendChild(searchInput);
    }

    function filterPages(searchText) {
        const searchLower = searchText.toLowerCase();
        let matchFound = false;

        function showParents(element) {
            let current = element;
            while (current) {
                if (current.style) {
                    current.style.display = '';
                }

                if (current.tagName === 'LI') {
                    const childContainer = current.querySelector('ul.page-list-sortable');
                    if (childContainer) {
                        childContainer.style.display = '';
                    }
                }

                current = current.parentElement;
                if (current && current.tagName === 'UL') {
                    current = current.parentElement;
                }
            }
        }

        function processPageItem(item) {
            const nameElement = item.querySelector('.name');
            const pageText = nameElement ? nameElement.textContent || '' : '';
            const isMatch = pageText.toLowerCase().includes(searchLower);

            let childrenMatch = false;
            const childList = item.querySelector('ul.page-list-sortable');
            if (childList) {
                const childItems = childList.querySelectorAll(':scope > li[data-cy="page-link-item"]');
                childItems.forEach(childItem => {
                    if (processPageItem(childItem)) {
                        childrenMatch = true;
                    }
                });
            }

            const shouldShow = isMatch || childrenMatch;

            if (shouldShow) {
                showParents(item);
                matchFound = true;
                item.style.display = '';
                if (childList) {
                    childList.style.display = '';
                }
            } else {
                item.style.display = 'none';
                if (childList) {
                    childList.style.display = 'none';
                }
            }

            return shouldShow;
        }

        if (!searchText) {
            document.querySelectorAll('li[data-cy="page-link-item"], ul.page-list-sortable').forEach(el => {
                el.style.display = '';
            });
            return true;
        }

        const topLevelItems = document.querySelectorAll('ul.page-list-sortable > li[data-cy="page-link-item"]');
        topLevelItems.forEach(processPageItem);

        return matchFound;
    }
}

function addFieldsFilter() {
    const fieldTabs = document.querySelector('#view-add-items>div.buttonFilter');
    if (!fieldTabs || document.querySelector('#incremental-filter-fields')) {
        return;
    }

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Filter fields...';
    searchInput.style.marginLeft = '30px';
    searchInput.style.padding = '2px 5px';
    searchInput.style.fontSize = '14px';
    searchInput.style.borderRadius = '4px';
    searchInput.style.border = '1px solid #ccc';
    searchInput.style.height = '35px';
    searchInput.style.width = '140px';
    searchInput.id = 'incremental-filter-fields';
    searchInput.classList.add('filter-input');

    searchInput.addEventListener('input', (e) => {
        document.querySelector('#pages .toolbox-body').scrollTop = 0;
        const hasMatches = filterListItems(e.target.value);
        searchInput.style.backgroundColor = hasMatches ? 'white' : ERROR_COLOR;
    });

    searchInput.addEventListener('keydown', (e) => {
        handleFilterKeydown(e);
    });

    fieldTabs.appendChild(searchInput);

    function filterListItems(searchText) {
        const connectionsElement = document.querySelector('[data-cy=connections]');
        const connectionsIsActive = connectionsElement && connectionsElement.classList.contains('is-active');
        const listItems = connectionsIsActive ? document.querySelectorAll('div.items-wrapper') : document.querySelectorAll('.view-add-item');
        const searchLower = searchText.toLowerCase();
        let matchFound = false;

        listItems.forEach(item => {
            if (connectionsIsActive) {
                const addItemsList = item.querySelectorAll('.view-add-item');
                let childMatchFound = false;

                addItemsList.forEach(addItem => {
                    if (filterItem(addItem, searchLower)) {
                        matchFound = true;
                        childMatchFound = true;
                    }
                });
                if (childMatchFound) {
                    const expandButton = item.querySelector('.expandableList_trigger:not(.open)');
                    expandButton && expandButton.click();
                }
                item.style.display = childMatchFound ? 'block' : 'none';
            } else {
                if (filterItem(item, searchLower)) {
                    matchFound = true;
                }
            }
        });

        return matchFound;
    }

    function filterItem(item, searchLower) {
        const spanContent = item.querySelector('span').textContent || '';
        const isMatch = spanContent.toLowerCase().includes(searchLower);

        item.style.display = isMatch ? 'block' : 'none';
        item.style.position = isMatch ? 'relative' : 'absolute';
        item.style.height = isMatch ? '' : '0';
        item.style.margin = isMatch ? '' : '0';
        item.style.padding = isMatch ? '' : '0';

        return isMatch;
    }
}

function addIDsToElements(elementSelector, idAttribute, textSelector) {
    const elements = document.querySelectorAll(`${elementSelector}:not(:has(.idTextStyle))`);
    elements.forEach(element => {
        let id = element.getAttribute(idAttribute) || element.id.match(/object_\d+/)?.[0];
        if (id) {
            // Ensure the ID is in the correct format
            id = id.replace(/.*object_(\d+).*/, 'object_$1');
        }
        const textElement = element.querySelector(textSelector);
        if (id && textElement) {
            textElement.innerHTML += ` <span class="idTextStyle">${id}</span>`;
        }
    });
}

function toggleDividerMinMax() {
    const divider = document.querySelector('.divider');
    if (divider) {
        const dblClickEvent = new MouseEvent('dblclick', {
            bubbles: true,
            cancelable: true,
            view: window
        });

        divider.dispatchEvent(dblClickEvent);
    }
}

function getFilteredListItems(searchEmpty) {
    const listItems = Array.from(document.querySelectorAll('[id^=object-li-object_].nav-item, [id^=role-object-nav-object_].nav-item'));
    return searchEmpty ? listItems : listItems.filter(item => getComputedStyle(item).display === 'block');
}

function updateListItemFocusStyles(currentFocusIndex, currentSelectionIndex, filteredListItems) {
    // Reset all focus styles
    filteredListItems.forEach((item, index) => {
        const anchor = item.querySelector('a'); // Select the <a> inside the <li>
        // Remove highlight styles from the <a>
        anchor.style.removeProperty('--tw-bg-opacity');
        anchor.style.removeProperty('background-color');
    });

    // Apply styles to current selection
    if (currentSelectionIndex === currentFocusIndex) return;

    const anchor = filteredListItems[currentFocusIndex]?.querySelector('a');
    if (!anchor) return;

    anchor.style.setProperty('--tw-bg-opacity', '1', 'important');
    anchor.style.setProperty('background-color', 'rgba(251, 239, 249, 1)', 'important');
}

// Shared utility function for keyboard handling in filter inputs
// Shared utility function for keyboard handling in filter inputs
function handleFilterKeydown(e, options = {}) {
    const {
        filteredListItems = [],
        currentFocusIndex = 0,
        currentSelectionIndex = -1,
        onFocusChange = null,
        resultsPopup = null,
        tableScroller = null
    } = options;

    // For Home/End keys - allow default behavior when focused on input field
    if ((e.key === 'Home' || e.key === 'End') && e.target.id.startsWith('incremental-filter-')) {
        return currentFocusIndex;
    }

    // Handle other keys
    switch (e.key) {
        case 'Escape':
            e.target.value = '';
            e.target.dispatchEvent(new Event('input'));
            e.target.blur();
            e.target.style.backgroundColor = 'white';
            if (tableScroller) tableScroller.style.height = 'unset';
            if (resultsPopup) resultsPopup.style.display = 'none';
            break;

        case 'Tab':
            if (e.target.id === 'incremental-filter-tables' && filteredListItems.length > 0) {
                e.preventDefault();
                const newIndex = (currentFocusIndex + 1) % filteredListItems.length;
                onFocusChange?.(newIndex, currentSelectionIndex, filteredListItems);
                return newIndex;
            }
            break;

        case 'Enter':
            if (e.target.id === 'incremental-filter-tables' && currentFocusIndex >= 0) {
                const item = filteredListItems[currentFocusIndex];
                item?.click();
                onFocusChange?.(-1, currentFocusIndex, filteredListItems);
                return currentFocusIndex;
            }
            break;

        case 'ArrowUp':
        case 'ArrowDown':
            if (e.target.id === 'incremental-filter-tables' && filteredListItems.length > 0) {
                e.preventDefault();
                const delta = e.key === 'ArrowUp' ? -1 : 1;
                const newIndex = (currentFocusIndex + delta + filteredListItems.length) % filteredListItems.length;
                onFocusChange?.(newIndex, currentSelectionIndex, filteredListItems);
                return newIndex;
            }
            break;

        case 'Home':
        case 'End':
            if (e.target.id === 'incremental-filter-tables' && filteredListItems.length > 0) {
                e.preventDefault();
                const newIndex = e.key === 'Home' ? 0 : filteredListItems.length - 1;
                onFocusChange?.(newIndex, currentSelectionIndex, filteredListItems);
                return newIndex;
            }
            break;
    }

    return currentFocusIndex;
}

function truncateCellText(selector = '.kn-table-element td', textLimit = 50, parentTableId = '#kn-records-table') {
    try {
        document.querySelectorAll(selector).forEach(cell => {
            if (cell.textContent.length > textLimit) {
                cell.classList.add('truncate-cell');
                if (cell.closest(parentTableId)) {
                    if (cell.querySelector('.view-more-btn')) return;
                    const viewMoreBtn = document.createElement('span');
                    viewMoreBtn.textContent = 'more';
                    viewMoreBtn.className = 'view-more-btn';
                    cell.appendChild(viewMoreBtn);

                    viewMoreBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        cell.classList.toggle('open');
                        viewMoreBtn.textContent = cell.classList.contains('open') ? 'less' : 'more';
                    });
                }
            }
        });
        return true;
    } catch (error) {
        console.error('Error in truncateCells:', error);
        return false;
    }
}
