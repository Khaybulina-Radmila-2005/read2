pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cloudflare.com';

let sentences = [];
let currentIndex = 0;
let audioPlayer = new Audio();
let isPlaying = false;

// Постраничное извлечение текста и управление индикатором выполнения
async function loadPdf() {
    const fileInput = document.getElementById('pdfFile');
    const status = document.getElementById('status');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');

    if (fileInput.files.length === 0) return;

    // Включаем отображение индикатора перед началом вычислений
    progressContainer.style.display = "block";
    progressBar.style.width = "0%";
    progressBar.innerText = "0%";
    status.innerText = "Подготовка файла книги...";
    document.getElementById('playBtn').disabled = true;

    const file = fileInput.files[0];
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let rawText = "";
    const totalPages = pdf.numPages; // Общее количество страниц в файле

    // Проходим циклом по каждой странице книги
    for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        rawText += pageText + " ";

        // Вычисляем текущий технический процент выполнения
        const percentage = Math.round((i / totalPages) * 100);

        // Двигаем зелёную полосу и обновляем текст с цифрой внутри неё
        progressBar.style.width = percentage + "%";
        progressBar.innerText = percentage + "%";
        status.innerText = `Обработка страницы ${i} из ${totalPages}`;
    }

    status.innerText = "Очистка полученного текста от мусора...";

    // Наш алгоритм очистки текста книги от дефисов и колонтитулов
    let text = rawText;
    text = text.replace(/-\s*\n/g, ''); // Соединяем разорванные переносами слова
    text = text.replace(/Б\.\s*Н\.\s*Миронов|Российская империя|от традиции к модерну/gi, ''); // Стираем колонтитулы
    text = text.replace(/\s+/g, ' '); // Удаляем лишние пробелы

    // Нарезаем чистый текст на массив отдельных предложений
    sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    sentences = sentences.map(s => s.trim()).filter(s => s.length > 5);

    currentIndex = 0;
    status.innerText = `Успешно загружено предложений: ${sentences.length}`;
    document.getElementById('playBtn').disabled = false;

    // Плавное скрытие индикатора загрузки через 2 секунды после успеха
    setTimeout(() => { progressContainer.style.display = "none"; }, 2000);
}

// Воспроизведение звука по принципу музыкального трека
function playAudio() {
    if (sentences.length === 0) return;
    isPlaying = true;
    speakCurrentSentence();
}

function speakCurrentSentence() {
    if (!isPlaying || currentIndex >= sentences.length) return;

    const currentText = sentences[currentIndex];
    document.getElementById('text-preview').innerText = currentText;

    // Передаем строку текста на стабильный речевой сервер
    const encodedText = encodeURIComponent(currentText);
    const audioUrl = `https://google.com{encodedText}`;

    audioPlayer.src = audioUrl;
    audioPlayer.play().catch(err => console.log("Техническая заминка звука:", err));

    // Автопереход к следующей строчке, когда текущая доиграла до конца
    audioPlayer.onended = () => {
        currentIndex++;
        speakCurrentSentence();
    };
}

function stopAudio() {
    isPlaying = false;
    audioPlayer.pause();
    document.getElementById('status').innerText = "Воспроизведение остановлено";
}