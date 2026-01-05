const wordsList = [
    "the", "be", "of", "and", "a", "to", "in", "he", "have", "it", "that", "for", "they", "i", "with", "as", "not", "on", "she", "at", "by", "this", "we", "you", "do", "but", "from", "or", "which", "one", "would", "all", "will", "there", "say", "who", "make", "when", "can", "more", "if", "no", "man", "out", "other", "so", "what", "time", "up", "go", "about", "than", "into", "could", "state", "only", "new", "year", "some", "take", "come", "these", "know", "see", "use", "get", "like", "then", "first", "any", "work", "now", "may", "such", "give", "over", "think", "most", "even", "find", "day", "also", "after", "way", "many", "must", "look", "before", "great", "back", "through", "long", "where", "much", "should", "well", "people", "down", "own", "just", "because", "good", "each", "those", "feel", "seem", "how", "high", "too", "place", "little", "world", "very", "still", "nation", "hand", "old", "life", "tell", "write", "become", "here", "show", "house", "both", "between", "need", "mean", "call", "develop", "under", "last", "right", "move", "thing", "general", "school", "never", "same", "another", "begin", "while", "number", "part", "turn", "real", "leave", "might", "want", "point", "form", "off", "child", "few", "small", "since", "against", "ask", "late", "home", "interest", "large", "person", "end", "open", "public", "follow", "during", "present", "without", "again", "hold", "governor", "program", "system", "problem", "lead", "stop", "never", "always",
    "course", "group", "always", "money", "next", "room", "area", "fact", "eye", "door", "face", "result", "night", "month", "side", "study", "word", "business", "issue", "kind", "head", "far", "black", "long", "both", "little", "house", "yes", "since", "provide", "service", "around", "friend", "important", "father", "sit", "away", "until", "power", "hour", "game", "often", "yet", "line", "political", "among", "ever", "stand", "bad", "lose", "however", "member", "pay", "law", "meet", "car", "city", "almost", "include", "continue", "set", "later", "community", "name", "five", "once", "white", "least", "president", "learn", "real", "change", "team", "minute", "best", "several", "idea", "kid", "body", "information", "nothing", "ago", "lead", "social", "understand", "whether", "watch", "together", "follow", "parent", "stop", "price", "create"
];

const GAME_DURATION = 60; // seconds

const typingArea = document.getElementById('typing-area');
const hiddenInput = document.getElementById('hidden-input');
const caret = document.getElementById('caret');
const timerElement = document.getElementById('timer');
const wpmElement = document.getElementById('wpm');
const accuracyElement = document.getElementById('accuracy');
const restartBtn = document.getElementById('restart-btn');
const resultsOverlay = document.getElementById('results-overlay');
const finalWpmElement = document.getElementById('final-wpm');
const finalAccuracyElement = document.getElementById('final-accuracy');
const finalCpmElement = document.getElementById('final-cpm');

let words = [];
let currentWordIndex = 0;
let currentLetterIndex = 0;
let isPlaying = false;
let timeRemaining = GAME_DURATION;
let timerInterval = null;
let correctKeystrokes = 0;
let incorrectKeystrokes = 0;
let totalKeystrokes = 0;
let hasStarted = false;

// Initialize Game
function initGame() {
    // Reset Variables
    words = [];
    currentWordIndex = 0;
    currentLetterIndex = 0;
    isPlaying = false;
    hasStarted = false;
    timeRemaining = GAME_DURATION;
    correctKeystrokes = 0;
    incorrectKeystrokes = 0;
    totalKeystrokes = 0;

    // Reset UI
    clearInterval(timerInterval);
    timerElement.innerText = timeRemaining;
    wpmElement.innerText = '0';
    accuracyElement.innerText = '100%';
    resultsOverlay.classList.remove('show');
    hiddenInput.value = '';

    // Generate Words
    generateWords();

    // Focus Input
    hiddenInput.focus();
    // Re-attach focus listener to ensure clicking anywhere focuses input
    document.onclick = () => hiddenInput.focus();

    // Update Caret Position Initial
    // Small timeout to allow DOM layout
    setTimeout(updateCaretPosition, 10);
}

function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

function generateWords() {
    typingArea.innerHTML = '';

    // Create a copy to shuffle
    let shuffledWords = shuffleArray([...wordsList]);

    // If not enough words, double it
    if (shuffledWords.length < 150) {
        shuffledWords = [...shuffledWords, ...shuffleArray([...wordsList])];
    }

    // Take first 150 words
    const selectedWords = shuffledWords.slice(0, 150);

    for (let i = 0; i < selectedWords.length; i++) {
        const wordText = selectedWords[i];
        words.push(wordText);

        const wordDiv = document.createElement('div');
        wordDiv.className = 'word';

        // Add letters
        for (let char of wordText) {
            const letterSpan = document.createElement('span');
            letterSpan.className = 'letter';
            letterSpan.innerText = char;
            wordDiv.appendChild(letterSpan);
        }

        typingArea.appendChild(wordDiv);
    }
    // Append caret last 
    typingArea.appendChild(caret);
}

function startTimer() {
    if (hasStarted) return;
    hasStarted = true;
    isPlaying = true;

    timerInterval = setInterval(() => {
        timeRemaining--;
        timerElement.innerText = timeRemaining;

        calculateStats();

        if (timeRemaining <= 0) {
            endGame();
        }
    }, 1000);
}

function calculateStats() {
    const timeElapsed = GAME_DURATION - timeRemaining;
    const timeElapsedInMin = timeElapsed / 60;

    // Avoid division by zero
    if (timeElapsedInMin === 0) return { wpm: 0, accuracy: 100 };

    // Standard WPM = (All keystrokes / 5) / time 
    // OR (Correct / 5) / time. Let's use Correct for 'Net' WPM approx
    const wpm = Math.round((correctKeystrokes / 5) / timeElapsedInMin);

    const accuracy = totalKeystrokes > 0
        ? Math.round((correctKeystrokes / totalKeystrokes) * 100)
        : 100;

    wpmElement.innerText = isNaN(wpm) || !isFinite(wpm) ? 0 : wpm;
    accuracyElement.innerText = accuracy + '%';

    return { wpm, accuracy };
}

function endGame() {
    clearInterval(timerInterval);
    isPlaying = false;
    hiddenInput.blur();

    const { wpm, accuracy } = calculateStats();

    finalWpmElement.innerText = isNaN(wpm) ? 0 : wpm;
    finalAccuracyElement.innerText = accuracy + '%';

    // CPM 
    const timeFraction = (GAME_DURATION - timeRemaining) / 60;
    const cpm = timeFraction > 0 ? Math.round(correctKeystrokes / timeFraction) : correctKeystrokes;
    finalCpmElement.innerText = cpm;

    resultsOverlay.classList.add('show');
}

function handleTyping(e) {
    // 1. Start Timer on ANY input if not started
    if (!hasStarted && !isPlaying) {
        // e.data is usually the character typed. 
        // e.inputType can act as secondary check.
        if (e.data || e.inputType.startsWith('insert')) {
            startTimer();
        }
    }

    if (timeRemaining <= 0) return;

    // 2. Navigation & Caret Logic
    const allWords = typingArea.querySelectorAll('.word');
    const currentWordDiv = allWords[currentWordIndex];
    if (!currentWordDiv) return;

    const letters = currentWordDiv.querySelectorAll('.letter');
    const currentWord = words[currentWordIndex];

    // Handle Backspace
    if (e.inputType === 'deleteContentBackward') {
        if (currentLetterIndex > 0) {
            currentLetterIndex--;
            const letterSpan = letters[currentLetterIndex];

            if (letterSpan.classList.contains('correct')) {
                correctKeystrokes--;
            }
            // Note: We do NOT decrement totalKeystrokes for accuracy tracking purposes (errors stick)
            // But if you prefer forgiving accuracy: totalKeystrokes--; 

            letterSpan.classList.remove('correct', 'incorrect');
        } else {
            // Optional: Move back to previous word functionality could go here
        }
        updateCaretPosition();
        return;
    }

    // Handle Character Input
    if (e.data) {
        const char = e.data;

        // Space -> Next Word
        if (char === ' ') {
            if (currentLetterIndex > 0 || currentWordIndex >= 0) {
                // Allow moving to next word even if incomplete (skipping)
                currentWordIndex++;
                currentLetterIndex = 0;

                // Scroll if needed
                const allWordsNow = typingArea.querySelectorAll('.word');
                const nextWord = allWordsNow[currentWordIndex];
                if (nextWord && nextWord.offsetTop > typingArea.scrollTop + 50) {
                    nextWord.scrollIntoView({ block: 'center', behavior: 'smooth' });
                }
            }
        } else {
            // Typing letters
            if (currentLetterIndex < currentWord.length) {
                const letterSpan = letters[currentLetterIndex];
                totalKeystrokes++;

                if (char === currentWord[currentLetterIndex]) {
                    letterSpan.classList.add('correct');
                    correctKeystrokes++;
                } else {
                    letterSpan.classList.add('incorrect');
                    incorrectKeystrokes++;
                }
                currentLetterIndex++;
            } else {
                // Overtyping (more letters than word has)
                // Just track error, don't render extra letters for simplest UI
                incorrectKeystrokes++;
                totalKeystrokes++;
            }
        }
    }
    updateCaretPosition();
}

function updateCaretPosition() {
    const allWords = typingArea.querySelectorAll('.word');
    const currentWordDiv = allWords[currentWordIndex];

    // Safety check
    if (!currentWordDiv) {
        // Maybe finished all words?
        return;
    }

    const wordLeft = currentWordDiv.offsetLeft;
    const wordTop = currentWordDiv.offsetTop;

    if (currentLetterIndex < currentWordDiv.children.length) {
        const currentLetter = currentWordDiv.children[currentLetterIndex];
        caret.style.left = (wordLeft + currentLetter.offsetLeft) + 'px';
        caret.style.top = (wordTop + currentLetter.offsetTop) + 'px';
    } else {
        // End of word
        const lastLetter = currentWordDiv.children[currentWordDiv.children.length - 1];
        if (lastLetter) {
            const lastLetterRight = lastLetter.offsetLeft + lastLetter.offsetWidth;
            caret.style.left = (wordLeft + lastLetterRight) + 'px';
            caret.style.top = (wordTop + lastLetter.offsetTop) + 'px';
        } else {
            // Empty word fallback
            caret.style.left = wordLeft + 'px';
            caret.style.top = wordTop + 'px';
        }
    }
    caret.classList.add('active');
}

// Event Listeners
hiddenInput.addEventListener('input', handleTyping);

// Tab to Restart
hiddenInput.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        initGame();
    }
});

restartBtn.addEventListener('click', initGame);

// Initial Load
window.addEventListener('load', initGame);
