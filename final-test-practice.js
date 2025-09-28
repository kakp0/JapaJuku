document.addEventListener('DOMContentLoaded', () => {
    // Check for playerDataManager from main.js
    const playerData = window.playerDataManager;

    // --- Helper function for lenient answer checking ---
    function normalizeAnswer(str) {
        if (typeof str !== 'string') return '';
        // For Japanese: remove punctuation (。, 、, ・), full-width spaces, and standard spaces.
        // For English: convert to lowercase, remove punctuation, and spaces.
        // This makes comparisons insensitive to minor formatting differences.
        return str
            .trim()
            .toLowerCase() // Handles English case-insensitivity
            .replace(/[.,!?。、・']/g, '') // Remove common punctuation
            .replace(/　/g, '') // Remove full-width Japanese spaces
            .replace(/\s+/g, ''); // Remove all other whitespace
    }


    // --- Quiz Data corrected based on JAPA202 Final Test Practice Answers PDF ---
    const quizData = {
        totalQuestions: 55, // 8 + 3 + 12 + 27 + 5 = 55 (re-adjusted particle/grammar counts)
        pages: [
            // Page 1: Causative and Causative-passive (A)
            {
                title: 'Causative & Causative-passive (A)',
                section: 'Causative & Causative-passive',
                questions: [
                    { id: 'q1a-causative', type: 'text', answer: '私にお茶を入れさせました' },
                    { id: 'q1b-causative-passive', type: 'text', answer: '部長にお茶を入れさせられました' }
                ]
            },
            // Page 2: Causative and Causative-passive (B)
            {
                title: 'Causative & Causative-passive (B)',
                section: 'Causative & Causative-passive',
                questions: [
                    { id: 'q2a-causative', type: 'text', answer: '学生にむずかしい漢字を習わせました' },
                    { id: 'q2b-causative-passive', type: 'text', answer: '先生にむずかしい漢字を習わされました' } // Corrected conjugation
                ]
            },
            // Page 3: Causative and Causative-passive (C)
            {
                title: 'Causative & Causative-passive (C)',
                section: 'Causative & Causative-passive',
                questions: [
                    { id: 'q3a-causative', type: 'text', answer: 'こうはいにおべんとうを買いに行かせました' },
                    { id: 'q3b-causative-passive', type: 'text', answer: 'せんぱいにおべんとうを買いに行かされました' } // Corrected conjugation
                ]
            },
            // Page 4: Causative and Causative-passive (D)
            {
                title: 'Causative & Causative-passive (D)',
                section: 'Causative & Causative-passive',
                questions: [
                    { id: 'q4a-causative-passive', type: 'text', answer: 'ゆいさんにおごらせました' }, // Corrected and swapped
                    { id: 'q4b-causative', type: 'text', answer: 'けんたさんにおごらされました' } // Corrected and swapped
                ]
            },
            // Page 5: Translation
            {
                title: 'Translation',
                section: 'Translation',
                questions: [
                    { id: 'q1-translation', type: 'text', answer: 'My parents allowed me to go out and have fun on weekends until late and to do a part-time job.' }, // Matched PDF
                    { id: 'q2-translation', type: 'text', answer: "Even though there is a university exam next week, Takeshi still hasn't started studying." }, // Matched PDF
                    { id: 'q3-translation', type: 'text', answer: "If I live alone, I'll have more free time, but I won't be able to save money." } // Matched PDF
                ]
            },
            // Page 6: Particle Quiz
            {
                title: 'Particles',
                section: 'Particles',
                type: 'particle',
                answers: ['に', 'を', 'に', 'が', 'が', 'N', 'に', 'で', 'に', 'N', ['が', 'を']] // Corrected based on PDF
            },
            // Page 7: Verb Forms (in Hiragana as per instructions)
            {
                title: 'Verb Forms',
                section: 'Verb Forms',
                type: 'table',
                answers: [
                    'かんがえさせる', 'かんがえさせられる', 'かんがえれば',
                    'かかせる', 'かかされる', 'かけば',
                    'のませる', 'のまされる', 'のめば',
                    'はこばせる', 'はこばされる', 'はこべば',
                    'てつだわせる', 'てつだわされる', 'てつだえば',
                    'とまらせる', 'とまらされる', 'とまれば',
                    'おさせる', 'おさせられる', 'おせば',
                    'させる', 'させられる', 'すれば',
                    'こさせる', 'こさせられる', 'くれば'
                ]
            },
            // Page 8: Grammar and Conjugation
            {
                title: 'Grammar & Conjugation',
                section: 'Grammar & Conjugation',
                questions: [
                    { id: 'q1-grammar', type: 'text', answer: 'なるまで' },      // Corrected
                    { id: 'q2-grammar', type: 'text', answer: '悪くても' },
                    { id: 'q3-grammar', type: 'text', answer: 'したのに' },
                    { id: 'q4-grammar', type: 'text', answer: '来ている間' },  // Corrected
                    { id: 'q5-grammar', type: 'text', answer: 'しなければ' },
                    { id: 'q6-grammar', type: 'text', answer: 'してから' }
                ]
            }
        ]
    };

    // --- DOM Elements ---
    const quizContainer = document.getElementById('quiz-container');
    const pages = quizContainer.querySelectorAll('.quiz-page');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const nextBtn = document.getElementById('next-btn');
    const backBtn = document.getElementById('back-btn');
    const finishBtn = document.getElementById('finish-btn');
    const restartBtn = document.getElementById('restart-btn');

    // --- State ---
    let currentPage = 1;
    const totalPages = pages.length;
    let userAnswers = {};

    // --- Functions ---
    function updateUI() {
        // Update Pages
        pages.forEach(page => {
            const pageNum = parseInt(page.dataset.page, 10);
            page.classList.toggle('active-page', pageNum === currentPage);
        });

        // Update Progress Bar
        const progressPercentage = ((currentPage - 1) / (totalPages - 1)) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        progressText.textContent = `Page ${currentPage} / ${totalPages}`;

        // Update Buttons
        backBtn.disabled = currentPage === 1;
        
        const isLastContentPage = currentPage === totalPages - 1;
        nextBtn.style.display = isLastContentPage ? 'none' : 'flex';
        finishBtn.style.display = isLastContentPage ? 'flex' : 'none';

        if (currentPage === totalPages) {
            document.getElementById('navigation-controls').style.display = 'none';
            progressText.textContent = `Test Complete!`;
        } else {
            document.getElementById('navigation-controls').style.display = 'flex';
        }
    }

    function saveAnswers() {
        const pageIndex = currentPage - 1;
        if (pageIndex >= quizData.pages.length) return;
    
        const currentPageData = quizData.pages[pageIndex];
        if (!currentPageData) return;

        userAnswers[currentPage] = [];

        if (currentPageData.type === 'particle') {
            const inputs = pages[pageIndex].querySelectorAll('.particle-input');
            inputs.forEach(input => userAnswers[currentPage].push(input.value));
        } else if (currentPageData.type === 'table') {
            const inputs = pages[pageIndex].querySelectorAll('.verb-input');
            inputs.forEach(input => userAnswers[currentPage].push(input.value));
        } else {
            currentPageData.questions.forEach(q => {
                if (q.type === 'text') {
                    const input = document.getElementById(q.id);
                    if (input) {
                        userAnswers[currentPage].push({ id: q.id, value: input.value });
                    }
                }
            });
        }
    }

    function calculateResults() {
        let totalCorrect = 0;
        let totalWrongAndAttempted = 0;
        const aggregatedScores = {};

        quizData.pages.forEach((pageData, index) => {
            const pageNum = index + 1;
            if (pageNum >= totalPages) return;

            const sectionIdentifier = pageData.section || pageData.title;
            if (!aggregatedScores[sectionIdentifier]) {
                aggregatedScores[sectionIdentifier] = { title: sectionIdentifier, correct: 0, total: 0 };
            }

            let sectionCorrect = 0;
            const answers = userAnswers[pageNum] || [];

            if (pageData.type === 'particle' || pageData.type === 'table') {
                const inputSelector = pageData.type === 'particle' ? '.particle-input' : '.verb-input';
                const correctAnswers = pageData.answers;
                aggregatedScores[sectionIdentifier].total += correctAnswers.length;

                const userPageAnswers = answers;
                userPageAnswers.forEach((userAnswerRaw, answerIndex) => {
                    const correctAnswer = correctAnswers[answerIndex];
                    
                    if (correctAnswer !== undefined) {
                        const normalizedUserAnswer = normalizeAnswer(userAnswerRaw);
                        let isCorrect = false;

                        if (Array.isArray(correctAnswer)) {
                            // If correct answer is an array of possibilities (e.g., ['が', 'を'])
                            const normalizedOptions = correctAnswer.map(opt => normalizeAnswer(opt));
                            if (normalizedOptions.includes(normalizedUserAnswer)) {
                                isCorrect = true;
                            }
                        } else {
                            // If correct answer is a single string
                            const normalizedCorrectAnswer = normalizeAnswer(correctAnswer);
                            if (normalizedUserAnswer === normalizedCorrectAnswer) {
                                isCorrect = true;
                            }
                        }
                        
                        if (isCorrect) {
                            sectionCorrect++;
                        } else if (userAnswerRaw.trim() !== '') {
                            totalWrongAndAttempted++;
                        }
                    }
                });

            } else {
                aggregatedScores[sectionIdentifier].total += pageData.questions.length;
                pageData.questions.forEach((q) => {
                    const userAnswerObj = answers.find(a => a.id === q.id);
                    const userAnswerValue = userAnswerObj ? userAnswerObj.value : '';

                    const normalizedUserAnswer = normalizeAnswer(userAnswerValue);
                    const normalizedCorrectAnswer = normalizeAnswer(q.answer);

                    if (normalizedCorrectAnswer.length > 0 && normalizedUserAnswer === normalizedCorrectAnswer) {
                        sectionCorrect++;
                    } else if (userAnswerValue.trim() !== '') {
                        totalWrongAndAttempted++;
                    }
                });
            }

            totalCorrect += sectionCorrect;
            aggregatedScores[sectionIdentifier].correct += sectionCorrect;
        });

        const sectionScores = Object.values(aggregatedScores);
        return { totalCorrect, totalWrongAndAttempted, sectionScores };
    }

    function displayResults({ totalCorrect, totalWrongAndAttempted, sectionScores }) {
        const percentage = quizData.totalQuestions > 0 ? Math.round((totalCorrect / quizData.totalQuestions) * 100) : 0;
        document.getElementById('total-score-display').textContent = `${percentage}%`;
        document.getElementById('total-score-details').textContent = `(${totalCorrect} / ${quizData.totalQuestions} Correct)`;

        const detailsContainer = document.getElementById('detailed-scores');
        detailsContainer.innerHTML = '';
        sectionScores.forEach(sec => {
            const item = document.createElement('div');
            item.className = 'detail-score-item';
            item.innerHTML = `
                <span class="section-name">${sec.title}</span>
                <span class="section-score">${sec.correct} / ${sec.total}</span>
            `;
            detailsContainer.appendChild(item);
        });

        if (playerData) {
            for (let i = 0; i < totalCorrect; i++) {
                playerData.rewardXp('quizCorrect');
            }
            for (let i = 0; i < totalWrongAndAttempted; i++) {
                playerData.rewardXp('quizWrong');
            }
        }
    }

    // --- Event Listeners ---
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages - 1) {
            saveAnswers();
            currentPage++;
            updateUI();
        }
    });

    backBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            saveAnswers();
            currentPage--;
            updateUI();
        }
    });

    finishBtn.addEventListener('click', () => {
        saveAnswers();
        const results = calculateResults();
        displayResults(results);
        currentPage = totalPages;
        updateUI();
    });

    restartBtn.addEventListener('click', () => {
        currentPage = 1;
        userAnswers = {};
        document.querySelectorAll('input[type="text"], .particle-input, .verb-input, .grammar-input').forEach(i => i.value = '');
        document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
        updateUI();
    });

    // --- Initial Setup ---
    updateUI();
});
