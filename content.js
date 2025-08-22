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
            settings_hq_recording = common.value(data.hq_recording, common.default_hq_recording);
            settings_download = common.value(data.download, common.default_download);
            settings_seek = common.value(data.seek, common.default_seek);
            settings_shortcut = common.value(data.shortcut, common.default_shortcut);
            settings_shortcut_seek = common.value(data.shortcut_seek, common.default_shortcut_seek);
            settings_shortcut_recording = common.value(data.shortcut_recording, common.default_shortcut_recording);
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
            const type = 'image/jpeg';
            const base64image = canvas.toDataURL(type, encoderOptions).replace(/^data:[^,]*,/, '');
            const title = `${sanitize(document.title)}_${now()}.jpg`;
            const hashtags = settings_hashtags ? [...document.title.matchAll(/[#＃]([\p{L}\p{N}_-]+)/gu)].map(m => m[1]).filter(tag => !/^\p{N}+$/u.test(tag)).join(',') : '';

            chrome.runtime.sendMessage({ msg: 'ScreenShot', base64image, type, title, hashtags });
        }

        if (settings_download) {
            const type = 'image/png';
            const base64image = canvas.toDataURL(type).replace(/^data:[^,]*,/, '');
            const title = `${sanitize(document.title)}_${now()}.png`;

            const blob = common.create_blob(base64image, type);
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
            e.stopPropagation();
            dialog_step_back();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            e.stopPropagation();
            dialog_step_forward();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            e.stopPropagation();
            dialog_rewind();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            e.stopPropagation();
            dialog_fast_forward();
        }
    }

    function dialog_seek_close(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            dialog_take_screenshot();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
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
            dialog.addEventListener('keyup', dialog_seek_close);
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
                cellKeyButton.addEventListener('mousedown', () => { clearInterval(push_interval); push_interval = setInterval(item.callback, 50); });
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

    function record() {
        if (recording) {
            recording_result = true;
            close_recording_dialog();
        } else {
            show_recording_dialog();

            const type = 'video/mp4';

            canvas = canvas ?? document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext('2d');
            const canvasStream = canvas.captureStream(settings_hq_recording ? 60 : 30);

            audioCtx = audioCtx ?? new AudioContext();
            source = source ?? audioCtx.createMediaElementSource(video);
            dest = dest ?? audioCtx.createMediaStreamDestination();
            source.connect(dest);
            source.connect(audioCtx.destination);
            const audioStream = dest.stream;

            const combinedStream = new MediaStream([
                ...canvasStream.getVideoTracks(),
                ...audioStream.getAudioTracks()
            ]);

            const recorder = new MediaRecorder(combinedStream, {
                mimeType: `${type};codecs=avc1,mp4a.40.2`,
                videoBitsPerSecond: settings_hq_recording ? 10240000 : 5120000,
                audioBitsPerSecond: settings_hq_recording ? 192000 : 128000,
            });
            const chunks = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);

            recorder.onstop = async () => {
                if (recording_result) {
                    const blob = new Blob(chunks, { type });
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        if (settings_post) {
                            const base64image = reader.result.replace(/^data:[^,]*,/, '');
                            const title = `${sanitize(document.title)}_${now()}.mp4`;
                            const hashtags = settings_hashtags ? [...document.title.matchAll(/[#＃]([\p{L}\p{N}_-]+)/gu)].map(m => m[1]).filter(tag => !/^\p{N}+$/u.test(tag)).join(',') : '';

                            chrome.runtime.sendMessage({ msg: 'ScreenShot', base64image, type, title, hashtags });
                        }

                        if (settings_download) {
                            const base64image = reader.result.replace(/^data:[^,]*,/, '');
                            const title = `${sanitize(document.title)}_${now()}.mp4`;

                            const blob = common.create_blob(base64image, type);
                            const a = document.createElement('a');
                            a.href = URL.createObjectURL(blob);
                            a.download = title;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(a.href);
                        }
                    };
                    reader.readAsDataURL(blob);
                }
            };

            video.play();
            recorder.start();
            function draw() {
                if (recording && !video.ended) {
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    requestAnimationFrame(draw);
                } else {
                    recorder.stop();

                    recording_result = true;
                    close_recording_dialog();
                }
            }
            draw();
        }
    }

    function show_recording_dialog() {
        recording = true;

        if (!recording_dialog) {
            recording_dialog = document.createElement('dialog');
            recording_dialog.id = '_post_screenshot_recording_dialog';
            recording_dialog.addEventListener('focusout', (e) => {
                if (!recording_dialog.contains(e.relatedTarget)) {
                    if (recording) {
                        recording_result = false;
                    }
                    close_recording_dialog();
                }
            });
            recording_dialog.style.backgroundColor = 'black';
            recording_dialog.style.color = 'red';
            recording_dialog.style.fontSize = '14px';
            recording_dialog.style.margin = 0;
            recording_dialog.style.outline = 'none';
            recording_dialog.title = 'Press Enter or the shortcut key again: Stop recording\nPress Escape or lose focus: Cancel recording';
            recording_dialog.addEventListener('keyup', (e) => {
                if (!recording_dialog.contains(e.relatedTarget)) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();

                        recording_result = true;
                        close_recording_dialog();
                    } else if (e.key === 'Escape') {
                        e.preventDefault();
                        e.stopPropagation();

                        if (recording) {
                            recording_result = false;
                        }
                        close_recording_dialog();
                    }
                }
            });

            const div = document.createElement('div');
            div.style.textAlign = 'center';
            div.style.paddingLeft = '4px';
            div.style.paddingRight = '4px';
            div.textContent = '●REC';

            recording_dialog.appendChild(div);

            document.body.appendChild(recording_dialog);
        }

        recording_dialog.style.zIndex = video.style.zIndex + 1;

        const rect = video.getBoundingClientRect();
        if (document.fullscreenElement) {
            recording_dialog.style.position = 'sticky';
            recording_dialog.style.left = `${rect.left + 4}px`;
            recording_dialog.style.top = `${rect.top + 4}px`;
        } else {
            recording_dialog.style.position = 'fixed';
            recording_dialog.style.left = `${rect.left + window.scrollX + 4}px`;
            recording_dialog.style.top = `${rect.top + window.scrollY + 4}px`;
        }

        recording_dialog.show();
    }

    function close_recording_dialog() {
        recording = false;
        recording_dialog.close();
    }

    function shortcut_command(e, type) {
        video = document.body.querySelector('video');
        if (video && video.readyState !== 0) {
            e.preventDefault();
            e.stopPropagation();

            if (type === 1) {
                take_screenshot();
            } else if (type === 2) {
                video.pause();
                show_seek_dialog();
            } else if (type === 3) {
                record();
            } else {
                if (settings_seek) {
                    video.pause();
                    show_seek_dialog();
                } else {
                    take_screenshot();
                }
            }
        }
    }

    let settings_post = common.default_post;
    let settings_hashtags = common.default_hashtags;
    let settings_hq = common.default_hq;
    let settings_hq_recording = common.default_hq_recording;
    let settings_download = common.default_download;
    let settings_seek = common.default_seek;
    let settings_shortcut = common.default_shortcut;
    let settings_shortcut_seek = common.default_shortcut_seek;
    let settings_shortcut_recording = common.default_shortcut_recording;
    let video;
    let canvas;
    let dialog;
    let push_interval;
    let recording;
    let recording_result;
    let audioCtx;
    let source;
    let dest;
    let recording_dialog;

    chrome.storage.onChanged.addListener(loadSettings);

    loadSettings();

    document.addEventListener('_post_screenshot_take_screenshot', e => shortcut_command(e, 0));

    document.addEventListener('keyup', e => {
        switch (e.target?.type) {
            case 'textarea':
            case 'date':
            case 'datetime-local':
            case 'email':
            case 'month':
            case 'number':
            case 'password':
            case 'search':
            case 'tel':
            case 'text':
            case 'time':
            case 'url':
            case 'week':
                return;
        }

        if (e.target?.isContentEditable || e.target?.getAttribute('role') === 'textbox') {
            return;
        }

        const comboKey = common.normalizeCombo(e);
        if (comboKey === settings_shortcut) {
            shortcut_command(e, 1);
        } else if (comboKey === settings_shortcut_seek) {
            shortcut_command(e, 2);
        } else if (comboKey === settings_shortcut_recording) {
            shortcut_command(e, 3);
        }
    });
}