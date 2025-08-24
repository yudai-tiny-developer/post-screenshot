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

export function createKeyInput(key_class, label, default_label, common_value, common) {
    const button = document.createElement('button');
    button.setAttribute('defaultValue', default_label);
    button.classList.add(key_class);

    if (label) {
        button.textContent = common_value(label);
    } else {
        button.textContent = default_label;
    }

    const dummy = document.createElement('span');
    dummy.style.visibility = 'hidden';
    dummy.style.position = 'absolute';
    dummy.style.whiteSpace = 'pre';
    document.body.appendChild(dummy);

    button.addEventListener('reset', () => {
        button.textContent = default_label;
        prev_value = default_label;
        adjust_size();
        button.dispatchEvent(new CustomEvent('change'));
    });

    let listening = false;
    let result = false;
    let prev_value = button.textContent;

    button.addEventListener('focus', () => {
        listening = true;
        result = false;
        button.textContent = '';
        adjust_size();
    });

    button.addEventListener('blur', () => {
        listening = false;
        if (!result) {
            button.textContent = prev_value;
            adjust_size();
        }
    });

    function keychange(e) {
        if (!listening) return;

        e.preventDefault();
        e.stopPropagation();

        if (e.repeat) return;

        const label = common.normalizeCombo(e);

        if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
            result = false;
            button.textContent = label;
            adjust_size();
        } else {
            result = true;
            button.textContent = label;
            prev_value = label;
            adjust_size();

            button.dispatchEvent(new CustomEvent('change'));
            button.blur();
        }
    }

    function adjust_size() {
        const baseFontSize = 14;
        const minFontSize = 5;
        const input_style = getComputedStyle(button);
        const padding = Number.parseInt(input_style.paddingLeft) + Number.parseInt(input_style.paddingRight);

        let fontSize = baseFontSize;

        button.style.fontSize = `${fontSize}px`;
        dummy.style.fontSize = `${fontSize}px`;
        dummy.style.font = input_style.font;
        dummy.textContent = button.textContent || '';

        while (dummy.offsetWidth > button.clientWidth - padding && fontSize > minFontSize) {
            fontSize -= 0.5;
            button.style.fontSize = `${fontSize}px`;
            dummy.style.fontSize = `${fontSize}px`;
        }

        while (dummy.offsetWidth <= button.clientWidth - padding && fontSize < baseFontSize) {
            fontSize += 0.5;
            button.style.fontSize = `${fontSize}px`;
            dummy.style.fontSize = `${fontSize}px`;
            if (dummy.offsetWidth > button.clientWidth - padding) {
                fontSize -= 0.5;
                button.style.fontSize = `${fontSize}px`;
                break;
            }
        }
    }

    button.addEventListener('keydown', keychange);
    button.addEventListener('keyup', keychange);
    button.addEventListener('adjust', adjust_size);

    return button;
}

export function createKeyClearButton(button, default_label) {
    const span = document.createElement('span');
    span.classList.add('filter-clear');
    span.innerHTML = '✕';

    span.addEventListener('click', () => {
        button.dispatchEvent(new CustomEvent('reset'));

        if (button.textContent === default_label) {
            span.style.visibility = 'hidden';
        } else {
            span.style.visibility = 'visible';
        }
    });

    button.addEventListener('change', () => {
        if (button.textContent === default_label) {
            span.style.visibility = 'hidden';
        } else {
            span.style.visibility = 'visible';
        }
    });

    if (button.textContent === default_label) {
        span.style.visibility = 'hidden';
    } else {
        span.style.visibility = 'visible';
    }

    return span;
}

let state = {};

export function registerResetButton(reset_button, progress_div, progress_class, done_class, toggle_class, key_class, progress) {
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

    reset_button.addEventListener('mouseup', () => progress.endProgress(progress_div, progress_class, done_class, state, resetSettings, { toggle_class, key_class }));
    reset_button.addEventListener('touchend', event => {
        event.preventDefault();
        progress.endProgress(progress_div, progress_class, done_class, state, resetSettings, { toggle_class, key_class });
    });
}

function resetSettings(args) {
    for (const input of document.body.querySelectorAll(`input.${args.toggle_class}`)) {
        input.checked = input.getAttribute('defaultValue') === 'true';
    }

    for (const input of document.body.querySelectorAll(`button.${args.key_class}`)) {
        input.dispatchEvent(new CustomEvent('reset'));
    }

    chrome.storage.local.clear();
}