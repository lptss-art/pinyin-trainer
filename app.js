const app = (() => {
    // State
    let mode = ''; // 'mcq', 'write', 'explorer'
    let currentSound = '';
    let currentOptions = [];
    let audio = new Audio();
    let scores = JSON.parse(localStorage.getItem('pinyinScores') || '{}');
    let groupedSounds = null;
    let hasAnswered = false;
    
    // Elements
    const setupScreen = document.getElementById('setupScreen');
    const gameScreen = document.getElementById('gameScreen');
    const mcqOptions = document.getElementById('mcqOptions');
    const writeInput = document.getElementById('writeInput');
    const pinyinInput = document.getElementById('pinyinInput');
    const feedback = document.getElementById('feedback');
    const nextBtn = document.getElementById('nextBtn');
    const statsDisplay = document.getElementById('statsDisplay');
    const explorerScreen = document.getElementById('explorerScreen');
    const explorerList = document.getElementById('explorerList');
    const explorerSearch = document.getElementById('explorerSearch');
    const volumeControl = document.getElementById('volumeControl');

    const formatPinyin = (syllableTone) => {
        const match = syllableTone.match(/^([a-z]+)(\d)$/);
        if (!match) return syllableTone.replace(/uu/g, "ü");
        
        let text = match[1].replace(/uu/g, "ü");
        const tone = parseInt(match[2], 10);
        if (tone < 1 || tone > 4) return text;
        
        const tonesMap = {
            "a": ["ā", "á", "ǎ", "à"],
            "e": ["ē", "é", "ě", "è"],
            "i": ["ī", "í", "ǐ", "ì"],
            "o": ["ō", "ó", "ǒ", "ò"],
            "u": ["ū", "ú", "ǔ", "ù"],
            "ü": ["ǖ", "ǘ", "ǚ", "ǜ"]
        };

        let target = "";
        if (text.includes("a")) target = "a";
        else if (text.includes("e")) target = "e";
        else if (text.includes("o")) target = "o";
        else if (text.includes("iu")) target = "u";
        else if (text.includes("ui")) target = "i";
        else {
            const m = text.match(/[iuü]/);
            if (m) target = m[0];
        }
        
        if (target) {
            text = text.replace(target, tonesMap[target][tone - 1]);
        }
        return text;
    };

    const parsePinyin = (syllableTone) => {
        const match = syllableTone.match(/^([a-z]+)(\d)$/);
        if (match) return { text: match[1], tone: match[2] };
        return { text: syllableTone, tone: '' }; // Fallback
    };

    const getWeightedRandomSound = () => {
        const candidates = pinyinSounds;
        if (!candidates || candidates.length === 0) return 'a1';

        const unmastered = candidates.filter(s => (scores[s] || 0) < 3);
        if (unmastered.length > 0 && Math.random() < 0.8) {
            return unmastered[Math.floor(Math.random() * unmastered.length)];
        }
        return candidates[Math.floor(Math.random() * candidates.length)];
    };

    const generateDistractors = (correct) => {
        const parsed = parsePinyin(correct);
        const base = parsed.text;
        
        const allBases = [...new Set(pinyinSounds.map(s => parsePinyin(s).text))];
        const others = allBases.filter(b => b !== base);
        
        const initialMatch = base.match(/^([bpmfdtnlgkhjqxrzcsyw]|zh|ch|sh)?(.*)$/);
        const initial = initialMatch ? initialMatch[1] || '' : '';
        const final = initialMatch ? initialMatch[2] : base;

        let similar = others.filter(b => {
            const bMatch = b.match(/^([bpmfdtnlgkhjqxrzcsyw]|zh|ch|sh)?(.*)$/);
            const bInitial = bMatch ? bMatch[1] || '' : '';
            const bFinal = bMatch ? bMatch[2] : b;
            return (bInitial === initial && bFinal !== final) || (bInitial !== initial && bFinal === final);
        });

        if (similar.length < 2) {
            similar = similar.concat(others);
        }
        
        const uniqueSimilar = [...new Set(similar)];
        uniqueSimilar.sort(() => Math.random() - 0.5);
        
        const bases = [base, uniqueSimilar[0], uniqueSimilar[1]].sort();
        
        let options = [];
        bases.forEach(b => {
            for(let i=1; i<=4; i++) {
                options.push(`${b}${i}`);
            }
        });

        if (!options.includes(correct)) {
            const index = options.indexOf(`${base}1`);
            if (index !== -1) {
                options[index] = correct;
            } else {
                options[0] = correct; // Fallback
            }
        }

        return options;
    };

    const switchView = (view) => {
        setupScreen.classList.add('hidden');
        gameScreen.classList.add('hidden');
        explorerScreen.classList.add('hidden');

        if (view === 'trainer') {
            setupScreen.classList.remove('hidden');
        } else if (view === 'explorer') {
            explorerScreen.classList.remove('hidden');
            renderExplorer();
        }
    };

    const startApp = (selectedMode) => {
        mode = selectedMode;
        setupScreen.classList.add('hidden');
        explorerScreen.classList.add('hidden');
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
        hasAnswered = false;
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

        playSound(currentSound);
    };

    const renderMCQ = () => {
        mcqOptions.innerHTML = '';
        currentOptions.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-secondary p-2 text-sm';
            btn.dataset.sound = opt;
            btn.textContent = formatPinyin(opt);
            btn.onclick = () => {
                if (!hasAnswered) {
                    checkAnswer(opt);
                } else {
                    playSound(opt);
                }
            };
            mcqOptions.appendChild(btn);
        });
    };

    const playSound = (soundName) => {
        if (!soundName) return;
        if (volumeControl) audio.volume = volumeControl.value;
        audio.src = `sounds/${soundName}.mp3`;
        audio.play().catch(e => console.log('Audio play failed', e));
    };

    const checkAnswer = (answer) => {
        hasAnswered = true;
        const isCorrect = answer === currentSound;
        handleResult(isCorrect, currentSound);
        
        Array.from(mcqOptions.children).forEach(btn => {
            if (btn.dataset.sound === currentSound) {
                btn.classList.remove('btn-secondary');
                btn.classList.add('bg-success');
            } else if (btn.dataset.sound === answer && !isCorrect) {
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
        feedback.textContent = isCorrect ? 'Bravo !' : `Faux, c'était : ${formatPinyin(currentSound)}`;
        nextBtn.classList.remove('hidden');
    };

    const updateStats = () => {
        if (statsDisplay) {
            const mastered = Object.values(scores).filter(s => s >= 3).length;
            statsDisplay.textContent = `Maîtrisés: ${mastered} / ${pinyinSounds.length}`;
        }
    };

    // --- EXPLORER LOGIC ---
    const renderExplorer = (filter = '') => {
        if (!groupedSounds) {
            groupedSounds = {};
            pinyinSounds.forEach(s => {
                const parsed = parsePinyin(s);
                const base = parsed.text;
                if (!groupedSounds[base]) groupedSounds[base] = [];
                groupedSounds[base].push(s);
            });
            for (let key in groupedSounds) {
                groupedSounds[key].sort();
            }
        }

        if (!explorerList) return;
        explorerList.innerHTML = '';
        const query = filter.toLowerCase().trim();
        
        Object.keys(groupedSounds).sort().forEach(base => {
            if (query && !base.includes(query)) return;
            
            const card = document.createElement('div');
            card.className = 'bg-white p-4 rounded-xl shadow-sm flex-col gap-3 mb-4';
            
            const title = document.createElement('h3');
            title.className = 'font-bold text-gray-700 capitalize text-lg';
            title.textContent = base.replace(/uu/g, 'ü');
            card.appendChild(title);
            
            const btnGrid = document.createElement('div');
            btnGrid.className = 'grid grid-cols-4 gap-2';
            
            groupedSounds[base].forEach(sound => {
                const btn = document.createElement('button');
                btn.className = 'btn btn-secondary p-2 text-sm';
                btn.textContent = formatPinyin(sound);
                btn.onclick = () => playSound(sound);
                btnGrid.appendChild(btn);
            });
            
            card.appendChild(btnGrid);
            explorerList.appendChild(card);
        });
    };

    if (explorerSearch) {
        explorerSearch.addEventListener('input', (e) => {
            renderExplorer(e.target.value);
        });
    }

    if (pinyinInput) {
        pinyinInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && feedback.classList.contains('hidden')) {
                checkWriteAnswer();
            } else if (e.key === 'Enter' && !nextBtn.classList.contains('hidden')) {
                nextQuestion();
            }
        });
    }

    if (volumeControl) {
        volumeControl.addEventListener('input', (e) => {
            audio.volume = e.target.value;
        });
    }

    return {
        startApp,
        switchView,
        nextQuestion,
        playSound: () => playSound(currentSound),
        checkWriteAnswer
    };
})();
