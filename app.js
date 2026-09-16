pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cloudflare.com';

let sentences = [];
let currentIndex = 0;
let audioPlayer = new Audio();
let isPlaying = false;

// 1. Извлечение и полная очистка текста из PDF
async function loadPdf() {
    const fileInput = document.getElementById('pdfFile');
    const status = document.getElementById('status');

    if (fileInput.files.length === 0) return;

    status.innerText = "Чтение книги и очистка от мусора... Подождите.";
    document.getElementById('playBtn').disabled = true;

    const file = fileInput.files[0];
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let rawText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        rawText += pageText + " ";
    }

    // Применяем ваши правила очистки текста
    let text = rawText;
    text = text.replace(/-\s*\n/g, ''); // Склеиваем слова с переносами
    text = text.replace(/Б\.\s*Н\.\s*Миронов|Российская империя|от традиции к модерну/gi, ''); // Удаляем колонтитулы книги
    text = text.replace(/\s+/g, ' '); // Убираем лишние пробелы

    // Разбираем очищенный текст на отдельные предложения
    sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    sentences = sentences.map(s => s.trim()).filter(s => s.length > 5);

    currentIndex = 0;
    status.innerText = `Успешно загружено предложений: ${sentences.length}`;
    document.getElementById('playBtn').disabled = false;
}

// 2. Фоновое воспроизведение через тег Audio
function playAudio() {
    if (sentences.length === 0) return;
    isPlaying = true;
    speakCurrentSentence();
}

function speakCurrentSentence() {
    if (!isPlaying || currentIndex >= sentences.length) return;

    const currentText = sentences[currentIndex];
    document.getElementById('text-preview').innerText = currentText;

    // Используем бесплатный TTS-сервер Google Translate API
    // Этот аудиопоток телефон воспринимает как музыку и не глушит в фоне!
    const encodedText = encodeURIComponent(currentText);
    const audioUrl = `https://google.com{encodedText}`;

    audioPlayer.src = audioUrl;
    audioPlayer.play().catch(err => console.log("Ошибка воспроизведения:", err));

    // Автоматический переход к следующему предложению, когда текущее дочитано
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