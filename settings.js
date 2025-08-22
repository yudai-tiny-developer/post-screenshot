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

export function createKeyInput(input_class, label, default_label, common_value, onChange, common) {
    const input = document.createElement('input');
    input.setAttribute('type', 'button');
    input.setAttribute('defaultValue', default_label);
    input.classList.add(input_class);

    if (label) {
        input.value = common_value(label);
    } else {
        input.value = default_label;
    }

    const dummy = document.createElement('span');
    dummy.style.visibility = 'hidden';
    dummy.style.position = 'absolute';
    dummy.style.whiteSpace = 'pre';
    document.body.appendChild(dummy);

    input.addEventListener('reset', () => {
        input.value = default_label;
        adjust_size();
    });

    let listening = false;
    let result = false;
    let prev_value = input.value;

    input.addEventListener('focus', () => {
        listening = true;
        result = false;
        input.value = '';
        adjust_size();
    });

    input.addEventListener('blur', () => {
        listening = false;
        if (!result) {
            input.value = prev_value;
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
            input.value = label;
            adjust_size();
        } else {
            result = true;
            input.value = label;
            prev_value = label;
            adjust_size();

            if (onChange) {
                onChange(input);
            }

            input.dispatchEvent(new CustomEvent('change'));
            input.blur();
        }
    }

    function adjust_size() {
        const baseFontSize = 14;
        const minFontSize = 5;
        const input_style = getComputedStyle(input);
        const padding = Number.parseInt(input_style.paddingLeft) + Number.parseInt(input_style.paddingRight);

        let fontSize = baseFontSize;

        input.style.fontSize = fontSize + 'px';
        dummy.style.fontSize = fontSize + 'px';
        dummy.style.font = input_style.font;
        dummy.textContent = input.value || '';

        while (dummy.offsetWidth > input.clientWidth - padding && fontSize > minFontSize) {
            fontSize -= 0.5;
            input.style.fontSize = fontSize + 'px';
            dummy.style.fontSize = fontSize + 'px';
        }

        while (dummy.offsetWidth <= input.clientWidth - padding && fontSize < baseFontSize) {
            fontSize += 0.5;
            input.style.fontSize = fontSize + 'px';
            dummy.style.fontSize = fontSize + 'px';
            if (dummy.offsetWidth > input.clientWidth - padding) {
                fontSize -= 0.5;
                input.style.fontSize = fontSize + 'px';
                break;
            }
        }
    }

    input.addEventListener('keydown', keychange);
    input.addEventListener('keyup', keychange);
    input.addEventListener('adjust', adjust_size);

    return input;
}

export function createClearButton(input, default_label, onChange) {
    const span = document.createElement('span');
    span.classList.add('filter-clear');
    span.innerHTML = '×';

    if (onChange) {
        span.addEventListener('click', () => {
            input.dispatchEvent(new CustomEvent('reset'));
            onChange(input);

            if (input.value === default_label) {
                span.style.visibility = 'hidden';
            } else {
                span.style.visibility = 'visible';
            }
        });
    }

    input.addEventListener('change', () => {
        if (input.value === default_label) {
            span.style.visibility = 'hidden';
        } else {
            span.style.visibility = 'visible';
        }
    });

    if (input.value === default_label) {
        span.style.visibility = 'hidden';
    } else {
        span.style.visibility = 'visible';
    }

    return span;
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
        input.dispatchEvent(new CustomEvent('change'));
    }

    chrome.storage.local.clear();
}