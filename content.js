let selectedAreas = []; // Массив для хранения выделенных областей
let isDrawing = false; // Переменная для отслеживания состояния рисования

// Функция для создания выделенной области
function createSelectionArea() {
    if (isDrawing) return; // Игнорируем попытки начать рисование, если уже рисуем
    isDrawing = true; // Устанавливаем флаг, что мы начали рисование

    // Создаем элемент для перекрытия
    const overlay = document.createElement("div");
    overlay.style.position = "fixed"; // Фиксированное положение на экране
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(255, 255, 255, 0.7)"; // Полупрозрачный цвет
    overlay.style.zIndex = 9998; // Задаем z-index чуть ниже выделяемой области
    overlay.style.pointerEvents = "auto"; // Позволяем блокировать события
    document.body.appendChild(overlay); // Добавляем перекрытие к body

    // Создаем элемент для выделенной области
    const selectionArea = document.createElement("div");
    selectionArea.style.position = "absolute"; // Абсолютное позиционирование
    selectionArea.style.border = "2px dashed rgba(255, 0, 0, 0.7)"; // Рамка выделенной области
    selectionArea.style.zIndex = 9999; // На верхнем слое
    selectionArea.style.pointerEvents = "none"; // Выделение не блокирует клики

    // Создаем кнопку "Закрыть"
    const closeButton = createButton("X", () => {
        // Удаляем выделенную область и очищаем массив
        document.body.removeChild(selectionArea);
        selectedAreas = selectedAreas.filter(area => area !== selectionArea);
        overlay.remove(); // Удаляем перекрытие
    });

    // Функция для создания кнопки "Сохранить" и обработки события нажатия
    const saveButton = createButton("Save", () => {
        // Извлекаем цвет рамки
        const originalBorderColor = selectionArea.style.borderColor;

        // Делаем рамку невидимой перед захватом
        selectionArea.style.borderColor = "transparent";
        selectionArea.style.display = "none"; // Скрываем выделенную область

        // Задержка перед захватом экрана
        setTimeout(() => {
            // Отправляем сообщение фонового скрипту для захвата изображения
            chrome.runtime.sendMessage({ action: 'captureVisibleTab' }, (response) => {
                if (response.success) {
                    // Создаем элемент изображения для обработки скриншота
                    const img = new Image();
                    img.src = response.imgUrl;
                    img.onload = function () {
                        // Создаем canvas для обработки скриншота
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        const rect = selectionArea.getBoundingClientRect(); // Получаем размеры выделенной области
                        canvas.width = rect.width; // Устанавливаем ширину canvas
                        canvas.height = rect.height; // Устанавливаем высоту canvas

                        // Рисуем на canvas только нужную часть скриншота
                        ctx.drawImage(img, rect.left, rect.top, rect.width, rect.height, 0, 0, rect.width, rect.height);
                        // Преобразуем обрезанное изображение в Data URL
                        const croppedImgSrc = canvas.toDataURL('image/png');
                        // Сохраняем или обрабатываем полученное изображение
                        downloadImage(croppedImgSrc);
                    };
                } else {
                    console.error("Ошибка при захвате видимой вкладки");
                    selectionArea.style.borderColor = originalBorderColor; // Вернуть исходный цвет на случай ошибки
                }
                // Возвращаем исходный цвет рамки и показываем область снова
                selectionArea.style.borderColor = originalBorderColor;
                selectionArea.style.display = ""; // Показываем выделенную область обратно
            });
        }, 100); // Задержка в 100 мс (можно изменить значение по необходимости)
    });

    // Функция для скачивания изображения
    function downloadImage(dataUrl) {
        const link = document.createElement('a'); // Создаем элемент ссылки
        link.href = dataUrl; // Устанавливаем URL изображения
        link.download = 'screenshot.png'; // Устанавливаем имя файла
        link.click(); // Эмулируем клик для загрузки
    }

    // Устанавливаем позиции кнопок на выделенной области
    closeButton.style.top = "5px";
    closeButton.style.left = "5px";
    saveButton.style.top = "5px";
    saveButton.style.right = "5px";

    // Добавляем кнопки в выделенную область
    selectionArea.appendChild(closeButton);
    selectionArea.appendChild(saveButton);

    // Скрываем кнопки изначально
    closeButton.style.opacity = 0;
    saveButton.style.opacity = 0;

    // Эффект появления кнопок при наведении над выбором
    selectionArea.addEventListener('mouseenter', () => {
        closeButton.style.transition = "opacity 0.2s";
        saveButton.style.transition = "opacity 0.2s";
        closeButton.style.opacity = 1; // Появление кнопки "Закрыть"
        saveButton.style.opacity = 1; // Появление кнопки "Сохранить"
    });

    // Эффект скрытия кнопок при покидании области выделения
    selectionArea.addEventListener('mouseleave', () => {
        closeButton.style.opacity = 0; // Скрытие кнопки "Закрыть"
        saveButton.style.opacity = 0; // Скрытие кнопки "Сохранить"
    });

    document.body.appendChild(selectionArea); // Добавляем выделенную область к body

    let startX, startY; // Переменные для хранения начальных координат

    overlay.addEventListener('mousedown', (e) => {
        startX = e.pageX; // Установка начальной координаты X
        startY = e.pageY; // Установка начальной координаты Y
        selectionArea.style.left = `${startX}px`; // Установка начального положения области
        selectionArea.style.top = `${startY}px`;
        selectionArea.style.width = '0px'; // Начальная ширина области
        selectionArea.style.height = '0px'; // Начальная высота области

        // Обработчик движения мыши, чтобы изменять размеры выделенной области
        const onMouseMove = (e) => {
            const currentX = e.pageX; // Текущая позиция мыши по X
            const currentY = e.pageY; // Текущая позиция мыши по Y
            selectionArea.style.width = Math.abs(currentX - startX) + 'px'; // Изменяем ширину в зависимости от движения мыши
            selectionArea.style.height = Math.abs(currentY - startY) + 'px'; // Изменяем высоту
            selectionArea.style.left = `${Math.min(currentX, startX)}px`; // Устанавливаем левую границу выделения
            selectionArea.style.top = `${Math.min(currentY, startY)}px`; // Устанавливаем верхнюю границу выделения
        };

        // Добавляем обработчик движения мыши
        overlay.addEventListener('mousemove', onMouseMove);

        // Обработчик завершения выделения
        overlay.addEventListener('mouseup', () => {
            overlay.removeEventListener('mousemove', onMouseMove); // Удаляем обработчик движения мыши
            selectionArea.style.pointerEvents = "auto"; // Позволяем взаимодействие с выделенной областью

            // Добавляем выделение в список
            selectedAreas.push(selectionArea);

            // Включаем возможность изменения размера и перетаскивания выделенной области
            enableResizingAndDragging(selectionArea, closeButton, saveButton); // Передаем кнопки

            // Удаляем overlay после завершения выделения
            document.body.removeChild(overlay);
            isDrawing = false; // Сбрасываем флаг рисования
        }, { once: true }); // Указание для единственного срабатывания события
    }, { once: true }); // Указание для единственного срабатывания события
}

// Функция для создания кнопки с текстом и обработчиком события
function createButton(text, onClick) {
    const button = document.createElement("button"); // Создаем кнопку
    button.innerHTML = text; // Устанавливаем текст кнопки
    button.style.position = "absolute"; // Абсолютное позиционирование
    button.style.zIndex = 10000; // Над выделенной областью
    button.style.cursor = "pointer"; // Курсор - указатель
    button.style.background = text === "Save" ? "blue" : "red"; // Цвет кнопки "Save" синий и "Close" красный
    button.style.border = "none"; // Убираем границу
    button.style.color = "white"; // Цвет текста
    button.style.borderRadius = "3px"; // Закругленные края
    button.style.padding = "5px"; // Отступы внутри кнопки
    button.style.fontSize = "12px"; // Размер шрифта

    // Обработчик клика по кнопке
    button.addEventListener('click', (event) => {
        event.stopPropagation(); // Останавливаем распространение события, чтобы избежать перетаскивания
        onClick(); // Вызываем переданный обработчик
    });

    return button; // Возвращаем созданную кнопку
}

// Функция для включения изменения размера и перетаскивания выделенной области
function enableResizingAndDragging(selectionArea, closeButton, saveButton) {
    let isResizing = false;
    let isDragging = false;
    let startX, startY, origX, origY; // Начальные координаты
    let startWidth, startHeight; // Начальные размеры выделенной области

    // Добавляем элемент для изменения размера
    const resizeHandle = document.createElement("div");
    resizeHandle.style.position = "absolute"; // Абсолютное позиционирование
    resizeHandle.style.width = "10px"; // Ширина ручки
    resizeHandle.style.height = "10px"; // Высота ручки
    resizeHandle.style.background = "blue"; // Цвет ручки
    resizeHandle.style.cursor = "nwse-resize"; // Указатель при наведении
    resizeHandle.style.right = "-5px"; // Позиция в правом нижнем углу
    resizeHandle.style.bottom = "-5px";
    selectionArea.appendChild(resizeHandle); // Добавляем ручку к выделенной области

    // Обработчик мыши для изменения размера
    resizeHandle.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Предотвращаем стандартное поведение
        isResizing = true; // Устанавливаем флаг изменения размера
        startX = e.clientX; // Начальная позиция X
        startY = e.clientY; // Начальная позиция Y
        startWidth = parseInt(window.getComputedStyle(selectionArea).width, 10); // Начальная ширина выделенной области
        startHeight = parseInt(window.getComputedStyle(selectionArea).height, 10); // Начальная высота
        origX = parseInt(selectionArea.style.left, 10); // Оригинальная позиция X
        origY = parseInt(selectionArea.style.top, 10); // Оригинальная позиция Y

        document.addEventListener('mousemove', resize); // Обработчик движения мыши для изменения размера
        document.addEventListener('mouseup', stopResize); // Обработчик завершения изменения размера
    });

    // Обработчик мыши для перетаскивания выделенной области
    selectionArea.addEventListener('mousedown', (e) => {
        if (e.target !== resizeHandle) { // Убедитесь, что мы не перетаскиваем, когда нажимаем на ручку изменения размера
            isDragging = true; // Устанавливаем флаг перетаскивания
            origX = parseInt(selectionArea.style.left, 10); // Оригинальная позиция X
            origY = parseInt(selectionArea.style.top, 10); // Оригинальная позиция Y
            startX = e.clientX; // Начальная позиция мыши по X
            startY = e.clientY; // Начальная позиция мыши по Y

            document.addEventListener('mousemove', drag); // Обработчик движения мыши для перетаскивания
            document.addEventListener('mouseup', stopDrag); // Обработчик завершения перетаскивания
        }
    });

    // Функция изменения размера
    function resize(e) {
        if (isResizing) {
            selectionArea.style.width = `${Math.max(startWidth + (e.clientX - startX), 0)}px`; // Обновление ширины
            selectionArea.style.height = `${Math.max(startHeight + (e.clientY - startY), 0)}px`; // Обновление высоты
        }
    }

    // Функция перетаскивания
    function drag(e) {
        if (isDragging) {
            selectionArea.style.left = `${origX + (e.clientX - startX)}px`; // Обновление позиции X
            selectionArea.style.top = `${origY + (e.clientY - startY)}px`; // Обновление позиции Y
        }
    }

    // Функция для остановки изменения размера
    function stopResize() {
        isResizing = false; // Сбрасываем флаг изменения размера
        document.removeEventListener('mousemove', resize); // Удаляем обработчик
        document.removeEventListener('mouseup', stopResize); // Удаляем обработчик завершения
    }

    // Функция для остановки перетаскивания
    function stopDrag() {
        isDragging = false; // Сбрасываем флаг перетаскивания
        document.removeEventListener('mousemove', drag); // Удаляем обработчик
        document.removeEventListener('mouseup', stopDrag); // Удаляем обработчик завершения
    }
}

// Обработчик сообщений от фонового скрипта
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    console.log("Message received:", request); // Логируем полученное сообщение
    if (request.action === 'selectArea') {
        await createSelectionArea(); // Запускаем создание выделенной области
        sendResponse({ success: true }); // Отправляем ответ об успешном выполнении
    }
});