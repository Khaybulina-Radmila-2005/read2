let cleanedText = "";
const synth = window.speechSynthesis;

// Функция очистки «грязного» текста
function cleanText(rawText) {
    let text = rawText;
    // 1. Склеиваем слова, разорванные дефисом на концах строк
    text = text.replace(/-\s*\n/g, '');
    // 2. Убираем колонтитулы (шаблон под книгу Миронова)
    text = text.replace(/Б\.\s*Н\.\s*Миронов|Российская империя|от традиции к модерну/gi, '');
    // 3. Удаляем номера страниц (одинокие цифры на новой строке)
    text = text.replace(/\n\s*\d+\s*\n/g, '\n');
    // 4. Схлопываем лишние пробелы и пустые строки
    text = text.replace(/[ \t]+/g, ' ');
    text = text.replace(/\n\s*\n+/g, '\n');
    return text.trim();
}

function handleClean() {
    const raw = document.getElementById('rawInput').value;
    cleanedText = cleanText(raw);
    document.getElementById('output').innerText = cleanedText;
}

function handlePlay() {
    if (!cleanedText) {
        alert("Сначала вставьте и очистите текст!");
        return;
    }
    if (synth.speaking) { synth.cancel(); } // Если уже говорит — сбрасываем

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = 'ru-RU';

    // Оптимальные настройки скорости, чтобы убрать роботизированность
    utterance.rate = 1.2;
    utterance.pitch = 1.0;

    // Пытаемся выбрать лучший русский голос из доступных в системе
    const voices = synth.getVoices();
    const ruVoice = voices.find(v => v.lang.includes('ru'));
    if (ruVoice) utterance.voice = ruVoice;

    synth.speak(utterance);
}

function handleStop() {
    synth.cancel();
}

// Нужно для корректной подгрузки голосов в некоторых браузерах
if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = synth.getVoices;
}