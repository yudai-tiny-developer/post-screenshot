var _post_screenshot_canvas;

(() => {
    try {
        const video = document.querySelector('video') ?? document.querySelector('iframe')?.contentWindow.document.querySelector('video');

        _post_screenshot_canvas = _post_screenshot_canvas ?? document.createElement('canvas');
        _post_screenshot_canvas.width = video.videoWidth;
        _post_screenshot_canvas.height = video.videoHeight;

        const context = _post_screenshot_canvas.getContext('2d');
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

        const hashtags = (document.title.match(/#[\p{L}\p{N}_]+/gu) || []).map(tag => tag.slice(1)).join(',');

        chrome.runtime.sendMessage({ msg: 'ScreenShot', base64png: _post_screenshot_canvas.toDataURL().replace(/^data:image\/png;base64,/, ''), hashtags });
    } catch {
        // service_worker not ready
    }
})();