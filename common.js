export const storage = [
    'popup',
    'hashtags',
];

export const default_popup = false;
export const default_hashtags = true;

export function value(value, defaultValue) {
    return value === undefined ? defaultValue : value;
}