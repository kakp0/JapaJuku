(function() { // IIFE to avoid polluting global scope
    // --- FIX ---
    // Listen for the pageshow event, which fires when navigating back to a page.
    // This is crucial for handling the back-forward cache (bfcache) in browsers.
    window.addEventListener('pageshow', function(event) {
        // If the body has the 'is-leaving' class (from when we navigated away),
        // remove it so the opening curtain animation can play correctly.
        if (document.body.classList.contains('is-leaving')) {
            document.body.classList.remove('is-leaving');
        }
    });
    // --- END FIX ---

    // --- Configuration ---
    const PLAYER_DATA_KEY = 'japaneseLearnerProgress';
    const THEME_KEY = 'japaneseLearnerTheme';
    const BASE_XP_PER_LEVEL = 100; // XP needed to go from Lvl 1 to Lvl 2

    // --- NEW: Centralized BASE XP Rewards Configuration ---
    // These are the base XP values for Level 1. They will scale with the player's level.
    const baseXpRewards = {
        // Kanji Practice
        kanjiPracticeGrade: 0.3,
        kanjiQuizRateAnswer: 10,
        kanjiReadingCorrectNormal: 5,
        kanjiReadingCorrectHard: 8,
        kanjiReadingIncorrectNormalAttempt: 2.5, // NEW: Half XP for incorrect normal reading
        kanjiReadingIncorrectHardAttempt: 4,    // NEW: Half XP for incorrect hard reading

        // Conjugation Practice
        conjugationCorrect: 10,
        conjugationIncorrectAttempt: 5,         // NEW: Half XP for incorrect conjugation

        // Sentence Completion
        sentenceCompletionCorrect: 15,
        sentenceCompletionIncorrectAttempt: 7.5, // NEW: Half XP for incorrect sentence completion

        // Sentence Rewriting
        sentenceRewritingCorrect: 12,
        sentenceRewritingIncorrectAttempt: 6,     // NEW: Half XP for incorrect sentence rewriting

        // Sentence Translation
        sentenceTranslationCorrect: 10,
        sentenceTranslationIncorrectAttempt: 5,   // NEW: Half XP for incorrect sentence translation

        // Written Passage (XP awarded for every 5 characters written)
        passageCharactersWritten: 5,

        quizCorrect: 12.5, // NEW: Half XP for incorrect normal reading
        quizWrong: 5,    // NEW: Half XP for incorrect hard reading
    };


    // --- Tiers Configuration ---
    // Tier 1: Common, Tier 2: Uncommon, Tier 3: Rare, Tier 4: Epic, Tier 5: Mythic, Tier 6: Legendary, Tier 7: Legend
    const titleTiers = {
        1: { name: 'Common' },
        2: { name: 'Uncommon' },
        3: { name: 'Rare' },
        4: { name: 'Epic' },
        5: { name: 'Mythic' },
        6: { name: 'Legendary' },
        7: { name: 'Legend' } // NEW TIER
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
        { id: 'level_100', name: '将軍', description: 'Reach Level 100.', tier: 6, requirement: { type: 'stat', stat: 'level', value: 100 }, category: 'general' },

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
        { id: 'rewrite_alchemist', name: 'Grammar Alchemist', description: 'Rewrite 10 sentences of each type.', tier: 4, requirement: { type: 'compound', stats: [{stat: 'sentenceRewritingCorrectCausative', value: 10}, {stat: 'sentenceRewritingCorrectPassive', value: 10}, {stat: 'sentenceRewritingCorrectCausativePassive', value: 10}, {stat: 'sentenceRewritingCorrectNoni', value: 10}] }, category: 'rewriting' },

        // NEW: Ultimate Achievement
        { id: 'legend_japajuku', name: 'JapaJuku Legend', description: 'Unlock every other achievement.', tier: 7, requirement: { type: 'all_achievements' }, category: 'legend' }
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
                const defaults = this.getDefaults();
                // Ensure pfp data exists for returning users
                if (!this.data.profile.pfp) {
                    this.data.profile.pfp = defaults.profile.pfp;
                }
                // Ensure settings object and new properties exist for returning users
                if (!this.data.settings) {
                    this.data.settings = defaults.settings;
                }
                if (this.data.settings.useLegendaryNameStyle === undefined) {
                    this.data.settings.useLegendaryNameStyle = defaults.settings.useLegendaryNameStyle;
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
            const isMobile = window.matchMedia('(max-width: 900px)').matches;
            return {
                profile: { 
                    name: 'Learner', 
                    level: 1, 
                    xp: 0, 
                    equippedTitleId: null,
                    pfp: {
                        bgColor: '#007bff',
                        textColor: '#ffffff'
                    }
                },
                settings: {
                    showPlayerCardEverywhere: !isMobile,
                    useLegendaryNameStyle: true // NEW setting
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
        // NEW: Function to unlock all achievements for debugging
        unlockAllAchievements() {
            this.data.achievements.forEach(ach => {
                ach.unlocked = true;
                ach.progress = 100;
            });
            this.checkAchievements(); // Re-check to update legend achievement state
            this.save();
            console.log("DEBUG: All achievements have been unlocked.");
            // Also show the legendary name setting if it's now unlocked
            const settingItem = document.getElementById('legendary-name-setting');
            const legendaryNameToggle = document.getElementById('legendary-name-toggle');
            if (settingItem && legendaryNameToggle) {
                settingItem.style.display = 'flex';
                legendaryNameToggle.checked = this.getData().settings.useLegendaryNameStyle;
            }
        },
        getData() { return this.data; },
        setName(name) { this.data.profile.name = name; this.save(); },
        equipTitle(titleId) { this.data.profile.equippedTitleId = titleId; this.save(); },
        setPfpColor(type, color) {
            if (type === 'bg') {
                this.data.profile.pfp.bgColor = color;
            } else if (type === 'text') {
                this.data.profile.pfp.textColor = color;
            }
            try {
                localStorage.setItem(PLAYER_DATA_KEY, JSON.stringify(this.data));
            } catch (e) {
                console.error("Could not save to localStorage:", e);
            }
        },
        increaseStat(stat, amount) { if (this.data.stats[stat] === undefined) this.data.stats[stat] = 0; this.data.stats[stat] += amount; this.checkAchievements(); this.save(); },
        setStat(stat, value) { if (this.data.stats[stat] === undefined || value > this.data.stats[stat]) { this.data.stats[stat] = value; } this.checkAchievements(); this.save(); },
        
        // NEW: Helper function to calculate level-up cost
        getXpForNextLevel(level) {
            return BASE_XP_PER_LEVEL * level;
        },

        // MODIFIED: This function now detects level-ups and calls the animation trigger.
        addXp(amount) {
            const p = this.data.profile;
            const levelBefore = p.level;
            p.xp += amount;
            let nextLvlXp = this.getXpForNextLevel(p.level);
            let leveledUp = false;

            // Use a while loop in case they earn enough XP for multiple levels at once
            while (p.xp >= nextLvlXp) {
                p.xp -= nextLvlXp;
                p.level++;
                this.setStat('level', p.level);
                nextLvlXp = this.getXpForNextLevel(p.level);
                leveledUp = true;
            }

            // If a level up happened, trigger the animation.
            if (leveledUp) {
                // The UI will update behind the animation. When the wipe reveals the card,
                // the new level and XP values will be shown.
                triggerLevelUpAnimation();
            }

            this.save();
        },
        
        rewardXp(activityId) {
            const baseAmount = baseXpRewards[activityId];
            if (baseAmount) {
                // Calculate the deterministic, scaled amount first
                const scaledAmount = baseAmount * this.data.profile.level;

                // Create a random multiplier between 0.9 and 1.1
                const randomMultiplier = Math.random() * 0.2 + 0.9; // (Math.random() * (max - min) + min)

                // Apply the randomness and round to the nearest whole number
                const randomizedAmount = Math.round(scaledAmount * randomMultiplier);

                this.addXp(randomizedAmount);
            } else {
                console.warn(`XP reward not found for activity: ${activityId}`);
            }
        },

        checkAchievements() {
            let newlyUnlockedCount = 0;

            // First pass for regular achievements
            this.data.achievements.forEach(ach => {
                if (!ach.requirement || ach.requirement.type === 'all_achievements') return;

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
                    newlyUnlockedCount++;
                } else {
                    ach.progress = totalProgress > 0 ? Math.floor((currentProgress / totalProgress) * 100) : 0;
                }
            });

            // Second pass for the legend achievement
            const legendAchievement = this.data.achievements.find(ach => ach.id === 'legend_japajuku');
            if (legendAchievement) {
                const allOtherAchievements = this.data.achievements.filter(a => a.id !== 'legend_japajuku');
                const unlockedCount = allOtherAchievements.filter(a => a.unlocked).length;
                const totalCount = allOtherAchievements.length;
                
                if (unlockedCount === totalCount) {
                    if (!legendAchievement.unlocked) {
                        legendAchievement.unlocked = true;
                        showAchievementPopup(legendAchievement);
                        // Make the setting visible immediately
                        const settingItem = document.getElementById('legendary-name-setting');
                        if (settingItem) settingItem.style.display = 'flex';
                    }
                    legendAchievement.progress = 100;
                } else {
                    legendAchievement.progress = Math.floor((unlockedCount / totalCount) * 100);
                }
            }


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
        const nextLvlXp = playerDataManager.getXpForNextLevel(p.level);
        
        els.name.textContent = p.name;
        
        // NEW: Legendary Name Style Logic
        const legendAchievement = data.achievements.find(ach => ach.id === 'legend_japajuku');
        const useLegendaryStyle = data.settings.useLegendaryNameStyle;
        if (legendAchievement && legendAchievement.unlocked && useLegendaryStyle) {
            els.name.classList.add('legendary-name');
        } else {
            els.name.classList.remove('legendary-name');
        }

        els.level.textContent = p.level;
        els.xp.textContent = `${Math.floor(p.xp)} / ${nextLvlXp} XP`;
        els.bar.style.width = `${(p.xp / nextLvlXp) * 100}%`;

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
            els.title.className = 'player-title'; // Reset class
            els.title.classList.add(`title-tier-${equipped.tier}`);
        } else {
            els.title.textContent = 'Newbie';
            els.title.className = 'player-title';
            els.title.classList.add('title-tier-1');
        }
    }
    
    function renderAchievements(data) {
        const listEl = document.getElementById('titles-list');
        if (!listEl) return;

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
                } else if (ach.requirement.type === 'all_achievements') {
                    const allOtherAchievements = data.achievements.filter(a => a.id !== 'legend_japajuku');
                    const unlockedCount = allOtherAchievements.filter(a => a.unlocked).length;
                    const totalCount = allOtherAchievements.length;
                    progressText = `${unlockedCount} / ${totalCount}`;
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

    // --- Profile Picture Editor ---
    function setupPfpEditor() {
        const pfpEl = document.getElementById('profile-picture');
        const pickerEl = document.getElementById('pfp-color-picker');
        const bgInput = document.getElementById('pfp-bg-color');
        const textInput = document.getElementById('pfp-text-color');

        if (!pfpEl || !pickerEl || !bgInput || !textInput) return;

        const currentPfpData = playerDataManager.getData().profile.pfp;
        if (currentPfpData) {
            bgInput.value = currentPfpData.bgColor;
            textInput.value = currentPfpData.textColor;
        }

        pfpEl.addEventListener('click', (e) => {
            e.stopPropagation(); 
            pickerEl.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!pickerEl.contains(e.target) && !pfpEl.contains(e.target)) {
                pickerEl.classList.add('hidden');
            }
        });

        bgInput.addEventListener('input', () => { pfpEl.style.backgroundColor = bgInput.value; });
        bgInput.addEventListener('change', () => { playerDataManager.setPfpColor('bg', bgInput.value); });

        textInput.addEventListener('input', () => { pfpEl.style.color = textInput.value; });
        textInput.addEventListener('change', () => { playerDataManager.setPfpColor('text', textInput.value); });
    }
    
    // --- Player Card Visibility Manager ---
    function applyPlayerCardVisibility() {
        // This function should only affect module pages, not the main hub.
        // We can detect a module page by the presence of an #app-container.
        const isModulePage = document.getElementById('app-container');
        if (!isModulePage) {
            return; // Do nothing on the main hub page
        }

        const shouldShow = playerDataManager.getData().settings.showPlayerCardEverywhere;
        document.body.classList.toggle('hide-player-card-globally', !shouldShow);
    }
    
    // --- Settings Popup ---
    function setupSettings() {
        const settingsBtn = document.getElementById('settings-btn');
        const settingsOverlay = document.getElementById('settings-overlay');
        const settingsCloseBtn = document.getElementById('settings-close-btn');
        const showPlayerCardToggle = document.getElementById('show-player-card-toggle');
        const eraseDataBtn = document.getElementById('erase-data-btn');
        const confirmOverlay = document.getElementById('confirm-overlay');
        const confirmYesBtn = document.getElementById('confirm-yes-btn');
        const confirmNoBtn = document.getElementById('confirm-no-btn');
        const legendaryNameSetting = document.getElementById('legendary-name-setting');
        const legendaryNameToggle = document.getElementById('legendary-name-toggle');

        if (!settingsBtn || !settingsOverlay) return;

        // Open/Close logic
        settingsBtn.addEventListener('click', () => settingsOverlay.classList.remove('hidden'));
        settingsCloseBtn.addEventListener('click', () => settingsOverlay.classList.add('hidden'));
        settingsOverlay.addEventListener('click', (e) => {
            if (e.target === settingsOverlay) settingsOverlay.classList.add('hidden');
        });

        // Legendary Name Toggle Logic
        if (legendaryNameSetting && legendaryNameToggle) {
            const legendAchievement = playerDataManager.getData().achievements.find(ach => ach.id === 'legend_japajuku');
            if (legendAchievement && legendAchievement.unlocked) {
                legendaryNameSetting.style.display = 'flex';
                legendaryNameToggle.checked = playerDataManager.getData().settings.useLegendaryNameStyle;
                legendaryNameToggle.addEventListener('change', () => {
                    playerDataManager.getData().settings.useLegendaryNameStyle = legendaryNameToggle.checked;
                    playerDataManager.save(); // This re-renders the UI
                });
            } else {
                legendaryNameSetting.style.display = 'none';
            }
        }

        // "Show player card" toggle logic
        if (showPlayerCardToggle) {
            showPlayerCardToggle.checked = playerDataManager.getData().settings.showPlayerCardEverywhere;
            showPlayerCardToggle.addEventListener('change', () => {
                playerDataManager.getData().settings.showPlayerCardEverywhere = showPlayerCardToggle.checked;
                playerDataManager.save();
                applyPlayerCardVisibility(); // Apply the change visually right away
            });
        }

        // Erase data logic
        eraseDataBtn.addEventListener('click', () => confirmOverlay.classList.remove('hidden'));
        confirmNoBtn.addEventListener('click', () => confirmOverlay.classList.add('hidden'));
        confirmOverlay.addEventListener('click', (e) => {
             if (e.target === confirmOverlay) confirmOverlay.classList.add('hidden');
        });
        confirmYesBtn.addEventListener('click', () => {
            try {
                localStorage.removeItem(PLAYER_DATA_KEY);
                localStorage.removeItem(THEME_KEY);
                location.reload();
            } catch (e) {
                console.error("Could not erase data from localStorage:", e);
                confirmOverlay.classList.add('hidden');
            }
        });
    }

    // --- NEW: Level Up Animation Trigger ---
    function triggerLevelUpAnimation() {
        if (window.innerWidth < 1800) {     
            return;
        }
        const profileCard = document.getElementById('profile-card');
        if (!profileCard || profileCard.classList.contains('is-leveling-up')) return;

        profileCard.classList.add('is-leveling-up');
        
        // The .level-up-wipe element's animation dictates the total duration of the effect.
        // We'll listen for its animation to end to know when to clean up.
        const wipeElement = profileCard.querySelector('.level-up-wipe');
        
        const cleanup = () => {
            profileCard.classList.remove('is-leveling-up');
        };
        
        if (wipeElement) {
            wipeElement.addEventListener('animationend', cleanup, { once: true });
        } else {
            // Fallback timer in case the wipe element isn't found.
            setTimeout(cleanup, 3500);
        }
    }

    // --- Initializations ---
    document.addEventListener('DOMContentLoaded', () => {
        playerDataManager.init();
        themeManager.init();
        setupWelcomePopup();
        setupPfpEditor();
        setupSettings();
        applyPlayerCardVisibility(); // Apply visibility setting on page load
        
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
        
        // NEW: Cheat code for unlocking all achievements
        let keySequence = [];
        const cheatCode = 'TOOLAZY';
        document.addEventListener('keyup', (e) => {

            if (!window.location.pathname.endsWith('/') && !window.location.pathname.endsWith('index.html')) {
                return;
            }
            keySequence.push(e.key.toUpperCase());
            // Keep the sequence only as long as the cheat code
            if (keySequence.length > cheatCode.length) {
                keySequence.shift();
            }
            if (keySequence.join('') === cheatCode) {
                console.log('Cheat code activated: Unlocking all achievements.');
                playerDataManager.unlockAllAchievements();
                keySequence = []; // Reset after use
            }
        });
        
        window.playerDataManager = playerDataManager;
    });
})();

