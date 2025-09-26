document.addEventListener('DOMContentLoaded', () => {
    // Assumes main.js is loaded and window.playerDataManager is available.

    // --- DOM Elements ---
    const verbDisplay = document.getElementById('verb-display');
    const verbTypeTag = document.getElementById('verb-type-tag');
    const formDisplay = document.getElementById('form-display');
    const answerInput = document.getElementById('answer-input');
    const feedbackArea = document.getElementById('feedback-area');
    const checkBtn = document.getElementById('check-btn');
    const nextBtn = document.getElementById('next-btn');

    // --- Data ---
    const verbs = [
        // Godan verbs (u-verbs)
        { dict: '話す', display: '<ruby>話<rt>はな</rt></ruby>す', type: 'Godan', causative: '話させる', causative_passive: '話させられる', ba_conditional: '話せば' },
        { dict: '聞く', display: '<ruby>聞<rt>き</rt></ruby>く', type: 'Godan', causative: '聞かせる', causative_passive: '聞かせられる', ba_conditional: '聞けば' },
        { dict: '泳ぐ', display: '<ruby>泳<rt>およ</rt></ruby>ぐ', type: 'Godan', causative: '泳がせる', causative_passive: '泳がせられる', ba_conditional: '泳げば' },
        { dict: '遊ぶ', display: '<ruby>遊<rt>あそ</rt></ruby>ぶ', type: 'Godan', causative: '遊ばせる', causative_passive: '遊ばせられる', ba_conditional: '遊べば' },
        { dict: '待つ', display: '<ruby>待<rt>ま</rt></ruby>つ', type: 'Godan', causative: '待たせる', causative_passive: '待たせられる', ba_conditional: '待てば' },
        { dict: '飲む', display: '<ruby>飲<rt>の</rt></ruby>む', type: 'Godan', causative: '飲ませる', causative_passive: '飲ませられる', ba_conditional: '飲めば' },
        { dict: '死ぬ', display: '<ruby>死<rt>し</rt></ruby>ぬ', type: 'Godan', causative: '死なせる', causative_passive: '死なせられる', ba_conditional: '死ねば' },
        { dict: '作る', display: '<ruby>作<rt>つく</rt></ruby>る', type: 'Godan', causative: '作らせる', causative_passive: '作らせられる', ba_conditional: '作れば' },
        { dict: '買う', display: '<ruby>買<rt>か</rt></ruby>う', type: 'Godan', causative: '買わせる', causative_passive: '買わせられる', ba_conditional: '買えば' },
        { dict: '急ぐ', display: '<ruby>急<rt>いそ</rt></ruby>ぐ', type: 'Godan', causative: '急がせる', causative_passive: '急がせられる', ba_conditional: '急げば' },
        { dict: '直す', display: '<ruby>直<rt>なお</rt></ruby>す', type: 'Godan', causative: '直させる', causative_passive: '直させられる', ba_conditional: '直せば' },
        { dict: '立つ', display: '<ruby>立<rt>た</rt></ruby>つ', type: 'Godan', causative: '立たせる', causative_passive: '立たせられる', ba_conditional: '立てば' },
        { dict: '運ぶ', display: '<ruby>運<rt>はこ</rt></ruby>ぶ', type: 'Godan', causative: '運ばせる', causative_passive: '運ばせられる', ba_conditional: '運べば' },

        // Ichidan verbs (ru-verbs)
        { dict: '食べる', display: '<ruby>食<rt>た</rt></ruby>べる', type: 'Ichidan', causative: '食べさせる', causative_passive: '食べさせられる', ba_conditional: '食べれば' },
        { dict: '見る', display: '<ruby>見<rt>み</rt></ruby>る', type: 'Ichidan', causative: '見させる', causative_passive: '見させられる', ba_conditional: '見れば' },
        { dict: '起きる', display: '<ruby>起<rt>お</rt></ruby>きる', type: 'Ichidan', causative: '起きさせる', causative_passive: '起きさせられる', ba_conditional: '起きれば' },
        { dict: '寝る', display: '<ruby>寝<rt>ね</rt></ruby>る', type: 'Ichidan', causative: '寝させる', causative_passive: '寝させられる', ba_conditional: '寝れば' },
        { dict: '信じる', display: '<ruby>信<rt>しん</rt></ruby>じる', type: 'Ichidan', causative: '信じさせる', causative_passive: '信じさせられる', ba_conditional: '信じれば' },
        { dict: '教える', display: '<ruby>教<rt>おし</rt></ruby>える', type: 'Ichidan', causative: '教えさせる', causative_passive: '教えさせられる', ba_conditional: '教えれば' },
        { dict: '調べる', display: '<ruby>調<rt>しら</rt></ruby>べる', type: 'Ichidan', causative: '調べさせる', causative_passive: '調べさせられる', ba_conditional: '調べれば' },
        { dict: '借りる', display: '<ruby>借<rt>か</rt></ruby>りる', type: 'Ichidan', causative: '借りさせる', causative_passive: '借りさせられる', ba_conditional: '借りれば' },

        // Irregular verbs
        { dict: 'する', display: 'する', type: 'Irregular', causative: 'させる', causative_passive: 'させられる', ba_conditional: 'すれば' },
        { dict: '来る', display: '<ruby>来<rt>く</rt></ruby>る', type: 'Irregular', causative: '来させる', causative_passive: '来させられる', ba_conditional: '来れば' },
    ];

    const forms = [
        { key: 'causative', name: 'Causative' },
        { key: 'causative_passive', name: 'Causative-Passive' },
        { key: 'ba_conditional', name: 'Conditional (ば)' },
    ];

    // --- State ---
    let currentVerb = null;
    let currentForm = null;

    // --- Functions ---
    function getRandomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function loadNewQuestion() {
        // Clear previous state
        feedbackArea.innerHTML = '';
        answerInput.value = '';
        answerInput.disabled = false;
        answerInput.focus();

        // Show/hide buttons
        checkBtn.style.display = 'inline-block';
        nextBtn.style.display = 'none';

        // Get new random verb and form
        currentVerb = getRandomItem(verbs);
        currentForm = getRandomItem(forms);

        // Update UI
        verbDisplay.innerHTML = currentVerb.display;
        verbTypeTag.textContent = `${currentVerb.type} Verb`;
        formDisplay.textContent = currentForm.name;
    }

    function checkAnswer() {
        const userAnswer = answerInput.value.trim();
        if (!userAnswer) return;

        const correctAnswer = currentVerb[currentForm.key];
        let isCorrect = userAnswer === correctAnswer;
        
        feedbackArea.innerHTML = ''; // Clear previous feedback
        const feedbackCard = document.createElement('div');
        feedbackCard.classList.add('feedback-card');

        if (isCorrect) {
            feedbackCard.classList.add('correct');
            feedbackCard.textContent = 'Correct!';
            
            if (window.playerDataManager) {
                window.playerDataManager.rewardXp('conjugationCorrect'); // Use centralized XP reward
                window.playerDataManager.increaseStat('conjugationCorrectTotal', 1);
                window.playerDataManager.increaseStat('conjugationStreak', 1);

                // Check for new high score streak
                const currentStreak = window.playerDataManager.getData().stats.conjugationStreak || 0;
                const highScoreStreak = window.playerDataManager.getData().stats.conjugationHighScoreStreak || 0;
                if (currentStreak > highScoreStreak) {
                    window.playerDataManager.setStat('conjugationHighScoreStreak', currentStreak);
                }

                // Increment specific form/type counters
                if (currentForm.key === 'causative') {
                    window.playerDataManager.increaseStat('conjugationCorrectCausative', 1);
                } else if (currentForm.key === 'causative_passive') {
                    window.playerDataManager.increaseStat('conjugationCorrectCausativePassive', 1);
                } else if (currentForm.key === 'ba_conditional') {
                    window.playerDataManager.increaseStat('conjugationCorrectConditional', 1);
                }

                if (currentVerb.type === 'Godan') {
                    window.playerDataManager.increaseStat('conjugationCorrectGodan', 1);
                } else if (currentVerb.type === 'Ichidan') {
                    window.playerDataManager.increaseStat('conjugationCorrectIchidan', 1);
                } else if (currentVerb.type === 'Irregular') {
                    window.playerDataManager.increaseStat('conjugationCorrectIrregular', 1);
                }

                // Check for secret verb
                if (currentVerb.dict === '死ぬ') {
                    window.playerDataManager.setStat('conjugationSecretVerbFound', 1);
                }
            }
        } else {
            feedbackCard.classList.add('incorrect');
            feedbackCard.innerHTML = `Not quite. Correct answer: <strong>${correctAnswer}</strong>`;

            if (window.playerDataManager) {
                window.playerDataManager.increaseStat('conjugationMistakes', 1);
                window.playerDataManager.setStat('conjugationStreak', 0);
            }
        }
        
        feedbackArea.appendChild(feedbackCard);

        // Update UI for next step
        answerInput.disabled = true;
        checkBtn.style.display = 'none';
        nextBtn.style.display = 'inline-block';
        nextBtn.focus();
    }

    // --- Event Listeners ---
    checkBtn.addEventListener('click', checkAnswer);
    nextBtn.addEventListener('click', loadNewQuestion);

    // MODIFIED: Consolidated Enter key logic
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Stop default form submission or line breaks

            // If 'Next' button is visible, click it.
            if (nextBtn.style.display !== 'none') {
                nextBtn.click();
            } 
            // Otherwise, if 'Check' button is visible, click it.
            else if (checkBtn.style.display !== 'none') {
                checkBtn.click();
            }
        }
    });

    // --- Initialization ---
    loadNewQuestion();
});

