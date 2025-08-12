var _post_screenshot_canvas;

(() => {
    function getVideo() {
        const video = document.body.querySelector('video');
        if (video) {
            return video;
        }

        for (const iframe of document.body.querySelectorAll('iframe')) {
            try {
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                if (doc) {
                    const found = getVideo(doc);
                    if (found) {
                        return found;
                    }
                }
            } catch (e) {
                // CORS Error
            }
        }

        return null;
    }

    try {
        const video = getVideo();
        if (video) {
            _post_screenshot_canvas = _post_screenshot_canvas ?? document.createElement('canvas');
            _post_screenshot_canvas.width = video.videoWidth;
            _post_screenshot_canvas.height = video.videoHeight;

            const context = _post_screenshot_canvas.getContext('2d');
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

            const hashtags = [...document.title.matchAll(/[#＃]([\p{L}\p{N}_-]+)/gu)].map(m => m[1]).filter(tag => !/^\p{N}+$/u.test(tag)).join(',');

            chrome.runtime.sendMessage({ msg: 'ScreenShot', base64image: _post_screenshot_canvas.toDataURL('image/jpeg', 0.85).replace(/^data:[^,]*,/, ''), hashtags });
        } else {
            chrome.runtime.sendMessage({ msg: 'VideoNotFound' });
        }
    } catch {
        // service_worker not ready
    }
})();