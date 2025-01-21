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

    // Создаем кнопки
    const closeButton = createButton("X", () => {
        // Удаляем выделенную область и очищаем массив
        document.body.removeChild(selectionArea);
        selectedAreas = selectedAreas.filter(area => area !== selectionArea);
        overlay.remove();
    });

    // Функция для создания кнопки "Save" и обработки события нажатия
    const saveButton = createButton("Save", () => {
        // Отправляем сообщение фонового скрипту для захвата изображения
        chrome.runtime.sendMessage({ action: 'captureVisibleTab' }, (response) => {
            if (response.success) {
                // Создаем элемент изображения для обработки скриншота
                const img = new Image();
                img.src = response.imgUrl;
                img.onload = function () {
                    // Создаем canvas для обработки скриншота и т.д.
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const rect = selectionArea.getBoundingClientRect();
                    canvas.width = rect.width;
                    canvas.height = rect.height;

                    // Рисуем на canvas только нужную часть скриншота
                    ctx.drawImage(img, rect.left, rect.top, rect.width, rect.height, 0, 0, rect.width, rect.height);
                    // Преобразуем обрезанное изображение в Data URL
                    const croppedImgSrc = canvas.toDataURL('image/png');
                    // Сохраняем или обрабатываем полученное изображение
                    downloadImage(croppedImgSrc);
                };
            } else {
                console.error("Ошибка при захвате видимой вкладки");
            }
        });
    });

    // Функция для скачивания изображения
    function downloadImage(dataUrl) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'screenshot.png';
        link.click();
    }

    // Устанавливаем позиции кнопок
    closeButton.style.top = "5px";
    closeButton.style.left = "5px";
    saveButton.style.top = "5px";
    saveButton.style.right = "5px";

    selectionArea.appendChild(closeButton);
    selectionArea.appendChild(saveButton);

    // Скрываем кнопки изначально
    closeButton.style.opacity = 0;
    saveButton.style.opacity = 0;

    // Эффект появления кнопок при наведении
    selectionArea.addEventListener('mouseenter', () => {
        closeButton.style.transition = "opacity 0.2s";
        saveButton.style.transition = "opacity 0.2s";
        closeButton.style.opacity = 1;
        saveButton.style.opacity = 1;
    });

    selectionArea.addEventListener('mouseleave', () => {
        closeButton.style.opacity = 0;
        saveButton.style.opacity = 0;
    });

    document.body.appendChild(selectionArea);

    let startX, startY;

    overlay.addEventListener('mousedown', (e) => {
        startX = e.pageX;
        startY = e.pageY;
        selectionArea.style.left = `${startX}px`;
        selectionArea.style.top = `${startY}px`;
        selectionArea.style.width = '0px';
        selectionArea.style.height = '0px';

        const onMouseMove = (e) => {
            const currentX = e.pageX;
            const currentY = e.pageY;
            selectionArea.style.width = Math.abs(currentX - startX) + 'px';
            selectionArea.style.height = Math.abs(currentY - startY) + 'px';
            selectionArea.style.left = `${Math.min(currentX, startX)}px`;
            selectionArea.style.top = `${Math.min(currentY, startY)}px`;
        };

        overlay.addEventListener('mousemove', onMouseMove);

        overlay.addEventListener('mouseup', () => {
            overlay.removeEventListener('mousemove', onMouseMove);
            selectionArea.style.pointerEvents = "auto"; // Позволяем взаимодействие с выделением

            // Добавляем выделение в список
            selectedAreas.push(selectionArea);

            enableResizingAndDragging(selectionArea, closeButton, saveButton); // Передаем кнопки

            // Удаляем overlay после завершения выделения
            document.body.removeChild(overlay);
        }, { once: true });
    }, { once: true });
}

function createButton(text, onClick) {
    const button = document.createElement("button");
    button.innerHTML = text;
    button.style.position = "absolute";
    button.style.zIndex = 10000; // Над выделенной областью
    button.style.cursor = "pointer";
    button.style.background = text === "Save" ? "blue" : "red"; // Цвет кнопки "Save" синий и кнопки "Close" красный
    button.style.border = "none";
    button.style.color = "white";
    button.style.borderRadius = "3px";
    button.style.padding = "5px";
    button.style.fontSize = "12px";

    // Обработчик клика
    button.addEventListener('click', (event) => {
        event.stopPropagation(); // Останавливаем распространение события, чтобы избежать перетаскивания
        onClick();
    });

    return button;
}

function enableResizingAndDragging(selectionArea, closeButton, saveButton) {
    let isResizing = false;
    let isDragging = false;
    let startX, startY, origX, origY;
    let startWidth, startHeight;

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
        startWidth = parseInt(window.getComputedStyle(selectionArea).width, 10);
        startHeight = parseInt(window.getComputedStyle(selectionArea).height, 10);
        origX = parseInt(selectionArea.style.left, 10);
        origY = parseInt(selectionArea.style.top, 10);

        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
    });

    // Перетаскивание рамки
    selectionArea.addEventListener('mousedown', (e) => {
        if (e.target !== resizeHandle) { // Убедитесь, что мы не перетаскиваем, когда нажимаем на ручку изменениия размера
            isDragging = true;
            origX = parseInt(selectionArea.style.left, 10);
            origY = parseInt(selectionArea.style.top, 10);
            startX = e.clientX;
            startY = e.clientY;

            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', stopDrag);
        }
    });

    function resize(e) {
        if (isResizing) {
            selectionArea.style.width = `${Math.max(startWidth + (e.clientX - startX), 0)}px`;
            selectionArea.style.height = `${Math.max(startHeight + (e.clientY - startY), 0)}px`;
        }
    }

    function drag(e) {
        if (isDragging) {
            selectionArea.style.left = `${origX + (e.clientX - startX)}px`;
            selectionArea.style.top = `${origY + (e.clientY - startY)}px`;
        }
    }

    function stopResize() {
        isResizing = false;
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
    }

    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);
    }
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    console.log("Message received:", request);
    if (request.action === 'selectArea') {
        await createSelectionArea(); // Запускаем создание выделенной области
        sendResponse({ success: true });
    }
});
