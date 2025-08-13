import(chrome.runtime.getURL('common.js')).then(common => {
    main(common);
});

function main(common) {
    try {
        chrome.runtime.sendMessage({ msg: 'GetScreenShot' }).then(response => {
            if (response.base64image) {
                const filename = `${response.title}.jpg`;

                const byteCharacters = atob(response.base64image);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const blob = new Blob([new Uint8Array(byteNumbers)], { type: 'image/jpeg' });
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(new File([blob], filename, { type: 'image/jpeg' }));

                chrome.storage.local.get(common.storage, data => {
                    if (common.value(data.download, common.default_download)) {
                        const a = document.createElement('a');
                        a.href = URL.createObjectURL(blob);
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    }
                });

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

                    target.dispatchEvent(new DragEvent('drop', {
                        bubbles: true,
                        cancelable: true,
                        dataTransfer: dataTransfer,
                    }));
                }, 500);
            } else {
                chrome.runtime.sendMessage({ msg: 'InvalidVideo' });
            }
        });
    } catch {
        // service_worker not ready
    }
}