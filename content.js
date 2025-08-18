import(chrome.runtime.getURL('common.js')).then(common => {
    main(common);
});

function main(common) {
    function loadSettings() {
        chrome.storage.local.get(common.storage, data => {
            settings_post = common.value(data.post, common.default_post);
            settings_popup = common.value(data.popup, common.default_popup);
            settings_hashtags = common.value(data.hashtags, common.default_hashtags);
            settings_hq = common.value(data.hq, common.default_hq);
            settings_download = common.value(data.download, common.default_download);
            settings_seek = common.value(data.seek, common.default_seek);
            settings_shortcut = common.parse_key(common.value(data.shortcut, common.default_shortcut));
        });
    }

    function take_screenshot() {
        canvas = canvas ?? document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        if (canvas.height > canvas.width) {
            canvas.width = (canvas.height * 3.0) / 4.0;
        }

        const context = canvas.getContext('2d');
        context.drawImage(video, Math.max((canvas.width - video.videoWidth) / 2.0, 0), 0, video.videoWidth, video.videoHeight);

        const encoderOptions = settings_hq ? 1.0 : 0.85;

        if (settings_post) {
            const base64image = canvas.toDataURL('image/jpeg', encoderOptions).replace(/^data:[^,]*,/, '');
            const title = `${sanitize(document.title)}_${now()}.jpg`;
            const hashtags = settings_hashtags ? [...document.title.matchAll(/[#＃]([\p{L}\p{N}_-]+)/gu)].map(m => m[1]).filter(tag => !/^\p{N}+$/u.test(tag)).join(',') : '';

            chrome.runtime.sendMessage({ msg: 'ScreenShot', base64image, title, hashtags });
        }

        if (settings_download) {
            const base64image = canvas.toDataURL('image/png').replace(/^data:[^,]*,/, '');
            const title = `${sanitize(document.title)}_${now()}.png`;

            const blob = common.create_blob(base64image, 'image/png');
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = title;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
        }
    }

    function sanitize(title) {
        return title.replace(/[\\/:*?"<>|\x00-\x1F]/g, '_').replace(/[ .]+$/, '') ?? '_';
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

    function dialog_close() {
        clearInterval(push_interval);
        dialog.close();
        video.play();
    }

    function dialog_step_back() {
        video.currentTime -= 1.0 / 60.0;
    }

    function dialog_step_forward() {
        video.currentTime += 1.0 / 60.0;
    }

    function dialog_rewind() {
        video.currentTime -= 1.0;
    }

    function dialog_fast_forward() {
        video.currentTime += 1.0;
    }

    function dialog_take_screenshot() {
        take_screenshot();
        dialog_close();
    }

    function dialog_seek(e) {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            dialog_step_back();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            dialog_step_forward();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            dialog_rewind();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            dialog_fast_forward();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            dialog_take_screenshot();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            dialog_close();
        }
    }

    function show_seek_dialog() {
        if (!dialog) {
            dialog = document.createElement('dialog');
            dialog.id = '_post_screenshot_dialog';
            dialog.addEventListener('focusout', (e) => {
                if (!dialog.contains(e.relatedTarget)) {
                    dialog_close();
                }
            });
            dialog.addEventListener('keydown', dialog_seek);
            dialog.style.backgroundColor = 'black';
            dialog.style.color = 'white';
            dialog.style.fontSize = '14px';
            dialog.style.margin = 0;
            dialog.style.outline = 'none';

            const keyActions = [
                { key: '←', action: 'Step back', callback: dialog_step_back },
                { key: '→', action: 'Step forward', callback: dialog_step_forward },
                { key: '↑', action: 'Rewind 1 second', callback: dialog_rewind },
                { key: '↓', action: 'Fast forward 1 second', callback: dialog_fast_forward },
                { key: 'Enter', action: 'Take a screenshot', callback: dialog_take_screenshot },
                { key: 'Escape', action: 'Cancel', callback: dialog_close },
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
                cellKeyButton.style.outline = 'none';
                cellKeyButton.value = item.key;
                cellKeyButton.addEventListener('click', item.callback);
                cellKeyButton.addEventListener('mousedown', () => { clearInterval(push_interval); push_interval = setInterval(item.callback, 100); });
                cellKeyButton.addEventListener('mouseup', () => { clearInterval(push_interval); });
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

            dialog.appendChild(tableDiv);

            document.body.appendChild(dialog);
        }

        dialog.style.zIndex = video.style.zIndex + 1;

        const rect = video.getBoundingClientRect();
        if (document.fullscreenElement) {
            dialog.style.position = 'sticky';
            dialog.style.left = `${rect.left + 4}px`;
            dialog.style.top = `${rect.top + 4}px`;
        } else {
            dialog.style.position = 'fixed';
            dialog.style.left = `${rect.left + window.scrollX + 4}px`;
            dialog.style.top = `${rect.top + window.scrollY + 4}px`;
        }

        dialog.show();
    }

    function shortcut_command() {
        video = document.body.querySelector('video');
        if (video && video.readyState !== 0) {
            if (settings_seek) {
                video.pause();
                show_seek_dialog();
            } else {
                take_screenshot();
            }
        } else {
            chrome.runtime.sendMessage({ msg: 'VideoNotFound' });
        }
    }

    let settings_post = common.default_post;
    let settings_hashtags = common.default_hashtags;
    let settings_hq = common.default_hq;
    let settings_download = common.default_download;
    let settings_seek = common.default_seek;
    let video;
    let canvas;
    let dialog;
    let push_interval;

    chrome.storage.onChanged.addListener(loadSettings);

    loadSettings();

    document.addEventListener('_post_screenshot_take_screenshot', shortcut_command);

    document.addEventListener('keydown', e => {
        if (e.key === settings_shortcut.key &&
            e.ctrlKey === settings_shortcut.ctrlKey &&
            e.shiftKey === settings_shortcut.shiftKey &&
            e.altKey === settings_shortcut.altKey &&
            e.metaKey === settings_shortcut.metaKey) {
            shortcut_command();
        }
    });
}