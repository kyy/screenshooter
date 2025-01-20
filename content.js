let selectedAreas = []; // Массив для хранения выделенных областей

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
        selectionArea.style.pointerEvents = "none"; // Показываем, что выделение не интерактивно

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

            // Получаем прямоугольник выделенной области
            const rect = selectionArea.getBoundingClientRect();
            chrome.runtime.sendMessage({ rect: rect }, (response) => {
                console.log('Screenshot captured:', response);
            });

            // Добавляем выделение в список и удаляем предыдущие
            selectedAreas.forEach(area => document.body.removeChild(area));
            selectedAreas = [selectionArea];

            // Теперь добавим возможность изменять размер выделенной области
            enableResizing(selectionArea);

            document.body.removeChild(overlay); // Удаляем overlay после завершения выделения
        }, { once: true });
    }, { once: true });
}

function enableResizing(selectionArea) {
    selectionArea.style.pointerEvents = "auto"; // Позволяем клики по выделенной области

    let isResizing = false;
    let startX, startY, startWidth, startHeight;

    // Добавляем элемент для изменения размера
    const resizeHandle = document.createElement("div");
    resizeHandle.style.position = "absolute";
    resizeHandle.style.width = "10px";
    resizeHandle.style.height = "10px";
    resizeHandle.style.background = "blue";
    resizeHandle.style.cursor = "nwse-resize"; // Указатель при наведении
    resizeHandle.style.right = "-5px"; // Позиция в правом нижнем углу
    resizeHandle.style.bottom = "-5px";
    selectionArea.appendChild(resizeHandle);

    resizeHandle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(document.defaultView.getComputedStyle(selectionArea).width, 10);
        startHeight = parseInt(document.defaultView.getComputedStyle(selectionArea).height, 10);

        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
    });

    function resize(e) {
        if (isResizing) {
            selectionArea.style.width = `${Math.max(startWidth + e.clientX - startX, 0)}px`;
            selectionArea.style.height = `${Math.max(startHeight + e.clientY - startY, 0)}px`;
        }
    }

    function stopResize() {
        isResizing = false;
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
    }
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    console.log("Message received:", request);
    if (request.action === 'selectArea') {
        await createSelectionArea(); // Можно сделать асинхронным
        sendResponse({ success: true });
    }
});