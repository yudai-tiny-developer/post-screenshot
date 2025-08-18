export function createRow(row_class) {
    const div = document.createElement('div');
    div.classList.add(row_class);
    return div;
}

export function createLabel(cell_class, label = '') {
    const div = document.createElement('div');
    div.classList.add(cell_class);
    div.innerHTML = label;
    return div;
}

export function createToggle(cell_class, toggle_class, label_class, key, checked, defaultValue, checkForDefault) {
    const div = document.createElement('div');
    div.classList.add(cell_class);

    const input = document.createElement('input');
    input.id = key;
    input.classList.add(toggle_class);
    input.type = 'checkbox';
    input.checked = checkForDefault(checked, defaultValue);

    input.setAttribute('defaultValue', defaultValue);
    input.addEventListener('change', () => {
        chrome.storage.local.set({ [key]: input.checked });
    });
    div.appendChild(input);

    const label = document.createElement('label');
    label.classList.add(label_class);
    label.setAttribute('for', key);
    div.appendChild(label);

    return div;
}

export function createKeyInput(input_class, label, default_label, common_value, onChange) {
    const input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('defaultValue', default_label);
    input.setAttribute('inputmode', 'none');
    input.setAttribute('autocomplete', 'off');
    input.classList.add(input_class);

    if (label) {
        input.value = common_value(label);
    } else {
        input.value = default_label;
    }

    input.addEventListener('reset', () => {
        input.value = default_label;
    });

    function normalizeCombo({ ctrl, alt, shift, meta, key, code }) {
        const parts = [];
        if (ctrl) parts.push('Ctrl');
        if (alt) parts.push('Alt');
        if (shift) parts.push('Shift');
        if (meta) parts.push(isMac() ? '⌘' : 'Meta');

        const keyName = normalizeKeyName(key, code);
        if (keyName) parts.push(keyName);
        return parts.join(' + ');
    }

    function normalizeKeyName(key, code) {
        const mods = ['Control', 'Shift', 'Alt', 'Meta'];
        if (!key || mods.includes(key)) return '';

        const map = {
            ' ': 'Space',
            'Spacebar': 'Space',
            'ArrowUp': 'ArrowUp',
            'ArrowDown': 'ArrowDown',
            'ArrowLeft': 'ArrowLeft',
            'ArrowRight': 'ArrowRight',
            'Esc': 'Escape',
        };

        if (key.length === 1) return key.toUpperCase();

        if (/^F\d{1,2}$/.test(key)) return key;

        if (code && code.startsWith('Numpad')) {
            const np = code.replace(/^Numpad/, '');
            return 'Numpad ' + np.replace('Add', '+')
                .replace('Subtract', '-')
                .replace('Multiply', '*')
                .replace('Divide', '/')
                .replace('Decimal', '.');
        }

        return map[key] || key;
    }

    function isMac() {
        return /Mac|iPhone|iPad|iPod/.test(navigator.platform) || /Mac OS|iOS/.test(navigator.userAgent);
    }

    let listening = false;
    let prev_value = input.value;

    input.addEventListener('focus', () => {
        listening = true;
        input.value = '';
        input.setAttribute('lang', 'en');
    });

    input.addEventListener('blur', () => {
        listening = false;
        if (input.value === '') {
            input.value = prev_value;
        }
    });

    input.addEventListener('keydown', (e) => {
        if (!listening) return;

        e.preventDefault();
        e.stopPropagation();

        if (e.repeat) return;

        const combo = {
            ctrl: e.ctrlKey,
            alt: e.altKey,
            shift: e.shiftKey,
            meta: e.metaKey,
            key: e.key,
            code: e.code
        };

        if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
            return;
        }

        const label = normalizeCombo(combo);

        if (label !== 'Process') {
            input.value = label;
            prev_value = label;

            if (onChange) {
                onChange(input);
            }
        }
    });

    input.addEventListener('compositionstart', e => {
        e.preventDefault();
        input.blur();
        input.focus();
    });

    input.addEventListener('change', (e) => {
        if (!/^[\x20-\x7E]*$/.test(input.value)) {
            input.value = prev_value;
        }
    });

    return input;
}

let state = {};

export function registerResetButton(reset_button, progress_div, progress_class, done_class, toggle_class, input_class, progress) {
    reset_button.addEventListener('mousedown', () => progress.startProgress(progress_div, progress_class, done_class, state));
    reset_button.addEventListener('touchstart', () => progress.startProgress(progress_div, progress_class, done_class, state));

    reset_button.addEventListener('mouseleave', () => progress.endProgress(progress_div, progress_class, done_class, state));
    reset_button.addEventListener('touchmove', event => {
        const touch = event.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        if (target !== reset_button) {
            progress.endProgress(progress_div, progress_class, done_class, state);
        }
    });
    reset_button.addEventListener('touchcancel', () => progress.endProgress(progress_div, progress_class, done_class, state));

    reset_button.addEventListener('mouseup', () => progress.endProgress(progress_div, progress_class, done_class, state, resetSettings, { toggle_class, input_class }));
    reset_button.addEventListener('touchend', event => {
        event.preventDefault();
        progress.endProgress(progress_div, progress_class, done_class, state, resetSettings, { toggle_class, input_class });
    });
}

function resetSettings(args) {
    for (const input of document.body.querySelectorAll('input.' + args.toggle_class)) {
        input.checked = input.getAttribute('defaultValue') === 'true';
    }

    for (const input of document.body.querySelectorAll('input.' + args.input_class)) {
        input.value = input.getAttribute('defaultValue');
    }

    chrome.storage.local.clear();
}