try {
    chrome.runtime.sendMessage({ msg: 'GetScreenShot' }).then(response => {
        if (response.base64image) {
            const detect_interval = setInterval(() => {
                const dialog = document.body.querySelector('div[role="dialog"]');
                if (!dialog) {
                    return;
                }

                const target = dialog.querySelector('div.public-DraftEditor-content');
                if (!target) {
                    return;
                }

                clearInterval(detect_interval);

                import(chrome.runtime.getURL('common.js')).then(common => {
                    const blob = common.create_blob(response.base64image, response.type);

                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(new File([blob], response.title, { type: response.type }));

                    target.dispatchEvent(new DragEvent('drop', {
                        bubbles: true,
                        cancelable: true,
                        dataTransfer: dataTransfer,
                    }));
                });
            }, 500);
        } else {
            chrome.runtime.sendMessage({ msg: 'InvalidVideo' });
        }
    });
} catch {
    // service_worker not ready
}