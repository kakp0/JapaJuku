document.addEventListener('DOMContentLoaded', () => {
    // Assumes main.js is loaded and window.playerDataManager is available.

    // --- DOM Elements ---
    const promptArea = document.getElementById('prompt-area');
    const feedbackArea = document.getElementById('feedback-area');
    const checkBtn = document.getElementById('check-btn');
    const nextBtn = document.getElementById('next-btn');
    const mainPanel = document.querySelector('.main-panel');
    const profileCard = document.getElementById('profile-card');
    const body = document.body;


    // --- Data ---
    const sentences = [
        // --- Particle Fill-in-the-blank Sentences ---
        // Text 1 Sentences
        { parts: ['涼', '会いに東京', '行った。'], answers: ['に', 'に'] },
        { parts: ['彼', '東京の銀行', '就職してからもう二年がたつ。'], answers: ['が', 'に'] },
        { parts: ['大学', '時', '毎日会っていたのに。'], answers: ['の', 'は'] },
        { parts: ['今', '私', '東京に行ったりする。'], answers: ['は', 'が'] },
        { parts: ['夏菜', 'いつも私たちのこと', 'うらやましがっている。'], answers: ['は', 'を'] },
        { parts: ['東京', '会いに行くの', '大変。'], answers: ['まで', 'は'] },
        { parts: ['早く大阪', '帰ってきてほしい。'], answers: ['に'] },
        { parts: ['今日', '涼', '大阪に来て、夕方お酒を飲みに行った。'], answers: ['は', 'が'] },
        { parts: ['涼', '相変わらず仕事', '忙しそうだ。'], answers: ['は', 'が'] },
        { parts: ['涼', '同僚', '黒木さんが彼女を探していると聞いた。'], answers: ['の', 'の'] },
        { parts: ['黒木さん', '夏菜', 'ように静かな人がタイプかもしれない。'], answers: ['は', 'の'] },
        { parts: ['今度二人', '会わせよう', '思う。'], answers: ['を', 'と'] },
        { parts: ['夏菜', '東京', '行った時、涼が黒木さんを紹介する予定。'], answers: ['が', 'に'] },
        { parts: ['東京', 'こと', '聞いてみたが、あまり話してくれなかった。'], answers: ['の', 'を'] },
        { parts: ['週末', '大阪', '会える。'], answers: ['は', 'で'] },
        { parts: ['今日', '残業', '疲れた。'], answers: ['も', 'で'] },
        { parts: ['涼からのメッセージ', '携帯に入っていた。'], answers: ['が'] },
        { parts: ['仕事だ', 'しかた', 'ないけど。'], answers: ['から', 'が'] },
        { parts: ['帰る時、駅', 'ホーム', '夏菜を見た。'], answers: ['の', 'で'] },
        { parts: ['男の人', '一緒', '楽しそうに話していた。'], answers: ['と', 'に'] },
        { parts: ['どうして私', '言ってくれないんだろう。'], answers: ['に'] },
        { parts: ['桜', '手紙を書くの', '本当にひさしぶりだね。'], answers: ['に', 'は'] },
        { parts: ['ぼく', '桜', 'うそをついていた。'], answers: ['は', 'に'] },
        { parts: ['夏菜さん', '東京', '来た時、黒木は急に用事ができた。'], answers: ['が', 'に'] },
        { parts: ['ぼく', '代わりに二日間東京', '案内してあげたんだ。'], answers: ['が', 'を'] },
        { parts: ['彼女', '大阪', '帰った後も、彼女のことが忘れられなかった。'], answers: ['が', 'に'] },
        { parts: ['本当', '大阪', '夏菜さんに会っていたんだ。'], answers: ['は', 'で'] },

        // Text 2 Sentences
        { parts: ['「厄年」', 'いう言葉', '聞いたことがありますか。'], answers: ['と', 'を'] },
        { parts: ['多くの日本人', '、厄年', '悪いことがよく起こると信じています。'], answers: ['は', 'に'] },
        { parts: ['男の人', '厄年', '二十五歳と四十二歳と六十一歳です。'], answers: ['の', 'は'] },
        { parts: ['これ', 'ただ', '迷信だと言う人もいます。'], answers: ['は', 'の'] },
        { parts: ['ある友だち', '台風', '家が壊れてしまいました。'], answers: ['は', 'で'] },
        { parts: ['ある友だち', '飼っていた犬', '死なれました。'], answers: ['は', 'に'] },
        { parts: ['外国', '勉強するの', '長い間の夢でした。'], answers: ['で', 'は'] },
        { parts: ['ここ', '若い日本人', '留学生がたくさんいます。'], answers: ['には', 'の'] },
        { parts: ['みんな親', 'お金を送って', 'らい、いいアパートに住んでいる。'], answers: ['に', 'も'] },
        { parts: ['夢', 'かなった', '、毎日がとても幸せでした。'], answers: ['が', 'ので'] },
        { parts: ['アパート', '帰った時、ドアのかぎ', '壊されていた。'], answers: ['に', 'が'] },
        { parts: ['どろぼう', '入られた', '気がつきました。'], answers: ['に', 'と'] },
        { parts: ['ネット', '日本の家族', '話したり、ビデオを見たりする。'], answers: ['で', 'と'] },
        { parts: ['自転車', '、学校', '通う時使っていました。'], answers: ['は', 'に'] },
        { parts: ['今日', 'バス', '通わなければいけません。'], answers: ['から', 'で'] },
        { parts: ['バス', 'よく遅れるし、一時間', '一台しか来ない。'], answers: ['は', 'に'] },
        { parts: ['どうしてどろぼう', '私のアパート', '入ったんだろう。'], answers: ['は', 'に'] },
        { parts: ['弟', '妹', 'お守りを送ってもらおうと思う。'], answers: ['か', 'に'] },

        // Text 3 Sentences
        { parts: ['パリ', 'さむい日', 'つづいていますが、東京はいかがですか。'], answers: ['では', 'が'] },
        { parts: ['大学', '授業', 'いそがしくて、日本を出てから三か月もたってしまいました。'], answers: ['の', 'で'] },
        { parts: ['留学中', 'たいへんお世話', 'なりました。'], answers: ['は', 'に'] },
        { parts: ['はじめ', '日本語', 'わからなくて、不安でした。'], answers: ['は', 'が'] },
        { parts: ['お母さん', 'おかげ', '、日本語が上手になりました。'], answers: ['の', 'で'] },
        { parts: ['お姉さん', 'いっしょ', 'テニスをしたりした。'], answers: ['と', 'に'] },
        { parts: ['お父さん', '作ってくれたカレー', 'なつかしいです。'], answers: ['が', 'も'] },
        { parts: ['その時、会えるの', '楽しみ', 'しています。'], answers: ['を', 'に'] },

        // --- Verb/Adjective Conjugation Sentences ---
        // Causative (せる/させる)
        { parts: ['先生は生徒に宿題を', '。'], answers: ['させた'], translation: 'The teacher made the students do homework.' },
        { parts: ['母は子供に部屋を掃除', '。'], answers: ['させる'], translation: 'The mother makes her child clean the room.' },
        { parts: ['部長は私に資料を', '。'], answers: ['作らせた'], translation: 'The manager made me create the documents.' },
        { parts: ['父は弟を買い物に', '。'], answers: ['行かせた'], translation: 'My father made my younger brother go shopping.' },
        { parts: ['コーチは選手にもっと', '。'], answers: ['走らせた'], translation: 'The coach made the players run more.' },
        { parts: ['親は子供に好きなことを', '。'], answers: ['させてあげたい'], translation: 'Parents want to let their children do what they love.' },
        { parts: ['彼に少し', 'ほうがいい。'], answers: ['休ませた'], translation: 'It is better to let him rest a little.' },
        { parts: ['先生は私たちに自由に意見を', '。'], answers: ['言わせてくれた'], translation: 'The teacher let us freely state our opinions.' },
        
        // Causative-Passive (せられる/させられる)
        { parts: ['私は上司に毎日', '。'], answers: ['残業させられる'], translation: 'I am made to work overtime every day by my boss.' },
        { parts: ['子供の時、よく兄に', '。'], answers: ['泣かされた'], translation: 'When I was a child, I was often made to cry by my older brother.' },
        { parts: ['彼は先生に廊下に', '。'], answers: ['立たせられた'], translation: 'He was made to stand in the hallway by the teacher.' },
        { parts: ['妹は母にピアノを', '。'], answers: ['習わせられた'], translation: 'My younger sister was made to learn the piano by our mother.' },
        { parts: ['先輩に重い荷物を', '。'], answers: ['持たされた'], translation: 'I was made to carry heavy luggage by a senior.' },
        { parts: ['嫌いな野菜を毎日', '。'], answers: ['食べさせられた'], translation: 'I was made to eat vegetables I dislike every day.' },
        { parts: ['みんなの前で歌を', '、恥ずかしかった。'], answers: ['歌わされて'], translation: 'I was embarrassed because I was made to sing in front of everyone.' },
        { parts: ['父に車を', '。'], answers: ['洗わされた'], translation: 'I was made to wash the car by my father.' },
        { parts: ['興味のない本を', 'のは苦痛だ。'], answers: ['読まされる'], translation: 'Being made to read a book I have no interest in is painful.' },

        // Passive (れる/られる)
        { parts: ['この本は多くの人に', '。'], answers: ['読まれている'], translation: 'This book is read by many people.' },
        { parts: ['どろぼうに', '。'], answers: ['入られた'], translation: 'My house was broken into by a thief.' },
        { parts: ['飼っていた犬に', '。'], answers: ['死なれた'], translation: 'My pet dog died.' },
        { parts: ['会議で、部長に名前を', '。'], answers: ['呼ばれた'], translation: 'My name was called by the manager at the meeting.' },
        { parts: ['知らない人に道を', '。'], answers: ['聞かれた'], translation: 'I was asked for directions by a stranger.' },
        
        // Conditional (ば)
        { parts: ['春に', '、桜が咲きます。'], answers: ['なれば'], translation: 'If it becomes spring, the cherry blossoms will bloom.' },
        { parts: ['ボタンを', '、ドアが開きます。'], answers: ['押せば'], translation: 'If you press the button, the door will open.' },
        { parts: ['もっと勉強', '、試験に合格できただろう。'], answers: ['すれば'], translation: 'If I had studied more, I probably would have passed the exam.' },
        { parts: ['お金が', '、世界旅行がしたい。'], answers: ['あれば'], translation: 'If I had money, I would want to travel the world.' },
        { parts: ['早く', '、始発電車に間に合う。'], answers: ['起きれば'], translation: 'If you wake up early, you can make it for the first train.' },
        { parts: ['薬を', '、きっとよくなります。'], answers: ['飲めば'], translation: 'If you take the medicine, you will surely get better.' },
        { parts: ['', '、そのパソコンを買います。'], answers: ['安ければ'], translation: 'If it is cheap, I will buy that computer.' },
        { parts: ['', '、どこでも勉強できます。'], answers: ['静かなら'], translation: 'If it is quiet, I can study anywhere.' },

        // Potential (れる/られる)
        { parts: ['彼女のことが', '。'], answers: ['忘れられない'], translation: "I can't forget about her." },
        { parts: ['納豆が', 'ようになりました。'], answers: ['食べられる'], translation: 'I became able to eat natto.' },
        { parts: ['重い荷物だったが、一人で', '。'], answers: ['持てた'], translation: 'It was heavy luggage, but I was able to carry it by myself.' },
        { parts: ['忙しくて、黒木さんに', '。'], answers: ['会えなかった'], translation: "I was busy, so I couldn't meet Mr. Kuroki." },
        
        // Mixed / Other Common Forms
        { parts: ['大学の時は毎日', 'のに。'], answers: ['会っていた'], translation: 'We used to meet every day when we were in university.' },
        { parts: ['涼なら教えてくれると', 'のに。'], answers: ['思った'], translation: 'I thought Ryo would tell me.' },
        { parts: ['大阪に', '。'], answers: ['行けなくなった'], translation: 'I became unable to go to Osaka.' },
        { parts: ['楽しそうに', '。'], answers: ['話していた'], translation: 'They were talking cheerfully.' },
        { parts: ['約束を', 'ごめん。'], answers: ['守れなくて'], translation: "I'm sorry I couldn't keep my promise." },
        { parts: ['台風で家が', '。'], answers: ['壊れてしまった'], translation: 'The house was destroyed by the typhoon.' },
        { parts: ['日本に', 'と思います。'], answers: ['行ってよかった'], translation: 'I think it was a good thing that I went to Japan.' },
        { parts: ['', 'いけませんでした。'], answers: ['入院しなければ'], translation: 'I had to be hospitalized.' }
    ];

    // --- State ---
    let currentSentence = null;
    let inputElements = [];
    let quizState = 'answering'; // Can be 'answering' or 'feedback'

    // --- Functions ---
    const handleResponsiveLayout = () => {
        const breakpoint = 1400; // The width where the layout changes

        if (!profileCard || !mainPanel || !body) {
            console.error("Required elements for layout handling are missing.");
            return;
        }

        // Non-PC Mode (Integrated/Mobile View)
        if (window.innerWidth <= breakpoint) {
            // If the profile card is not already inside the main panel, move it.
            if (profileCard.parentElement !== mainPanel) {
                mainPanel.appendChild(profileCard);
            }
        } 
        // PC Mode (Desktop View)
        else {
            // If the profile card is not a direct child of the body, move it back.
            if (profileCard.parentElement !== body) {
                 // Place it before the app-container to restore the original desktop DOM structure.
                 body.insertBefore(profileCard, document.getElementById('app-container'));
            }
        }
    };

    function getRandomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function loadNewQuestion() {
        // Clear previous state
        promptArea.innerHTML = '';
        feedbackArea.innerHTML = '';
        inputElements = [];

        // Show/hide buttons and enable controls
        checkBtn.style.display = 'inline-block';
        nextBtn.style.display = 'none';
        quizState = 'answering';
        
        // Get new random sentence
        currentSentence = getRandomItem(sentences);

        // Create an inner container for the sentence parts to allow wrapping
        const sentenceInnerContainer = document.createElement('div');
        sentenceInnerContainer.className = 'sentence-inner-container';

        // Build the sentence in the UI
        currentSentence.parts.forEach((part, index) => {
            // Add the text part
            const partSpan = document.createElement('span');
            partSpan.className = 'sentence-part';
            partSpan.textContent = part;
            sentenceInnerContainer.appendChild(partSpan);

            // Add an input for a blank after each part, except the last one
            if (index < currentSentence.answers.length) {
                const input = document.createElement('input');
                input.type = 'text';
                input.lang = 'ja';
                input.autocomplete = 'off';
                sentenceInnerContainer.appendChild(input);
                inputElements.push(input);
            }
        });
        
        promptArea.appendChild(sentenceInnerContainer);

        // Add translation if it exists for the sentence type
        if (currentSentence.translation) {
            const translationDiv = document.createElement('div');
            translationDiv.className = 'sentence-translation';
            translationDiv.textContent = currentSentence.translation;
            promptArea.appendChild(translationDiv);
        }

        // Focus the first input
        if (inputElements.length > 0) {
            inputElements[0].focus();
        }
    }

    function checkAnswer() {
        const userAnswers = inputElements.map(input => input.value.trim());
        
        // NEW: Check for empty answers and track for an achievement
        if (userAnswers.some(answer => answer === '')) {
            if (window.playerDataManager) {
                window.playerDataManager.increaseStat('scEmptiedHanded', 1);
            }
            // Maybe add a subtle shake or visual cue here in the future
            return; 
        }

        const correctAnswers = currentSentence.answers;
        let allCorrect = true;


        // Disable all inputs
        inputElements.forEach(input => input.disabled = true);

        // Check each answer
        userAnswers.forEach((userAnswer, index) => {
            const isCorrect = userAnswer === correctAnswers[index];
            inputElements[index].classList.add(isCorrect ? 'correct' : 'incorrect');
            if (!isCorrect) {
                allCorrect = false;
            }
        });

        // Display feedback and update stats
        feedbackArea.innerHTML = ''; // Clear previous feedback
        const feedbackCard = document.createElement('div');
        feedbackCard.classList.add('feedback-card');

        if (allCorrect) {
            feedbackCard.classList.add('correct');
            feedbackCard.textContent = 'Perfect!';
            
            if (window.playerDataManager) {
                const playerData = window.playerDataManager.getData();
                // NEW: Check for "Quick Study" achievement
                if (playerData.stats.sentenceCompletionCorrectTotal === 0 && playerData.stats.sentenceCompletionMistakes === 0) {
                    window.playerDataManager.setStat('scFirstTrySuccess', 1);
                }

                window.playerDataManager.rewardXp('sentenceCompletionCorrect'); // Use centralized XP reward
                window.playerDataManager.increaseStat('sentenceCompletionCorrectTotal', 1);
                window.playerDataManager.increaseStat('sentenceCompletionStreak', 1);

                // NEW: Track specific particles for achievements
                correctAnswers.forEach(answer => {
                    switch (answer) {
                        case 'は': window.playerDataManager.increaseStat('scTyped_は', 1); break;
                        case 'が': window.playerDataManager.increaseStat('scTyped_が', 1); break;
                        case 'を': window.playerDataManager.increaseStat('scTyped_を', 1); break;
                        case 'に': window.playerDataManager.increaseStat('scTyped_に', 1); break;
                        case 'で': window.playerDataManager.increaseStat('scTyped_で', 1); break;
                        case 'の': window.playerDataManager.increaseStat('scTyped_の', 1); break;
                    }
                });

                const currentStreak = window.playerDataManager.getData().stats.sentenceCompletionStreak || 0;
                const highScoreStreak = window.playerDataManager.getData().stats.sentenceCompletionHighScoreStreak || 0;
                if (currentStreak > highScoreStreak) {
                    window.playerDataManager.setStat('sentenceCompletionHighScoreStreak', currentStreak);
                }
            }
        } else {
            feedbackCard.classList.add('incorrect');
            const correctAnswersHtml = correctAnswers.map(ans => `<strong>${ans}</strong>`).join(', ');
            feedbackCard.innerHTML = `Not quite. The correct answer was: ${correctAnswersHtml}`;

            if (window.playerDataManager) {
                window.playerDataManager.increaseStat('sentenceCompletionMistakes', 1);
                window.playerDataManager.setStat('sentenceCompletionStreak', 0);
            }
        }
        
        feedbackArea.appendChild(feedbackCard);

        // Update UI for next step
        checkBtn.style.display = 'none';
        nextBtn.style.display = 'inline-block';
        quizState = 'feedback';
        nextBtn.focus();
    }
    
    // --- Event Listeners ---
    checkBtn.addEventListener('click', checkAnswer);
    nextBtn.addEventListener('click', loadNewQuestion);

    // Centralized Enter key handler
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') {
            return; // Ignore keys other than Enter
        }

        // Prevent default behavior for the Enter key, like submitting a form
        e.preventDefault();

        if (quizState === 'answering') {
            // Only act if the user is focused on an input field
            if (document.activeElement.tagName === 'INPUT' && inputElements.includes(document.activeElement)) {
                
                const allFilled = inputElements.every(input => input.value.trim() !== '');

                if (allFilled) {
                    checkAnswer();
                } else {
                    // Logic to move to the next empty input field
                    const currentIndex = inputElements.indexOf(document.activeElement);
                    const nextInput = inputElements[currentIndex + 1];
                    if (nextInput) {
                        nextInput.focus();
                    } else {
                        // Or, if at the last input, find the first empty one and focus it
                        const firstEmpty = inputElements.find(input => input.value.trim() === '');
                        if (firstEmpty) {
                            firstEmpty.focus();
                        } else {
                            // If somehow all are filled but the check didn't trigger, trigger it.
                            checkAnswer();
                        }
                    }
                }
            }
        } else if (quizState === 'feedback') {
            loadNewQuestion();
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
