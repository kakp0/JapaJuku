document.addEventListener('DOMContentLoaded', () => {
    // Assumes main.js is loaded and window.playerDataManager is available.

    // --- DOM Elements ---
    const sentenceDisplay = document.getElementById('japanese-sentence-display');
    const answerInput = document.getElementById('answer-input');
    const feedbackArea = document.getElementById('feedback-area');
    const checkBtn = document.getElementById('check-btn');
    const nextBtn = document.getElementById('next-btn');
    const mainPanel = document.querySelector('.main-panel');
    const profileCard = document.getElementById('profile-card');
    const body = document.body;

    // --- Data ---
    const sentences = [
        { 
            original: '学生が本を読みます。', display: '<ruby>学生<rt>がくせい</rt></ruby>が<ruby>本<rt>ほん</rt></ruby>を<ruby>読<rt>よ</rt></ruby>みます。', original_en: ['The student reads the book.'],
            causative: '先生は学生に本を読ませます。', causative_en: ['The teacher makes the student read the book.', 'The teacher has the student read the book.'],
            passive: '本は学生に読まれます。', passive_en: ['The book is read by the student.'],
            causative_passive: '学生は先生に本を読ませられます。', causative_passive_en: ['The student is made to read the book by the teacher.'],
            noni: '学生は本を読んだのに、話を忘れました。', noni_en: ['Even though the student read the book, they forgot the story.', 'Although the student read the book, they forgot the story.']
        },
        { 
            original: '兄が手紙を書きます。', display: '<ruby>兄<rt>あに</rt></ruby>が<ruby>手紙<rt>てがみ</rt></ruby>を<ruby>書<rt>か</rt></ruby>きます。', original_en: ['My older brother writes a letter.'],
            causative: '父は兄に手紙を書かせます。', causative_en: ['My father makes my older brother write a letter.', 'My father has my older brother write a letter.'],
            passive: '手紙は兄に書かれます。', passive_en: ['The letter is written by my older brother.'],
            causative_passive: '兄は父に手紙を書かせられます。', causative_passive_en: ['My older brother is made to write a letter by my father.'],
            noni: '兄は手紙を書いたのに、まだ送っていません。', noni_en: ["Although my older brother wrote the letter, he hasn't sent it yet.", "Even though my older brother wrote the letter, he hasn't sent it yet."]
        },
        { 
            original: '猫が魚を食べます。', display: '<ruby>猫<rt>ねこ</rt></ruby>が<ruby>魚<rt>さかな</rt></ruby>を<ruby>食<rt>た</rt></ruby>べます。', original_en: ['The cat eats the fish.'],
            causative: '私が猫に魚を食べさせます。', causative_en: ['I let the cat eat the fish.', 'I allow the cat to eat the fish.'],
            passive: '魚は猫に食べられます。', passive_en: ['The fish is eaten by the cat.'],
            causative_passive: '猫は私に魚を食べさせられます。', causative_passive_en: ['The cat is made to eat the fish by me.'],
            noni: '猫は魚を食べたのに、まだお腹が空いています。', noni_en: ['Even though the cat ate the fish, it is still hungry.', 'Although the cat ate the fish, it is still hungry.']
        },
        { 
            original: '彼がドアを開けます。', display: '<ruby>彼<rt>かれ</rt></ruby>がドアを<ruby>開<rt>あ</rt></ruby>けます。', original_en: ['He opens the door.'],
            causative: '彼女は彼にドアを開けさせます。', causative_en: ['She makes him open the door.', 'She has him open the door.'],
            passive: 'ドアは彼に開けられます。', passive_en: ['The door is opened by him.'],
            causative_passive: '彼は彼女にドアを開けさせられます。', causative_passive_en: ['He is made to open the door by her.'],
            noni: '彼はドアを開けたのに、誰もいませんでした。', noni_en: ['Although he opened the door, nobody was there.', 'Even though he opened the door, nobody was there.']
        },
        { 
            original: '田中さんが映画を見ます。', display: '<ruby>田中<rt>たなか</rt></ruby>さんが<ruby>映画<rt>えいが</rt></ruby>を<ruby>見<rt>み</rt></ruby>ます。', original_en: ['Mr. Tanaka watches the movie.'],
            causative: '鈴木さんは田中さんに映画を見させます。', causative_en: ['Mr. Suzuki makes Mr. Tanaka watch the movie.', 'Mr. Suzuki has Mr. Tanaka watch the movie.'],
            passive: '映画は田中さんに見られます。', passive_en: ['The movie is watched by Mr. Tanaka.'],
            causative_passive: '田中さんは鈴木さんに映画を見させられます。', causative_passive_en: ['Mr. Tanaka is made to watch the movie by Mr. Suzuki.'],
            noni: '田中さんは映画を見たのに、面白くなかったです。', noni_en: ["Even though Mr. Tanaka watched the movie, it wasn't interesting.", "Although Mr. Tanaka watched the movie, it wasn't interesting."]
        },
        { 
            original: '子供がジュースを飲みます。', display: '<ruby>子供<rt>こども</rt></ruby>がジュースを<ruby>飲<rt>の</rt></ruby>みます。', original_en: ['The child drinks juice.'],
            causative: '母は子供にジュースを飲ませます。', causative_en: ['The mother makes the child drink juice.', 'The mother has the child drink juice.'],
            passive: 'ジュースは子供に飲まれます。', passive_en: ['The juice is drunk by the child.'],
            causative_passive: '子供は母にジュースを飲ませられます。', causative_passive_en: ['The child is made to drink juice by the mother.'],
            noni: '子供はジュースを飲んだのに、まだ喉が渇いています。', noni_en: ['Although the child drank juice, they are still thirsty.', 'Even though the child drank juice, they are still thirsty.']
        },
        { 
            original: 'シェフがピザを作ります。', display: 'シェフがピザを<ruby>作<rt>つく</rt></ruby>ります。', original_en: ['The chef makes a pizza.'],
            causative: '私はシェフにピザを作らせます。', causative_en: ['I make the chef make a pizza.', 'I have the chef make a pizza.'],
            passive: 'ピザはシェフに作られます。', passive_en: ['The pizza is made by the chef.'],
            causative_passive: 'シェフは私にピザを作らせられます。', causative_passive_en: ['The chef is made to make a pizza by me.'],
            noni: 'シェフはピザを作ったのに、誰も食べませんでした。', noni_en: ['Even though the chef made a pizza, nobody ate it.', 'Although the chef made a pizza, nobody ate it.']
        },
        { 
            original: '弟が部屋を掃除します。', display: '<ruby>弟<rt>おとうと</rt></ruby>が<ruby>部屋<rt>へや</rt></ruby>を<ruby>掃除<rt>そうじ</rt></ruby>します。', original_en: ['My younger brother cleans the room.'],
            causative: '母は弟に部屋を掃除させます。', causative_en: ['My mother makes my younger brother clean the room.', 'My mother has my younger brother clean the room.'],
            passive: '部屋は弟に掃除されます。', passive_en: ['The room is cleaned by my younger brother.'],
            causative_passive: '弟は母に部屋を掃除させられます。', causative_passive_en: ['My younger brother is made to clean the room by my mother.'],
            noni: '弟は部屋を掃除したのに、すぐにまた汚れました。', noni_en: ['Although my younger brother cleaned the room, it got dirty again right away.', 'Even though my younger brother cleaned the room, it got dirty again right away.']
        },
        { 
            original: '彼がピアノをひきます。', display: '<ruby>彼<rt>かれ</rt></ruby>がピアノをひきます。', original_en: ['He plays the piano.'],
            causative: '先生は彼にピアノをひかせます。', causative_en: ['The teacher makes him play the piano.', 'The teacher has him play the piano.'],
            passive: 'ピアノは彼にひかれます。', passive_en: ['The piano is played by him.'],
            causative_passive: '彼は先生にピアノをひかせられます。', causative_passive_en: ['He is made to play the piano by the teacher.'],
            noni: '彼はピアノをひいたのに、誰も聞いていませんでした。', noni_en: ['Even though he played the piano, no one was listening.', 'Although he played the piano, no one was listening.']
        },
        { 
            original: '友達が写真を撮ります。', display: '<ruby>友達<rt>ともだち</rt></ruby>が<ruby>写真<rt>しゃしん</rt></ruby>を<ruby>撮<rt>と</rt></ruby>ります。', original_en: ['My friend takes a picture.'],
            causative: '私は友達に写真を撮らせます。', causative_en: ['I have my friend take a picture.', 'I make my friend take a picture.', 'I get my friend to take a picture.'],
            passive: '写真は友達に撮られます。', passive_en: ['The picture is taken by my friend.'],
            causative_passive: '友達は私に写真を撮らせられます。', causative_passive_en: ['My friend is made to take a picture by me.'],
            noni: '友達は写真を撮ったのに、写真は暗いです。', noni_en: ['Even though my friend took the picture, it is dark.', 'Although my friend took the picture, it is dark.']
        },
    ];

    const sentenceTypes = ['original', 'causative', 'passive', 'causative_passive', 'noni'];

    // --- State ---
    let currentSentence = null;
    let currentSentenceType = null;

    // --- Functions ---
    const handleResponsiveLayout = () => {
        const breakpoint = 1400;
        const mobileBreakpoint = 1100;

        if (!profileCard || !mainPanel || !body) {
            console.error("Required elements for layout handling are missing.");
            return;
        }

        // Middle Zone (Integrated View) & Mobile Zone (Stacked View)
        if (window.innerWidth <= breakpoint) {
            // If card is not already in the main panel, move it there.
            if (profileCard.parentElement !== mainPanel) {
                mainPanel.appendChild(profileCard);
            }
        } 
        // Desktop Zone
        else {
            // If card is not already a direct child of the body, move it back.
            if (profileCard.parentElement !== body) {
                 // Place it before the app-container to maintain a consistent DOM structure for CSS.
                 body.insertBefore(profileCard, document.getElementById('app-container'));
            }
        }
    };

    function getRandomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function loadNewQuestion() {
        feedbackArea.innerHTML = '';
        answerInput.value = '';
        answerInput.disabled = false;
        answerInput.focus();
        checkBtn.style.display = 'inline-block';
        nextBtn.style.display = 'none';

        currentSentence = getRandomItem(sentences);
        currentSentenceType = getRandomItem(sentenceTypes);

        const japaneseText = (currentSentenceType === 'original') 
            ? currentSentence.display 
            : currentSentence[currentSentenceType];
        sentenceDisplay.innerHTML = japaneseText;
    }

    function normalizeString(str) {
        if (!str) return '';
        return str.toLowerCase().replace(/[.,?!']/g, '').trim();
    }

    function checkAnswer() {
        const userAnswer = answerInput.value;
        if (!userAnswer) return;

        const correctAnswerKey = `${currentSentenceType}_en`;
        const correctAnswers = currentSentence[correctAnswerKey];
        const possibleAnswers = Array.isArray(correctAnswers) ? correctAnswers : [correctAnswers];
        const normalizedUserAnswer = normalizeString(userAnswer);
        const isCorrect = possibleAnswers.some(answer => normalizeString(answer) === normalizedUserAnswer);
        
        feedbackArea.innerHTML = ''; 
        const feedbackCard = document.createElement('div');
        feedbackCard.classList.add('feedback-card');

        const playerData = window.playerDataManager;

        if (isCorrect) {
            feedbackCard.classList.add('correct');
            feedbackCard.textContent = 'Correct!';
            
            if (playerData) {
                playerData.rewardXp('sentenceTranslationCorrect');
                playerData.increaseStat('sentenceTranslationCorrectTotal', 1);

                // Increment stat for specific sentence type
                const statSuffix = currentSentenceType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
                if (statSuffix && statSuffix !== 'Original') { // We don't track 'original' type
                    playerData.increaseStat(`sentenceTranslationCorrect${statSuffix}`, 1);
                }
                
                // Check for secret cat achievement
                if (currentSentence.original.includes('猫')) {
                    playerData.increaseStat('transSecretCat', 1);
                }

                const currentStreak = (playerData.getData().stats.sentenceTranslationStreak || 0) + 1;
                playerData.setStat('sentenceTranslationStreak', currentStreak);
                playerData.setStat('sentenceTranslationHighScoreStreak', currentStreak);
            }
        } else {
            feedbackCard.classList.add('incorrect');
            feedbackCard.innerHTML = `Not quite. Correct answer: <strong>${possibleAnswers[0]}</strong>`;

            if (playerData) {
                playerData.increaseStat('sentenceTranslationMistakes', 1);
                playerData.setStat('sentenceTranslationStreak', 0);
            }
        }
        
        feedbackArea.appendChild(feedbackCard);

        answerInput.disabled = true;
        checkBtn.style.display = 'none';
        nextBtn.style.display = 'inline-block';
        nextBtn.focus();
    }

    // --- Event Listeners ---
    checkBtn.addEventListener('click', checkAnswer);
    nextBtn.addEventListener('click', loadNewQuestion);

    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent default action for Enter key

            // If the "Next" button is visible, click it. This takes priority.
            if (nextBtn.style.display !== 'none') {
                nextBtn.click();
            } 
            // Otherwise, if the "Check" button is visible, click it.
            else if (checkBtn.style.display !== 'none') {
                checkBtn.click();
            }
        }
    });

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResponsiveLayout, 250);
    });

    // --- Initialization ---
    loadNewQuestion();
    handleResponsiveLayout();
});

