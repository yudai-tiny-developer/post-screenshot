import(chrome.runtime.getURL('common.js')).then(common => {
    main(common);
});

function main(common) {
    try {
        chrome.runtime.sendMessage({ msg: 'GetScreenShot' }).then(base64image => {
            if (base64image) {
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

                    const byteCharacters = atob(base64image);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: 'image/jpeg' });
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(new File([blob], 'QuickPostScreenShot.jpg', { type: 'image/jpeg' }));

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