let sentences = [];
let currentIndex = 0;
let audioPlayer = new Audio();
let isPlaying = false;

// Чтение текстового файла встроенными силами телефона (без внешних библиотек)
function loadTxtFile() {
    const fileInput = document.getElementById('txtFile');
    const status = document.getElementById('status');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');

    if (fileInput.files.length === 0) return;

    // Включаем индикатор
    progressContainer.style.display = "block";
    progressBar.style.width = "50%";
    progressBar.innerText = "50%";
    status.innerText = "Чтение файла...";
    document.getElementById('playBtn').disabled = true;

    const file = fileInput.files[0];
    const reader = new FileReader();

    // Этот код сработает внутри процессора телефона мгновенно
    reader.onload = function(e) {
        let rawText = e.target.result;

        progressBar.style.width = "90%";
        progressBar.innerText = "90%";
        status.innerText = "Очистка текста от мусора...";

        // Алгоритм очистки текста
        let text = rawText;
        text = text.replace(/-\s*\n/g, ''); // Склеиваем слова с переносами
        text = text.replace(/Б\.\s*Н\.\s*Миронов|Российская империя|от традиции к модерну/gi, ''); // Стираем колонтитулы
        text = text.replace(/\s+/g, ' '); // Удаляем лишние пробелы

        // Нарезка очищенного текста на предложения
        sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        sentences = sentences.map(s => s.trim()).filter(s => s.length > 5);

        progressBar.style.width = "100%";
        progressBar.innerText = "100%";
        currentIndex = 0;

        status.innerText = `Успешно загружено предложений: ${sentences.length}`;
        document.getElementById('playBtn').disabled = false;

        // Скрываем индикатор выполнения через 1.5 секунды
        setTimeout(() => { progressContainer.style.display = "none"; }, 1500);
    };

    reader.readAsText(file, "UTF-8");
}

// Воспроизведение звука по технологии музыкального трека
function playAudio() {
    if (sentences.length === 0) return;
    isPlaying = true;
    speakCurrentSentence();
}

function speakCurrentSentence() {
    if (!isPlaying || currentIndex >= sentences.length) return;

    const currentText = sentences[currentIndex];
    document.getElementById('text-preview').innerText = currentText;

    // Переводим текст в безопасную ссылку
    const encodedText = encodeURIComponent(currentText);

    // ИСПРАВЛЕНИЕ: Переписано строго на защищенный протокол HTTPS
    const audioUrl = `https://google.com{encodedText}`;

    audioPlayer.src = audioUrl;
    audioPlayer.play().catch(err => console.log("Техническая заминка звука:", err));

    // Автоматический переход к следующей строчке, когда текущая доиграла до конца
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