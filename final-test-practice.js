document.addEventListener('DOMContentLoaded', () => {
    // Check for playerDataManager from main.js
    const playerData = window.playerDataManager;

    // --- Quiz Data based on JAPA202 Final Test Practice PDF (Pages 1-4) ---
    const quizData = {
        totalQuestions: 55, // UPDATED: 8 + 3 + 11 + 27 + 6 = 55
        pages: [
            // Page 1: Causative and Causative-passive (A)
            {
                title: 'Causative & Causative-passive (A)',
                section: 'Causative & Causative-passive',
                questions: [
                    { id: 'q1a-causative', type: 'text', answer: '部長は私にお茶を入れさせました。' },
                    { id: 'q1b-causative-passive', type: 'text', answer: '私は部長にお茶を入れさせられました。' }
                ]
            },
            // Page 2: Causative and Causative-passive (B)
            {
                title: 'Causative & Causative-passive (B)',
                section: 'Causative & Causative-passive',
                questions: [
                    { id: 'q2a-causative', type: 'text', answer: '先生は学生にむずかしい漢字を習わせました。' },
                    { id: 'q2b-causative-passive', type: 'text', answer: '学生は先生にむずかしい漢字を習わせられました。' }
                ]
            },
            // Page 3: Causative and Causative-passive (C)
            {
                title: 'Causative & Causative-passive (C)',
                section: 'Causative & Causative-passive',
                questions: [
                    { id: 'q3a-causative', type: 'text', answer: 'せんぱいはこうはいにおべんとうを買いに行かせました。' },
                    { id: 'q3b-causative-passive', type: 'text', answer: 'こうはいはせんぱいにおべんとうを買いに行かせられました。' }
                ]
            },
            // Page 4: Causative and Causative-passive (D) - ADDED
            {
                title: 'Causative & Causative-passive (D)',
                section: 'Causative & Causative-passive',
                questions: [
                    { id: 'q4a-causative-passive', type: 'text', answer: 'けんたさんはゆいさんにおごらせられました。' },
                    { id: 'q4b-causative', type: 'text', answer: 'ゆいさんはけんたさんにおごらせました。' }
                ]
            },
            // Page 5: Translation (Renumbered)
            {
                title: 'Translation',
                section: 'Translation',
                questions: [
                    { id: 'q1-translation', type: 'text', answer: 'My parents let me go out to play late at night and do a part-time job on weekends.' },
                    { id: 'q2-translation', type: 'text', answer: 'Even though there is a university exam next week, Takeshi has not started studying yet.' },
                    { id: 'q3-translation', type: 'text', answer: 'If you live alone, you can have more free time, but you cannot save money.' }
                ]
            },
            // Page 6: Particle Quiz (Renumbered)
            {
                title: 'Particles',
                section: 'Particles',
                type: 'particle',
                answers: ['に', 'を', 'に', 'が', 'が', 'N', 'に', 'で', 'に', 'N', 'を']
            },
            // Page 7: Verb Forms (Renumbered & UPDATED)
            {
                title: 'Verb Forms',
                section: 'Verb Forms',
                type: 'table',
                answers: [
                    '考えさせる', '考えさせられる', '考えれば',
                    '書かせる', '書かせられる', '書けば',
                    '飲ませる', '飲ませられる', '飲めば',
                    '運ばせる', '運ばせられる', '運べば',
                    '手伝わせる', '手伝わせられる', '手伝えば', // ADDED
                    'とまらせる', 'とまらせられる', 'とまれば', // ADDED
                    'おさせる', 'おさせられる', 'おせば',   // ADDED
                    'させる', 'させられる', 'すれば',
                    'こさせる', 'こさせられる', 'くれば'
                ]
            },
            // Page 8: Grammar and Conjugation (Renumbered)
            {
                title: 'Grammar & Conjugation',
                section: 'Grammar & Conjugation',
                questions: [
                    { id: 'q1-grammar', type: 'text', answer: '前に' },
                    { id: 'q2-grammar', type: 'text', answer: '悪くても' },
                    { id: 'q3-grammar', type: 'text', answer: 'したのに' },
                    { id: 'q4-grammar', type: 'text', answer: '間' },
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
        progressBar.style.setProperty('--progress-width', `${progressPercentage}%`);
        progressBar.style.width = `${progressPercentage}%`;
        progressText.textContent = `Page ${currentPage} / ${totalPages}`;

        // Update Buttons
        backBtn.disabled = currentPage === 1;
        
        // Logic for next/finish buttons
        const isLastContentPage = currentPage === totalPages - 1;
        nextBtn.style.display = isLastContentPage ? 'none' : 'flex';
        finishBtn.style.display = isLastContentPage ? 'flex' : 'none';


        if (currentPage === totalPages) {
            // If on results page, hide main nav
            document.getElementById('navigation-controls').style.display = 'none';
            progressText.textContent = `Test Complete!`;
        } else {
            document.getElementById('navigation-controls').style.display = 'flex';
        }
    }

    function saveAnswers() {
        const pageIndex = currentPage - 1;
        if (pageIndex >= quizData.pages.length) return; // Don't save on results page
    
        const currentPageData = quizData.pages[pageIndex];
        if (!currentPageData) return;

        userAnswers[currentPage] = [];

        if (currentPageData.type === 'particle') {
            const inputs = pages[pageIndex].querySelectorAll('.particle-input');
            inputs.forEach(input => userAnswers[currentPage].push(input.value.trim().toUpperCase())); // Use uppercase for 'N' consistency
        } else if (currentPageData.type === 'table') {
            const inputs = pages[pageIndex].querySelectorAll('.verb-input');
            inputs.forEach(input => userAnswers[currentPage].push(input.value.trim()));
        } else {
            currentPageData.questions.forEach(q => {
                if (q.type === 'text') {
                    const input = document.getElementById(q.id);
                    if (input) {
                        userAnswers[currentPage].push({ id: q.id, value: input.value.trim() });
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

                let answerIndex = 0;
                pages[index].querySelectorAll(inputSelector).forEach(input => {
                    const userAnswer = input.value.trim();
                    const correctAnswer = (pageData.type === 'particle') ? correctAnswers[answerIndex]?.toUpperCase() : correctAnswers[answerIndex];
                    
                    if (correctAnswers[answerIndex] !== undefined) {
                        if (userAnswer === correctAnswer) {
                            sectionCorrect++;
                        } else if (userAnswer !== '') {
                            totalWrongAndAttempted++;
                        }
                    }
                    answerIndex++;
                });

            } else {
                aggregatedScores[sectionIdentifier].total += pageData.questions.length;
                pageData.questions.forEach((q) => {
                    const userAnswerObj = answers.find(a => a.id === q.id);
                    const userAnswerValue = userAnswerObj ? userAnswerObj.value : '';

                    if (userAnswerValue === q.answer) {
                        sectionCorrect++;
                    } else if (userAnswerValue !== '') {
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
        // Update total score
        const percentage = quizData.totalQuestions > 0 ? Math.round((totalCorrect / quizData.totalQuestions) * 100) : 0;
        document.getElementById('total-score-display').textContent = `${percentage}%`;
        document.getElementById('total-score-details').textContent = `(${totalCorrect} / ${quizData.totalQuestions} Correct)`;

        // Display detailed scores
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

        // Award XP
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
        currentPage = totalPages; // Go to results page
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
