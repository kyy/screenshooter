document.getElementById('capture').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0 && tabs[0].id) {
            console.log("Active tab:", tabs[0]); // Логируем информацию о активной вкладке  
            chrome.tabs.sendMessage(tabs[0].id, { action: 'selectArea' }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message); // Логируем ошибку  
                } else {
                    console.log("Response received:", response); // Логируем ответ  
                }
            });
        } else {
            console.error("No active tabs found."); // Логируем, если нет активных вкладок  
        }
    });
});