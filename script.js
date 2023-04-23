const startButton = document.getElementById('start');
const livesContainer = document.getElementById('lives');
const lives = document.getElementsByClassName('life');
const secondsText = document.getElementById('seconds-text');

const aboutButton = document.getElementById('about-button');
const aboutContent = document.getElementById('about-content');

aboutButton.addEventListener('click', (event) => {
  event.stopPropagation();
  aboutContent.classList.toggle('active');
});

aboutContent.addEventListener('click', (event) => {
  event.stopPropagation();
});

document.addEventListener('click', (event) => {
  if (aboutContent.classList.contains('active')) {
    aboutContent.classList.remove('active');
  }
});


const backgroundMusic = new Audio('background_music.mp3');
const correctSound = new Audio('correct_answer.mp3');
const incorrectSound = new Audio('incorrect_answer.mp3');
const levelUpSound = new Audio('level_up.mp3');
const numberContainer = document.querySelector('.number-container');
const warningBackgroundMusic = new Audio('warning_background_music.mp3');

let livesRemaining = 3;
let timerInterval;

function gameOver() {
    clearInterval(timerInterval);
    resultElement.innerHTML = `Game Over!<br>Level reached: ${level}`;
    resultElement.classList.add('result-extra-margin');
    resultElement.classList.remove('result-initial-margin');
    yesButton.style.display = 'none';
    noButton.style.display = 'none';
    numberElement.style.display = 'none';
    numberContainer.style.display = 'none';

    // Scores to cache.
    const currentScore = level;
    const storedScores = JSON.parse(localStorage.getItem('leaderboard')) || [];
    storedScores.push({ score: currentScore, timestamp: new Date().toISOString() });
    storedScores.sort((a, b) => b.score - a.score || new Date(b.timestamp) - new Date(a.timestamp));
    localStorage.setItem('leaderboard', JSON.stringify(storedScores.slice(0, 10)));

    yesButton.disabled = true;
    noButton.disabled = true;
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    warningBackgroundMusic.pause();
    warningBackgroundMusic.currentTime = 0;
    startButton.style.display = 'inline';
    startButton.textContent = 'Again?';
    leaderboard.style.display = 'block';
}

const timerElement = document.getElementById('timer');
const numberElement = document.getElementById('number');
const yesButton = document.getElementById('yes');
const noButton = document.getElementById('no');
const resultElement = document.getElementById('result');
const usedNumbers = new Set();

let timeRemaining = 60;
let level = 1;
let correctAnswers = 0;

function loseLife() {
    livesRemaining--;
    lives[livesRemaining].style.display = 'none';
    if (livesRemaining <= 0) {
        gameOver();
        return true;
    }
    return false;
}


function isPrime(num) {
    if (num <= 1) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
}

let min = 0;
let max = 10;

function generateNumber() {
    if (level === 1) {
        min = 0;
        max = 10;
    } else {
        min = 10 + min;
        max = 20 + max;
    }

    let newNumber;
    let attempts = 0;
    const maxAttempts = (max - min + 1) / 2; // Half of the numbers in the range should be odd

    do {
        newNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        attempts++;
    } while ((usedNumbers.has(newNumber) || newNumber % 2 === 0) && attempts < maxAttempts);

    if (attempts === maxAttempts) {
        return -1; // Indicates that there are no more odd numbers available in the current range
    }

    usedNumbers.add(newNumber);
    return newNumber;
}

function nextQuestion() {
    const generatedNumber = generateNumber();
    if (generatedNumber === -1) {
        level++;
        resultElement.innerHTML = `Level ${level}<br>+10 seconds!`;
        levelUpSound.currentTime = 0;
        levelUpSound.play();
        nextQuestion();
    } else {
        numberElement.textContent = generatedNumber;
    }
}

function checkAnswer(answer) {
  const number = parseInt(numberElement.textContent);
  const isCorrect = (isPrime(number) && answer) || (!isPrime(number) && !answer);

  if (isCorrect) {
    correctAnswers++;
    correctSound.currentTime = 0;
    correctSound.play();
    if (correctAnswers === 3) {
    level++;
    timeRemaining += 10; // Add 10 seconds to the timer
    if (timeRemaining > 20) {
      timerElement.style.color = 'black';
      secondsText.style.color = 'black';
      warningBackgroundMusic.pause();
      warningBackgroundMusic.currentTime = 0;

    }
    correctAnswers = 0;
    resultElement.innerHTML = `Level ${level}<br>+10 seconds!`;
    levelUpSound.currentTime = 0;
    levelUpSound.play();
  } else {
    resultElement.textContent = 'Correct!';
  }

    nextQuestion();

  } else {
    const isGameOver = loseLife();
    incorrectSound.currentTime = 0;
    incorrectSound.play();
    if (!isGameOver) {
      resultElement.textContent = 'Incorrect!';
    }
    nextQuestion();
  }
}

function displayLeaderboard() {
  const leaderboardElement = document.getElementById('leaderboard');
  const storedScores = JSON.parse(localStorage.getItem('leaderboard')) || [];

  let leaderboardHTML = '<h2>Personal Records</h2><ul>';
  for (const scoreEntry of storedScores) {
    leaderboardHTML += `<li>Level ${scoreEntry.score} - ${new Date(scoreEntry.timestamp).toLocaleString()}</li>`;
  }
  leaderboardHTML += '</ul>';

  leaderboardElement.innerHTML = leaderboardHTML;
}


function startGame() {
    startButton.style.display = 'none';
    leaderboard.style.display = 'none';
    document.querySelector('#game').classList.add('game-active');
    document.querySelector('#game-title').style.display = 'none';
    yesButton.style.display = 'inline';
    noButton.style.display = 'inline';
    numberElement.style.display = 'inline';
    numberContainer.style.display = 'block';
    document.querySelector('.number-container').style.display = 'flex';
    resultElement.classList.add('result-initial-margin');
    resultElement.classList.remove('result-extra-margin');
    timerElement.style.color = 'black';
    secondsText.style.color = 'black';

    timeRemaining = 60;
    livesRemaining = 3;
    level = 1;
    correctAnswers = 0;

    timerElement.textContent = timeRemaining;
    for (let i = 0; i < lives.length; i++) {
        lives[i].style.display = 'inline';
    }

    resultElement.textContent = '';
    yesButton.disabled = false;
    noButton.disabled = false;

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
    timeRemaining--;
    timerElement.textContent = timeRemaining;

    if (timeRemaining === 20) {
        warningBackgroundMusic.play();
        timerElement.style.color = '#8a1e24';
        document.getElementById('seconds-text').style.color = '#8a1e24';
    }

    if (timeRemaining <= 0) {
        gameOver();
        // Stop the warning background music
        warningBackgroundMusic.pause();
        warningBackgroundMusic.currentTime = 0;
    }
}, 1000);

    backgroundMusic.loop = true;
    backgroundMusic.play();

    nextQuestion();
}

startButton.addEventListener('click', startGame);

// Disable the yes and no buttons initially
yesButton.disabled = true;
noButton.disabled = true;

yesButton.style.display = 'none';
noButton.style.display = 'none';

yesButton.addEventListener('click', () => checkAnswer(true));
noButton.addEventListener('click', () => checkAnswer(false));

document.querySelector('.number-container').style.display = 'none';

displayLeaderboard();