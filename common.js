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

export function normalizeCombo({ ctrl, alt, shift, meta, key, code }) {
    const parts = [];
    if (ctrl) parts.push('Ctrl');
    if (alt) parts.push('Alt');
    if (shift) parts.push('Shift');
    if (meta) parts.push(isMac() ? '⌘' : 'Meta');

    const keyName = normalizeKeyName(key, code);
    parts.push(keyName);
    return parts.join(' + ');
}

function normalizeKeyName(key, code) {
    const mods = ['Control', 'Shift', 'Alt', 'Meta'];
    if (!key || mods.includes(key)) return '';

    const map = {
        ' ': 'Space',
        'Spacebar': 'Space',
        'ArrowUp': '↑',
        'ArrowDown': '↓',
        'ArrowLeft': '←',
        'ArrowRight': '→',
        'Esc': 'Escape',
    };

    if (code && code.startsWith('Numpad')) return code;

    if (key.length === 1 && key !== ' ') return key.toUpperCase();

    if (/^F\d{1,2}$/.test(key)) return key;

    return map[key] || key;
}