export const storage = [
    'post',
    'popup',
    'hashtags',
    'hq',
    'hq_recording',
    'download',
    'seek',
    'shortcut',
    'shortcut_seek',
    'shortcut_recording',
];

export const default_post = true;
export const default_popup = false;
export const default_hashtags = true;
export const default_hq = false;
export const default_hq_recording = false;
export const default_download = false;
export const default_seek = false;
export const default_shortcut = '';
export const default_shortcut_seek = '';
export const default_shortcut_recording = '';

export const label = {
    caption_settings: chrome.i18n.getMessage('caption_settings'),
    post: chrome.i18n.getMessage('post'),
    popup: chrome.i18n.getMessage('popup'),
    hashtags: chrome.i18n.getMessage('hashtags'),
    hq: chrome.i18n.getMessage('hq'),
    hq_recording: chrome.i18n.getMessage('hq_recording'),
    download: chrome.i18n.getMessage('download'),
    seek: chrome.i18n.getMessage('seek'),
    caption_shortcuts: chrome.i18n.getMessage('caption_shortcuts'),
    shortcut: chrome.i18n.getMessage('shortcut'),
    shortcut_seek: chrome.i18n.getMessage('shortcut_seek'),
    shortcut_recording: chrome.i18n.getMessage('shortcut_recording'),
};

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
    function normalizeKey(part) {
        if (part.startsWith('Numpad')) {
            return part.replace(/^Numpad/, '').replace('Add', '+')
                .replace('Subtract', '-')
                .replace('Multiply', '*')
                .replace('Divide', '/')
                .replace('Decimal', '.');
        }

        const map = {
            'Space': ' ',
            '↑': 'ArrowUp',
            '↓': 'ArrowDown',
            '←': 'ArrowLeft',
            '→': 'ArrowRight',
            'Esc': 'Escape',
        };
        if (map[part]) return map[part];
        if (part.length === 1) return part.toLowerCase();
        return part;
    }

    function guessCodeFromKey(part) {
        if (part.startsWith('Numpad')) {
            return part;
        }
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
            code = guessCodeFromKey(part);
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