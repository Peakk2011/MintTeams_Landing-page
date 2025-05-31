export function injectCSS(cssString) {
    const styleEl = document.createElement('style');
    styleEl.textContent = cssString;
    document.head.appendChild(styleEl);
    return styleEl;
}

export function injectHTML(targetSelector, htmlString) {
    const target = document.querySelector(targetSelector);
    if (!target) throw new Error(`No element matches selector: ${targetSelector}`);
    target.innerHTML = htmlString;
}

export function injectTitle(titleHtmlString) {
    const head = document.head;
    if (!head) {
        throw new Error('Document.head not found');
    }

    const existingTitle = head.querySelector('title');
    if (existingTitle) {
        head.removeChild(existingTitle);
    }
    
    head.insertAdjacentHTML('beforeend', titleHtmlString.trim());
}