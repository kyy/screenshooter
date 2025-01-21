chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Background script received:", request);
    if (request.action === 'captureVisibleTab') {
        chrome.tabs.captureVisibleTab(null, { format: 'png' }, function (dataUrl) {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                sendResponse({ success: false });
                return;
            }
            sendResponse({ success: true, imgUrl: dataUrl });
        });
        return true; // Убедитесь, что возвращаете true для асинхронного ответа
    }
});
