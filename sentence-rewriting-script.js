document.addEventListener('DOMContentLoaded', () => {
    // Assumes main.js is loaded and window.playerDataManager is available.

    // --- DOM Elements ---
    const sentenceDisplay = document.getElementById('sentence-display');
    const modifierDisplay = document.getElementById('modifier-display');
    const translationHint = document.getElementById('translation-hint');
    const answerInput = document.getElementById('answer-input');
    const feedbackArea = document.getElementById('feedback-area');
    const checkBtn = document.getElementById('check-btn');
    const nextBtn = document.getElementById('next-btn');
    // NEW: Elements for responsive layout
    const profileCard = document.getElementById('profile-card');
    const appContainer = document.getElementById('app-container');
    const body = document.body;


    // --- Data with English Translations ---
    const sentences = [
        { 
            original: '学生が本を読みます。', display: '<ruby>学生<rt>がくせい</rt></ruby>が<ruby>本<rt>ほん</rt></ruby>を<ruby>読<rt>よ</rt></ruby>みます。', 
            causative: '先生は学生に本を読ませます。', causative_en: 'The teacher makes the student read the book.',
            passive: '本は学生に読まれます。', passive_en: 'The book is read by the student.',
            causative_passive: '学生は先生に本を読ませられます。', causative_passive_en: 'The student is made to read the book by the teacher.',
            のに: '学生は本を読んだのに、話を忘れました。', noni_en: 'Even though the student read the book, they forgot the story.'
        },
        { 
            original: '兄が手紙を書きます。', display: '<ruby>兄<rt>あに</rt></ruby>が<ruby>手紙<rt>てがみ</rt></ruby>を<ruby>書<rt>か</rt></ruby>きます。', 
            causative: '父は兄に手紙を書かせます。', causative_en: 'My father makes my older brother write a letter.',
            passive: '手紙は兄に書かれます。', passive_en: 'The letter is written by my older brother.',
            causative_passive: '兄は父に手紙を書かせられます。', causative_passive_en: 'My older brother is made to write a letter by my father.',
            のに: '兄は手紙を書いたのに、まだ送っていません。', noni_en: 'Although my older brother wrote the letter, he hasn\'t sent it yet.'
        },
        { 
            original: '猫が魚を食べます。', display: '<ruby>猫<rt>ねこ</rt></ruby>が<ruby>魚<rt>さかな</rt></ruby>を<ruby>食<rt>た</rt></ruby>べます。', 
            causative: '私が猫に魚を食べさせます。', causative_en: 'I let the cat eat the fish.',
            passive: '魚は猫に食べられます。', passive_en: 'The fish is eaten by the cat.',
            causative_passive: '猫は私に魚を食べさせられます。', causative_passive_en: 'The cat is made to eat the fish by me.',
            のに: '猫は魚を食べたのに、まだお腹が空いています。', noni_en: 'Even though the cat ate the fish, it is still hungry.'
        },
        { 
            original: '彼がドアを開けます。', display: '<ruby>彼<rt>かれ</rt></ruby>がドアを<ruby>開<rt>あ</rt></ruby>けます。', 
            causative: '彼女は彼にドアを開けさせます。', causative_en: 'She makes him open the door.',
            passive: 'ドアは彼に開けられます。', passive_en: 'The door is opened by him.',
            causative_passive: '彼は彼女にドアを開けさせられます。', causative_passive_en: 'He is made to open the door by her.',
            のに: '彼はドアを開けたのに、誰もいませんでした。', noni_en: 'Although he opened the door, nobody was there.'
        },
        { 
            original: '田中さんが映画を見ます。', display: '<ruby>田中<rt>たなか</rt></ruby>さんが<ruby>映画<rt>えいが</rt></ruby>を<ruby>見<rt>み</rt></ruby>ます。', 
            causative: '鈴木さんは田中さんに映画を見させます。', causative_en: 'Mr. Suzuki makes Mr. Tanaka watch the movie.',
            passive: '映画は田中さんに見られます。', passive_en: 'The movie is watched by Mr. Tanaka.',
            causative_passive: '田中さんは鈴木さんに映画を見させられます。', causative_passive_en: 'Mr. Tanaka is made to watch the movie by Mr. Suzuki.',
            のに: '田中さんは映画を見たのに、面白くなかったです。', noni_en: 'Even though Mr. Tanaka watched the movie, it wasn\'t interesting.'
        },
        { 
            original: '子供がジュースを飲みます。', display: '<ruby>子供<rt>こども</rt></ruby>がジュースを<ruby>飲<rt>の</rt></ruby>みます。', 
            causative: '母は子供にジュースを飲ませます。', causative_en: 'The mother makes the child drink juice.',
            passive: 'ジュースは子供に飲まれます。', passive_en: 'The juice is drunk by the child.',
            causative_passive: '子供は母にジュースを飲ませられます。', causative_passive_en: 'The child is made to drink juice by the mother.',
            のに: '子供はジュースを飲んだのに、まだ喉が渇いています。', noni_en: 'Although the child drank juice, they are still thirsty.'
        },
        { 
            original: 'シェフがピザを作ります。', display: 'シェフがピザを<ruby>作<rt>つく</rt></ruby>ります。', 
            causative: '私はシェフにピザを作らせます。', causative_en: 'I make the chef make a pizza.',
            passive: 'ピザはシェフに作られます。', passive_en: 'The pizza is made by the chef.',
            causative_passive: 'シェフは私にピザを作らせられます。', causative_passive_en: 'The chef is made to make a pizza by me.',
            のに: 'シェフはピザを作ったのに、誰も食べませんでした。', noni_en: 'Even though the chef made a pizza, nobody ate it.'
        },
        { 
            original: '弟が部屋を掃除します。', display: '<ruby>弟<rt>おとうと</rt></ruby>が<ruby>部屋<rt>へや</rt></ruby>を<ruby>掃除<rt>そうじ</rt></ruby>します。', 
            causative: '母は弟に部屋を掃除させます。', causative_en: 'My mother makes my younger brother clean the room.',
            passive: '部屋は弟に掃除されます。', passive_en: 'The room is cleaned by my younger brother.',
            causative_passive: '弟は母に部屋を掃除させられます。', causative_passive_en: 'My younger brother is made to clean the room by my mother.',
            のに: '弟は部屋を掃除したのに、すぐにまた汚れました。', noni_en: 'Although my younger brother cleaned the room, it got dirty again right away.'
        },
        { 
            original: '彼がピアノをひきます。', display: '<ruby>彼<rt>かれ</rt></ruby>がピアノをひきます。', 
            causative: '先生は彼にピアノをひかせます。', causative_en: 'The teacher makes him play the piano.',
            passive: 'ピアノは彼にひかれます。', passive_en: 'The piano is played by him.',
            causative_passive: '彼は先生にピアノをひかせられます。', causative_passive_en: 'He is made to play the piano by the teacher.',
            のに: '彼はピアノをひいたのに、誰も聞いていませんでした。', noni_en: 'Even though he played the piano, no one was listening.'
        },
        { 
            original: '友達が写真を撮ります。', display: '<ruby>友達<rt>ともだち</rt></ruby>が<ruby>写真<rt>しゃしん</rt></ruby>を<ruby>撮<rt>と</rt></ruby>ります。', 
            causative: '私は友達に写真を撮らせます。', causative_en: 'I have my friend take a picture.',
            passive: '写真は友達に撮られます。', passive_en: 'The picture is taken by my friend.',
            causative_passive: '友達は私に写真を撮らせられます。', causative_passive_en: 'My friend is made to take a picture by me.',
            のに: '友達は写真を撮ったのに、写真は暗いです。', noni_en: 'Even though my friend took the picture, it is dark.'
        },
        { 
            original: '子供が絵を描きます。', display: '<ruby>子供<rt>こども</rt></ruby>が<ruby>絵<rt>え</rt></ruby>を<ruby>描<rt>か</rt></ruby>きます。', 
            causative: 'お母さんは子供に絵を描かせます。', causative_en: 'The mother makes the child draw a picture.',
            passive: '絵は子供に描かれます。', passive_en: 'The picture is drawn by the child.',
            causative_passive: '子供はお母さんに絵を描かせられます。', causative_passive_en: 'The child is made to draw a picture by the mother.',
            のに: '子供は絵を描いたのに、上手じゃないです。', noni_en: 'Even though the child drew a picture, they aren\'t good at it.'
        },
        { 
            original: '先生が漢字を教えます。', display: '<ruby>先生<rt>せんせい</rt></ruby>が<ruby>漢字<rt>かんじ</rt></ruby>を<ruby>教<rt>おし</rt></ruby>えます。', 
            causative: '学校は先生に漢字を教えさせます。', causative_en: 'The school makes the teacher teach kanji.',
            passive: '漢字は先生に教えられます。', passive_en: 'Kanji is taught by the teacher.',
            causative_passive: '先生は学校に漢字を教えさせられます。', causative_passive_en: 'The teacher is made to teach kanji by the school.',
            のに: '先生は漢字を教えたのに、学生は忘れました。', noni_en: 'Even though the teacher taught kanji, the students forgot it.'
        },
        { 
            original: '妹がお皿を洗います。', display: '<ruby>妹<rt>いもうと</rt></ruby>が<ruby>お皿<rt>さら</rt></ruby>を<ruby>洗<rt>あら</rt></ruby>います。', 
            causative: '母は妹にお皿を洗わせます。', causative_en: 'My mother makes my younger sister wash the dishes.',
            passive: 'お皿は妹に洗われます。', passive_en: 'The dishes are washed by my younger sister.',
            causative_passive: '妹は母にお皿を洗わせられます。', causative_passive_en: 'My younger sister is made to wash the dishes by my mother.',
            のに: '妹はお皿を洗ったのに、まだきれいじゃないです。', noni_en: 'Although my younger sister washed the dishes, they still aren\'t clean.'
        },
        { 
            original: '会社員が書類を作ります。', display: '<ruby>会社員<rt>かいしゃいん</rt></ruby>が<ruby>書類<rt>しょるい</rt></ruby>を<ruby>作<rt>つく</rt></ruby>ります。', 
            causative: '部長は会社員に書類を作らせます。', causative_en: 'The manager makes the employee create documents.',
            passive: '書類は会社員に作られます。', passive_en: 'The documents are created by the employee.',
            causative_passive: '会社員は部長に書類を作らせられます。', causative_passive_en: 'The employee is made to create documents by the manager.',
            のに: '会社員は書類を作ったのに、間違いが多いです。', noni_en: 'Even though the employee created the documents, there are many mistakes.'
        },
        { 
            original: '学生が質問をします。', display: '<ruby>学生<rt>がくせい</rt></ruby>が<ruby>質問<rt>しつもん</rt></ruby>をします。', 
            causative: '先生は学生に質問をさせます。', causative_en: 'The teacher makes the student ask a question.',
            passive: '質問は学生にされます。', passive_en: 'The question is asked by the student.',
            causative_passive: '学生は先生に質問をさせられます。', causative_passive_en: 'The student is made to ask a question by the teacher.',
            のに: '学生は質問をしたのに、先生は答えませんでした。', noni_en: 'Even though the student asked a question, the teacher did not answer.'
        },
        { 
            original: '学生が電気を消します。', display: '<ruby>学生<rt>がくせい</rt></ruby>が<ruby>電気<rt>でんき</rt></ruby>を<ruby>消<rt>け</rt></ruby>します。', 
            causative: '先生は学生に電気を消させます。', causative_en: 'The teacher makes the student turn off the light.',
            passive: '電気は学生に消されます。', passive_en: 'The light is turned off by the student.',
            causative_passive: '学生は先生に電気を消させられます。', causative_passive_en: 'The student is made to turn off the light by the teacher.',
            のに: '学生は電気を消したのに、部屋はまだ明るいです。', noni_en: 'Even though the student turned off the light, the room is still bright.'
        },
    ];
    // --- State Variables ---
    let currentSentence = {};
    let currentModification = '';
    const playerData = window.playerDataManager;

    // --- NEW: Function to handle moving the profile card and its layout ---
    const handleResponsiveLayout = () => {
        const breakpoint = 1400; // The pixel width where the layout changes
        const mainPanel = appContainer.querySelector('.main-panel');

        if (!profileCard || !mainPanel || !body) {
            console.error("Required elements for layout handling are missing.");
            return; // Exit if key elements aren't found
        }

        if (window.innerWidth <= breakpoint) {
            // On screens 1400px or less, the card is inside the main panel
            if (profileCard.parentElement !== mainPanel) {
                mainPanel.appendChild(profileCard);
            }
        } else {
            // On larger screens, the card is a sibling to the app container
            if (profileCard.parentElement !== body) {
                body.insertBefore(profileCard, appContainer);
            }
        }
    };


    // --- FUNCTION to scale font size based on text length ---
    function adjustSentenceFontSize(sentenceText) {
        const textLength = sentenceText.length;
        const isMobile = window.innerWidth <= 680;
        let fontSize;

        if (isMobile) {
            // More aggressive scaling for mobile vertical screens
            if (textLength > 20) {
                fontSize = '1.1rem';
            } else if (textLength > 15) {
                fontSize = '1.2rem';
            } else if (textLength > 10) {
                fontSize = '1.3rem';
            } else {
                fontSize = '1.4rem'; // Matches the base CSS for mobile
            }
        } else {
            // Original scaling for desktop
            if (textLength > 30) {
                fontSize = '1.2rem';
            } else if (textLength > 20) {
                fontSize = '1.5rem';
            } else {
                fontSize = '1.75rem'; // Default size for shorter sentences
            }
        }
        sentenceDisplay.style.fontSize = fontSize;
    }

    // --- Core Logic ---
    function loadNewQuestion() {
        // Reset UI
        answerInput.value = '';
        answerInput.disabled = false;
        feedbackArea.innerHTML = '';
        checkBtn.style.display = 'inline-block';
        nextBtn.style.display = 'none';

        // Select a random sentence
        const randomIndex = Math.floor(Math.random() * sentences.length);
        currentSentence = sentences[randomIndex];
        
        // Select a random modification type that exists for the sentence
        const possibleModifications = Object.keys(currentSentence).filter(key => key !== 'original' && key !== 'display' && !key.endsWith('_en'));
        const randomModificationKey = possibleModifications[Math.floor(Math.random() * possibleModifications.length)];
        currentModification = randomModificationKey;

        sentenceDisplay.innerHTML = currentSentence.display;
        
        // Call the new function to adjust the font size based on the original text length
        adjustSentenceFontSize(currentSentence.original);

        modifierDisplay.textContent = currentModification.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        // Display the English hint
        const hintText = currentSentence[`${currentModification}_en`];
        translationHint.textContent = hintText ? `Hint: "${hintText}"` : '';

        answerInput.focus();
    }

    function checkAnswer() {
        const userAnswer = answerInput.value.trim();
        const primaryCorrectAnswer = currentSentence[currentModification];
        // Allow for multiple correct answers if defined in the future
        const correctAnswers = Array.isArray(primaryCorrectAnswer) ? primaryCorrectAnswer : [primaryCorrectAnswer];

        if (!userAnswer) {
            // Handle empty answer
            const feedbackCard = document.createElement('div');
            feedbackCard.className = 'feedback-card incorrect';
            feedbackCard.textContent = 'Please enter an answer.';
            feedbackArea.innerHTML = '';
            feedbackArea.appendChild(feedbackCard);
            return;
        }

        const isCorrect = correctAnswers.some(answer => userAnswer === answer);

        const feedbackCard = document.createElement('div');
        feedbackCard.className = 'feedback-card';
        feedbackArea.innerHTML = ''; // Clear previous feedback

        if (isCorrect) {
            feedbackCard.classList.add('correct');
            feedbackCard.textContent = 'Correct!';
            if (playerData) {
                playerData.rewardXp('sentenceRewritingCorrect'); // Grant XP for correct answer
                playerData.increaseStat('sentenceRewritingCorrectTotal', 1); // Use 'CorrectTotal' for consistency
                playerData.increaseStat('sentenceRewritingStreak', 1);
                
                // Track correct answers by type
                const statSuffix = currentModification.charAt(0).toUpperCase() + currentModification.slice(1).replace(/_(\w)/g, (match, p1) => p1.toUpperCase());
                playerData.increaseStat(`sentenceRewritingCorrect${statSuffix}`, 1);
            }
        } else {
            feedbackCard.classList.add('incorrect');
            feedbackCard.innerHTML = `Not quite. Correct answer: <strong>${primaryCorrectAnswer}</strong>`;

            if (playerData) {
                playerData.rewardXp('sentenceRewritingIncorrectAttempt'); // Reward half XP for the attempt
                playerData.increaseStat('sentenceRewritingMistakes', 1);
                playerData.setStat('sentenceRewritingStreak', 0); // Reset streak
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

    // Consolidated 'Enter' key logic
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent default form submission or line break
            
            // If the 'Next' button is visible, click it.
            if (nextBtn.style.display !== 'none') {
                nextBtn.click();
            } 
            // Otherwise, if the 'Check' button is visible, click it.
            else if (checkBtn.style.display !== 'none') {
                checkBtn.click();
            }
        }
    });

    // --- Initialization & Resize Handling ---
    loadNewQuestion();
    handleResponsiveLayout(); // Call on initial load

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            handleResponsiveLayout();
            if (currentSentence.original) {
                adjustSentenceFontSize(currentSentence.original);
            }
        }, 250);
    });
});
