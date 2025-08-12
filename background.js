let base64image;

function screenshot(tab) {
    chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['inject.js'] });
}

function error_popup(popup) {
    chrome.action.setPopup({ popup: popup }).then(() => { chrome.action.openPopup().then(() => { chrome.action.setPopup({ popup: '' }); }); });
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
                chrome.tabs.create({ url: `https://x.com/intent/post?screenshot=1&hashtags=${message.hashtags}` });
            } else {
                error_popup('InvalidVideo.html');
            }
            return;
        case 'GetScreenShot':
            sendResponse(base64image);
            base64image = undefined;
            return true;
        case 'VideoNotFound':
            error_popup('VideoNotFound.html');
            return;
        case 'InvalidVideo':
            error_popup('InvalidVideo.html');
            return;
    }
});