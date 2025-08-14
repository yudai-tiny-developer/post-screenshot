import * as common from './common.js';

let base64image;
let title;
let tab_for_post;
let window_for_post;

function screenshot(tab) {
    chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['inject.js'] });
}

function error_popup(popup) {
    chrome.action.setPopup({ popup: popup }).then(() => { chrome.action.openPopup().then(() => { chrome.action.setPopup({ popup: '' }); }); });
}

function sanitize(title) {
    const sanitized = title.replace(/[\\/:*?"<>|\x00-\x1F]/g, '_').replace(/[ .]+$/, '');
    if (sanitized) {
        return sanitized;
    } else {
        return '_';
    }
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
                chrome.storage.local.get(common.storage, async data => {
                    if (common.value(data.popup, common.default_popup)) {
                        if (window_for_post) {
                            chrome.tabs.query({ windowId: window_for_post.id }, async tabs => {
                                if (tabs && tabs.length > 0 && tabs[0].url.startsWith('https://x.com/')) {
                                    chrome.tabs.update(tabs[0].id, { url: `https://x.com/intent/post?screenshot=1&hashtags=${message.hashtags}`, active: true });
                                    chrome.windows.update(tabs[0].windowId, { focused: true });
                                } else {
                                    window_for_post = await chrome.windows.create({ url: `https://x.com/intent/post?screenshot=1&hashtags=${message.hashtags}`, type: 'popup' });
                                }
                            });
                        } else {
                            window_for_post = await chrome.windows.create({ url: `https://x.com/intent/post?screenshot=1&hashtags=${message.hashtags}`, type: 'popup' });
                        }
                    } else {
                        if (tab_for_post) {
                            chrome.tabs.get(tab_for_post.id, async tab => {
                                if (tab && tab.url.startsWith('https://x.com/')) {
                                    chrome.tabs.update(tab.id, { url: `https://x.com/intent/post?screenshot=1&hashtags=${message.hashtags}`, active: true });
                                    chrome.windows.update(tab.windowId, { focused: true });
                                } else {
                                    tab_for_post = await chrome.tabs.create({ url: `https://x.com/intent/post?screenshot=1&hashtags=${message.hashtags}` });
                                }
                            });
                        } else {
                            tab_for_post = await chrome.tabs.create({ url: `https://x.com/intent/post?screenshot=1&hashtags=${message.hashtags}` });
                        }
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