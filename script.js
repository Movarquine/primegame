const startButton = document.getElementById('start');
const livesContainer = document.getElementById('lives');
const lives = document.getElementsByClassName('life');

const backgroundMusic = new Audio('background_music.mp3');
const correctSound = new Audio('correct_answer.mp3');
const incorrectSound = new Audio('incorrect_answer.mp3');
const levelUpSound = new Audio('level_up.mp3');
const numberContainer = document.querySelector('.number-container');

let livesRemaining = 3;
let timerInterval;

function gameOver() {
    clearInterval(timerInterval);
    resultElement.textContent = `Game Over! Level reached: ${level}`;
    yesButton.style.display = 'none';
    noButton.style.display = 'none';
    numberElement.style.display = 'none';
    numberContainer.style.display = 'none';

 // Save the score to localStorage
  const currentScore = level;
  const storedScores = JSON.parse(localStorage.getItem('leaderboard')) || [];
  storedScores.push({ score: currentScore, timestamp: new Date().toISOString() });
  storedScores.sort((a, b) => b.score - a.score || new Date(b.timestamp) - new Date(a.timestamp));
  localStorage.setItem('leaderboard', JSON.stringify(storedScores.slice(0, 10)));

  yesButton.disabled = true;
  noButton.disabled = true;
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
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
    resultElement.textContent = `Game Over! Level reached: ${level}`;
    gameOver();
    return true; // Indicate that the game is over
  }
  return false; // Indicate that the game is not over
}


function isPrime(num) {
    if (num <= 1) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
}

function generateNumber() {
  let min, max;
  if (level === 1) {
    min = 0;
    max = 10;
  } else {
    min = 10;
    max = 100;
    for (let i = 2; i < level; i++) {
      min = max + 1;
      max = 10 * max + 1;
    }
  }

  let newNumber;
  let primeGenerated = false;

  do {
    newNumber = Math.floor(Math.random() * (max - min + 1)) + min; // generate a new random number
    primeGenerated = isPrime(newNumber);

    // If we're at level 5 or higher, generate a prime number with higher probability
    if (level >= 3) {
      if (Math.random() < 1 && !primeGenerated) {
        continue;
      }
    } else {
      // Before level 5, generate a prime number with a 50% probability
      if (Math.random() < 0.5 && !primeGenerated) {
        continue;
      }
    }
  } while (usedNumbers.has(newNumber)); // repeat until a unique number is generated

  usedNumbers.add(newNumber); // add the new number to the Set of used numbers
  return newNumber;
}


function nextQuestion() {
    numberElement.textContent = generateNumber();
}

function checkAnswer(answer) {
  const number = parseInt(numberElement.textContent);
  const isCorrect = (isPrime(number) && answer) || (!isPrime(number) && !answer);

  if (isCorrect) {
    correctAnswers++;
    correctSound.play();
    if (correctAnswers === 3) {
      level++;
      correctAnswers = 0;
      resultElement.textContent = `Level ${level}!`;
      levelUpSound.play();
    } else {
      resultElement.textContent = 'Correct!';
    }
    nextQuestion();
  } else {
    const isGameOver = loseLife();
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

        if (timeRemaining <= 0) {
            gameOver();
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

