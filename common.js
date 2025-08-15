export const storage = [
    'popup',
    'hashtags',
    'hq',
    'download',
    'seek',
];

export const default_popup = false;
export const default_hashtags = true;
export const default_hq = false;
export const default_download = false;
export const default_seek = false;

export function value(value, defaultValue) {
    return value === undefined ? defaultValue : value;
}