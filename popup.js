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
    const input_class = 'rate';
    const progress_class = 'progress';
    const done_class = 'done';

    const container = document.body.querySelector('div#container');
    const reset_button = document.body.querySelector('input#reset');
    const progress_div = document.body.querySelector('div#reset_progress');

    {
        const row = settings.createRow(row_class);
        row.appendChild(settings.createLabel(cell_class, 'Post after taking a screenshot'));
        row.appendChild(settings.createToggle(cell_class, toggle_class, label_class, 'post', data.post, common.default_post, common.value));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.appendChild(settings.createLabel(cell_class, 'Open in a popup window'));
        row.appendChild(settings.createToggle(cell_class, toggle_class, label_class, 'popup', data.popup, common.default_popup, common.value));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.appendChild(settings.createLabel(cell_class, 'Use hashtags in the window title'));
        row.appendChild(settings.createToggle(cell_class, toggle_class, label_class, 'hashtags', data.hashtags, common.default_hashtags, common.value));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.appendChild(settings.createLabel(cell_class, 'Post a high-quality screenshot'));
        row.appendChild(settings.createToggle(cell_class, toggle_class, label_class, 'hq', data.hq, common.default_hq, common.value));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.appendChild(settings.createLabel(cell_class, 'Download a screenshot'));
        row.appendChild(settings.createToggle(cell_class, toggle_class, label_class, 'download', data.download, common.default_download, common.value));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.appendChild(settings.createLabel(cell_class, 'Seek before taking a screenshot<br>(Only effective if the platform supports seeking)'));
        row.appendChild(settings.createToggle(cell_class, toggle_class, label_class, 'seek', data.seek, common.default_seek, common.value));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.appendChild(settings.createLabel(cell_class, 'Shortcut key: Quick Post'));
        const onChange = input => chrome.storage.local.set({ shortcut: input.value });
        const input = settings.createKeyInput(input_class, data.shortcut, common.default_shortcut, common.value, onChange);
        row.appendChild(input);
        row.appendChild(settings.createClearButton(input, common.default_shortcut, onChange));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.appendChild(settings.createLabel(cell_class, 'Shortcut key: Seek before taking a screenshot'));
        const onChange = input => chrome.storage.local.set({ shortcut_seek: input.value });
        const input = settings.createKeyInput(input_class, data.shortcut_seek, common.default_shortcut_seek, common.value, onChange);
        row.appendChild(input);
        row.appendChild(settings.createClearButton(input, common.default_shortcut_seek, onChange));
        container.appendChild(row);
    }

    settings.registerResetButton(reset_button, progress_div, progress_class, done_class, toggle_class, input_class, progress);
}