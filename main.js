(function() { // IIFE to avoid polluting global scope
    // --- Configuration ---
    const PLAYER_DATA_KEY = 'japaneseLearnerProgress';
    const THEME_KEY = 'japaneseLearnerTheme';
    const XP_PER_LEVEL = 100;

    // --- NEW: Centralized XP Rewards Configuration ---
    // This is the single spot where you can edit all XP values for different activities.
    const xpRewards = {
        // Kanji Practice (Values are ready for when you implement this)
        kanjiPracticeGrade: 0.3,
        kanjiQuizRateAnswer: 10,
        kanjiReadingCorrectNormal: 5,
        kanjiReadingCorrectHard: 8,

        // Conjugation Practice
        conjugationCorrect: 10,

        // Sentence Completion
        sentenceCompletionCorrect: 15,

        // Sentence Rewriting
        sentenceRewritingCorrect: 12,

        // Sentence Translation
        sentenceTranslationCorrect: 10,

        // Written Passage (XP awarded for every 5 characters written)
        passageCharactersWritten: 2,
    };


    // --- Tiers Configuration ---
    // Tier 1: Common, Tier 2: Uncommon, Tier 3: Rare, Tier 4: Epic, Tier 5: Mythic, Tier 6: Legendary
    const titleTiers = {
        1: { name: 'Common' },
        2: { name: 'Uncommon' },
        3: { name: 'Rare' },
        4: { name: 'Epic' },
        5: { name: 'Mythic' },
        6: { name: 'Legendary' }
    };

    // --- Achievements Data ---
    // Added a 'tier' property to each achievement based on difficulty.
    const achievementsList = [
        // General Achievements
        { id: 'level_1', name: 'はじめの一歩', description: 'Reach Level 1.', tier: 1, requirement: { type: 'stat', stat: 'level', value: 1 }, category: 'general' },
        { id: 'level_5', name: 'Apprentice', description: 'Reach Level 5.', tier: 2, requirement: { type: 'stat', stat: 'level', value: 5 }, category: 'general' },
        { id: 'level_10', name: 'Adept', description: 'Reach Level 10.', tier: 3, requirement: { type: 'stat', stat: 'level', value: 10 }, category: 'general' },
        { id: 'level_20', name: 'Scholar', description: 'Reach Level 20.', tier: 4, requirement: { type: 'stat', stat: 'level', value: 20 }, category: 'general' },
        { id: 'level_50', name: 'Master', description: 'Reach Level 50.', tier: 5, requirement: { type: 'stat', stat: 'level', value: 50 }, category: 'general' },
        { id: 'level_100', name: 'Shogun', description: 'Reach Level 100.', tier: 6, requirement: { type: 'stat', stat: 'level', value: 100 }, category: 'general' },

        // Kanji Achievements
        { id: 'kanji_draw_score_80', name: 'Getting the Hang of It', description: 'Score 80%+ on a Kanji drawing.', tier: 1, requirement: { type: 'stat', stat: 'kanjiDrawingHighScore', value: 80 }, category: 'kanji' },
        { id: 'kanji_draw_score_90', name: 'Perfectionist', description: 'Score 90%+ on a Kanji drawing.', tier: 2, requirement: { type: 'stat', stat: 'kanjiDrawingHighScore', value: 90 }, category: 'kanji' },
        { id: 'kanji_draw_score_98', name: 'Pixel Perfect', description: 'Score 98%+ on a Kanji drawing.', tier: 2, requirement: { type: 'stat', stat: 'kanjiDrawingHighScore', value: 98 }, category: 'kanji' },
        { id: 'kanji_draw_score_100', name: 'A Perfect Stroke', description: 'Score 100% on a Kanji drawing.', tier: 3, requirement: { type: 'stat', stat: 'kanjiPerfectScore', value: 1 }, category: 'kanji' },
        { id: 'kanji_graded_matsu', name: 'Patiently Waiting', description: 'Successfully grade the Kanji for "wait" (待).', tier: 1, requirement: { type: 'stat', stat: 'kanjiGraded_待', value: 1 }, category: 'kanji' },
        { id: 'kanji_graded_mamoru', name: 'Ever Vigilant', description: 'Successfully grade the Kanji for "protect" (守).', tier: 1, requirement: { type: 'stat', stat: 'kanjiGraded_守', value: 1 }, category: 'kanji' },
        { id: 'kanji_graded_sue', name: 'The Final Stroke', description: 'Successfully grade the Kanji for "end" (末).', tier: 1, requirement: { type: 'stat', stat: 'kanjiGraded_末', value: 1 }, category: 'kanji' },
        { id: 'kanji_quiz_dist_50k', name: 'Novice Calligrapher', description: 'Draw 50,000 pixels in the Drawing Quiz.', tier: 2, requirement: { type: 'stat', stat: 'kanjiQuizDrawnDistance', value: 50000 }, category: 'kanji' },
        { id: 'kanji_quiz_dist_100k', name: 'Master Calligrapher', description: 'Draw 100,000 pixels in the Drawing Quiz.', tier: 3, requirement: { type: 'stat', stat: 'kanjiQuizDrawnDistance', value: 100000 }, category: 'kanji' },
        { id: 'kanji_quiz_dist_1M', name: 'Pixel Picasso', description: 'Draw 1,000,000 pixels in the Drawing Quiz.', tier: 5, requirement: { type: 'stat', stat: 'kanjiQuizDrawnDistance', value: 1000000 }, category: 'kanji' },
        { id: 'kanji_review_10', name: 'Juggler', description: 'Have 10+ Kanji in your review queue.', tier: 2, requirement: { type: 'stat', stat: 'kanjiInReview', value: 10 }, category: 'kanji' },
        { id: 'kanji_review_20', name: 'Plate Spinner', description: 'Have 20+ Kanji in your review queue.', tier: 3, requirement: { type: 'stat', stat: 'kanjiInReview', value: 20 }, category: 'kanji' },
        { id: 'kanji_review_all', name: 'Master of Memory', description: 'Have all 31 Kanji in your review queue.', tier: 4, requirement: { type: 'stat', stat: 'kanjiInReview', value: 31 }, category: 'kanji' },
        { id: 'kanji_quiz_reveal_10', name: 'A Glimpse', description: 'Reveal the answer 10 times in the Drawing Quiz.', tier: 1, requirement: { type: 'stat', stat: 'kanjiQuizReveals', value: 10 }, category: 'kanji' },
        { id: 'kanji_quiz_reveal_50', name: 'Relying on the Answer', description: 'Reveal the answer 50 times in the Drawing Quiz.', tier: 2, requirement: { type: 'stat', stat: 'kanjiQuizReveals', value: 50 }, category: 'kanji' },
        { id: 'kanji_rated_again_10', name: 'Again and Again', description: 'Rate 10 cards as \'Again\'.', tier: 1, requirement: { type: 'stat', stat: 'kanjiRatedAgain', value: 10 }, category: 'kanji' },
        { id: 'kanji_rated_hard_10', name: 'This One\'s Tough', description: 'Rate 10 cards as \'Hard\'.', tier: 1, requirement: { type: 'stat', stat: 'kanjiRatedHard', value: 10 }, category: 'kanji' },
        { id: 'kanji_rated_good_25', name: 'Good to Go', description: 'Rate 25 cards as \'Good\'.', tier: 2, requirement: { type: 'stat', stat: 'kanjiRatedGood', value: 25 }, category: 'kanji' },
        { id: 'kanji_rated_easy_25', name: 'Easy Peasy', description: 'Rate 25 cards as \'Easy\'.', tier: 2, requirement: { type: 'stat', stat: 'kanjiRatedEasy', value: 25 }, category: 'kanji' },
        { id: 'kanji_deck_reset_1', name: 'Fresh Start', description: 'Reset your Kanji drawing quiz deck.', tier: 2, requirement: { type: 'stat', stat: 'kanjiDeckResets', value: 1 }, category: 'kanji' },
        { id: 'kanji_deck_reset_5', name: 'Clean Slate', description: 'Reset your Kanji drawing quiz deck 5 times.', tier: 3, requirement: { type: 'stat', stat: 'kanjiDeckResets', value: 5 }, category: 'kanji' },
        { id: 'kanji_read_10', name: 'First Words', description: 'Get 10 correct answers in the Reading Quiz.', tier: 1, requirement: { type: 'stat', stat: 'kanjiReadingCorrect', value: 10 }, category: 'kanji' },
        { id: 'kanji_read_100', name: '本の虫', description: 'Get 100 correct answers in the Reading Quiz.', tier: 3, requirement: { type: 'stat', stat: 'kanjiReadingCorrect', value: 100 }, category: 'kanji' },
        { id: 'kanji_read_500', name: 'Walking Dictionary', description: 'Get 500 correct answers in the Reading Quiz.', tier: 4, requirement: { type: 'stat', stat: 'kanjiReadingCorrect', value: 500 }, category: 'kanji' },
        { id: 'kanji_read_hard_50', name: 'Typing Prodigy', description: 'Get 50 correct in Reading Quiz (Hard Mode).', tier: 3, requirement: { type: 'stat', stat: 'kanjiReadingHardModeCorrect', value: 50 }, category: 'kanji' },
        { id: 'kanji_read_hard_200', name: 'Keyboard Warrior', description: 'Get 200 correct in Reading Quiz (Hard Mode).', tier: 4, requirement: { type: 'stat', stat: 'kanjiReadingHardModeCorrect', value: 200 }, category: 'kanji' },
        { id: 'kanji_read_streak_10', name: 'Quick Wit', description: 'Achieve a 10-answer streak in the Reading Quiz.', tier: 2, requirement: { type: 'stat', stat: 'kanjiReadingHighScoreStreak', value: 10 }, category: 'kanji' },
        { id: 'kanji_read_streak_25', name: '天才', description: 'Achieve a 25-answer streak in the Reading Quiz.', tier: 4, requirement: { type: 'stat', stat: 'kanjiReadingHighScoreStreak', value: 25 }, category: 'kanji' },
        { id: 'kanji_read_mistake_1', name: '七転び八起き', description: 'Make your first mistake in the Reading Quiz.', tier: 1, requirement: { type: 'stat', stat: 'kanjiReadingMistakes', value: 1 }, category: 'kanji' },
        { id: 'kanji_secret_gin', name: 'Secret Silver', description: 'Correctly identify a reading for 銀 (silver).', tier: 3, requirement: { type: 'stat', stat: 'kanjiSecretSilverFound', value: 1 }, category: 'kanji' },

        // Conjugation Achievements
        { id: 'conj_correct_10', name: 'Novice Conjugator', description: 'Get 10 correct conjugations.', tier: 1, requirement: { type: 'stat', stat: 'conjugationCorrectTotal', value: 10 }, category: 'conjugation' },
        { id: 'conj_correct_50', name: 'Adept Conjugator', description: 'Get 50 correct conjugations.', tier: 2, requirement: { type: 'stat', stat: 'conjugationCorrectTotal', value: 50 }, category: 'conjugation' },
        { id: 'conj_correct_200', name: 'Expert Conjugator', description: 'Get 200 correct conjugations.', tier: 3, requirement: { type: 'stat', stat: 'conjugationCorrectTotal', value: 200 }, category: 'conjugation' },
        { id: 'conj_correct_500', name: 'Verb Virtuoso', description: 'Get 500 correct conjugations.', tier: 4, requirement: { type: 'stat', stat: 'conjugationCorrectTotal', value: 500 }, category: 'conjugation' },
        { id: 'conj_causative_25', name: 'Causative Commander', description: 'Correctly conjugate 25 Causative forms.', tier: 2, requirement: { type: 'stat', stat: 'conjugationCorrectCausative', value: 25 }, category: 'conjugation' },
        { id: 'conj_passive_25', name: 'Passive Powerhouse', description: 'Correctly conjugate 25 Causative-Passive forms.', tier: 2, requirement: { type: 'stat', stat: 'conjugationCorrectCausativePassive', value: 25 }, category: 'conjugation' },
        { id: 'conj_conditional_25', name: 'Conditional Champ', description: 'Correctly conjugate 25 Conditional (ば) forms.', tier: 2, requirement: { type: 'stat', stat: 'conjugationCorrectConditional', value: 25 }, category: 'conjugation' },
        { id: 'conj_godan_50', name: 'Godan Grad', description: 'Correctly conjugate 50 Godan verbs.', tier: 2, requirement: { type: 'stat', stat: 'conjugationCorrectGodan', value: 50 }, category: 'conjugation' },
        { id: 'conj_ichidan_50', name: 'Ichidan Ace', description: 'Correctly conjugate 50 Ichidan verbs.', tier: 2, requirement: { type: 'stat', stat: 'conjugationCorrectIchidan', value: 50 }, category: 'conjugation' },
        { id: 'conj_irregular_25', name: 'Irregular Ruler', description: 'Correctly conjugate 25 Irregular verbs.', tier: 2, requirement: { type: 'stat', stat: 'conjugationCorrectIrregular', value: 25 }, category: 'conjugation' },
        { id: 'conj_streak_10', name: 'On a Roll', description: 'Achieve a 10-answer streak in conjugation.', tier: 3, requirement: { type: 'stat', stat: 'conjugationHighScoreStreak', value: 10 }, category: 'conjugation' },
        { id: 'conj_streak_25', name: 'Unstoppable', description: 'Achieve a 25-answer streak in conjugation.', tier: 4, requirement: { type: 'stat', stat: 'conjugationHighScoreStreak', value: 25 }, category: 'conjugation' },
        { id: 'conj_streak_50', name: 'Perfection', description: 'Achieve a 50-answer streak in conjugation.', tier: 6, requirement: { type: 'stat', stat: 'conjugationHighScoreStreak', value: 50 }, category: 'conjugation' },
        { id: 'conj_mistake_1', name: 'Learning Curve', description: 'Make your first mistake in conjugation.', tier: 1, requirement: { type: 'stat', stat: 'conjugationMistakes', value: 1 }, category: 'conjugation' },
        { id: 'conj_secret_shinu', name: 'Grim Reaper', description: 'Conjugate the verb 死ぬ.', tier: 3, requirement: { type: 'stat', stat: 'conjugationSecretVerbFound', value: 1 }, category: 'conjugation' },

        // Written Passage Achievements
        { id: 'passage_char_1', name: 'First Draft', description: 'Write your first character in a passage.', tier: 1, requirement: { type: 'stat', stat: 'passageCharsWrittenTotal', value: 1 }, category: 'passage' },
        { id: 'passage_char_250', name: 'Budding Author', description: 'Write a total of 250 characters.', tier: 2, requirement: { type: 'stat', stat: 'passageCharsWrittenTotal', value: 250 }, category: 'passage' },
        { id: 'passage_char_1000', name: '小説家', description: 'Write a total of 1000 characters.', tier: 3, requirement: { type: 'stat', stat: 'passageCharsWrittenTotal', value: 1000 }, category: 'passage' },
        { id: 'passage_deletes_100', name: 'The Editor', description: 'Press backspace or delete 100 times.', tier: 1, requirement: { type: 'stat', stat: 'passageDeletes', value: 100 }, category: 'passage' },
        { id: 'passage_streak_50', name: 'Word Weaver', description: 'Write 50 characters without deleting.', tier: 3, requirement: { type: 'stat', stat: 'passageHighScoreStreak', value: 50 }, category: 'passage' },
        
        // Sentence Completion Achievements
        { id: 'sc_correct_10', name: 'Particle Pro', description: 'Correctly complete 10 sentences.', tier: 1, requirement: { type: 'stat', stat: 'sentenceCompletionCorrectTotal', value: 10 }, category: 'sentenceCompletion' },
        { id: 'sc_correct_50', name: 'Grammar Guru', description: 'Correctly complete 50 sentences.', tier: 2, requirement: { type: 'stat', stat: 'sentenceCompletionCorrectTotal', value: 50 }, category: 'sentenceCompletion' },
        { id: 'sc_correct_250', name: 'Sentence Architect', description: 'Correctly complete 250 sentences.', tier: 4, requirement: { type: 'stat', stat: 'sentenceCompletionCorrectTotal', value: 250 }, category: 'sentenceCompletion' },
        { id: 'sc_streak_15', name: 'Sentence Striker', description: 'Achieve a 15-sentence streak.', tier: 3, requirement: { type: 'stat', stat: 'sentenceCompletionHighScoreStreak', value: 15 }, category: 'sentenceCompletion' },
        { id: 'sc_streak_30', name: 'Unbroken Flow', description: 'Achieve a 30-sentence streak.', tier: 5, requirement: { type: 'stat', stat: 'sentenceCompletionHighScoreStreak', value: 30 }, category: 'sentenceCompletion' },
        { id: 'sc_mistake_1', name: 'Minor Mix-up', description: 'Make your first mistake in sentence completion.', tier: 1, requirement: { type: 'stat', stat: 'sentenceCompletionMistakes', value: 1 }, category: 'sentenceCompletion' },
        { id: 'sc_first_try', name: 'Quick Study', description: 'Get your very first sentence correct.', tier: 1, requirement: { type: 'stat', stat: 'scFirstTrySuccess', value: 1 }, category: 'sentenceCompletion' },
        { id: 'sc_empty_10', name: 'Oops!', description: 'Try to submit an empty answer 10 times.', tier: 1, requirement: { type: 'stat', stat: 'scEmptiedHanded', value: 10 }, category: 'sentenceCompletion' },
        { id: 'sc_particle_wa_ga', name: 'Topic Master', description: 'Correctly use は and が 25 times each.', tier: 3, requirement: { type: 'compound', stats: [{stat: 'scTyped_は', value: 25}, {stat: 'scTyped_が', value: 25}] }, category: 'sentenceCompletion' },
        { id: 'sc_particle_wo_ni_de', name: 'Action & Location', description: 'Correctly use を, に, and で 25 times each.', tier: 3, requirement: { type: 'compound', stats: [{stat: 'scTyped_を', value: 25}, {stat: 'scTyped_に', value: 25}, {stat: 'scTyped_で', value: 25}] }, category: 'sentenceCompletion' },
        { id: 'sc_particle_no', name: 'The Possessor', description: 'Correctly use の 30 times.', tier: 2, requirement: { type: 'stat', stat: 'scTyped_の', value: 30 }, category: 'sentenceCompletion' },

        // Sentence Translation Achievements
        { id: 'trans_correct_10', name: 'Budding Translator', description: 'Translate 10 sentences correctly.', tier: 1, requirement: { type: 'stat', stat: 'sentenceTranslationCorrectTotal', value: 10 }, category: 'translation' },
        { id: 'trans_correct_50', name: 'Fluent Speaker', description: 'Translate 50 sentences correctly.', tier: 2, requirement: { type: 'stat', stat: 'sentenceTranslationCorrectTotal', value: 50 }, category: 'translation' },
        { id: 'trans_correct_200', name: 'Language Bridge', description: 'Translate 200 sentences correctly.', tier: 3, requirement: { type: 'stat', stat: 'sentenceTranslationCorrectTotal', value: 200 }, category: 'translation' },
        { id: 'trans_correct_500', name: 'Polyglot', description: 'Translate 500 sentences correctly.', tier: 4, requirement: { type: 'stat', stat: 'sentenceTranslationCorrectTotal', value: 500 }, category: 'translation' },
        { id: 'trans_streak_10', name: 'Linguistic Link', description: 'Achieve a 10-sentence streak in translation.', tier: 3, requirement: { type: 'stat', stat: 'sentenceTranslationHighScoreStreak', value: 10 }, category: 'translation' },
        { id: 'trans_streak_25', name: 'Cultural Conduit', description: 'Achieve a 25-sentence streak in translation.', tier: 4, requirement: { type: 'stat', stat: 'sentenceTranslationHighScoreStreak', value: 25 }, category: 'translation' },
        { id: 'trans_streak_50', name: 'Universal Translator', description: 'Achieve a 50-sentence streak in translation.', tier: 6, requirement: { type: 'stat', stat: 'sentenceTranslationHighScoreStreak', value: 50 }, category: 'translation' },
        { id: 'trans_mistake_1', name: 'Lost in Translation', description: 'Make your first translation mistake.', tier: 1, requirement: { type: 'stat', stat: 'sentenceTranslationMistakes', value: 1 }, category: 'translation' },
        { id: 'trans_mistake_25', name: 'Trial and Error', description: 'Make 25 translation mistakes.', tier: 2, requirement: { type: 'stat', stat: 'sentenceTranslationMistakes', value: 25 }, category: 'translation' },
        { id: 'trans_passive_25', name: 'Passive Observer', description: 'Translate 25 passive sentences.', tier: 2, requirement: { type: 'stat', stat: 'sentenceTranslationCorrectPassive', value: 25 }, category: 'translation' },
        { id: 'trans_causative_25', name: 'Agent of Causation', description: 'Translate 25 causative sentences.', tier: 2, requirement: { type: 'stat', stat: 'sentenceTranslationCorrectCausative', value: 25 }, category: 'translation' },
        { id: 'trans_noni_25', name: 'The Contrarian', description: 'Translate 25 sentences with 「のに」.', tier: 2, requirement: { type: 'stat', stat: 'sentenceTranslationCorrectNoni', value: 25 }, category: 'translation' },
        { id: 'trans_secret_cat', name: 'Cat Wrangler', description: 'Translate the sentence about the cat eating fish.', tier: 3, requirement: { type: 'stat', stat: 'transSecretCat', value: 1 }, category: 'translation' },

        // Sentence Rewriting Achievements
        { id: 'rewrite_correct_10', name: 'Sentence Shaper', description: 'Rewrite 10 sentences correctly.', tier: 1, requirement: { type: 'stat', stat: 'sentenceRewritingCorrectTotal', value: 10 }, category: 'rewriting' },
        { id: 'rewrite_correct_50', name: 'Grammar Engineer', description: 'Rewrite 50 sentences correctly.', tier: 2, requirement: { type: 'stat', stat: 'sentenceRewritingCorrectTotal', value: 50 }, category: 'rewriting' },
        { id: 'rewrite_correct_200', name: 'Syntax Surgeon', description: 'Rewrite 200 sentences correctly.', tier: 3, requirement: { type: 'stat', stat: 'sentenceRewritingCorrectTotal', value: 200 }, category: 'rewriting' },
        { id: 'rewrite_streak_15', name: 'Flawless Flow', description: 'Achieve a 15-sentence rewrite streak.', tier: 4, requirement: { type: 'stat', stat: 'sentenceRewritingHighScoreStreak', value: 15 }, category: 'rewriting' },
        { id: 'rewrite_streak_30', name: 'Unbreakable Syntax', description: 'Achieve a 30-sentence rewrite streak.', tier: 5, requirement: { type: 'stat', stat: 'sentenceRewritingHighScoreStreak', value: 30 }, category: 'rewriting' },
        { id: 'rewrite_mistake_1', name: 'A Minor Revision', description: 'Make your first rewrite mistake.', tier: 1, requirement: { type: 'stat', stat: 'sentenceRewritingMistakes', value: 1 }, category: 'rewriting' },
        { id: 'rewrite_causative_50', name: 'The Instigator', description: 'Correctly rewrite 50 causative sentences.', tier: 2, requirement: { type: 'stat', stat: 'sentenceRewritingCorrectCausative', value: 50 }, category: 'rewriting' },
        { id: 'rewrite_passive_50', name: 'The Receiver', description: 'Correctly rewrite 50 passive sentences.', tier: 2, requirement: { type: 'stat', stat: 'sentenceRewritingCorrectPassive', value: 50 }, category: 'rewriting' },
        { id: 'rewrite_causative_passive_25', name: 'Tongue Twister', description: 'Correctly rewrite 25 causative-passive sentences.', tier: 3, requirement: { type: 'stat', stat: 'sentenceRewritingCorrectCausativePassive', value: 25 }, category: 'rewriting' },
        { id: 'rewrite_noni_50', name: 'Despite Everything...', description: 'Correctly rewrite 50 sentences with 「のに」.', tier: 2, requirement: { type: 'stat', stat: 'sentenceRewritingCorrectNoni', value: 50 }, category: 'rewriting' },
        { id: 'rewrite_alchemist', name: 'Grammar Alchemist', description: 'Rewrite 10 sentences of each type.', tier: 4, requirement: { type: 'compound', stats: [{stat: 'sentenceRewritingCorrectCausative', value: 10}, {stat: 'sentenceRewritingCorrectPassive', value: 10}, {stat: 'sentenceRewritingCorrectCausativePassive', value: 10}, {stat: 'sentenceRewritingCorrectNoni', value: 10}] }, category: 'rewriting' }
    ];

    // --- Player Data Manager ---
    const playerDataManager = {
        data: {},
        isNewUser: false,
        init() {
            let savedData = null;
            try {
                savedData = localStorage.getItem(PLAYER_DATA_KEY);
            } catch (e) {
                console.error("Could not access localStorage:", e);
            }

            if (savedData) {
                this.isNewUser = false;
                this.data = JSON.parse(savedData);
                // ADDED: Ensure pfp data exists for returning users
                if (!this.data.profile.pfp) {
                    this.data.profile.pfp = this.getDefaults().profile.pfp;
                }
                const savedAchievements = this.data.achievements || [];
                this.data.achievements = achievementsList.map(masterAch => {
                    const savedAch = savedAchievements.find(a => a.id === masterAch.id);
                    return { ...masterAch, ...(savedAch || { unlocked: false, progress: 0 }) };
                });
            } else {
                this.isNewUser = true;
                try {
                    if (localStorage.getItem(THEME_KEY) === null) {
                        localStorage.setItem(THEME_KEY, 'dark');
                        document.documentElement.classList.add('dark-mode');
                    }
                } catch (e) {
                    console.error("Could not set default theme:", e);
                }
                this.data = this.getDefaults();
            }
            if (!this.data.stats) this.data.stats = this.getDefaults().stats;
            achievementsList.forEach(ach => {
                if (ach.requirement.type === 'stat') {
                    const statName = ach.requirement.stat;
                    if (statName && this.data.stats[statName] === undefined) {
                        this.data.stats[statName] = 0;
                    }
                } else if (ach.requirement.type === 'compound') {
                     ach.requirement.stats.forEach(req => {
                        if (this.data.stats[req.stat] === undefined) {
                            this.data.stats[req.stat] = 0;
                        }
                    });
                }
            });

            if (!this.isNewUser) {
                this.save();
            }
        },
        getDefaults() {
            return {
                profile: { 
                    name: 'Learner', 
                    level: 1, 
                    xp: 0, 
                    equippedTitleId: null,
                    // ADDED: Default colors for the profile picture
                    pfp: {
                        bgColor: '#007bff',
                        textColor: '#ffffff'
                    }
                },
                stats: { 
                    level: 1,
                    // Kanji Stats
                    kanjiDrawnDistance: 0, 
                    kanjiQuizDrawnDistance: 0,
                    kanjiDrawingHighScore: 0,
                    kanjiPerfectScore: 0,
                    kanjiGraded_待: 0,
                    kanjiGraded_守: 0,
                    kanjiGraded_末: 0,
                    kanjiInReview: 0,
                    kanjiQuizReveals: 0,
                    kanjiRatedAgain: 0,
                    kanjiRatedHard: 0,
                    kanjiRatedGood: 0,
                    kanjiRatedEasy: 0,
                    kanjiDeckResets: 0, 
                    kanjiReadingCorrect: 0, 
                    kanjiReadingHardModeCorrect: 0,
                    kanjiReadingStreak: 0,
                    kanjiReadingHighScoreStreak: 0,
                    kanjiReadingMistakes: 0,
                    kanjiSecretSilverFound: 0,
                    // Conjugation stats
                    conjugationCorrectTotal: 0,
                    conjugationCorrectCausative: 0,
                    conjugationCorrectCausativePassive: 0,
                    conjugationCorrectConditional: 0,
                    conjugationCorrectGodan: 0,
                    conjugationCorrectIchidan: 0,
                    conjugationCorrectIrregular: 0,
                    conjugationStreak: 0,
                    conjugationHighScoreStreak: 0,
                    conjugationMistakes: 0,
                    conjugationSecretVerbFound: 0,
                    // Written Passage stats
                    passageCharsWrittenTotal: 0,
                    passageDeletes: 0,
                    passageHighScoreStreak: 0,
                    // Sentence Completion stats
                    sentenceCompletionCorrectTotal: 0,
                    sentenceCompletionMistakes: 0,
                    sentenceCompletionStreak: 0,
                    sentenceCompletionHighScoreStreak: 0,
                    scEmptiedHanded: 0,
                    scFirstTrySuccess: 0,
                    scTyped_は: 0,
                    scTyped_が: 0,
                    scTyped_を: 0,
                    scTyped_に: 0,
                    scTyped_で: 0,
                    scTyped_の: 0,
                    // Sentence Translation stats
                    sentenceTranslationCorrectTotal: 0,
                    sentenceTranslationMistakes: 0,
                    sentenceTranslationStreak: 0,
                    sentenceTranslationHighScoreStreak: 0,
                    sentenceTranslationCorrectCausative: 0,
                    sentenceTranslationCorrectPassive: 0,
                    sentenceTranslationCorrectCausativePassive: 0,
                    sentenceTranslationCorrectNoni: 0,
                    transSecretCat: 0,
                    // Sentence Rewriting stats
                    sentenceRewritingCorrectTotal: 0,
                    sentenceRewritingMistakes: 0,
                    sentenceRewritingStreak: 0,
                    sentenceRewritingHighScoreStreak: 0,
                    sentenceRewritingCorrectCausative: 0,
                    sentenceRewritingCorrectPassive: 0,
                    sentenceRewritingCorrectCausativePassive: 0,
                    sentenceRewritingCorrectNoni: 0,
                },
                achievements: achievementsList.map(ach => ({ ...ach, unlocked: false, progress: 0 })),
                kanjiDeckState: { unseen: [], learning: [], review: {} }
            };
        },
        save() {
            try {
                localStorage.setItem(PLAYER_DATA_KEY, JSON.stringify(this.data));
            } catch (e) {
                console.error("Could not save to localStorage:", e);
            }
            this.updateAllUI();
        },
        getData() { return this.data; },
        setName(name) { this.data.profile.name = name; this.save(); },
        equipTitle(titleId) { this.data.profile.equippedTitleId = titleId; this.save(); },
        // ADDED: Method to save profile picture colors
        setPfpColor(type, color) {
            if (type === 'bg') {
                this.data.profile.pfp.bgColor = color;
            } else if (type === 'text') {
                this.data.profile.pfp.textColor = color;
            }
            // Save is called separately in the event listener to avoid saving on every 'input' event
            try {
                localStorage.setItem(PLAYER_DATA_KEY, JSON.stringify(this.data));
            } catch (e) {
                console.error("Could not save to localStorage:", e);
            }
        },
        increaseStat(stat, amount) { if (this.data.stats[stat] === undefined) this.data.stats[stat] = 0; this.data.stats[stat] += amount; this.checkAchievements(); this.save(); },
        setStat(stat, value) { if (this.data.stats[stat] === undefined || value > this.data.stats[stat]) { this.data.stats[stat] = value; } this.checkAchievements(); this.save(); },
        addXp(amount) { const p = this.data.profile; p.xp += amount; let nextLvlXp = XP_PER_LEVEL; while (p.xp >= nextLvlXp) { p.xp -= nextLvlXp; p.level++; this.setStat('level', p.level); nextLvlXp = XP_PER_LEVEL; } this.save(); },
        
        // --- NEW: Centralized function to award XP based on an activity ID ---
        rewardXp(activityId) {
            const amount = xpRewards[activityId];
            if (amount) {
                this.addXp(amount);
            } else {
                // This warning helps you find if you've misspelled an activity ID
                console.warn(`XP reward not found for activity: ${activityId}`);
            }
        },

        checkAchievements() {
            this.data.achievements.forEach(ach => {
                if (!ach.requirement) return;

                let isUnlocked = false;
                let currentProgress = 0;
                let totalProgress = 0;

                if (ach.requirement.type === 'stat') {
                    const playerStat = this.data.stats[ach.requirement.stat] || 0;
                    const reqValue = ach.requirement.value;
                    if (playerStat >= reqValue) isUnlocked = true;
                    currentProgress = Math.min(playerStat, reqValue);
                    totalProgress = reqValue;
                } else if (ach.requirement.type === 'compound') {
                    let allMet = true;
                    ach.requirement.stats.forEach(req => {
                        const playerStat = this.data.stats[req.stat] || 0;
                        if (playerStat < req.value) allMet = false;
                        currentProgress += Math.min(playerStat, req.value);
                        totalProgress += req.value;
                    });
                    if (allMet) isUnlocked = true;
                }

                if (isUnlocked) {
                    if (!ach.unlocked) {
                        ach.unlocked = true;
                        showAchievementPopup(ach);
                    }
                    ach.progress = 100;
                } else {
                    ach.progress = totalProgress > 0 ? Math.floor((currentProgress / totalProgress) * 100) : 0;
                }
            });
            if (this.data.profile.equippedTitleId === null && this.data.achievements.find(a => a.id === 'level_1')?.unlocked) {
                this.data.profile.equippedTitleId = 'level_1';
            }
        },
        updateAllUI() { updateProfileUI(this.data); renderAchievements(this.data); }
    };

    // --- UI Rendering ---
    function updateProfileUI(data) {
        const els = {
            name: document.getElementById('player-name'),
            title: document.getElementById('player-title'),
            level: document.getElementById('level-number'),
            xp: document.getElementById('xp-counter'),
            bar: document.getElementById('xp-bar'),
            pfp: document.getElementById('profile-picture')
        };
        if (!els.name) return;
        const p = data.profile;
        const nextLvlXp = XP_PER_LEVEL;
        els.name.textContent = p.name;
        els.level.textContent = p.level;
        els.xp.textContent = `${Math.floor(p.xp)} / ${nextLvlXp} XP`;
        els.bar.style.width = `${(p.xp / nextLvlXp) * 100}%`;

        // ADDED: Update profile picture
        if (els.pfp) {
            const initial = p.name.charAt(0).toUpperCase() || '?';
            els.pfp.textContent = initial;
            if (p.pfp) {
                els.pfp.style.backgroundColor = p.pfp.bgColor;
                els.pfp.style.color = p.pfp.textColor;
            }
        }

        const equipped = data.achievements.find(a => a.id === p.equippedTitleId);
        if (equipped && equipped.unlocked) {
            els.title.textContent = equipped.name;
            els.title.className = 'title-tier-0'; // Reset class
            els.title.classList.add(`title-tier-${equipped.tier}`);
        } else {
            els.title.textContent = 'Newbie';
            els.title.className = 'title-tier-1';
        }
    }
    
    function renderAchievements(data) {
        const listEl = document.getElementById('titles-list');
        if (!listEl) return;

        // Sort achievements by tier (ascending)
        const sortedAchievements = [...data.achievements].sort((a, b) => (a.tier || 0) - (b.tier || 0));

        listEl.innerHTML = '';
        sortedAchievements.forEach(ach => {
            const li = document.createElement('li');
            li.className = 'title-item';
            li.dataset.id = ach.id;

            const titleView = document.createElement('div');
            titleView.className = 'title-view';
            const text = document.createElement('span');
            text.className = 'title-text';
            // Only add tier class if the title is unlocked
            if (ach.unlocked) {
                text.classList.add(`title-tier-${ach.tier}`);
            }
            text.textContent = ach.name;
            titleView.appendChild(text);

            const descriptionView = document.createElement('div');
            descriptionView.className = 'description-view';

            let descriptionHTML = `<p class="description-view-text">${ach.description}</p>`;
            
            let progressText = '';
            if (ach.requirement) {
                if (ach.requirement.type === 'stat') {
                    const playerStat = data.stats[ach.requirement.stat] || 0;
                    const target = ach.requirement.value;
                    progressText = `${Math.min(playerStat, target)} / ${target}`;
                } else if (ach.requirement.type === 'compound') {
                     let currentTotal = 0;
                     let targetTotal = 0;
                     ach.requirement.stats.forEach(req => {
                         currentTotal += Math.min(data.stats[req.stat] || 0, req.value);
                         targetTotal += req.value;
                     });
                     progressText = `${currentTotal} / ${targetTotal}`;
                }
            }
            
            if (progressText) {
                descriptionHTML += `<p class="description-view-progress-text">${progressText}</p>`;
            }
            descriptionHTML += `<div class="tooltip-progress-container"><div class="tooltip-progress-bar" style="width: ${ach.progress}%"></div></div>`;
            descriptionView.innerHTML = descriptionHTML;


            li.appendChild(titleView);
            li.appendChild(descriptionView);

            if (ach.unlocked) {
                li.classList.add('unlocked');
                if (data.profile.equippedTitleId === ach.id) li.classList.add('equipped');
                li.addEventListener('click', () => playerDataManager.equipTitle(ach.id));
            } else {
                li.classList.add('locked');
            }
            listEl.appendChild(li);
        });
    }


    // --- Achievement Notification ---
    function showAchievementPopup(achievement) {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            document.body.appendChild(container);
        }
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `<i class="ph-bold ph-trophy"></i><div><p class="ach-title">Achievement Unlocked!</p><p class="ach-name title-tier-${achievement.tier}">${achievement.name}</p></div>`;
        container.appendChild(popup);
        setTimeout(() => popup.classList.add('show'), 10);
        setTimeout(() => {
            popup.classList.remove('show');
            popup.addEventListener('transitionend', () => popup.remove());
        }, 5000);
    }

    // --- Theme Manager ---
    const themeManager = {
        init() {
            const toggle = document.getElementById('theme-toggle');
            if (toggle) {
                toggle.checked = !document.documentElement.classList.contains('dark-mode');
                toggle.addEventListener('change', this.toggleTheme);
            }
        },
        toggleTheme() {
            const toggle = document.getElementById('theme-toggle');
            const isLightMode = toggle.checked;
            document.documentElement.classList.toggle('dark-mode', !isLightMode);
            localStorage.setItem(THEME_KEY, isLightMode ? 'light' : 'dark');
        }
    };
    
    // --- Welcome Popup Logic ---
    function setupWelcomePopup() {
        const overlay = document.getElementById('welcome-overlay');
        const usernameInput = document.getElementById('username-input');
        const submitBtn = document.getElementById('welcome-submit-btn');

        if (!overlay || !usernameInput || !submitBtn) return;

        if (playerDataManager.isNewUser) {
            overlay.classList.remove('hidden');
        }

        usernameInput.addEventListener('input', () => {
            submitBtn.disabled = usernameInput.value.trim() === '';
        });
        
        usernameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !submitBtn.disabled) {
                submitBtn.click();
            }
        });

        submitBtn.addEventListener('click', () => {
            const username = usernameInput.value.trim();
            if (username) {
                playerDataManager.setName(username);
                overlay.classList.add('hidden');
            }
        });
    }

    // ADDED: Function to handle profile picture editor logic
    function setupPfpEditor() {
        const pfpEl = document.getElementById('profile-picture');
        const pickerEl = document.getElementById('pfp-color-picker');
        const bgInput = document.getElementById('pfp-bg-color');
        const textInput = document.getElementById('pfp-text-color');

        if (!pfpEl || !pickerEl || !bgInput || !textInput) return;

        // Set initial values for color pickers from player data
        const currentPfpData = playerDataManager.getData().profile.pfp;
        if (currentPfpData) {
            bgInput.value = currentPfpData.bgColor;
            textInput.value = currentPfpData.textColor;
        }

        // Toggle picker visibility
        pfpEl.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent click from bubbling to the document
            pickerEl.classList.toggle('hidden');
        });

        // Close picker when clicking outside
        document.addEventListener('click', (e) => {
            if (!pickerEl.contains(e.target) && !pfpEl.contains(e.target)) {
                pickerEl.classList.add('hidden');
            }
        });

        // Handle background color changes
        bgInput.addEventListener('input', () => {
            pfpEl.style.backgroundColor = bgInput.value;
        });
        bgInput.addEventListener('change', () => { // 'change' fires when picker is closed
            playerDataManager.setPfpColor('bg', bgInput.value);
        });

        // Handle text color changes
        textInput.addEventListener('input', () => {
            pfpEl.style.color = textInput.value;
        });
        textInput.addEventListener('change', () => {
            playerDataManager.setPfpColor('text', textInput.value);
        });
    }

    // --- Initializations ---
    document.addEventListener('DOMContentLoaded', () => {
        playerDataManager.init();
        themeManager.init();
        setupWelcomePopup();
        setupPfpEditor(); // ADDED
        
        const nameEl = document.getElementById('player-name');
        if (nameEl && nameEl.hasAttribute('contenteditable') && nameEl.getAttribute('contenteditable') === 'true') {
            nameEl.addEventListener('blur', () => {
                const newName = nameEl.textContent.trim() || 'Learner';
                nameEl.textContent = newName;
                playerDataManager.setName(newName);
            });
            nameEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') { e.preventDefault(); nameEl.blur(); }
            });
        }

        const navLinks = document.querySelectorAll('a');
        navLinks.forEach(link => {
            if (link.hostname === window.location.hostname && link.pathname !== window.location.pathname && link.href.endsWith('.html')) {
                link.addEventListener('click', e => {
                    e.preventDefault();
                    const destination = link.href;
                    document.body.classList.add('is-leaving');
                    setTimeout(() => {
                        window.location.href = destination;
                    }, 800);
                });
            }
        });
        
        window.playerDataManager = playerDataManager;
    });
})();
