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
const layerPopup = document.getElementById('layerPopup');
const layerList = document.getElementById('layerList');

let layerCount = 0;
let activeLayerIndex = 0;
let originalPosition = "0px 0px"; // Начальная позиция фона
const layers = [];

// Функция для загрузки миниатюр
function loadThumbnails() {
    const imageNames = Array.from({ length: 55 }, (_, i) => `img${i + 1}.png`);
    
    imageNames.forEach(name => {
        const thumb = document.createElement('img');
        thumb.src = `imags/icons/${name}`;
        thumb.alt = name;

        thumb.addEventListener('click', () => {
            if (layerCount == 0) {
                addLayer();
            }
            if (layers[activeLayerIndex]) {
                layers[activeLayerIndex].style.backgroundImage = `url('imags/${name}')`;
                updateLayerSelectorButton();
                updateLayerList(); // Обновляем список слоев в попапе после выбора миниатюры
            }
        });

        thumbnailsContainer.appendChild(thumb);
    });
}

// Функция для добавления слоя
function addLayer() {
    const newLayer = document.createElement('div');
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
function updateLayerSelectorButton() {
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

    updateLayerSelectorButton();
}

// Функция для выбора активного слоя
function selectLayer(index) {
    activeLayerIndex = index;
    layerSelectorButton.textContent = `${index + 1}`;
    updateLayerSelectorButton();
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
