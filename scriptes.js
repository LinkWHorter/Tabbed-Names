const selectedImageDiv = document.getElementById('selectedImage');
const thumbnailsContainer = document.getElementById('thumbnails');
const resizeScroller = document.getElementById('resizeScroller');  // Скроллер для изменения масштаба
const moveUpButton = document.getElementById('moveUp');
const moveDownButton = document.getElementById('moveDown');
const moveLeftButton = document.getElementById('moveLeft');
const moveRightButton = document.getElementById('moveRight');
const addLayerButton = document.getElementById('addLayer');
const removeLayerButton = document.getElementById('removeLayer');
const layerSelectorButton = document.getElementById('layerSelector');
const button = document.getElementById('toggleButton');
const presetButton = document.getElementById('presetButton');
const layerPopup = document.getElementById('layerPopup');
const layerList = document.getElementById('layerList');

let layerCount = 0;
let activeLayerIndex = 0;
let originalPosition = "0px 0px"; // Начальная позиция фона
const layers = [];

// Проверяем, был ли уже введен правильный пароль
const isPasswordEntered = localStorage.getItem('passwordEntered');
localStorage.setItem('passwordEntered', 'false');

// Функция для применения пресета
presetButton.addEventListener('click', () => {
    if (layers[activeLayerIndex]) {
        if(layers[activeLayerIndex].style.backgroundPosition === '30px -3px' && layers[activeLayerIndex].style.backgroundSize === '70%') {
            layers[activeLayerIndex].style.backgroundPosition = '36px 42px';
            presetButton.textContent = "Bod";
            layers[activeLayerIndex].style.backgroundSize = '70%';
        }
        else if(layers[activeLayerIndex].style.backgroundPosition === '36px 42px' && layers[activeLayerIndex].style.backgroundSize === '70%') {
            layers[activeLayerIndex].style.backgroundPosition = '0px 0px';
            presetButton.textContent = "Fac";
            layers[activeLayerIndex].style.backgroundSize = '100%';
        }
        else {
            layers[activeLayerIndex].style.backgroundPosition = '30px -3px';
            presetButton.textContent = "Fac";
            layers[activeLayerIndex].style.backgroundSize = '70%';
        }
    }
});

// Функция для загрузки миниатюр
function loadThumbnails() {
    const imageNames = Array.from({ length: 55 }, (_, i) => `img${i + 1}.png`);
    
    const columns = 5; // Количество элементов в строке
    let row = 1, col = 1;

    imageNames.forEach(name => {
        // Создаем контейнер для изображения и текста
        const thumbWrapper = document.createElement('div');
        thumbWrapper.style.position = 'relative';

        const thumb = document.createElement('img');
        thumb.src = `imags/icons/${name}`;
        thumb.alt = name;
        thumb.addEventListener('mouseenter', () => {
            // Apply the scale and background-color on hover
            thumb.style.transform = 'scale(1.15)';
            thumb.style.backgroundColor = 'rgba(225, 225, 225, 0.821325)';
        });
        thumb.addEventListener('mouseleave', () => {
            // Revert the styles when the hover effect ends
            if (button.textContent == 'On') {
                thumb.style.transform = 'scale(1)';
                thumb.style.backgroundColor = 'rgba(225, 225, 225, 0.5)'; // Remove the background color
            }
            if (button.textContent == 'Off') {
                thumb.style.transform = 'scale(1)';
                thumb.style.backgroundColor = 'rgba(225, 225, 225, 0.2)'; // Remove the background color
            }
        });

        thumb.addEventListener('click', () => {
            if (layerCount == 0) {
                addLayer();
            }
            if (layers[activeLayerIndex]) {
                layers[activeLayerIndex].style.backgroundImage = `url('imags/${name}')`;
                updateLayerSelectorPresettes();
                updateLayerList(); // Обновляем список слоев в попапе после выбора миниатюры
            }
        });

        // Создаем текст поверх изображения
        const textOverlay = document.createElement('span');
        textOverlay.textContent = `${row}.${col}`;
        textOverlay.style.position = 'absolute';
        textOverlay.style.top = '50%';
        textOverlay.style.left = '50%';
        textOverlay.style.transform = 'translate(-50%, -50%)';
        textOverlay.style.color = 'black';
        textOverlay.style.fontWeight = 'bold';
        textOverlay.style.fontSize = '14px';
        textOverlay.style.pointerEvents = 'none';
        textOverlay.style.display = 'none'; // По умолчанию скрыт

        // Добавляем элементы в контейнер
        thumbWrapper.appendChild(thumb);
        thumbWrapper.appendChild(textOverlay);
        thumbnailsContainer.appendChild(thumbWrapper);

        // Увеличиваем колонки и строки
        col++;
        if (col > columns) {
            col = 1;
            row++;
        }

        toggleThumbnailStyles();
    });
}

// Функция для переключения стилей
function toggleThumbnailStyles() {
    const thumbnails = document.querySelectorAll('#thumbnails img');
    const textOverlays = document.querySelectorAll('#thumbnails span');

    if (button.textContent === 'Off') {
        // Устанавливаем стили "Off"
        thumbnails.forEach(thumb => {
            thumb.style.backgroundColor = 'rgba(225, 225, 225, 0.5)';
            thumb.style.filter = 'blur(10px)';
            thumb.style.clipPath = 'inset(1px)';
        });
        textOverlays.forEach(text => {
            text.style.display = 'block'; // Показываем текст
        });
        thumbnailsContainer.style.backgroundImage = 'none';
        button.textContent = 'On';
    } else {
        // Устанавливаем стили "On"
        thumbnails.forEach(thumb => {
            thumb.style.backgroundColor = 'rgba(225, 225, 225, 0.2)';
            thumb.style.filter = 'none';
            thumb.style.clipPath = 'none';
        });
        textOverlays.forEach(text => {
            text.style.display = 'none'; // Показываем текст
        });
        thumbnailsContainer.style.backgroundImage = 'url("imags/assets/ofye-body-thumb.png")';
        button.textContent = 'Off';
    }
}

// Проверяем, был ли уже введен правильный пароль при нажатии на кнопку
document.getElementById('toggleButton').addEventListener('click', () => {
    // Если пароль ещё не введён, запрашиваем его
    if (localStorage.getItem('passwordEntered') === 'false') {
        const password = prompt('Введите пароль:');
        if (password === 'abc') {
            localStorage.setItem('passwordEntered', 'true'); // Сохраняем информацию о том, что пароль введён
            toggleThumbnailStyles();  // Переключаем режим
        }
    } else {
        // Если пароль уже введён, просто переключаем режим
        toggleThumbnailStyles();  // Переключаем режим
    }
});

// Функция для добавления слоя
function addLayer() {
    const newLayer = document.createElement('div');
    presetButton.textContent = "Fac";
    newLayer.classList.add('layer');
    newLayer.style.zIndex = layerCount + 1;
    selectedImageDiv.appendChild(newLayer);
    layers.push(newLayer);

    updateLayerList();
    selectLayer(layerCount);
    layerCount++;
}

// Функция для удаления верхнего слоя
function removeLayer() {
    if (layers.length > 0) {
        const layerToRemove = layers.pop();
        layerToRemove.remove();
        layerCount--;

        activeLayerIndex = Math.max(0, layerCount - 1);
        updateLayerList();
        selectLayer(activeLayerIndex);
    }
    if (layerCount == 0) {
        layerSelectorButton.textContent = "0";
    }
}

// Обновление кнопки выбора слоя с миниатюрой текущего слоя
function updateLayerSelectorPresettes() {
    presetButton.textContent = "Fac";
    /*if (layers[activeLayerIndex]) {
        layerSelectorButton.style.backgroundImage = layers[activeLayerIndex].style.backgroundImage;
        layerSelectorButton.style.backgroundSize = 'cover';
        layerSelectorButton.style.padding = '15px';
    } else {
        layerSelectorButton.style.backgroundImage = '';
    }*/
}

thumbnailsContainer.addEventListener("scroll", function () {
    const scrollTop = thumbnailsContainer.scrollTop; // Текущее значение прокрутки дива
    thumbnailsContainer.style.backgroundPosition = `0 ${-scrollTop * 1}px`; // Обновляем позицию фона
});

// Обновление списка слоев в всплывающем окне
function updateLayerList() {
    layerList.innerHTML = ''; // Очищаем старые элементы
    layers.forEach((layer, index) => {
        const listItem = document.createElement('li');
        const thumb = document.createElement('div');
        thumb.style.backgroundImage = layer.style.backgroundImage;
        thumb.style.width = '80px';
        thumb.style.height = '80px';
        thumb.style.backgroundSize = 'cover';
        thumb.style.marginRight = '45px';

        listItem.appendChild(thumb);
        listItem.appendChild(document.createTextNode(`${index + 1}`));
        
        listItem.addEventListener('click', () => {
            selectLayer(index);
            toggleLayerPopup();
        });

        layerList.appendChild(listItem);
    });

    updateLayerSelectorPresettes();
}

// Функция для выбора активного слоя
function selectLayer(index) {
    activeLayerIndex = index;
    layerSelectorButton.textContent = `${index + 1}`;
    updateLayerSelectorPresettes();
}

// Показать/скрыть всплывающее окно выбора слоя
function toggleLayerPopup() {
    layerPopup.classList.toggle('hidden');
}

// Обработчики событий для кнопок
addLayerButton.addEventListener('click', addLayer);
removeLayerButton.addEventListener('click', removeLayer);
layerSelectorButton.addEventListener('click', toggleLayerPopup);

window.addEventListener('DOMContentLoaded', loadThumbnails);

const saveImageButton = document.getElementById('saveImage');
const resizeImageButton = document.getElementById('resizeImage');
const resizeControls = document.getElementById('resizeControls');
const resizeConfirmButton = document.getElementById('resizeConfirm');
const resizeCancelButton = document.getElementById('resizeCancel');

let resizing = false;
let currentScale = 1; // Начальный масштаб
let originalScale = 1;

// Сохранение изображения через html2canvas
saveImageButton.addEventListener('click', () => {
    html2canvas(document.getElementById('selectedImage'), {
        useCORS: true, 
        logging: true,  
        allowTaint: true
    }).then(function(canvas) {
        const link = document.createElement('a');
        link.download = 'image.png';   
        link.href = canvas.toDataURL('image/png');
        link.click(); 
        
        // Опционально можно очистить ссылку для повторного использования
        setTimeout(() => {
            link.remove();
        }, 100); // Убираем ссылку после краткой задержки
    }).catch(function(error) {
        console.error("Ошибка при сохранении изображения:", error);
    });       
});

// Включение режима изменения размера
resizeImageButton.addEventListener('click', () => {
    resizing = true;
    resizeControls.classList.remove('hidden');
    resizeImageButton.disabled = true;
    saveImageButton.disabled = true;

    // Сохраняем начальную позицию фона и начальный масштаб
    if (layers[activeLayerIndex]) {
        originalPosition = layers[activeLayerIndex].style.backgroundPosition || "0px 0px";
        originalScale = currentScale;
    }

    // Обработка прокрутки мыши для изменения размера
    selectedImageDiv.addEventListener('wheel', handleResize);
});

// Подтверждение изменения размера
resizeConfirmButton.addEventListener('click', () => {
    resizing = false;
    originalScale = currentScale;
    resetResizeMode();
});

// Отмена изменения размера
resizeCancelButton.addEventListener('click', () => {
    resizing = false;
    currentScale = originalScale;
    updateLayerScale(currentScale);
    console.log(currentScale);

    // Сброс позиции фона на начальную
    if (layers[activeLayerIndex]) {
        layers[activeLayerIndex].style.backgroundPosition = originalPosition;
    } 

    resetResizeMode();
});

// Обновление масштаба слоя с учетом центра
function handleResize(event) {
    if (resizing && layers[activeLayerIndex]) {
        event.preventDefault();
        
        // Получаем текущее положение фона
        let currentPos = layers[activeLayerIndex].style.backgroundPosition.split(' ');
        let currentX = parseInt(currentPos[0] || 0, 10);
        let currentY = parseInt(currentPos[1] || 0, 10);
        
        // Если начальный масштаб был сохранен, вычисляем смещение
        const centerX = selectedImageDiv.offsetWidth / 2;
        const centerY = selectedImageDiv.offsetHeight / 2;

        // Применяем изменение масштаба
        currentScale += event.deltaY * -0.001; // Уменьшаем или увеличиваем масштаб
        currentScale = Math.max(0.1, Math.min(currentScale, 5)); // Ограничиваем диапазон масштаба

        // Вычисляем новые смещения, чтобы центр изображения оставался в центре
        let newX = centerX - (centerX - currentX) * currentScale / originalScale;
        let newY = centerY - (centerY - currentY) * currentScale / originalScale;

        // Обновляем стиль фона с новым масштабом и смещением
        layers[activeLayerIndex].style.backgroundSize = `${currentScale * 100}%`;

        // Обновляем сохраненные значения
        resizeScroller.value = currentScale;
        updateLayerScale(currentScale);
        console.log(currentScale);
    }
}

// Функция обновления масштаба с учетом центра
function updateLayerScale(scale) {
    if (layers[activeLayerIndex]) {
        // Получаем текущее положение фона
        let currentPos = layers[activeLayerIndex].style.backgroundPosition.split(' ');
        let currentX = parseInt(currentPos[0] || 0, 10);
        let currentY = parseInt(currentPos[1] || 0, 10);

        // Получаем размеры изображения
        const centerX = selectedImageDiv.offsetWidth / 2;
        const centerY = selectedImageDiv.offsetHeight / 2;

        // Вычисляем новые смещения
        let newX = centerX - (centerX - currentX) * scale / originalScale;
        let newY = centerY - (centerY - currentY) * scale / originalScale;

        // Обновляем стиль фона с новым масштабом и смещением
        layers[activeLayerIndex].style.backgroundSize = `${scale * 100}%`;

        // Сохраняем новый масштаб
        resizeScroller.value = currentScale;
        currentScale = scale;
        console.log(currentScale);
    }
}

// Сброс режима изменения размера
function resetResizeMode() {
    resizeControls.classList.add('hidden');
    resizeImageButton.disabled = false;
    saveImageButton.disabled = false;
    selectedImageDiv.removeEventListener('wheel', handleResize);
}

// Функция перемещения фона с учетом центра изображения
function moveBackground(x, y) {
    if (layers[activeLayerIndex]) {
        let currentPos = layers[activeLayerIndex].style.backgroundPosition.split(' ');
        let currentX = parseInt(currentPos[0] || 0, 10);
        let currentY = parseInt(currentPos[1] || 0, 10);

        // Получаем текущие размеры фона
        const backgroundWidth = layers[activeLayerIndex].offsetWidth;
        const backgroundHeight = layers[activeLayerIndex].offsetHeight;

        // Вычисляем смещение для центрирования
        const centerX = backgroundWidth / 2;
        const centerY = backgroundHeight / 2;

        // Обновляем смещение с учетом центра
        let newX = centerX - (centerX - currentX) + x;
        let newY = centerY - (centerY - currentY) + y;

        // Применяем новое положение фона
        layers[activeLayerIndex].style.backgroundPosition = `${newX}px ${newY}px`;
    }
}


// Обработчики для кнопок перемещения
moveUpButton.addEventListener('click', () => moveBackground(0, -3));
moveDownButton.addEventListener('click', () => moveBackground(0, 3));
moveLeftButton.addEventListener('click', () => moveBackground(-3, 0));
moveRightButton.addEventListener('click', () => moveBackground(3, 0));

// Обработчик для скроллера
resizeScroller.addEventListener('input', (event) => {
    const scaleValue = parseFloat(event.target.value); // Получаем текущее значение скроллера
    updateLayerScale(scaleValue);
});
