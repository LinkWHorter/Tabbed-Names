const selectedImageDiv = document.getElementById('selectedImage');
const thumbnailsContainer = document.getElementById('thumbnails');
const addLayerButton = document.getElementById('addLayer');
const removeLayerButton = document.getElementById('removeLayer');
const layerSelectorButton = document.getElementById('layerSelector');
const layerPopup = document.getElementById('layerPopup');
const layerList = document.getElementById('layerList');

let layerCount = 0;
let activeLayerIndex = 0;
const layers = [];

// Функция для загрузки миниатюр
function loadThumbnails() {
    const imageNames = Array.from({ length: 17 }, (_, i) => `img${i + 1}.png`);
    
    imageNames.forEach(name => {
        const thumb = document.createElement('img');
        thumb.src = `imags/${name}`;
        thumb.alt = name;

        thumb.addEventListener('click', () => {
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
}

// Обновление кнопки выбора слоя с миниатюрой текущего слоя
function updateLayerSelectorButton() {
    if (layers[activeLayerIndex]) {
        layerSelectorButton.style.backgroundImage = layers[activeLayerIndex].style.backgroundImage;
        layerSelectorButton.style.backgroundSize = 'cover';
        layerSelectorButton.style.padding = '15px';
    } else {
        layerSelectorButton.style.backgroundImage = '';
    }
}

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
    // Используем html2canvas с параметром useCORS: true
    html2canvas(document.getElementById('selectedImage'), {
        useCORS: true, // Включаем CORS для изображений
        logging: true,  // Для отладки
        allowTaint: true // Разрешаем «загрязнённый» канвас
    }).then(function(canvas) {
        // Скачиваем картинку
        const link = document.createElement('a');
        link.download = 'image.png';   // Имя файла
        link.href = canvas.toDataURL('image/png'); // Преобразуем канвас в PNG
        link.click();  // Имитируем клик для скачивания
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
    resetResizeMode();
});

// Обновление масштаба слоя
function handleResize(event) {
    if (resizing && layers[activeLayerIndex]) {
        event.preventDefault();
        currentScale += event.deltaY * -0.001; // Увеличиваем/уменьшаем масштаб
        currentScale = Math.max(0.1, Math.min(currentScale, 5)); // Ограничиваем масштаб
        updateLayerScale(currentScale);
    }
}

// Применение масштаба к активному слою
function updateLayerScale(scale) {
    if (layers[activeLayerIndex]) {
        layers[activeLayerIndex].style.transform = `scale(${scale})`;
    }
}

// Сброс режима изменения размера
function resetResizeMode() {
    resizeControls.classList.add('hidden');
    resizeImageButton.disabled = false;
    saveImageButton.disabled = false;
    selectedImageDiv.removeEventListener('wheel', handleResize);
}

