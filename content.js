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
            settings_shortcut_hashtags = common.value(data.shortcut_hashtags, common.default_shortcut_hashtags);
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
            const hashtags = settings_hashtags ? selected_hashtags(location.href.split('#')[0]).join(',') : '';

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
                { key: '←', action: 'Step back', callback: dialog_step_back, repeat: true },
                { key: '→', action: 'Step forward', callback: dialog_step_forward, repeat: true },
                { key: '↑', action: 'Rewind 1 second', callback: dialog_rewind, repeat: true },
                { key: '↓', action: 'Fast forward 1 second', callback: dialog_fast_forward, repeat: true },
                { key: 'Enter', action: 'Take a screenshot', callback: dialog_take_screenshot, repeat: false },
                { key: 'Escape', action: 'Cancel', callback: dialog_close, repeat: false },
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
                cellKeyButton.style.width = '100%';
                cellKeyButton.value = item.key;
                if (item.repeat) {
                    cellKeyButton.addEventListener('mousedown', () => { clearInterval(push_interval); push_interval = setInterval(item.callback, 100); item.callback(); });
                    cellKeyButton.addEventListener('mouseup', () => { clearInterval(push_interval); });
                } else {
                    cellKeyButton.addEventListener('click', item.callback);
                }
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
                            const hashtags = settings_hashtags ? selected_hashtags(location.href.split('#')[0]).join(',') : '';

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
                    if (recording) {
                        recording_result = true;
                    }
                    close_recording_dialog();
                    recorder.stop();
                }
            }
            draw();
        }
    }

    function show_recording_dialog() {
        recording = Date.now();

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

                        if (recording) {
                            recording_result = true;
                        }
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

            recording_dialog_div = document.createElement('div');
            recording_dialog_div.style.textAlign = 'center';
            recording_dialog_div.style.paddingLeft = '4px';
            recording_dialog_div.style.paddingRight = '4px';

            recording_dialog.appendChild(recording_dialog_div);

            document.body.appendChild(recording_dialog);
        }

        clearInterval(recording_count_interval);
        recording_dialog_div.textContent = '●REC (0:00)';
        recording_count_interval = setInterval(() => {
            const t = Number.parseInt((Date.now() - recording) / 1000);
            const mm = String(Number.parseInt(t / 60)).padStart(1, '0');
            const ss = String(t % 60).padStart(2, '0');
            recording_dialog_div.textContent = `●REC (${mm}:${ss})`;
        }, 500);

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
        clearInterval(recording_count_interval);
        recording_dialog.close();
        recording = 0;
    }

    function show_hashtags_dialog() {
        if (!hashtags_dialog) {
            hashtags_dialog = document.createElement('dialog');
            hashtags_dialog.id = '_post_screenshot_hashtags_dialog';
            hashtags_dialog.addEventListener('focusout', (e) => {
                if (!hashtags_dialog.contains(e.relatedTarget)) {
                    close_hashtags_dialog();
                }
            });
            hashtags_dialog.style.backgroundColor = 'black';
            hashtags_dialog.style.color = 'white';
            hashtags_dialog.style.fontSize = '14px';
            hashtags_dialog.style.margin = 0;
            hashtags_dialog.style.outline = 'none';
            hashtags_dialog.style.height = 'fit-content';
            hashtags_dialog.addEventListener('keyup', (e) => {
                if (!hashtags_dialog.contains(e.relatedTarget)) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        close_hashtags_dialog();
                    } else if (e.key === 'Escape') {
                        e.preventDefault();
                        e.stopPropagation();
                        close_hashtags_dialog();
                    }
                }
            });

            document.body.appendChild(hashtags_dialog);
        }

        showHashtagChecklist(hashtags_dialog);

        hashtags_dialog.style.zIndex = video.style.zIndex + 1;

        const rect = video.getBoundingClientRect();
        if (document.fullscreenElement) {
            hashtags_dialog.style.position = 'sticky';
            hashtags_dialog.style.left = `${rect.left + 4}px`;
            hashtags_dialog.style.top = `${rect.top + 4}px`;
        } else {
            hashtags_dialog.style.position = 'fixed';
            hashtags_dialog.style.left = `${rect.left + window.scrollX + 4}px`;
            hashtags_dialog.style.top = `${rect.top + window.scrollY + 4}px`;
        }

        hashtags_dialog.show();
    }

    function close_hashtags_dialog() {
        hashtags_dialog.close();
    }

    function showHashtagChecklist(container) {
        container.textContent = '';

        const urlKey = location.href.split('#')[0];

        let selectionData = loadSelection();
        let selected = new Set(selectionData[urlKey] || []);

        const applyDefaultSelection = () => {
            selected.clear();
            selected = defaultSelection();
            selectionData[urlKey] = [...selected];
            saveSelection(selectionData);
        };

        if (!selectionData[urlKey]) applyDefaultSelection();

        const tags = new Set();
        const walker = document.createTreeWalker(
            document,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode(n) {
                    const el = n.parentElement;
                    if (!el || ['SCRIPT', 'STYLE'].includes(el.nodeName)) return NodeFilter.FILTER_REJECT;

                    if (hasMatchingParent(n, el => ['related'].includes(el.id))) return NodeFilter.FILTER_REJECT;

                    const r = el.getBoundingClientRect();
                    if (r.width <= 0 || r.height <= 0) return NodeFilter.FILTER_REJECT;

                    return NodeFilter.FILTER_ACCEPT;
                },
            }
        );
        for (let node; (node = walker.nextNode());) {
            for (const m of node.nodeValue.matchAll(TAG_RE)) {
                const tag = `#${m[1]}`;
                if (/^#\d+$/.test(tag)) continue;
                tags.add(tag);
            }
        }
        selected.forEach(tags.add, tags);

        const panel = document.createElement('div');
        panel.tabIndex = 0;
        panel.style.cssText = [
            'position:relative',
            'max-height:60vh',
            'width:min(320px, 80vw)',
            'overflow:auto',
            'outline:none',
        ].join(';');

        const ctrl_top = document.createElement('div');
        ctrl_top.style.display = 'flex';
        const title = document.createElement('div');
        title.textContent = 'Hashtags';
        ctrl_top.appendChild(title);
        const closeBtn = document.createElement('div');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = 'font-size:18px;font-weight:bold;cursor:pointer;margin: 0 0 0 auto';
        closeBtn.addEventListener('click', () => {
            close_hashtags_dialog();
        });
        ctrl_top.appendChild(closeBtn);
        panel.appendChild(ctrl_top);

        const list = document.createElement('div');
        [...tags].forEach((tag, i) => {
            const id = `ht-${i}`;
            const label = document.createElement('label');
            label.style.display = 'flex';
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.id = id;
            cb.value = tag;
            cb.checked = selected.has(tag);
            cb.addEventListener('change', () => {
                if (cb.checked) selected.add(tag);
                else selected.delete(tag);
                selectionData[urlKey] = [...selected];
                saveSelection(selectionData);
            });
            const span = document.createElement('span');
            span.textContent = tag;
            label.append(cb, span);
            list.appendChild(label);
        });
        panel.appendChild(list);

        const ctrl_bottom = document.createElement('div');
        ctrl_bottom.style.display = 'flex';
        const resetBtn = document.createElement('input');
        resetBtn.setAttribute('type', 'reset');
        resetBtn.style.cssText = 'margin: 0 0 0 auto';
        resetBtn.addEventListener('click', () => {
            selectionData = loadSelection();
            delete selectionData[urlKey];
            saveSelection(selectionData);
            applyDefaultSelection();
            for (const input of list.querySelectorAll('input')) {
                input.checked = selected.has(input.value);
            }
        });
        ctrl_bottom.appendChild(resetBtn);
        panel.appendChild(ctrl_bottom);

        container.appendChild(panel);
    }

    function hasMatchingParent(el, condition) {
        let current = el.parentElement;
        while (current) {
            if (condition(current)) return true;
            current = current.parentElement;
        }
        return false;
    }

    function loadSelection() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
        catch { return {}; }
    }

    function saveSelection(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function defaultSelection() {
        const selected = new Set();
        for (const m of document.title.matchAll(TAG_RE)) {
            const t = `#${m[1]}`;
            if (!/^#\d+$/.test(t)) selected.add(t);
        }
        return selected;
    }

    function selected_hashtags(urlKey) {
        const selectionData = loadSelection();
        const selected = new Set(selectionData[urlKey] || defaultSelection());

        return [...selected].map(s => s.replace(/^#/, ''));
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
            } else if (type === 4) {
                show_hashtags_dialog();
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

    const STORAGE_KEY = 'hashtag-checklist-selection';
    const TAG_RE = /#([\p{L}\p{N}_\-\u3040-\u30FF\u31F0-\u31FF\u3005\u4E00-\u9FFF]+)/gu;

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
    let recording_count_interval;
    let audioCtx;
    let source;
    let dest;
    let recording_dialog;
    let recording_dialog_div;
    let hashtags_dialog;

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
        if (comboKey) {
            if (comboKey === settings_shortcut) {
                shortcut_command(e, 1);
            } else if (comboKey === settings_shortcut_seek) {
                shortcut_command(e, 2);
            } else if (comboKey === settings_shortcut_recording) {
                shortcut_command(e, 3);
            } else if (comboKey === settings_shortcut_hashtags) {
                shortcut_command(e, 4);
            }
        }
    });
}