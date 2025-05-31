export const pipe = function () {
    const a = arguments;
    return function (x) {
        let i = 0;
        for (; i < a.length;) x = a[i++](x);
        return x;
    }
};

export const compose = function () {
    const a = arguments;
    return function (x) {
        let i = a.length - 1;
        for (; i >= 0;) x = a[i--](x);
        return x;
    }
};

function createElement(tag, props, ...children) {
    return { tag, props: props || {}, children: children.flat() };
}

function isSameNodeType(a, b) {
    return a && b && a.tag === b.tag;
}

function updateProps($el, oldProps, newProps) {
    oldProps = oldProps || {};
    newProps = newProps || {};

    // Remove old props
    for (let key in oldProps) {
        if (!(key in newProps)) {
            $el.removeAttribute(key);
        }
    }

    // Set new props
    for (let key in newProps) {
        if (oldProps[key] !== newProps[key]) {
            if (key.startsWith('on') && typeof newProps[key] === 'function') {
                // Event handler
                const eventName = key.slice(2).toLowerCase();
                $el[eventName] = newProps[key];
            } else {
                $el.setAttribute(key, newProps[key]);
            }
        }
    }
}

function createDomNode(vNode) {
    if (typeof vNode === 'string' || typeof vNode === 'number') {
        return document.createTextNode(vNode);
    }
    const $el = document.createElement(vNode.tag);
    updateProps($el, {}, vNode.props);
    vNode.children.forEach(child => {
        $el.appendChild(createDomNode(child));
    });
    return $el;
}

function diff($parent, newVNode, oldVNode, index = 0) {
    if (!oldVNode) {
        $parent.appendChild(createDomNode(newVNode));
    } else if (!newVNode) {
        $parent.removeChild($parent.childNodes[index]);
    } else if (typeof newVNode !== typeof oldVNode ||
        (typeof newVNode === 'string' && newVNode !== oldVNode) ||
        !isSameNodeType(newVNode, oldVNode)) {
        $parent.replaceChild(createDomNode(newVNode), $parent.childNodes[index]);
    } else if (newVNode.tag) {
        updateProps($parent.childNodes[index], oldVNode.props, newVNode.props);
        const newLen = newVNode.children.length;
        const oldLen = oldVNode.children.length;
        for (let i = 0; i < newLen || i < oldLen; i++) {
            diff($parent.childNodes[index], newVNode.children[i], oldVNode.children[i], i);
        }
    }
}

export function createState(v) {
    let s = v, c = [], oldVNode = null, root = null;

    return {
        get: function () {
            return s;
        },
        set: function (n) {
            s = typeof n === "function" ? n(s) : n;
            for (let i = 0, l = c.length; i < l;) c[i++](s);
            // ถ้า subscribe มี render dom ให้ diff update อัตโนมัติ
            if (root && oldVNode !== null && typeof s === 'object' && s.vdom) {
                diff(root, s.vdom, oldVNode);
                oldVNode = s.vdom;
            }
        },
        subscribe: function (f, mountPoint) {
            if (typeof f === "function") {
                c[c.length] = f;
            }
            if (mountPoint && mountPoint instanceof HTMLElement) {
                root = mountPoint;
                if (s && typeof s === 'object' && s.vdom) {
                    oldVNode = s.vdom;
                    root.innerHTML = '';
                    root.appendChild(createDomNode(s.vdom));
                }
            }
        },
        createElement,  // Vdom
    };
}
