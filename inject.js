var _post_screenshot_canvas;

(() => {
    const video = document.body.querySelector('video');
    if (video) {
        import(chrome.runtime.getURL('common.js')).then(common => {
            chrome.storage.local.get(common.storage, data => {
                _post_screenshot_canvas = _post_screenshot_canvas ?? document.createElement('canvas');
                _post_screenshot_canvas.width = video.videoWidth;
                _post_screenshot_canvas.height = video.videoHeight;

                if (_post_screenshot_canvas.height > _post_screenshot_canvas.width) {
                    _post_screenshot_canvas.width = (_post_screenshot_canvas.height * 3.0) / 4.0;
                }

                const context = _post_screenshot_canvas.getContext('2d');
                context.drawImage(video, Math.max((_post_screenshot_canvas.width - video.videoWidth) / 2.0, 0), 0, video.videoWidth, video.videoHeight);

                if (common.value(data.hashtags, common.default_hashtags)) {
                    const hashtags = [...document.title.matchAll(/[#＃]([\p{L}\p{N}_-]+)/gu)].map(m => m[1]).filter(tag => !/^\p{N}+$/u.test(tag)).join(',');
                    chrome.runtime.sendMessage({ msg: 'ScreenShot', base64image: _post_screenshot_canvas.toDataURL('image/jpeg', 0.85).replace(/^data:[^,]*,/, ''), hashtags });
                } else {
                    chrome.runtime.sendMessage({ msg: 'ScreenShot', base64image: _post_screenshot_canvas.toDataURL('image/jpeg', 0.85).replace(/^data:[^,]*,/, ''), hashtags: '' });
                }
            });
        });
    } else {
        chrome.runtime.sendMessage({ msg: 'VideoNotFound' });
    }
})();