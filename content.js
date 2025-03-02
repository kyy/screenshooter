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

    // Создаем контейнер для основных кнопок
    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex"; // Стили для кнопок
    buttonContainer.style.justifyContent = "space-between";
    buttonContainer.style.alignItems = "center";
    buttonContainer.style.gap = "5px"; // Промежуток между кнопками
    buttonContainer.style.margin = "5px 5px"; // Отступ от рамки
    selectionArea.appendChild(buttonContainer); // Добавляем контейнер к выделенной области

    // Создаем контейнер для Соц-сетей
    const socialButtonsContainer = document.createElement("div");
    socialButtonsContainer.style.position = "absolute"; // Абсолютное позиционирование
    socialButtonsContainer.style.top = "70px"; // От верхнего края
    socialButtonsContainer.style.right = "0px"; // От правого края
    socialButtonsContainer.style.display = "none"; // Изначально скрыть
    buttonContainer.appendChild(socialButtonsContainer); // Добавляем контейнер к buttonContainer


    // Всплывающее сообщение для уведомления пользователя
    function showTemporaryMessage(message) {
        const messageContainer = document.createElement("div");
        messageContainer.innerHTML = message; // Устанавливаем содержимое сообщения
        messageContainer.style.position = "absolute"; // Абсолютное позиционирование
        messageContainer.style.top = "50%"; // Центрировать по вертикали
        messageContainer.style.left = "50%"; // Центрировать по горизонтали
        messageContainer.style.transform = "translate(-50%, -50%)"; // Подвинуть на половину ширины и высоты
        messageContainer.style.background = "rgba(0, 0, 0, 0.7)"; // Полупрозрачный фон
        messageContainer.style.color = "white"; // Цвет текста
        messageContainer.style.padding = "10px"; // Отступы
        messageContainer.style.borderRadius = "5px"; // Закругленные края
        messageContainer.style.zIndex = "10000"; // Поднимать над остальным контентом
        buttonContainer.appendChild(messageContainer); // Добавляем сообщение к контейнеру кнопок

        // Удаление сообщения через t секунды
        setTimeout(() => {
            buttonContainer.removeChild(messageContainer); // Удаляем сообщение
        }, 1200); // 
    }

    // Функция для создания основных кнопок и обработчиком события
    function createButton(text, onClick, options = {}) {
        const button = document.createElement("button"); // Создаем кнопку
        button.innerHTML = text; // Устанавливаем текст кнопки

        // Применяем заданные классы и стили из options
        if (options.className) {
            button.className = options.className; // Устанавливаем классы кнопки
        }

        if (options.style) {
            Object.assign(button.style, options.style); // Устанавливаем стили
        }

        button.style.cursor = "pointer"; // Курсор - указатель
        button.style.border = "none"; // Убираем границу
        button.style.borderRadius = "3px"; // Закругленные края
        button.style.padding = "5px"; // Отступы внутри кнопки
        button.style.fontSize = "12px"; // Размер шрифта
        button.style.color = "white"; // Цвет шрифта

        // Обработчик клика по кнопке
        button.addEventListener('click', (event) => {
            event.stopPropagation(); // Останавливаем распространение события
            onClick(); // Вызываем переданный обработчик
        });

        buttonContainer.appendChild(button); // Добавляем кнопку в контейнер
        return button; // Возвращаем созданную кнопку
    }


    // Функция для создания кнопок соц-сетей
    function createSocialButton(text, onClick) {
        const button = document.createElement("button"); // Создаем кнопку
        button.innerHTML = text; // Устанавливаем текст кнопки
        button.style.cursor = "pointer"; // Указатель
        button.style.border = "none"; // Убираем границу
        button.style.borderRadius = "3px"; // Закругленные края
        button.style.padding = "5px"; // Отступы
        button.style.fontSize = "12px"; // Размер шрифта
        button.style.color = "white"; // Цвет шрифта
        button.style.background = "black"; // Цвет фона кнопки
        button.style.margin = "5px"; // Отступ между кнопками

        // Добавляем обработчик событий на кнопку
        button.addEventListener('click', onClick);
        socialButtonsContainer.appendChild(button); // Добавляем кнопку в контейнер
        return button; // Возвращаем созданную кнопку
    }


    // Функция для обработки изображения (для кнопок "Save" и "Copy")
    function handleImage(method) {
        const originalBorderColor = selectionArea.style.borderColor; // Извлекаем цвет рамки

        selectionArea.style.borderColor = "transparent"; // Делаем рамку невидимой перед захватом
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
                        const canvas = document.createElement('canvas'); // Создаем canvas для обработки скриншота
                        const ctx = canvas.getContext('2d');
                        const rect = selectionArea.getBoundingClientRect(); // Получаем размеры выделенной области
                        canvas.width = rect.width; // Устанавливаем ширину canvas
                        canvas.height = rect.height; // Устанавливаем высоту canvas

                        // Рисуем на canvas только нужную часть скриншота
                        ctx.drawImage(img, rect.left, rect.top, rect.width, rect.height, 0, 0, rect.width, rect.height);
                        const croppedImgSrc = canvas.toDataURL('image/png'); // Преобразуем обрезанное изображение в Data URL

                        // Здесь логика для скачивания или копирования
                        if (method == "copy") {
                            copyImage(croppedImgSrc); // Логика для копирования изображения в буфер обмена
                        } else if (method == "save") {
                            downloadImage(croppedImgSrc); // Сохраняем или обрабатываем полученное изображение
                        }
                    };
                } else {
                    console.error("Ошибка при захвате видимой вкладки");
                    selectionArea.style.borderColor = originalBorderColor; // Вернуть исходный цвет на случай ошибки
                }

                // Возвращаем исходный цвет рамки и показываем область снова
                selectionArea.style.borderColor = originalBorderColor;
                selectionArea.style.display = ""; // Показываем выделенную область обратно
            });
        }, 100); // Задержка в 100 мс
    }

    // Функция для копирования изображения в буфер обмена
    async function copyImage(dataUrl) {
        try {
            const blob = await fetch(dataUrl).then(res => res.blob()); // Получаем Blob-изображение
            const item = new ClipboardItem({ 'image/png': blob }); // Создаем элемент для буфера обмена
            await navigator.clipboard.write([item]); // Пишем изображение в буфер обмена
            showTemporaryMessage('Изображение скопировано в буфер обмена!'); // Показываем всплывающее сообщение
        } catch (err) {
            console.error('Ошибка при копировании изображения: ', err);
            showTemporaryMessage('Ошибка при копировании изображения!'); // Показываем сообщение об ошибке
        }
    }

    // Кнопка "Закрыть" (Close Button)
    const closeButton = createButton("X", () => {
        document.body.removeChild(selectionArea);
        selectedAreas = selectedAreas.filter(area => area !== selectionArea);
        overlay.remove(); // Удаляем перекрытие
    }, {
        className: "close-button",
        style: {
            background: "red",
        }
    });

    // Кнопка "Save" (Сохранить)
    const saveButton = createButton("Save", () => {
        handleImage("save"); // Передаем для сохранения
    }, {
        className: "save-button",
        style: {
            background: "blue",
            position: "absolute", // Позиционируем абсолютно
            top: "5px", // От верхнего края
            right: "5px" // От правого края
        }
    });

    // Кнопка "Copy" (Копировать)
    const copyButton = createButton("Copy", () => {
        handleImage("copy"); // Передаем для копирования
    }, {
        className: "copy-button",
        style: {
            background: "orange",
            position: "absolute", // Позиционируем абсолютно
            top: "5px", // От верхнего края
            right: "55px" // От правого края (для размещения рядом с кнопкой "Save")
        }
    });

    // Кнопка "Отправить" (Send Button)
    const sendButton = createButton("Send", () => {
        // Показать или скрыть контейнер с социальными кнопками
        socialButtonsContainer.style.display = (socialButtonsContainer.style.display === 'none' || socialButtonsContainer.style.display === '') ? 'block' : 'none';
    }, {
        className: "send-button",
        style: {
            background: "green",
            position: "absolute", // Позиционируем абсолютно
            top: "40px", // Устанавливаем отступ сверху для размещения под кнопкой "Сохранить"
            right: "5px" // Оставляем то же самое для правого края
        }
    });

    // Создаем кнопки Telegram и Viber
    createSocialButton("Telegram", () => {
        alert("Telegram button clicked!");
        // Логика для отправки через Telegram
    });

    createSocialButton("Viber", () => {
        alert("Viber button clicked!");
        // Логика для отправки через Viber
    });

    // Обработчик для скрытия контейнера с социальными кнопками
    selectionArea.addEventListener('mouseleave', () => {
        socialButtonsContainer.style.display = 'none'; // Скрыть контейнер при выходе за пределы
    });

    // Скрываем кнопки изначально
    buttonContainer.style.opacity = 0;

    // Эффект появления кнопок при наведении над выбором
    selectionArea.addEventListener('mouseenter', () => {
        buttonContainer.style.transition = "opacity 0.2s";
        buttonContainer.style.opacity = 1; // Появление кнопок
    });

    // Эффект скрытия кнопок при покидании области выделения
    selectionArea.addEventListener('mouseleave', () => {
        buttonContainer.style.opacity = 0; // Скрытие кнопок
    });

    document.body.appendChild(selectionArea); // Добавляем выделенную область к body

    // Функция для скачивания изображения
    function downloadImage(dataUrl) {
        const link = document.createElement('a'); // Создаем элемент ссылки
        link.href = dataUrl; // Устанавливаем URL изображения
        link.download = 'screenshot.png'; // Устанавливаем имя файла
        link.click(); // Эмулируем клик для загрузки
    }

    let startX, startY; // Переменные для хранения начальных координат

    // Обработчик мыши для начала рисования
    overlay.addEventListener('mousedown', (e) => {
        startX = e.pageX; // Начальная координата X
        startY = e.pageY; // Начальная координата Y
        selectionArea.style.left = `${startX}px`; // Установка начального положения области
        selectionArea.style.top = `${startY}px`;
        selectionArea.style.width = '0px'; // Начальная ширина области
        selectionArea.style.height = '0px'; // Начальная высота области

        // Обработчик движения мыши, чтобы изменять размеры выделенной области
        const onMouseMove = (e) => {
            const currentX = e.pageX; // Текущая позиция мыши по X
            const currentY = e.pageY; // Текущая позиция мыши по Y
            selectionArea.style.width = Math.abs(currentX - startX) + 'px'; // Изменяем ширину
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
            enableResizingAndDragging(selectionArea); // Передаем только выделенную область

            // Удаляем overlay после завершения выделения
            document.body.removeChild(overlay);
            isDrawing = false; // Сбрасываем флаг рисования
        }, { once: true }); // Указание для единственного срабатывания события
    }, { once: true }); // Указание для единственного срабатывания события
}

// Функция для включения изменения размера и перетаскивания выделенной области
function enableResizingAndDragging(selectionArea) {
    let isResizing = false; // Флаг для отслеживания изменения размера
    let isDragging = false; // Флаг для отслеживания перетаскивания
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
        startWidth = parseInt(window.getComputedStyle(selectionArea).width, 10); // Начальная ширина
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