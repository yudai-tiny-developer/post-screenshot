import * as common from './common.js';

let base64image;
let title;

function screenshot(tab) {
    chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['inject.js'] });
}

function error_popup(popup) {
    chrome.action.setPopup({ popup: popup }).then(() => { chrome.action.openPopup().then(() => { chrome.action.setPopup({ popup: '' }); }); });
}

function sanitize(title) {
    const invalidChars = /[\\/:*?"<>|\x00-\x1F]/g;
    let sanitized = title.replace(invalidChars, '_');
    sanitized = sanitized.replace(/[ .]+$/, '');
    if (!sanitized) {
        sanitized = '_'
    };
    return sanitized;
}

function now() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');

    return `${yyyy}${mm}${dd}${hh}${mi}${ss}`;
}

chrome.action.onClicked.addListener(tab => {
    screenshot(tab);
});

chrome.commands.onCommand.addListener((command, tab) => {
    screenshot(tab);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.msg) {
        case 'ScreenShot':
            if (message.base64image) {
                base64image = message.base64image;
                title = `${sanitize(message.title)}_${now()}`;
                chrome.storage.local.get(common.storage, data => {
                    if (common.value(data.popup, common.default_popup)) {
                        chrome.windows.create({ url: `https://x.com/intent/post?screenshot=1&hashtags=${message.hashtags}`, type: 'popup' });
                    } else {
                        chrome.tabs.create({ url: `https://x.com/intent/post?screenshot=1&hashtags=${message.hashtags}` });
                    }
                });
            } else {
                error_popup('InvalidVideo.html');
            }
            return;
        case 'GetScreenShot':
            sendResponse({ base64image, title });
            base64image = undefined;
            title = undefined;
            return true;
        case 'VideoNotFound':
            error_popup('VideoNotFound.html');
            return;
        case 'InvalidVideo':
            error_popup('InvalidVideo.html');
            return;
    }
});