import(chrome.runtime.getURL('common.js')).then(common =>
    import(chrome.runtime.getURL('settings.js')).then(settings =>
        import(chrome.runtime.getURL('progress.js')).then(progress =>
            chrome.storage.local.get(common.storage, data =>
                main(common, settings, progress, data)
            )
        )
    )
);

function main(common, settings, progress, data) {
    const row_class = 'row';
    const cell_class = 'cell';
    const toggle_class = 'toggle';
    const label_class = 'switch';
    const key_class = 'key';
    const progress_class = 'progress';
    const done_class = 'done';
    const separator_row_class = 'separator-row';
    const separator_line_row_class = 'separator-line-row';
    const separator_cell_class = 'separator-cell';
    const separator_line_cell_class = 'separator-line-cell';
    const caption_cell_class = 'caption-cell';

    const container = document.body.querySelector('div#container');
    const reset_button = document.body.querySelector('input#reset');
    const progress_div = document.body.querySelector('div#reset_progress');

    {
        const row = settings.createRow(row_class);
        row.appendChild(settings.createLabel(caption_cell_class, common.label.caption_settings));
        row.appendChild(settings.createLabel(caption_cell_class, ''));
        row.appendChild(settings.createLabel(caption_cell_class, ''));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.appendChild(settings.createLabel(cell_class, common.label.post));
        row.appendChild(settings.createToggle(cell_class, toggle_class, label_class, 'post', data.post, common.default_post, common.value));
        row.appendChild(settings.createLabel(cell_class, ''));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.appendChild(settings.createLabel(cell_class, common.label.popup));
        row.appendChild(settings.createToggle(cell_class, toggle_class, label_class, 'popup', data.popup, common.default_popup, common.value));
        row.appendChild(settings.createLabel(cell_class, ''));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.appendChild(settings.createLabel(cell_class, common.label.hashtags));
        row.appendChild(settings.createToggle(cell_class, toggle_class, label_class, 'hashtags', data.hashtags, common.default_hashtags, common.value));
        row.appendChild(settings.createLabel(cell_class, ''));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.appendChild(settings.createLabel(cell_class, common.label.hq));
        row.appendChild(settings.createToggle(cell_class, toggle_class, label_class, 'hq', data.hq, common.default_hq, common.value));
        row.appendChild(settings.createLabel(cell_class, ''));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.appendChild(settings.createLabel(cell_class, common.label.hq_recording));
        row.appendChild(settings.createToggle(cell_class, toggle_class, label_class, 'hq_recording', data.hq_recording, common.default_hq_recording, common.value));
        row.appendChild(settings.createLabel(cell_class, ''));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.appendChild(settings.createLabel(cell_class, common.label.download));
        row.appendChild(settings.createToggle(cell_class, toggle_class, label_class, 'download', data.download, common.default_download, common.value));
        row.appendChild(settings.createLabel(cell_class, ''));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.appendChild(settings.createLabel(cell_class, common.label.seek));
        row.appendChild(settings.createToggle(cell_class, toggle_class, label_class, 'seek', data.seek, common.default_seek, common.value));
        row.appendChild(settings.createLabel(cell_class, ''));
        container.appendChild(row);
    }

    {
        const row = settings.createRow(separator_row_class);
        row.appendChild(settings.createLabel(separator_cell_class, ''));
        row.appendChild(settings.createLabel(separator_cell_class, ''));
        row.appendChild(settings.createLabel(separator_cell_class, ''));
        container.appendChild(row);
    } {
        const row = settings.createRow(separator_line_row_class);
        row.appendChild(settings.createLabel(separator_line_cell_class, ''));
        row.appendChild(settings.createLabel(separator_line_cell_class, ''));
        row.appendChild(settings.createLabel(separator_line_cell_class, ''));
        container.appendChild(row);
    } {
        const row = settings.createRow(separator_row_class);
        row.appendChild(settings.createLabel(separator_cell_class, ''));
        row.appendChild(settings.createLabel(separator_cell_class, ''));
        row.appendChild(settings.createLabel(separator_cell_class, ''));
        container.appendChild(row);
    }

    {
        const row = settings.createRow(row_class);
        row.appendChild(settings.createLabel(caption_cell_class, common.label.caption_shortcuts));
        row.appendChild(settings.createLabel(caption_cell_class, ''));
        row.appendChild(settings.createLabel(caption_cell_class, ''));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.appendChild(settings.createLabel(cell_class, common.label.shortcut));
        const input = settings.createKeyInput(key_class, data.shortcut, common.default_shortcut, common.value, common);
        input.addEventListener('change', e => chrome.storage.local.set({ shortcut: e.target.textContent }));
        row.appendChild(input);
        row.appendChild(settings.createKeyClearButton(input, common.default_shortcut));
        container.appendChild(row);
        input.dispatchEvent(new CustomEvent('adjust'));
    } {
        const row = settings.createRow(row_class);
        row.appendChild(settings.createLabel(cell_class, common.label.shortcut_seek));
        const input = settings.createKeyInput(key_class, data.shortcut_seek, common.default_shortcut_seek, common.value, common);
        input.addEventListener('change', e => chrome.storage.local.set({ shortcut_seek: e.target.textContent }));
        row.appendChild(input);
        row.appendChild(settings.createKeyClearButton(input, common.default_shortcut_seek));
        container.appendChild(row);
        input.dispatchEvent(new CustomEvent('adjust'));
    } {
        const row = settings.createRow(row_class);
        row.appendChild(settings.createLabel(cell_class, common.label.shortcut_recording));
        const input = settings.createKeyInput(key_class, data.shortcut_recording, common.default_shortcut_recording, common.value, common);
        input.addEventListener('change', e => chrome.storage.local.set({ shortcut_recording: e.target.textContent }));
        row.appendChild(input);
        row.appendChild(settings.createKeyClearButton(input, common.default_shortcut_recording));
        container.appendChild(row);
        input.dispatchEvent(new CustomEvent('adjust'));
    } {
        const row = settings.createRow(row_class);
        row.appendChild(settings.createLabel(cell_class, common.label.shortcut_hashtags));
        const input = settings.createKeyInput(key_class, data.shortcut_hashtags, common.default_shortcut_hashtags, common.value, common);
        input.addEventListener('change', e => chrome.storage.local.set({ shortcut_hashtags: e.target.textContent }));
        row.appendChild(input);
        row.appendChild(settings.createKeyClearButton(input, common.default_shortcut_hashtags));
        container.appendChild(row);
        input.dispatchEvent(new CustomEvent('adjust'));
    }

    settings.registerResetButton(reset_button, progress_div, progress_class, done_class, toggle_class, key_class, progress);
}