// Bihar Board 2026 - Complete JavaScript Functions (Fixed Version)

// Global Variables
let currentSubject = '';
let currentChapter = '';
let currentChapterNumber = 0;
let currentTestNumber = 1;
let currentQuestionIndex = 0;
let userAnswers = [];
let timeLeft = 600; // 10 minutes in seconds
let timerInterval;
let startTime;
let questionsData = [];

// Load questions from JSON file
async function loadQuestions(subject, chapterNum, testNum) {
    try {
        const fileName = `${subject}_chapter${chapterNum}_test${testNum}.json`;
        const response = await fetch(fileName);
        
        if (!response.ok) {
            throw new Error('Questions file not found');
        }
        
        const data = await response.json();
        questionsData = data.questions;
        
        // Shuffle questions for random order
        shuffleArray(questionsData);
        
        return true;
    } catch (error) {
        console.error('Error loading questions:', error);
        alert('⚠️ इस test के questions अभी उपलब्ध नहीं हैं।\n\nकृपया बाद में try करें।\n\nFile needed: ' + fileName);
        return false;
    }
}

// Shuffle array for random question order
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Show Test Selection Modal
function showTestSelection(chapterName, chapterNum, subject) {
    currentChapter = chapterName;
    currentChapterNumber = chapterNum;
    currentSubject = subject;
    
    document.getElementById('test-modal').style.display = 'flex';
    document.getElementById('modal-chapter-name').textContent = chapterName;
}

// Close Modal
function closeModal() {
    document.getElementById('test-modal').style.display = 'none';
}

// Start Test
async function startTest(testNumber) {
    currentTestNumber = testNumber;
    
    // Show loading message
    const modal = document.getElementById('test-modal');
    const originalContent = modal.innerHTML;
    modal.innerHTML = '<div class="modal-content"><h2>⏳ Loading questions...</h2><p>कृपया प्रतीक्षा करें...</p></div>';
    
    // Load questions
    const loaded = await loadQuestions(currentSubject, currentChapterNumber, testNumber);
    
    if (!loaded) {
        modal.innerHTML = originalContent;
        closeModal();
        return;
    }
    
    // Initialize test
    currentQuestionIndex = 0;
    userAnswers = new Array(questionsData.length).fill(null);
    
    // Set timer based on subject (15 min for math, 10 min for others)
    timeLeft = currentSubject === 'math' ? 900 : 600;
    
    // Hide modal and subject page
    closeModal();
    
    // Hide chapters container
    const chaptersContainer = document.querySelector('.chapters-container');
    if (chaptersContainer && chaptersContainer.parentElement) {
        chaptersContainer.parentElement.style.display = 'none';
    }
    
    // Show test page
    const testPage = document.getElementById('test-page');
    if (testPage) {
        testPage.classList.remove('hidden');
    }
    
    // Start test
    startTime = Date.now();
    startTimer();
    loadQuestion();
}

// Start Timer
function startTimer() {
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            autoSubmitTest();
        }
    }, 1000);
}

// Update Timer Display
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timerElement = document.getElementById('timer');
    
    if (timerElement) {
        timerElement.textContent = `⏱️ ${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Change color when time is low
        if (timeLeft < 60) {
            timerElement.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
        } else if (timeLeft < 180) {
            timerElement.style.background = 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)';
        }
    }
}

// Load Question
function loadQuestion() {
    const question = questionsData[currentQuestionIndex];
    
    // Update question counter
    const counterElement = document.getElementById('question-counter');
    if (counterElement) {
        counterElement.textContent = `प्रश्न ${currentQuestionIndex + 1}/${questionsData.length}`;
    }
    
    // Update progress bar
    const progress = ((currentQuestionIndex + 1) / questionsData.length) * 100;
    const progressElement = document.getElementById('progress-fill');
    if (progressElement) {
        progressElement.style.width = progress + '%';
    }
    
    // Display question
    const questionElement = document.getElementById('question-text');
    if (questionElement) {
        questionElement.textContent = `${currentQuestionIndex + 1}. ${question.question}`;
    }
    
    // Display options
    const optionsHtml = question.options.map((option, index) => {
        const selected = userAnswers[currentQuestionIndex] === index ? 'selected' : '';
        return `<div class="option ${selected}" onclick="selectOption(${index})">${option}</div>`;
    }).join('');
    
    const optionsElement = document.getElementById('options');
    if (optionsElement) {
        optionsElement.innerHTML = optionsHtml;
    }
    
    // Update navigation buttons
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    
    if (prevBtn) {
        prevBtn.disabled = currentQuestionIndex === 0;
    }
    
    if (currentQuestionIndex === questionsData.length - 1) {
        if (nextBtn) nextBtn.classList.add('hidden');
        if (submitBtn) submitBtn.classList.remove('hidden');
    } else {
        if (nextBtn) nextBtn.classList.remove('hidden');
        if (submitBtn) submitBtn.classList.add('hidden');
    }
}

// Select Option
function selectOption(optionIndex) {
    userAnswers[currentQuestionIndex] = optionIndex;
    loadQuestion();
}

// Previous Question
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
    }
}

// Next Question
function nextQuestion() {
    if (currentQuestionIndex < questionsData.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    }
}

// Auto Submit Test
function autoSubmitTest() {
    alert('⏰ समय समाप्त! आपका test automatically submit हो रहा है।');
    submitTest();
}

// Submit Test
function submitTest() {
    // Confirm submission
    const unanswered = userAnswers.filter(ans => ans === null).length;
    
    if (unanswered > 0 && timerInterval) {
        const confirm = window.confirm(
            `⚠️ ${unanswered} प्रश्न अनुत्तरित हैं।\n\nक्या आप test submit करना चाहते हैं?`
        );
        
        if (!confirm) {
            return;
        }
    }
    
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - startTime) / 1000);
    
    // Calculate score
    let correctCount = 0;
    questionsData.forEach((q, index) => {
        if (userAnswers[index] === q.correct) {
            correctCount++;
        }
    });
    
    const percentage = Math.round((correctCount / questionsData.length) * 100);
    
    showResults(correctCount, percentage, timeTaken);
}

// Show Results
function showResults(score, percentage, timeTaken) {
    const testPage = document.getElementById('test-page');
    const resultPage = document.getElementById('result-page');
    
    if (testPage) testPage.classList.add('hidden');
    if (resultPage) resultPage.classList.remove('hidden');
    
    // Display score
    const scoreDisplay = document.getElementById('score-display');
    const percentageDisplay = document.getElementById('percentage-display');
    const timeTakenDisplay = document.getElementById('time-taken');
    
    if (scoreDisplay) {
        scoreDisplay.textContent = `${score}/${questionsData.length}`;
    }
    
    if (percentageDisplay) {
        percentageDisplay.textContent = `${percentage}%`;
    }
    
    // Display time taken
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    if (timeTakenDisplay) {
        timeTakenDisplay.textContent = `समय: ${minutes} मिनट ${seconds} सेकंड`;
    }
    
    // Display motivational message
    let message = '';
    let cardColor = '';
    
    if (percentage >= 90) {
        message = '🎉 शानदार! आप बहुत अच्छे हैं! ऐसे ही मेहनत करते रहें! 🌟';
        cardColor = 'linear-gradient(135deg, #28a745 0%, #5cb85c 100%)';
    } else if (percentage >= 70) {
        message = '👍 बढ़िया! अच्छा प्रदर्शन! थोड़ी और मेहनत से आप और बेहतर कर सकते हैं! 💪';
        cardColor = 'linear-gradient(135deg, #228B22 0%, #32CD32 100%)';
    } else if (percentage >= 50) {
        message = '💪 अच्छी कोशिश! Practice जारी रखें! आप जरूर सुधार करेंगे! 📚';
        cardColor = 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)';
    } else {
        message = '📚 फिर से try करें! आप कर सकते हैं! हार मत मानिए! 🎯';
        cardColor = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
    }
    
    const motivationMsg = document.getElementById('motivation-msg');
    const scoreCard = document.querySelector('.score-card');
    
    if (motivationMsg) {
        motivationMsg.textContent = message;
    }
    
    if (scoreCard) {
        scoreCard.style.background = cardColor;
    }
    
    // Display detailed analysis
    displayDetailedAnalysis();
}

// Display Detailed Analysis
function displayDetailedAnalysis() {
    let detailsHtml = '<h3>विस्तृत विश्लेषण:</h3>';
    
    questionsData.forEach((q, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === q.correct;
        const resultClass = isCorrect ? 'correct' : 'incorrect';
        
        detailsHtml += `
            <div class="result-question ${resultClass}">
                <h4>प्रश्न ${index + 1}: ${q.question}</h4>
                <p><strong>आपका उत्तर:</strong> ${userAnswer !== null ? q.options[userAnswer] : 'कोई उत्तर नहीं'} ${isCorrect ? '✅' : '❌'}</p>
                ${!isCorrect ? `<p><strong>सही उत्तर:</strong> ${q.options[q.correct]} ✅</p>` : ''}
                ${q.explanation ? `<div class="explanation">💡 ${q.explanation}</div>` : ''}
            </div>
        `;
    });
    
    const resultDetails = document.getElementById('result-details');
    if (resultDetails) {
        resultDetails.innerHTML = detailsHtml;
    }
}

// Retry Test
function retryTest() {
    const resultPage = document.getElementById('result-page');
    if (resultPage) {
        resultPage.classList.add('hidden');
    }
    
    showTestSelection(currentChapter, currentChapterNumber, currentSubject);
}

// Back to Chapters
function backToChapters() {
    const resultPage = document.getElementById('result-page');
    if (resultPage) {
        resultPage.classList.add('hidden');
    }
    
    // Show chapters container
    const chaptersContainer = document.querySelector('.chapters-container');
    if (chaptersContainer && chaptersContainer.parentElement) {
        chaptersContainer.parentElement.style.display = 'block';
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Download Notes
function downloadNotes(driveLink) {
    if (driveLink && driveLink !== '#') {
        window.open(driveLink, '_blank');
    } else {
        alert('📚 Notes का link जल्द ही उपलब्ध होगा।\n\nकृपया बाद में check करें।');
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('test-modal');
    if (event.target === modal) {
        closeModal();
    }
}

// Prevent going back during test
window.addEventListener('beforeunload', function (e) {
    if (timerInterval) {
        e.preventDefault();
        e.returnValue = '';
    }
});
