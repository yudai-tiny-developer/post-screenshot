var _post_screenshot_canvas;
var _post_screenshot_dialog;

(() => {
    const video = document.body.querySelector('video');
    if (video) {
        import(chrome.runtime.getURL('common.js')).then(common => {
            chrome.storage.local.get(common.storage, data => {
                function screenshot() {
                    _post_screenshot_canvas = _post_screenshot_canvas ?? document.createElement('canvas');
                    _post_screenshot_canvas.width = video.videoWidth;
                    _post_screenshot_canvas.height = video.videoHeight;

                    if (_post_screenshot_canvas.height > _post_screenshot_canvas.width) {
                        _post_screenshot_canvas.width = (_post_screenshot_canvas.height * 3.0) / 4.0;
                    }

                    const context = _post_screenshot_canvas.getContext('2d');
                    context.drawImage(video, Math.max((_post_screenshot_canvas.width - video.videoWidth) / 2.0, 0), 0, video.videoWidth, video.videoHeight);

                    const hashtags = common.value(data.hashtags, common.default_hashtags) ? [...document.title.matchAll(/[#＃]([\p{L}\p{N}_-]+)/gu)].map(m => m[1]).filter(tag => !/^\p{N}+$/u.test(tag)).join(',') : '';
                    const encoderOptions = common.value(data.hq, common.default_hq) ? 1.0 : 0.85;

                    chrome.runtime.sendMessage({ msg: 'ScreenShot', base64image: _post_screenshot_canvas.toDataURL('image/jpeg', encoderOptions).replace(/^data:[^,]*,/, ''), title: document.title, hashtags });
                }

                if (common.value(data.seek, common.default_seek)) {
                    let pushInterval;

                    function close() {
                        clearInterval(pushInterval);
                        _post_screenshot_dialog.style.display = 'none';
                        video.play();
                    }

                    function step_back() {
                        video.currentTime -= 1.0 / 60.0;
                    }

                    function step_forward() {
                        video.currentTime += 1.0 / 60.0;
                    }

                    function rewind() {
                        video.currentTime -= 1.0;
                    }

                    function fast_forward() {
                        video.currentTime += 1.0;
                    }

                    function take_screenshot() {
                        close();
                        screenshot();
                    }

                    function seek(e) {
                        if (e.key === 'ArrowLeft') {
                            e.preventDefault();
                            step_back();
                        } else if (e.key === 'ArrowRight') {
                            e.preventDefault();
                            step_forward();
                        } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            rewind();
                        } else if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            fast_forward();
                        } else if (e.key === 'Enter') {
                            e.preventDefault();
                            take_screenshot();
                        } else if (e.key === 'Escape') {
                            e.preventDefault();
                            close();
                        }
                    }

                    if (!_post_screenshot_dialog) {
                        _post_screenshot_dialog = document.createElement('dialog');
                        _post_screenshot_dialog.id = '_post_screenshot_dialog';
                        _post_screenshot_dialog.addEventListener('focusout', (e) => {
                            if (!_post_screenshot_dialog.contains(e.relatedTarget)) {
                                close();
                            }
                        });
                        _post_screenshot_dialog.addEventListener('keydown', seek);
                        _post_screenshot_dialog.style.position = 'fixed';
                        _post_screenshot_dialog.style.backgroundColor = 'black';
                        _post_screenshot_dialog.style.color = 'white';
                        _post_screenshot_dialog.style.fontSize = '14px';
                        _post_screenshot_dialog.style.margin = 0;
                        _post_screenshot_dialog.style.zIndex = video.style.zIndex + 1;
                        _post_screenshot_dialog.style.outline = 'none';

                        const keyActions = [
                            { key: '←', action: 'Step back', callback: step_back },
                            { key: '→', action: 'Step forward', callback: step_forward },
                            { key: '↑', action: 'Rewind 1 second', callback: rewind },
                            { key: '↓', action: 'Fast forward 1 second', callback: fast_forward },
                            { key: 'Enter', action: 'Take a screenshot', callback: take_screenshot },
                            { key: 'Escape', action: 'Cancel', callback: close },
                        ];

                        const tableDiv = document.createElement('div');
                        tableDiv.style.display = 'table';

                        keyActions.forEach(item => {
                            const row = document.createElement('div');
                            row.style.display = 'table-row';

                            const cellKey = document.createElement('div');
                            cellKey.style.display = 'table-cell';
                            cellKey.style.textAlign = 'center';
                            const cellKeyButton = document.createElement('input');
                            cellKeyButton.type = 'button';
                            cellKeyButton.value = item.key;
                            cellKeyButton.addEventListener('click', item.callback);
                            cellKeyButton.addEventListener('mousedown', () => { clearInterval(pushInterval); pushInterval = setInterval(item.callback, 100); });
                            cellKeyButton.addEventListener('mouseup', () => { clearInterval(pushInterval); });
                            cellKey.appendChild(cellKeyButton);

                            const cellSeparator = document.createElement('div');
                            cellSeparator.style.display = 'table-cell';
                            cellSeparator.style.textAlign = 'center';
                            cellSeparator.style.paddingLeft = '4px';
                            cellSeparator.style.paddingRight = '4px';
                            cellSeparator.textContent = ':';

                            const cellAction = document.createElement('div');
                            cellAction.style.display = 'table-cell';
                            cellAction.textContent = item.action;

                            row.appendChild(cellKey);
                            row.appendChild(cellSeparator);
                            row.appendChild(cellAction);

                            tableDiv.appendChild(row);
                        });

                        _post_screenshot_dialog.appendChild(tableDiv);

                        document.body.appendChild(_post_screenshot_dialog);
                    }

                    video.pause();

                    const rect = video.getBoundingClientRect();
                    _post_screenshot_dialog.style.left = `${rect.left + 4}px`;
                    _post_screenshot_dialog.style.top = `${rect.top + 4}px`;
                    _post_screenshot_dialog.style.display = 'block';
                    _post_screenshot_dialog.focus();
                } else {
                    screenshot();
                }
            });
        });
    } else {
        chrome.runtime.sendMessage({ msg: 'VideoNotFound' });
    }
})();