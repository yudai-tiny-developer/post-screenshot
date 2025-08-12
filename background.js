let base64image;

chrome.action.onClicked.addListener(tab => {
    chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['inject.js'] });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.msg) {
        case 'ScreenShot':
            base64image = message.base64image;
            chrome.tabs.create({ url: `https://x.com/intent/post?screenshot=1&hashtags=${message.hashtags}` });
            return;
        case 'GetScreenShot':
            sendResponse(base64image);
            base64image = undefined;
            return true;
    }
});