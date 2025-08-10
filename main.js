// Global variables
let currentPart = 1;
let totalParts = 4;
let audioPlayer = null;
let timer = null;
let timeRemaining = 60 * 60; // 60 minutes in seconds
let isPlaying = false;

// Correct answers for checking
const correctAnswers = {
    1: "MONTH", 2: "SELLING", 3: "SUNDAYS", 4: "35", 5: "TRAINING",
    6: "UNIFORM", 7: "ACTIVITIES", 8: "CHILDCARE", 9: "8.70", 10: "BALLERA",
    11: ["C", "D"], 12: ["C", "D"], 13: ["A", "D"], 14: ["A", "D"],
    15: "C", 16: "F", 17: "B", 18: "H", 19: "D", 20: "A",
    21: "E", 22: "A", 23: "G", 24: "F", 25: "B",
    26: "A", 27: "A", 28: "B", 29: "B", 30: "A",
    31: "AGRICULTURE", 32: "LOW WAGES", 33: "CENTRALIZATION", 34: "TIME KEEPING",
    35: "GAS", 36: "SILK", 37: "WATER", 38: "TEXTILE", 39: "DISEASE", 40: "REPLACE"
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    setupAudioPlayer();
    startTimer();
    loadTheme();
});

function initializeApp() {
    // Show first part by default
    switchToPart(1);
    updateNavigationButtons();
    updateAttemptedCounts();
}

function setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Audio controls
    const playPauseBtn = document.getElementById('play-pause-btn');
    const progressBar = document.getElementById('progress-bar');
    const volumeSlider = document.getElementById('volume-slider');
    const speedBtn = document.getElementById('speed-btn');
    const speedOptions = document.getElementById('speed-options');

    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', togglePlayPause);
    }

    if (progressBar) {
        progressBar.addEventListener('input', seekAudio);
    }

    if (volumeSlider) {
        volumeSlider.addEventListener('input', changeVolume);
    }

    if (speedBtn) {
        speedBtn.addEventListener('click', toggleSpeedOptions);
    }

    if (speedOptions) {
        speedOptions.addEventListener('click', changeSpeed);
    }

    // Answer checking
    const deliverButton = document.getElementById('deliver-button');
    if (deliverButton) {
        deliverButton.addEventListener('click', checkAnswers);
    }

    // Modal close
    const modalCloseBtn = document.getElementById('modal-close-button');
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }

    // Input event listeners for answer tracking
    setupAnswerTracking();

    // Close speed options when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.speed-container')) {
            hideSpeedOptions();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

function setupAudioPlayer() {
    audioPlayer = document.getElementById('global-audio-player');
    if (!audioPlayer) return;

    audioPlayer.addEventListener('loadedmetadata', function() {
        const totalDuration = document.getElementById('total-duration');
        if (totalDuration) {
            totalDuration.textContent = formatTime(audioPlayer.duration);
        }
        
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.max = audioPlayer.duration;
        }
    });

    audioPlayer.addEventListener('timeupdate', function() {
        const currentTime = document.getElementById('current-time');
        const progressBar = document.getElementById('progress-bar');
        
        if (currentTime) {
            currentTime.textContent = formatTime(audioPlayer.currentTime);
        }
        
        if (progressBar) {
            progressBar.value = audioPlayer.currentTime;
        }
    });

    audioPlayer.addEventListener('ended', function() {
        isPlaying = false;
        updatePlayPauseButton();
    });

    audioPlayer.addEventListener('error', function(e) {
        console.warn('Audio loading error:', e);
        // Handle audio loading gracefully
    });
}

function setupAnswerTracking() {
    // Track text inputs
    const textInputs = document.querySelectorAll('.answer-input');
    textInputs.forEach(input => {
        input.addEventListener('input', updateAttemptedCounts);
    });

    // Track radio buttons
    const radioInputs = document.querySelectorAll('input[type="radio"]');
    radioInputs.forEach(input => {
        input.addEventListener('change', updateAttemptedCounts);
    });

    // Track checkboxes
    const checkboxInputs = document.querySelectorAll('input[type="checkbox"]');
    checkboxInputs.forEach(input => {
        input.addEventListener('change', updateAttemptedCounts);
    });
}

// Theme functions
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Timer functions
function startTimer() {
    timer = setInterval(function() {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining <= 0) {
            clearInterval(timer);
            autoSubmit();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const timerDisplay = document.querySelector('.timer-display');
    if (timerDisplay) {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Change color when time is running low
        if (timeRemaining <= 300) { // 5 minutes
            timerDisplay.style.color = 'var(--error-color)';
        } else if (timeRemaining <= 600) { // 10 minutes
            timerDisplay.style.color = 'var(--warning-color)';
        }
    }
}

function autoSubmit() {
    alert('Time is up! Your answers will be submitted automatically.');
    checkAnswers();
}

// Audio player functions
function togglePlayPause() {
    if (!audioPlayer) return;

    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
    } else {
        audioPlayer.play().catch(e => {
            console.warn('Audio play failed:', e);
        });
        isPlaying = true;
    }
    
    updatePlayPauseButton();
}

function updatePlayPauseButton() {
    const playPauseBtn = document.getElementById('play-pause-btn');
    if (!playPauseBtn) return;

    const svg = playPauseBtn.querySelector('svg path');
    if (svg) {
        if (isPlaying) {
            svg.setAttribute('d', 'M6 4h4v16H6V4zm8 0h4v16h-4V4z'); // Pause icon
        } else {
            svg.setAttribute('d', 'M8 5v14l11-7z'); // Play icon
        }
    }
}

function seekAudio() {
    if (!audioPlayer) return;
    
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        audioPlayer.currentTime = progressBar.value;
    }
}

function changeVolume() {
    if (!audioPlayer) return;
    
    const volumeSlider = document.getElementById('volume-slider');
    if (volumeSlider) {
        audioPlayer.volume = volumeSlider.value;
    }
}

function toggleSpeedOptions() {
    const speedOptions = document.getElementById('speed-options');
    if (speedOptions) {
        speedOptions.classList.toggle('hidden');
    }
}

function hideSpeedOptions() {
    const speedOptions = document.getElementById('speed-options');
    if (speedOptions) {
        speedOptions.classList.add('hidden');
    }
}

function changeSpeed(event) {
    if (!event.target.dataset.speed || !audioPlayer) return;
    
    const speed = parseFloat(event.target.dataset.speed);
    audioPlayer.playbackRate = speed;
    
    const speedBtn = document.getElementById('speed-btn');
    if (speedBtn) {
        speedBtn.textContent = `${speed}x`;
    }
    
    hideSpeedOptions();
}

// Navigation functions
function switchToPart(partNumber) {
    if (partNumber < 1 || partNumber > totalParts) return;
    
    // Hide all parts
    for (let i = 1; i <= totalParts; i++) {
        const part = document.getElementById(`part-${i}`);
        if (part) {
            part.classList.add('hidden');
        }
    }
    
    // Show selected part
    const selectedPart = document.getElementById(`part-${partNumber}`);
    if (selectedPart) {
        selectedPart.classList.remove('hidden');
    }
    
    currentPart = partNumber;
    updateNavigationButtons();
    updatePartSelection();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextPart() {
    if (currentPart < totalParts) {
        switchToPart(currentPart + 1);
    }
}

function previousPart() {
    if (currentPart > 1) {
        switchToPart(currentPart - 1);
    }
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
        prevBtn.disabled = currentPart === 1;
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPart === totalParts;
    }
}

function updatePartSelection() {
    // Update bottom navigation
    const questionWrappers = document.querySelectorAll('.footer__questionNo');
    questionWrappers.forEach((wrapper, index) => {
        if (index + 1 === currentPart) {
            wrapper.classList.add('selected');
        } else {
            wrapper.classList.remove('selected');
        }
    });
}

function goToQuestion(questionNumber) {
    // Determine which part the question belongs to
    let targetPart;
    if (questionNumber <= 10) targetPart = 1;
    else if (questionNumber <= 20) targetPart = 2;
    else if (questionNumber <= 30) targetPart = 3;
    else targetPart = 4;
    
    // Switch to the appropriate part
    if (targetPart !== currentPart) {
        switchToPart(targetPart);
    }
    
    // Scroll to the question
    setTimeout(() => {
        const questionElement = document.getElementById(`q${questionNumber}`);
        if (questionElement) {
            questionElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            questionElement.focus();
        }
    }, 100);
}

// Answer tracking and validation
function updateAttemptedCounts() {
    const parts = [
        { start: 1, end: 10, part: 1 },
        { start: 11, end: 20, part: 2 },
        { start: 21, end: 30, part: 3 },
        { start: 31, end: 40, part: 4 }
    ];
    
    parts.forEach(({ start, end, part }) => {
        let attempted = 0;
        
        for (let i = start; i <= end; i++) {
            if (isQuestionAttempted(i)) {
                attempted++;
            }
        }
        
        const attemptedSpan = document.querySelector(
            `.footer__questionWrapper:nth-child(${part}) .attemptedCount`
        );
        if (attemptedSpan) {
            attemptedSpan.textContent = `${attempted} of 10`;
        }
        
        // Update individual question buttons
        for (let i = start; i <= end; i++) {
            const questionBtn = document.querySelector(
                `.subQuestion[onclick="goToQuestion(${i})"]`
            );
            if (questionBtn) {
                if (isQuestionAttempted(i)) {
                    questionBtn.classList.add('active');
                } else {
                    questionBtn.classList.remove('active');
                }
            }
        }
    });
}

function isQuestionAttempted(questionNumber) {
    // Check text inputs
    const textInput = document.getElementById(`q${questionNumber}`);
    if (textInput && textInput.value.trim() !== '') {
        return true;
    }
    
    // Check radio buttons
    const radioInput = document.querySelector(`input[name="q${questionNumber}"]:checked`);
    if (radioInput) {
        return true;
    }
    
    // Check checkboxes for multi-answer questions
    if (questionNumber === 11 || questionNumber === 12) {
        const checkboxes = document.querySelectorAll('input[name="q11-12"]:checked');
        return checkboxes.length > 0;
    }
    
    if (questionNumber === 13 || questionNumber === 14) {
        const checkboxes = document.querySelectorAll('input[name="q13-14"]:checked');
        return checkboxes.length > 0;
    }
    
    return false;
}

// Answer checking and results
function checkAnswers() {
    const results = {};
    let totalCorrect = 0;
    let totalQuestions = 40;
    
    // Check all answers
    for (let i = 1; i <= totalQuestions; i++) {
        const userAnswer = getUserAnswer(i);
        const correctAnswer = correctAnswers[i];
        const isCorrect = checkAnswer(userAnswer, correctAnswer);
        
        results[i] = {
            userAnswer,
            correctAnswer,
            isCorrect
        };
        
        if (isCorrect) {
            totalCorrect++;
        }
    }
    
    // Calculate band score (simplified)
    const bandScore = calculateBandScore(totalCorrect);
    
    // Show results
    showResults(results, totalCorrect, totalQuestions, bandScore);
}

function getUserAnswer(questionNumber) {
    // Text input
    const textInput = document.getElementById(`q${questionNumber}`);
    if (textInput) {
        return textInput.value.trim().toUpperCase();
    }
    
    // Radio button
    const radioInput = document.querySelector(`input[name="q${questionNumber}"]:checked`);
    if (radioInput) {
        return radioInput.value;
    }
    
    // Checkbox questions
    if (questionNumber === 11 || questionNumber === 12) {
        const checkboxes = document.querySelectorAll('input[name="q11-12"]:checked');
        return Array.from(checkboxes).map(cb => cb.value).sort();
    }
    
    if (questionNumber === 13 || questionNumber === 14) {
        const checkboxes = document.querySelectorAll('input[name="q13-14"]:checked');
        return Array.from(checkboxes).map(cb => cb.value).sort();
    }
    
    return '';
}

function checkAnswer(userAnswer, correctAnswer) {
    if (Array.isArray(correctAnswer)) {
        if (Array.isArray(userAnswer)) {
            return JSON.stringify(userAnswer.sort()) === JSON.stringify(correctAnswer.sort());
        }
        return correctAnswer.includes(userAnswer);
    }
    
    if (Array.isArray(userAnswer)) {
        return userAnswer.includes(correctAnswer);
    }
    
    return userAnswer === correctAnswer;
}

function calculateBandScore(correctAnswers) {
    // Simplified IELTS band score calculation
    const percentage = (correctAnswers / 40) * 100;
    
    if (percentage >= 90) return 9.0;
    if (percentage >= 82) return 8.5;
    if (percentage >= 75) return 8.0;
    if (percentage >= 67) return 7.5;
    if (percentage >= 60) return 7.0;
    if (percentage >= 52) return 6.5;
    if (percentage >= 45) return 6.0;
    if (percentage >= 37) return 5.5;
    if (percentage >= 30) return 5.0;
    if (percentage >= 22) return 4.5;
    if (percentage >= 15) return 4.0;
    if (percentage >= 10) return 3.5;
    return 3.0;
}

function showResults(results, totalCorrect, totalQuestions, bandScore) {
    const modal = document.getElementById('result-modal');
    const scoreSummary = document.getElementById('score-summary');
    const resultDetails = document.getElementById('result-details');
    
    if (!modal || !scoreSummary || !resultDetails) return;
    
    // Update summary
    scoreSummary.innerHTML = `
        <div style="text-align: center; margin-bottom: 1rem;">
            <div style="font-size: 2rem; color: var(--accent-color);">${bandScore}</div>
            <div>IELTS Band Score</div>
            <div style="margin-top: 0.5rem;">${totalCorrect}/${totalQuestions} correct answers</div>
        </div>
    `;
    
    // Create detailed results
    const sections = [
        { name: 'Section 1', start: 1, end: 10 },
        { name: 'Section 2', start: 11, end: 20 },
        { name: 'Section 3', start: 21, end: 30 },
        { name: 'Section 4', start: 31, end: 40 }
    ];
    
    let detailsHTML = '';
    
    sections.forEach(section => {
        let sectionCorrect = 0;
        let sectionHTML = `<div class="result-section">
            <h3>${section.name}</h3>`;
        
        for (let i = section.start; i <= section.end; i++) {
            const result = results[i];
            const isCorrect = result.isCorrect;
            
            if (isCorrect) sectionCorrect++;
            
            sectionHTML += `
                <div class="result-item ${isCorrect ? 'correct' : 'incorrect'}">
                    <span>Q${i}: ${result.userAnswer || '(not answered)'}</span>
                    <span>${isCorrect ? '✓' : `✗ (${result.correctAnswer})`}</span>
                </div>
            `;
        }
        
        sectionHTML += `<div style="margin-top: 0.5rem; font-weight: bold;">
            Score: ${sectionCorrect}/10
        </div></div>`;
        
        detailsHTML += sectionHTML;
    });
    
    resultDetails.innerHTML = detailsHTML;
    
    // Show modal
    modal.style.display = 'flex';
    
    // Stop timer
    if (timer) {
        clearInterval(timer);
    }
}

function closeModal() {
    const modal = document.getElementById('result-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Keyboard shortcuts
function handleKeyboardShortcuts(event) {
    // Don't trigger shortcuts when typing in inputs
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
    }
    
    switch (event.key) {
        case 'ArrowLeft':
            event.preventDefault();
            previousPart();
            break;
        case 'ArrowRight':
            event.preventDefault();
            nextPart();
            break;
        case ' ':
            event.preventDefault();
            togglePlayPause();
            break;
        case 'Escape':
            closeModal();
            hideSpeedOptions();
            break;
    }
}

// Utility functions
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Export functions for global access
window.switchToPart = switchToPart;
window.nextPart = nextPart;
window.previousPart = previousPart;
window.goToQuestion = goToQuestion;