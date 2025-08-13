export const storage = [
    'popup',
    'hashtags',
    'hq',
];

export const default_popup = false;
export const default_hashtags = true;
export const default_hq = false;

export function value(value, defaultValue) {
    return value === undefined ? defaultValue : value;
}