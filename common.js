export const storage = [
    'post',
    'popup',
    'hashtags',
    'hq',
    'download',
    'seek',
    'shortcut',
    'shortcut_seek',
];

export const default_post = true;
export const default_popup = false;
export const default_hashtags = true;
export const default_hq = false;
export const default_download = false;
export const default_seek = false;
export const default_shortcut = '';
export const default_shortcut_seek = '';

export function value(value, defaultValue) {
    return value === undefined ? defaultValue : value;
}

export function create_blob(base64image, type) {
    const byteCharacters = atob(base64image);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    return new Blob([new Uint8Array(byteNumbers)], { type });
}

export function parse_key(comboStr) {
    function normalizeKey(k) {
        const map = {
            'Space': ' ',
            'ArrowUp': 'ArrowUp',
            'ArrowDown': 'ArrowDown',
            'ArrowLeft': 'ArrowLeft',
            'ArrowRight': 'ArrowRight',
            'Esc': 'Escape',
        };
        if (map[k]) return map[k];
        if (k.length === 1) return k.toLowerCase();
        return k;
    }

    function guessCodeFromKey(k) {
        if (/^[A-Z]$/.test(k)) return 'Key' + k;
        if (/^\d$/.test(k)) return 'Digit' + k;
        if (k === ' ') return 'Space';
        if (/^F\d{1,2}$/.test(k)) return k;
        if (k.startsWith('Arrow')) return k;
        return '';
    }

    const parts = comboStr.split('+').map(s => s.trim());

    let ctrl = false, shift = false, alt = false, meta = false;
    let key = '', code = '';

    for (const part of parts) {
        if (/^Ctrl$/i.test(part)) ctrl = true;
        else if (/^Shift$/i.test(part)) shift = true;
        else if (/^Alt$/i.test(part)) alt = true;
        else if (/^(Meta|⌘)$/i.test(part)) meta = true;
        else {
            key = normalizeKey(part);
            code = guessCodeFromKey(key);
        }
    }

    return {
        key,
        code,
        ctrlKey: ctrl,
        shiftKey: shift,
        altKey: alt,
        metaKey: meta
    };
}