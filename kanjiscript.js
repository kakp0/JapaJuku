document.addEventListener('DOMContentLoaded', () => {
    // This script now assumes main.js has loaded and window.playerDataManager is available.

    // --- Configuration ---
    const lessons = [{ name: "Lesson 22", kanji: [ { char: '記', on: 'キ', kun: 'しる(す)', en: 'scribe, account' }, { char: '銀', on: 'ギン', kun: 'しろがね', en: 'silver' }, { char: '回', on: 'カイ', kun: 'まわ(る)', en: 'times, round' }, { char: '夕', on: 'セキ', kun: 'ゆう', en: 'evening' }, { char: '黒', on: 'コク', kun: 'くろ', en: 'black' }, { char: '用', on: 'ヨウ', kun: 'もち(いる)', en: 'use, business' }, { char: '守', on: 'シュ, ス', kun: 'まも(る)', en: 'guard, protect' }, { char: '末', on: 'マツ', kun: 'すえ', en: 'end, close' }, { char: '待', on: 'タイ', kun: 'ま(つ)', en: 'wait' }, { char: '残', on: 'ザン', kun: 'のこ(る)', en: 'remainder, leave behind' }, { char: '番', on: 'バン', kun: 'つが(い)', en: 'turn, number in series' }, { char: '駅', on: 'エキ', kun: 'n/a', en: 'station' }, { char: '説', on: 'セツ', kun: 'と(く)', en: 'theory, explanation' }, { char: '案', on: 'アン', kun: 'つくえ', en: 'plan, suggestion' }, { char: '内', on: 'ナイ', kun: 'うち', en: 'inside, within' }, { char: '忘', on: 'ボウ', kun: 'わす(れる)', en: 'forget' } ] }, { name: "Lesson 23", kanji: [ { char: '調', on: 'チョウ', kun: 'しら(べる)', en: 'investigate, tune' }, { char: '化', on: 'カ, ケ', kun: 'ば(ける)', en: 'change, take form of' }, { char: '横', on: 'オウ', kun: 'よこ', en: 'sideways, side' }, { char: '比', on: 'ヒ', kun: 'くら(べる)', en: 'compare, ratio' }, { char: '感', on: 'カン', kun: 'n/a', en: 'feel, emotion' }, { char: '果', on: 'カ', kun: 'は(たす)', en: 'fruit, result' }, { char: '答', on: 'トウ', kun: 'こた(える)', en: 'solution, answer' }, { char: '変', on: 'ヘン', kun: 'か(わる)', en: 'unusual, change' }, { char: '情', on: 'ジョウ', kun: 'なさ(け)', en: 'feeling, passion' }, { char: '悲', on: 'ヒ', kun: 'かな(しい)', en: 'grieve, sad' }, { char: '査', on: 'サ', kun: 'n/a', en: 'investigate' }, { char: '違', on: 'イ', kun: 'ちが(う)', en: 'differ, violate' }, { char: '相', on: 'ソウ, ショウ', kun: 'あい-', en: 'mutual, together' }, { char: '顔', on: 'ガン', kun: 'かお', en: 'face' }, { char: '怒', on: 'ド', kun: 'いか(る), おこ(る)', en: 'angry, be offended' } ] }];
    const allKanji = lessons.flatMap(lesson => lesson.kanji);
    const DECK_STATE_KEY = 'kanjiDeckState';
    const LEARNING_BUFFER_SIZE = 5;

    // --- Global DOM Elements & State ---
    const practiceContainer = document.getElementById('practice-container');
    const drawingQuizContainer = document.getElementById('drawing-quiz-container');
    const readingQuizContainer = document.getElementById('reading-quiz-container');
    const practiceModeBtn = document.getElementById('practice-mode-btn');
    const drawingQuizBtn = document.getElementById('drawing-quiz-btn');
    const readingQuizBtn = document.getElementById('reading-quiz-btn');
    const clearTimersBtn = document.getElementById('clear-timers-btn');
    const mainPanel = document.querySelector('.main-panel');
    const profileCard = document.getElementById('profile-card');
    const body = document.body;
    const modal = document.getElementById('status-modal'); // MOVED to global scope
    let isDrawing = false, lastX = 0, lastY = 0;
    let countdownInterval = null; // MOVED to global scope
    
    // --- Helper Functions ---
    const formatReading = (reading) => {
        if (!reading || typeof reading !== 'string') return '';
        // Replaces ".xyz" with "(xyz)" for better readability
        return reading.replace(/\.([\w-]+)/g, '($1)');
    };

    // --- Generic Drawing Functions ---
    const getCoords = (canvas, e) => {
        const rect = canvas.getBoundingClientRect();
        const event = e.touches ? e.touches[0] : e;
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return [(event.clientX - rect.left) * scaleX, (event.clientY - rect.top) * scaleY];
    };
    const startDrawing = e => { isDrawing = true;[lastX, lastY] = getCoords(e.target, e); };
    const stopDrawing = () => { isDrawing = false; };
    const createDrawFunction = (canvas, ctx, onDraw) => e => { if (!isDrawing) return; e.preventDefault(); const [x, y] = getCoords(canvas, e); ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(x, y); ctx.stroke(); const dist = Math.hypot(x - lastX, y - lastY); if(onDraw) onDraw(Math.round(dist)); [lastX, lastY] = [x, y]; };
    
    // --- Responsive Layout Handler ---
    const handleResponsiveLayout = () => {
        const breakpoint = 1400;
        if (!profileCard || !mainPanel || !body) {
            console.error("Required elements for layout handling are missing.");
            return;
        }

        if (window.innerWidth <= breakpoint) {
            if (profileCard.parentElement !== mainPanel) {
                mainPanel.appendChild(profileCard);
            }
        } else {
            if (profileCard.parentElement !== body) {
                 const appContainer = document.getElementById('app-container');
                 if (appContainer) {
                    body.insertBefore(profileCard, appContainer);
                 }
            }
        }
    };

    // --- Mode Switching ---
    const allModeContainers = [practiceContainer, drawingQuizContainer, readingQuizContainer];
    const allModeBtns = [practiceModeBtn, drawingQuizBtn, readingQuizBtn];
    const switchToMode = (activeContainer, activeBtn) => {
        allModeContainers.forEach(c => c.style.display = 'none');
        allModeBtns.forEach(b => b.classList.remove('active'));
        activeContainer.style.display = 'block';
        activeBtn.classList.add('active');
    };

    // --- Practice Mode ---
    const practice = (() => {
        const guideCanvas = document.getElementById('guideCanvas'), drawingCanvas = document.getElementById('drawingCanvas'), guideCtx = guideCanvas.getContext('2d'), drawingCtx = drawingCanvas.getContext('2d'), gradeButton = document.getElementById('grade-button'), clearButton = document.getElementById('clear-button'), nextButton = document.getElementById('next-button'), kanjiInfo = document.getElementById('kanji-info'), scoreInfo = document.getElementById('score-info'), onReading = document.getElementById('on-reading'), kunReading = document.getElementById('kun-reading'), enMeaning = document.getElementById('en-meaning'), kanjiSelect = document.getElementById('kanji-select');
        let currentLessonIndex = 0, currentKanjiInLessonIndex = 0;
        
        const populateKanjiSelect = () => { lessons.forEach((lesson, lessonIndex) => { const optgroup = document.createElement('optgroup'); optgroup.label = lesson.name; lesson.kanji.forEach((kanji, kanjiIndex) => { const option = document.createElement('option'); option.value = `${lessonIndex}-${kanjiIndex}`; option.textContent = kanji.char; optgroup.appendChild(option); }); kanjiSelect.appendChild(optgroup); }); };
        const loadKanji = () => { 
            const isDarkMode = document.documentElement.classList.contains('dark-mode');
            clearDrawingCanvas(); 
            guideCtx.clearRect(0, 0, guideCanvas.width, guideCanvas.height); 
            scoreInfo.textContent = 'Score: --%'; 
            const lesson = lessons[currentLessonIndex]; 
            const kanjiData = lesson.kanji[currentKanjiInLessonIndex]; 
            guideCtx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'; 
            guideCtx.font = '200px "Yu Gothic", "Meiryo", sans-serif'; 
            guideCtx.textAlign = 'center'; 
            guideCtx.textBaseline = 'middle'; 
            guideCtx.fillText(kanjiData.char, guideCanvas.width / 2, guideCanvas.height / 2); 
            kanjiInfo.textContent = `${lesson.name}: ${kanjiData.char}`; 
            onReading.textContent = kanjiData.on; 
            kunReading.textContent = formatReading(kanjiData.kun); // CHANGED
            enMeaning.textContent = kanjiData.en; 
            kanjiSelect.value = `${currentLessonIndex}-${currentKanjiInLessonIndex}`; 
        };
        const handleSelectChange = (e) => { const [lessonIdx, kanjiIdx] = e.target.value.split('-').map(Number); currentLessonIndex = lessonIdx; currentKanjiInLessonIndex = kanjiIdx; loadKanji(); };
        const clearDrawingCanvas = () => drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        const nextKanji = () => { currentKanjiInLessonIndex++; if (currentKanjiInLessonIndex >= lessons[currentLessonIndex].kanji.length) { currentKanjiInLessonIndex = 0; currentLessonIndex = (currentLessonIndex + 1) % lessons.length; } loadKanji(); };
        const gradeDrawing = () => { 
            const guideData = guideCtx.getImageData(0, 0, guideCanvas.width, guideCanvas.height).data, 
                  drawingData = drawingCtx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height).data; 
            let templatePixels = 0, userPixels = 0, correctPixels = 0; 
            for (let i = 0; i < guideData.length; i += 4) { 
                const isGuidePixel = guideData[i + 3] > 0, 
                      isDrawingPixel = drawingData[i + 3] > 0; 
                if (isGuidePixel) templatePixels++; 
                if (isDrawingPixel) userPixels++; 
                if (isGuidePixel && isDrawingPixel) correctPixels++; 
            } 
            if (templatePixels === 0) { 
                scoreInfo.textContent = 'Score: 0%'; 
                return; 
            } 
            const incorrectPixels = userPixels - correctPixels, 
                  score = (correctPixels / (templatePixels + (incorrectPixels * 0.5))) * 100; 

            // New grading logic: scale so 80 becomes 100, then cap at 100.
            const scaledScore = score * (100 / 80);
            const finalScore = Math.round(Math.min(100, scaledScore));

            scoreInfo.textContent = `Score: ${finalScore}%`; 
            if (window.playerDataManager) { 
                window.playerDataManager.setStat('kanjiDrawingHighScore', finalScore); 
                window.playerDataManager.rewardXp('kanjiPracticeGrade'); 
                const kanjiChar = lessons[currentLessonIndex].kanji[currentKanjiInLessonIndex].char; 
                if (finalScore === 100) { 
                    window.playerDataManager.setStat('kanjiPerfectScore', 1); 
                } 
                if (kanjiChar === '待') { 
                    window.playerDataManager.setStat('kanjiGraded_待', 1); 
                } else if (kanjiChar === '守') { 
                    window.playerDataManager.setStat('kanjiGraded_守', 1); 
                } else if (kanjiChar === '末') { 
                    window.playerDataManager.setStat('kanjiGraded_末', 1); 
                } 
            } 
        };
        
        return { 
            init: () => { 
                const isDarkMode = document.documentElement.classList.contains('dark-mode');
                drawingCtx.strokeStyle = isDarkMode ? '#e0e0e0' : '#000'; 
                drawingCtx.lineWidth = 10; drawingCtx.lineCap = 'round'; drawingCtx.lineJoin = 'round'; 
                const draw = createDrawFunction(drawingCanvas, drawingCtx, (dist) => { if(window.playerDataManager) window.playerDataManager.increaseStat('kanjiDrawnDistance', dist); }); 
                drawingCanvas.addEventListener('mousedown', startDrawing); drawingCanvas.addEventListener('mousemove', draw); drawingCanvas.addEventListener('mouseup', stopDrawing); drawingCanvas.addEventListener('mouseout', stopDrawing); drawingCanvas.addEventListener('touchstart', startDrawing); drawingCanvas.addEventListener('touchmove', draw); drawingCanvas.addEventListener('touchend', stopDrawing); 
                gradeButton.addEventListener('click', gradeDrawing); clearButton.addEventListener('click', clearDrawingCanvas); nextButton.addEventListener('click', nextKanji); kanjiSelect.addEventListener('change', handleSelectChange);
                populateKanjiSelect(); loadKanji(); 
            } 
        };
    })();

    // --- Drawing Quiz Mode ---
    const drawingQuiz = (() => {
        const userCanvas = document.getElementById('quizUserCanvas'), answerCanvas = document.getElementById('quizAnswerCanvas'), userCtx = userCanvas.getContext('2d'), answerCtx = answerCanvas.getContext('2d'), revealBtn = document.getElementById('quiz-reveal-btn'), clearBtn = document.getElementById('quiz-clear-btn'), onDisplay = document.getElementById('quiz-on'), kunDisplay = document.getElementById('quiz-kun'), enDisplay = document.getElementById('quiz-en'), ratingButtons = document.getElementById('quiz-rating-buttons'), noCardsMessage = document.getElementById('no-cards-message'), quizUI = document.getElementById('quiz-canvas-wrapper'), mainActions = document.querySelector('.quiz-main-actions'), promptEl = document.getElementById('quiz-prompt');
        const statusBtn = document.getElementById('deck-status-btn'), modalClose = document.querySelector('.modal-close'), learningList = document.getElementById('learning-list'), reviewList = document.getElementById('review-list'), unseenList = document.getElementById('unseen-list'), learningCount = document.getElementById('learning-count'), reviewCount = document.getElementById('review-count'), unseenCount = document.getElementById('unseen-count');
        let currentKanji = null;

        const getDeckState = () => { let state = JSON.parse(localStorage.getItem(DECK_STATE_KEY)); if (!state || !state.unseen || !state.learning || !state.review) { state = { unseen: allKanji.map(k => k.char), learning: [], review: {} }; } while (state.learning.length < LEARNING_BUFFER_SIZE && state.unseen.length > 0) { state.learning.push(state.unseen.shift()); } return state; };
        const saveDeckState = (state) => { localStorage.setItem(DECK_STATE_KEY, JSON.stringify(state)); if (window.playerDataManager) window.playerDataManager.setStat('kanjiInReview', Object.keys(state.review).length); };
        const clearUserCanvas = () => userCtx.clearRect(0, 0, userCanvas.width, userCanvas.height);
        const formatTime = (ms) => { if (ms <= 0) return 'Due!'; const totalSeconds = Math.ceil(ms / 1000); const minutes = Math.floor(totalSeconds / 60); const seconds = totalSeconds % 60; return `${minutes}m ${seconds.toString().padStart(2, '0')}s`; };
        const updateTimers = () => { modal.querySelectorAll('.timer').forEach(el => { el.textContent = formatTime(parseInt(el.dataset.due, 10) - Date.now()); }); };

        const openStatusModal = () => {
            const state = getDeckState();
            learningList.innerHTML = ''; reviewList.innerHTML = ''; unseenList.innerHTML = '';
            state.learning.forEach(char => learningList.innerHTML += `<li>${char}</li>`);
            state.unseen.forEach(char => unseenList.innerHTML += `<li>${char}</li>`);
            const reviewEntries = Object.entries(state.review).sort((a,b) => a[1] - b[1]);
            reviewEntries.forEach(([char, due]) => { reviewList.innerHTML += `<li><span>${char}</span><span class="timer" data-due="${due}"></span></li>`; });
            learningCount.textContent = state.learning.length; reviewCount.textContent = reviewEntries.length; unseenCount.textContent = state.unseen.length;
            updateTimers(); countdownInterval = setInterval(updateTimers, 1000); 
            modal.style.display = 'flex';
        };
        const closeStatusModal = () => { clearInterval(countdownInterval); modal.style.display = 'none'; };

        const handleRating = (e) => { if (!e.target.classList.contains('rating-btn') || !currentKanji) return; if(window.playerDataManager) { window.playerDataManager.rewardXp('kanjiQuizRateAnswer'); if (e.target.classList.contains('again')) window.playerDataManager.increaseStat('kanjiRatedAgain', 1); else if (e.target.classList.contains('hard')) window.playerDataManager.increaseStat('kanjiRatedHard', 1); else if (e.target.classList.contains('good')) window.playerDataManager.increaseStat('kanjiRatedGood', 1); else if (e.target.classList.contains('easy')) window.playerDataManager.increaseStat('kanjiRatedEasy', 1); } const timeInSeconds = parseInt(e.target.dataset.time, 10); let state = getDeckState(); const kanjiChar = currentKanji.char; const indexInLearning = state.learning.indexOf(kanjiChar); if (indexInLearning > -1) state.learning.splice(indexInLearning, 1); if (timeInSeconds > 0) { const snoozeUntil = Date.now() + timeInSeconds * 1000; state.review[kanjiChar] = snoozeUntil; if (state.unseen.length > 0) state.learning.push(state.unseen.shift()); } else { state.learning.push(kanjiChar); } saveDeckState(state); loadNextQuestion(); };
        const revealAnswer = () => { 
            if(window.playerDataManager) window.playerDataManager.increaseStat('kanjiQuizReveals', 1);
            const isDarkMode = document.documentElement.classList.contains('dark-mode');
            if (!currentKanji) return; 
            answerCtx.clearRect(0, 0, answerCanvas.width, answerCanvas.height); 
            answerCtx.fillStyle = isDarkMode ? '#3391ff' : '#007bff'; 
            answerCtx.font = '170px "Yu Gothic", "Meiryo", sans-serif'; 
            answerCtx.textAlign = 'center'; 
            answerCtx.textBaseline = 'middle'; 
            answerCtx.fillText(currentKanji.char, answerCanvas.width / 2, answerCanvas.height / 2); 
            revealBtn.style.display = 'none';
            ratingButtons.style.display = 'flex'; 
        };
        const loadNextQuestion = () => { 
            clearUserCanvas(); 
            answerCtx.clearRect(0, 0, answerCanvas.width, answerCanvas.height); 
            let state = getDeckState(); 
            const now = Date.now(); 
            const dueChars = Object.keys(state.review).filter(char => state.review[char] <= now); 
            if (dueChars.length > 0) { 
                for (const char of dueChars) { 
                    state.learning.unshift(char); 
                    delete state.review[char]; 
                } 
            } 
            saveDeckState(state); 
            if (state.learning.length === 0) { 
                quizUI.style.display = 'none'; 
                mainActions.style.display = 'none'; 
                ratingButtons.style.display = 'none'; 
                promptEl.style.display = 'none'; 
                noCardsMessage.style.display = 'block'; 
                currentKanji = null; 
                return; 
            } 
            quizUI.style.display = 'flex'; 
            mainActions.style.display = 'flex'; 
            promptEl.style.display = 'block'; 
            noCardsMessage.style.display = 'none'; 
            const nextKanjiChar = state.learning[0]; 
            currentKanji = allKanji.find(k => k.char === nextKanjiChar); 
            onDisplay.textContent = currentKanji.on; 
            kunDisplay.textContent = formatReading(currentKanji.kun); // CHANGED
            enDisplay.textContent = currentKanji.en; 
            revealBtn.style.display = '';
            ratingButtons.style.display = 'none'; 
        };
        
        return {
            init: () => {
                const isDarkMode = document.documentElement.classList.contains('dark-mode');
                userCtx.strokeStyle = isDarkMode ? '#e0e0e0' : '#000';
                userCtx.lineWidth = 8; userCtx.lineCap = 'round'; userCtx.lineJoin = 'round';
                const draw = createDrawFunction(userCanvas, userCtx, (dist) => { if(window.playerDataManager) window.playerDataManager.increaseStat('kanjiQuizDrawnDistance', dist); });
                userCanvas.addEventListener('mousedown', startDrawing); userCanvas.addEventListener('mousemove', draw); userCanvas.addEventListener('mouseup', stopDrawing); userCanvas.addEventListener('mouseout', stopDrawing); userCanvas.addEventListener('touchstart', startDrawing); userCanvas.addEventListener('touchmove', draw); userCanvas.addEventListener('touchend', stopDrawing);
                revealBtn.addEventListener('click', revealAnswer); clearBtn.addEventListener('click', clearUserCanvas); ratingButtons.addEventListener('click', handleRating); statusBtn.addEventListener('click', openStatusModal); modalClose.addEventListener('click', closeStatusModal); window.addEventListener('click', (e) => { if (e.target == modal) closeStatusModal(); });
            },
            loadNextQuestion,
            openStatusModal // EXPOSED for external use
        };
    })();

    // --- Reading Quiz Mode ---
    const readingQuiz = (() => {
        const checkbox = document.getElementById('hard-mode-checkbox'), instruction = document.getElementById('reading-q-instruction'), promptEl = document.getElementById('reading-q-prompt'), answerArea = document.getElementById('reading-q-answer-area'), feedbackArea = document.getElementById('reading-q-feedback-area'), checkBtn = document.getElementById('reading-q-check-btn'), nextBtn = document.getElementById('reading-q-next-btn');
        let isHardMode = false, questionPool = [], currentQuestion = null, isChecking = false;
        
        const katakanaToHiragana = (str) => {
            if (!str || typeof str !== 'string') return '';
            return str.replace(/[\u30a1-\u30f6]/g, (match) => {
                const chr = match.charCodeAt(0) - 0x60;
                return String.fromCharCode(chr);
            });
        };

        const generateQuestionPool = () => { const pool = []; allKanji.forEach(kanji => { if (kanji.on !== 'n/a') pool.push({ type: 'kanjiToReading', prompt: kanji.char, answer: kanji.on }); if (kanji.kun !== 'n/a') pool.push({ type: 'kanjiToReading', prompt: kanji.char, answer: kanji.kun }); kanji.on.split(', ').forEach(on => { if (on !== 'n/a') pool.push({ type: 'readingToKanji', prompt: on, answer: kanji.char }); }); kanji.kun.split(', ').forEach(kun => { if (kun !== 'n/a') pool.push({ type: 'readingToKanji', prompt: kun, answer: kanji.char }); }); }); return pool; };
        const getDistractors = (type, answer) => { const distractors = new Set(); const source = type === 'kanjiToReading' ? [...new Set(allKanji.flatMap(k => [k.on, k.kun]))].filter(r => r !== 'n/a' && r) : allKanji.map(k => k.char); while (distractors.size < 3) { const randomItem = source[Math.floor(Math.random() * source.length)]; if (randomItem !== answer) { distractors.add(randomItem); } } return [...distractors]; };
        
        const renderQuestion = () => { 
            isChecking = false;
            instruction.textContent = currentQuestion.type === 'kanjiToReading' ? 'What is a reading for this Kanji?' : 'What is the Kanji for this reading?'; 
            promptEl.textContent = currentQuestion.prompt; 
            answerArea.innerHTML = ''; 
            feedbackArea.innerHTML = ''; 
            nextBtn.style.display = 'none'; 
            checkBtn.style.display = 'none';

            if (isHardMode) { 
                const input = document.createElement('input'); 
                input.type = 'text'; 
                input.id = 'reading-q-input'; 
                input.placeholder = 'Type your answer here'; 
                input.autocomplete = 'off'; 
                answerArea.appendChild(input); 
                input.focus(); 
            } else { 
                const choices = [currentQuestion.answer, ...getDistractors(currentQuestion.type, currentQuestion.answer)]; 
                choices.sort(() => Math.random() - 0.5); 
                choices.forEach(choice => { 
                    const btn = document.createElement('button'); 
                    btn.className = 'choice-btn'; 
                    btn.textContent = formatReading(choice); 
                    btn.onclick = (e) => checkAnswer(choice, e.target); 
                    answerArea.appendChild(btn); 
                }); 
            } 
        };

        const checkAnswer = (userAnswerRaw, selectedBtn = null) => {
            if (isChecking) return;
            isChecking = true;
        
            // NEW: Get all possible correct answers for the current question.
            let allCorrectAnswersString = currentQuestion.answer;
            let allCorrectAnswersForFeedback = [currentQuestion.answer];
        
            // If it's a kanji-to-reading question, find all readings (on and kun).
            if (currentQuestion.type === 'kanjiToReading') {
                const kanjiData = allKanji.find(k => k.char === currentQuestion.prompt);
                if (kanjiData) {
                    const allReadings = [];
                    if (kanjiData.on && kanjiData.on !== 'n/a') allReadings.push(kanjiData.on);
                    if (kanjiData.kun && kanjiData.kun !== 'n/a') allReadings.push(kanjiData.kun);
                    
                    allCorrectAnswersString = allReadings.join(', ');
                    allCorrectAnswersForFeedback = allReadings;
                }
            }
        
            // Create a set of correct answers, normalized for checking.
            const acceptedHiraganaAnswers = new Set();
            allCorrectAnswersString.split(', ').forEach(ans => {
                const cleanAns = ans.trim().replace(/[().-]/g, ''); // Handles okurigana and prefixes
                if (cleanAns !== 'n/a' && cleanAns) {
                    acceptedHiraganaAnswers.add(katakanaToHiragana(cleanAns));
                }
            });
        
            // Normalize the user's answer the same way for a fair comparison.
            const cleanUserAnswer = userAnswerRaw.trim().replace(/[().-]/g, '');
            const userHiraganaAnswer = katakanaToHiragana(cleanUserAnswer);
            
            // The correctness check is now based on the normalized hiragana strings.
            const isCorrect = acceptedHiraganaAnswers.has(userHiraganaAnswer);
        
            // --- Scoring logic (remains the same) ---
            if (isCorrect) {
                if (window.playerDataManager) {
                    window.playerDataManager.rewardXp(isHardMode ? 'kanjiReadingCorrectHard' : 'kanjiReadingCorrectNormal');
                    window.playerDataManager.increaseStat('kanjiReadingCorrect', 1);
                    if (isHardMode) window.playerDataManager.increaseStat('kanjiReadingHardModeCorrect', 1);
                    window.playerDataManager.increaseStat('kanjiReadingStreak', 1);
                    const currentStreak = window.playerDataManager.getData().stats.kanjiReadingStreak || 0;
                    const highScoreStreak = window.playerDataManager.getData().stats.kanjiReadingHighScoreStreak || 0;
                    if (currentStreak > highScoreStreak) {
                        window.playerDataManager.setStat('kanjiReadingHighScoreStreak', currentStreak);
                    }
                    if (currentQuestion.prompt === '銀' || currentQuestion.answer === '銀') {
                        window.playerDataManager.setStat('kanjiSecretSilverFound', 1);
                    }
                }
            } else {
                if (window.playerDataManager) {
                    window.playerDataManager.rewardXp(isHardMode ? 'kanjiReadingIncorrectHardAttempt' : 'kanjiReadingIncorrectNormalAttempt');
                    window.playerDataManager.setStat('kanjiReadingStreak', 0);
                    window.playerDataManager.increaseStat('kanjiReadingMistakes', 1);
                }
            }
        
            // --- Feedback logic (modified to show all answers) ---
            if (isHardMode) {
                const input = document.getElementById('reading-q-input');
                if (input) {
                    input.disabled = true;
                    input.classList.add(isCorrect ? 'correct' : 'incorrect');
                }
                if (!isCorrect) {
                    const feedbackText = allCorrectAnswersForFeedback.map(formatReading).join(', ');
                    feedbackArea.innerHTML = `<p class="incorrect-feedback">Answer: ${feedbackText}</p>`;
                }
            } else { // Multiple Choice
                const choiceBtns = answerArea.querySelectorAll('.choice-btn');
                choiceBtns.forEach(btn => btn.disabled = true);
                
                const formattedCorrectAnswers = allCorrectAnswersForFeedback.map(formatReading);
                choiceBtns.forEach(btn => {
                    if (formattedCorrectAnswers.includes(btn.textContent)) {
                        btn.classList.add('correct');
                    }
                });
                
                if (!isCorrect && selectedBtn) {
                    selectedBtn.classList.add('incorrect');
                }
            }
            
            setTimeout(loadQuestion, isCorrect ? 1000 : 2000);
        };

        const loadQuestion = () => { if (questionPool.length === 0) { questionPool = generateQuestionPool(); } currentQuestion = questionPool[Math.floor(Math.random() * questionPool.length)]; renderQuestion(); };
        
        return {
            init: () => { 
                checkbox.addEventListener('change', (e) => { isHardMode = e.target.checked; loadQuestion(); }); 
                answerArea.addEventListener('keypress', function(e) { 
                    if (e.key === 'Enter' && isHardMode) { 
                        const input = document.getElementById('reading-q-input'); 
                        if (input && input.value) { 
                            checkAnswer(input.value); 
                        } 
                    } 
                });
            },
            loadQuestion
        };
    })();

    // --- App Initialization ---
    const resetAllTimers = () => {
        localStorage.removeItem(DECK_STATE_KEY); 
        if(window.playerDataManager) window.playerDataManager.increaseStat('kanjiDeckResets', 1); 

        // Check if the main drawing quiz is active and reload its question
        if (drawingQuizContainer.style.display === 'block') { 
            drawingQuiz.loadNextQuestion(); 
        } 

        // NEW: Check if the status modal is open and refresh it
        if (modal && modal.style.display === 'flex') {
            // Stop the old countdown timer to prevent it from running in the background
            clearInterval(countdownInterval);
            // Re-run the function that builds the modal's content
            drawingQuiz.openStatusModal(); 
        }
    };
    
    practiceModeBtn.addEventListener('click', () => switchToMode(practiceContainer, practiceModeBtn));
    drawingQuizBtn.addEventListener('click', () => { switchToMode(drawingQuizContainer, drawingQuizBtn); drawingQuiz.loadNextQuestion(); });
    readingQuizBtn.addEventListener('click', () => { switchToMode(readingQuizContainer, readingQuizBtn); readingQuiz.loadQuestion(); });
    clearTimersBtn.addEventListener('click', resetAllTimers);

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResponsiveLayout, 250);
    });

    practice.init();
    drawingQuiz.init();
    readingQuiz.init();
    handleResponsiveLayout();
    switchToMode(practiceContainer, practiceModeBtn);
});

