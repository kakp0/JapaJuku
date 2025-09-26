document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DOM Elements ---
    const grid = document.getElementById('passage-grid');
    const textarea = document.getElementById('hidden-textarea');
    const counter = document.getElementById('char-counter');
    const instructionsContainer = document.querySelector('.instructions');
    const instructionsHeader = document.querySelector('.instructions-header');
    const toggleButton = document.getElementById('toggle-instructions');
    const copyButton = document.getElementById('copy-button'); // New button

    // --- 2. State & Dynamic Constants ---
    let ROWS;
    let COLS;
    let TOTAL_CELLS;
    const MIN_LENGTH = 120;

    let cells = [];
    let currentStreak = 0;
    let unrewardedChars = 0;

    // --- Accordion Logic ---
    if (instructionsHeader) {
        instructionsHeader.addEventListener('click', () => {
            if (window.getComputedStyle(toggleButton).display !== 'none') {
                instructionsContainer.classList.toggle('is-open');
                const isExpanded = instructionsContainer.classList.contains('is-open');
                toggleButton.setAttribute('aria-expanded', isExpanded);
            }
        });
    }

    // --- Grid Configuration based on screen size ---
    function updateGridConfig() {
        if (window.innerWidth <= 800) {
            ROWS = 15;
            COLS = 10;
        } else {
            ROWS = 10;
            COLS = 15;
        }
        TOTAL_CELLS = ROWS * COLS;
        textarea.setAttribute('maxlength', TOTAL_CELLS);
    }

    // --- 3. Grid & UI Initialization ---
    function createGrid() {
        grid.innerHTML = ''; // Clear the grid before rebuilding
        cells = [];
        for (let i = 0; i < TOTAL_CELLS; i++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.dataset.index = i;
            grid.appendChild(cell);
            cells.push(cell);
        }
    }

    // --- 4. UI Update Functions ---
    function updateGridDisplay() {
        const text = textarea.value;
        cells.forEach((cell, index) => {
            cell.textContent = text[index] || '';
        });
        updateCharacterCount(text.length);
    }

    function updateCharacterCount(count) {
        counter.textContent = `${count} / ${TOTAL_CELLS}`;
        if (count >= MIN_LENGTH && count <= TOTAL_CELLS) {
            counter.style.color = '#28a745';
        } else if (count > TOTAL_CELLS) {
            counter.style.color = '#dc3545';
        } else {
            counter.style.color = 'var(--subtle-text-color)';
        }
    }

    function updateCursorVisual() {
        const oldCursor = grid.querySelector('.cursor');
        if (oldCursor) oldCursor.classList.remove('cursor');

        const cursorIndex = textarea.selectionStart;

        if (cursorIndex === TOTAL_CELLS && textarea.value.length === TOTAL_CELLS) {
             cells[TOTAL_CELLS - 1].classList.add('cursor');
        } else if (cells[cursorIndex]) {
            cells[cursorIndex].classList.add('cursor');
        }
    }

    // --- 5. Core Logic & Stat Tracking ---
    function handleInput(event) {
        const currentLength = textarea.value.length;

        if (currentLength > TOTAL_CELLS) {
            textarea.value = textarea.value.substring(0, TOTAL_CELLS);
        }

        if (window.playerDataManager) {
            const previousLength = cells.filter(c => c.textContent !== '').length;

            if (currentLength > previousLength) {
                const charsAdded = currentLength - previousLength;
                playerDataManager.increaseStat('passageCharsWrittenTotal', charsAdded);
                currentStreak += charsAdded;
                playerDataManager.setStat('passageHighScoreStreak', currentStreak);

                unrewardedChars += charsAdded;
                const xpRewardChunks = Math.floor(unrewardedChars / 5);
                if (xpRewardChunks > 0) {
                    for (let i = 0; i < xpRewardChunks; i++) {
                        playerDataManager.rewardXp('passageCharactersWritten');
                    }
                    unrewardedChars %= 5;
                }
            }
        }

        updateGridDisplay();
        updateCursorVisual();
    }

    function handleKeyDown(e) {
        if (e.key === 'Backspace' || e.key === 'Delete') {
            if (window.playerDataManager) {
                playerDataManager.increaseStat('passageDeletes', 1);
            }
            currentStreak = 0;
        }

        let cursorIndex = textarea.selectionStart;
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            const newIndex = Math.max(0, cursorIndex - COLS);
            textarea.setSelectionRange(newIndex, newIndex);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const newIndex = Math.min(textarea.value.length + 1, cursorIndex + COLS);
            const finalIndex = Math.min(newIndex, textarea.value.length);
            textarea.setSelectionRange(finalIndex, finalIndex);
        }

        setTimeout(updateCursorVisual, 0);
    }

    // --- 6. Event Listeners ---
    textarea.addEventListener('input', handleInput);
    textarea.addEventListener('keydown', handleKeyDown);
    textarea.addEventListener('keyup', updateCursorVisual);
    textarea.addEventListener('click', updateCursorVisual);
    textarea.addEventListener('focus', updateCursorVisual);

    grid.addEventListener('click', (e) => {
        const cell = e.target.closest('.grid-cell');
        if (cell) {
            textarea.focus();
            const index = parseInt(cell.dataset.index, 10);
            const newPosition = Math.min(index, textarea.value.length);
            textarea.setSelectionRange(newPosition, newPosition);
            updateCursorVisual();
        }
    });
    
    // --- NEW: Copy to Clipboard Logic ---
    const showCopySuccess = () => {
        const buttonIcon = copyButton.querySelector('i');
        const buttonText = copyButton.querySelector('span');

        copyButton.classList.add('copied');
        buttonIcon.className = 'ph-bold ph-check-bold';
        buttonText.textContent = 'Copied!';

        // Prevent multiple clicks from creating multiple timers
        if (copyButton.dataset.timeoutId) {
            clearTimeout(copyButton.dataset.timeoutId);
        }

        const timeoutId = setTimeout(() => {
            copyButton.classList.remove('copied');
            buttonIcon.className = 'ph-bold ph-clipboard';
            buttonText.textContent = 'Copy';
            delete copyButton.dataset.timeoutId;
        }, 2000);

        copyButton.dataset.timeoutId = timeoutId;
    };

    copyButton.addEventListener('click', () => {
        // Use modern clipboard API
        navigator.clipboard.writeText(textarea.value).then(showCopySuccess)
        .catch(err => {
            console.error('Async clipboard copy failed, trying fallback:', err);
            // Fallback for older browsers or insecure contexts (http)
            try {
                textarea.select();
                document.execCommand('copy');
                showCopySuccess();
            } catch (e) {
                console.error('Fallback copy method failed:', e);
            }
        });
    });


    // --- Resize Handling ---
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const currentText = textarea.value;
            const currentSelection = textarea.selectionStart;

            updateGridConfig();
            createGrid();

            textarea.value = currentText;
            updateGridDisplay();
            textarea.setSelectionRange(currentSelection, currentSelection);
            updateCursorVisual();
        }, 250);
    });

    // --- 7. Initial Setup ---
    updateGridConfig();
    createGrid();
    updateGridDisplay();
    textarea.focus();
    updateCursorVisual();
});
