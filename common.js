export const storage = [
    'post',
    'popup',
    'hashtags',
    'hq',
    'download',
    'seek',
];

export const default_post = true;
export const default_popup = false;
export const default_hashtags = true;
export const default_hq = false;
export const default_download = false;
export const default_seek = false;

export function value(value, defaultValue) {
    return value === undefined ? defaultValue : value;
}

export function create_blob(base64image) {
    const byteCharacters = atob(base64image);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    return new Blob([new Uint8Array(byteNumbers)], { type: 'image/jpeg' });
}