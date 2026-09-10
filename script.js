(() => {
  const DIGIT_COUNT = 4;

  const state = {
    secret: [],
    attempts: 0,
    finished: false,
  };

  const digitInputs = Array.from(document.querySelectorAll('.digit-box'));
  const guessForm = document.getElementById('guess-form');
  const errorMessage = document.getElementById('error-message');
  const attemptCountEl = document.getElementById('attempt-count');
  const gameStateEl = document.getElementById('game-state');
  const historyBody = document.getElementById('history-body');
  const newGameBtn = document.getElementById('new-game-btn');
  const submitBtn = document.getElementById('submit-btn');
  const winModal = document.getElementById('win-modal');
  const winMessage = document.getElementById('win-message');
  const playAgainBtn = document.getElementById('play-again-btn');

  function generateSecret() {
    const pool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const secret = [];
    for (let i = 0; i < DIGIT_COUNT; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      secret.push(pool[idx]);
      pool.splice(idx, 1);
    }
    return secret;
  }

  function judge(guess, secret) {
    let hit = 0;
    let blow = 0;
    for (let i = 0; i < DIGIT_COUNT; i++) {
      if (guess[i] === secret[i]) {
        hit++;
      } else if (secret.includes(guess[i])) {
        blow++;
      }
    }
    return { hit, blow };
  }

  function resetGame() {
    state.secret = generateSecret();
    state.attempts = 0;
    state.finished = false;
    attemptCountEl.textContent = '0';
    gameStateEl.textContent = '挑戦中';
    historyBody.innerHTML = '';
    errorMessage.textContent = '';
    setEmptyHistory();
    digitInputs.forEach((input) => {
      input.value = '';
      input.disabled = false;
    });
    submitBtn.disabled = false;
    winModal.classList.remove('visible');
    digitInputs[0].focus();
  }

  function setEmptyHistory() {
    historyBody.innerHTML = '<tr><td colspan="4" class="empty-history">まだ回答がありません</td></tr>';
  }

  function clearEmptyHistoryIfNeeded() {
    const emptyRow = historyBody.querySelector('.empty-history');
    if (emptyRow) {
      historyBody.innerHTML = '';
    }
  }

  function addHistoryRow(attemptNumber, guess, hit, blow) {
    clearEmptyHistoryIfNeeded();
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${attemptNumber}</td>
      <td><span class="guess-digits">${guess.join(' ')}</span></td>
      <td class="hit-badge">${hit}</td>
      <td class="blow-badge">${blow}</td>
    `;
    historyBody.prepend(row);
  }

  function getGuessFromInputs() {
    return digitInputs.map((input) => input.value.trim());
  }

  function showError(message) {
    errorMessage.textContent = message;
    digitInputs.forEach((input) => {
      input.classList.remove('shake');
      void input.offsetWidth;
      input.classList.add('shake');
    });
  }

  function validateGuess(rawValues) {
    if (rawValues.some((v) => v === '')) {
      return 'すべての桁を入力してください';
    }
    if (rawValues.some((v) => !/^[0-9]$/.test(v))) {
      return '0〜9の数字を入力してください';
    }
    const digits = rawValues.map(Number);
    const uniqueCount = new Set(digits).size;
    if (uniqueCount !== DIGIT_COUNT) {
      return '同じ数字は使えません(重複なしの4桁)';
    }
    return null;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (state.finished) return;

    const rawValues = getGuessFromInputs();
    const validationError = validateGuess(rawValues);
    if (validationError) {
      showError(validationError);
      return;
    }
    errorMessage.textContent = '';

    const guess = rawValues.map(Number);
    const { hit, blow } = judge(guess, state.secret);
    state.attempts += 1;
    attemptCountEl.textContent = String(state.attempts);
    addHistoryRow(state.attempts, guess, hit, blow);

    if (hit === DIGIT_COUNT) {
      state.finished = true;
      gameStateEl.textContent = 'クリア!';
      winMessage.textContent = `正解は ${state.secret.join('')} でした。${state.attempts}回で当てました!`;
      submitBtn.disabled = true;
      digitInputs.forEach((input) => (input.disabled = true));
      winModal.classList.add('visible');
    } else {
      digitInputs.forEach((input) => (input.value = ''));
      digitInputs[0].focus();
    }
  }

  function setupDigitInputBehavior() {
    digitInputs.forEach((input, index) => {
      input.addEventListener('input', () => {
        input.value = input.value.replace(/[^0-9]/g, '').slice(0, 1);
        if (input.value && index < digitInputs.length - 1) {
          digitInputs[index + 1].focus();
        }
      });

      input.addEventListener('keydown', (event) => {
        if (event.key === 'Backspace' && !input.value && index > 0) {
          digitInputs[index - 1].focus();
        }
      });

      input.addEventListener('paste', (event) => {
        const pasted = (event.clipboardData || window.clipboardData).getData('text');
        const digitsOnly = pasted.replace(/[^0-9]/g, '').slice(0, DIGIT_COUNT);
        if (digitsOnly.length > 0) {
          event.preventDefault();
          digitsOnly.split('').forEach((digit, i) => {
            if (digitInputs[i]) digitInputs[i].value = digit;
          });
          const nextIndex = Math.min(digitsOnly.length, DIGIT_COUNT - 1);
          digitInputs[nextIndex].focus();
        }
      });
    });
  }

  guessForm.addEventListener('submit', handleSubmit);
  newGameBtn.addEventListener('click', resetGame);
  playAgainBtn.addEventListener('click', resetGame);
  setupDigitInputBehavior();

  resetGame();
})();
