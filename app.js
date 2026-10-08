const app = (() => {
    // State
    let mode = ''; // 'mcq' or 'write'
    let currentSound = '';
    let currentOptions = [];
    let audio = new Audio();
    let scores = JSON.parse(localStorage.getItem('pinyinScores') || '{}');
    
    // Elements
    const setupScreen = document.getElementById('setupScreen');
    const gameScreen = document.getElementById('gameScreen');
    const mcqOptions = document.getElementById('mcqOptions');
    const writeInput = document.getElementById('writeInput');
    const pinyinInput = document.getElementById('pinyinInput');
    const feedback = document.getElementById('feedback');
    const nextBtn = document.getElementById('nextBtn');
    const statsDisplay = document.getElementById('statsDisplay');

    // Similarity map for consonants and vowels to generate good distractors
    const similarConsonants = {
        'b': ['p', 'd'], 'p': ['b', 't'], 'd': ['t', 'b'], 't': ['d', 'p'],
        'g': ['k', 'h'], 'k': ['g', 'h'], 'h': ['g', 'k'],
        'j': ['q', 'x', 'zh'], 'q': ['j', 'x', 'ch'], 'x': ['j', 'q', 'sh'],
        'zh': ['ch', 'sh', 'z', 'j'], 'ch': ['zh', 'sh', 'c', 'q'], 'sh': ['zh', 'ch', 's', 'x'],
        'z': ['c', 's', 'zh'], 'c': ['z', 's', 'ch'], 's': ['z', 'c', 'sh'],
        'm': ['n'], 'n': ['m', 'l'], 'l': ['n', 'r'], 'r': ['l', 'sh']
    };

    const parsePinyin = (syllableTone) => {
        const match = syllableTone.match(/^([a-z]+)(\d)$/);
        if (match) return { text: match[1], tone: match[2] };
        return { text: syllableTone, tone: '' }; // Fallback
    };

    const getWeightedRandomSound = () => {
        // Find sounds user is bad at or hasn't played
        const candidates = pinyinSounds;
        if (!candidates || candidates.length === 0) return 'a1';

        // simple weighting: 80% chance to pick something with score < 3 or unplayed
        const unmastered = candidates.filter(s => (scores[s] || 0) < 3);
        
        if (unmastered.length > 0 && Math.random() < 0.8) {
            return unmastered[Math.floor(Math.random() * unmastered.length)];
        }
        return candidates[Math.floor(Math.random() * candidates.length)];
    };

    const generateDistractors = (correct) => {
        const parsed = parsePinyin(correct);
        const options = new Set([correct]);
        
        // 1. Same syllable, different tone
        let attempts = 0;
        while(options.size < 2 && attempts < 20) {
            const tone = Math.floor(Math.random() * 4) + 1;
            const option = `${parsed.text}${tone}`;
            if (pinyinSounds.includes(option)) options.add(option);
            attempts++;
        }

        // 2. Add random other sounds as fallback or similarity
        while (options.size < 4) {
            options.add(pinyinSounds[Math.floor(Math.random() * pinyinSounds.length)]);
        }

        return Array.from(options).sort(() => Math.random() - 0.5);
    };

    const startApp = (selectedMode) => {
        mode = selectedMode;
        setupScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        
        if (mode === 'mcq') {
            mcqOptions.classList.remove('hidden');
            writeInput.classList.add('hidden');
        } else {
            mcqOptions.classList.add('hidden');
            writeInput.classList.remove('hidden');
        }
        
        updateStats();
        nextQuestion();
    };

    const nextQuestion = () => {
        currentSound = getWeightedRandomSound();
        feedback.classList.add('hidden');
        nextBtn.classList.add('hidden');
        
        if (mode === 'mcq') {
            currentOptions = generateDistractors(currentSound);
            renderMCQ();
        } else {
            pinyinInput.value = '';
            pinyinInput.focus();
        }

        playSound();
    };

    const renderMCQ = () => {
        mcqOptions.innerHTML = '';
        currentOptions.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-secondary';
            btn.textContent = opt;
            btn.onclick = () => checkAnswer(opt);
            mcqOptions.appendChild(btn);
        });
    };

    const playSound = () => {
        if (!currentSound) return;
        audio.src = `sounds/${currentSound}.mp3`;
        audio.play().catch(e => console.log('Audio play failed', e));
    };

    const checkAnswer = (answer) => {
        const isCorrect = answer === currentSound;
        handleResult(isCorrect, currentSound);
        
        // Visual feedback
        Array.from(mcqOptions.children).forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === currentSound) {
                btn.classList.remove('btn-secondary');
                btn.classList.add('bg-success');
            } else if (btn.textContent === answer && !isCorrect) {
                btn.classList.remove('btn-secondary');
                btn.classList.add('bg-error');
            }
        });
        
        showFeedback(isCorrect);
    };

    const checkWriteAnswer = () => {
        const answer = pinyinInput.value.trim().toLowerCase();
        if (!answer) return;
        
        const isCorrect = answer === currentSound;
        handleResult(isCorrect, currentSound);
        showFeedback(isCorrect);
    };

    const handleResult = (isCorrect, sound) => {
        if (!scores[sound]) scores[sound] = 0;
        if (isCorrect) {
            scores[sound] = Math.min(scores[sound] + 1, 5);
        } else {
            scores[sound] = Math.max(scores[sound] - 1, -2);
        }
        localStorage.setItem('pinyinScores', JSON.stringify(scores));
        updateStats();
    };

    const showFeedback = (isCorrect) => {
        feedback.classList.remove('hidden');
        feedback.className = `p-4 rounded-xl text-center font-bold ${isCorrect ? 'bg-success' : 'bg-error'}`;
        feedback.textContent = isCorrect ? 'Bravo !' : `Faux, c'était : ${currentSound}`;
        nextBtn.classList.remove('hidden');
    };

    const updateStats = () => {
        const mastered = Object.values(scores).filter(s => s >= 3).length;
        statsDisplay.textContent = `Maîtrisés: ${mastered} / ${pinyinSounds.length}`;
    };

    // Keyboard support for Write mode
    pinyinInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && feedback.classList.contains('hidden')) {
            checkWriteAnswer();
        } else if (e.key === 'Enter' && !nextBtn.classList.contains('hidden')) {
            nextQuestion();
        }
    });

    return {
        startApp,
        nextQuestion,
        playSound,
        checkWriteAnswer
    };
})();
