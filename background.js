let base64png;

chrome.action.onClicked.addListener(tab => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['inject.js']
    });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.msg) {
        case 'ScreenShot':
            base64png = message.base64png;
            chrome.tabs.create({ url: `https://x.com/intent/post?screenshot=1&hashtags=${message.hashtags}` });
            break;
        case 'GetScreenShot':
            sendResponse(base64png);
            break;
    }
    return true;
});