function createSelectionArea() {
    // Создаем элемент для перекрытия
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(255, 255, 255, 0.7)"; // Полупрозрачный цвет
    overlay.style.zIndex = 9998; // Чуть ниже выделения области
    overlay.style.pointerEvents = "auto"; // Позволяет блокировать события
    document.body.appendChild(overlay);

    const selectionArea = document.createElement("div");
    selectionArea.style.position = "absolute";
    selectionArea.style.border = "2px dashed rgba(255, 0, 0, 0.7)";
    selectionArea.style.zIndex = 9999; // На верхнем слое
    selectionArea.style.pointerEvents = "none"; // Чтобы выделение не блокировало клики

    let startX, startY;

    overlay.addEventListener('mousedown', (e) => {
        startX = e.pageX;
        startY = e.pageY;
        selectionArea.style.left = `${startX}px`;
        selectionArea.style.top = `${startY}px`;
        selectionArea.style.width = '0px';
        selectionArea.style.height = '0px';

        document.body.appendChild(selectionArea);

        const onMouseMove = (e) => {
            selectionArea.style.width = Math.abs(e.pageX - startX) + 'px';
            selectionArea.style.height = Math.abs(e.pageY - startY) + 'px';
            selectionArea.style.left = `${Math.min(e.pageX, startX)}px`;
            selectionArea.style.top = `${Math.min(e.pageY, startY)}px`;
        };

        overlay.addEventListener('mousemove', onMouseMove);

        overlay.addEventListener('mouseup', () => {
            overlay.removeEventListener('mousemove', onMouseMove);
            const rect = selectionArea.getBoundingClientRect();
            chrome.runtime.sendMessage({ rect: rect }, (response) => {
                console.log('Screenshot captured:', response);
            });
            document.body.removeChild(selectionArea);
            document.body.removeChild(overlay); // Удаляем overlay после завершения выделения
        }, { once: true });
    }, { once: true });
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    console.log("Message received:", request);
    if (request.action === 'selectArea') {
        await createSelectionArea(); // Можно сделать асинхронным
        sendResponse({ success: true });
    }
});