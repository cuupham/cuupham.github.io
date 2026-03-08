import { escapeHtml, getSkeletonHtml, updateActiveNavButton, copyToClipboard, renderNavButtons } from './utils.js';

let gamesData = null;

export async function loadGamesSection() {
  const nav = document.getElementById('game-nav');
  if (!nav) return;

  try {
    const res = await fetch(`${CONFIG.GAMES_PATH}/games.json`);
    if (!res.ok) {
      gamesData = [];
    } else {
      gamesData = JSON.parse(await res.text());
    }
    renderNavButtons('game-nav', gamesData, 'gameId', 'Chơi', loadGame);

    const urlGame = getUrlGame();
    const validGame = gamesData?.find((g) => g.id === urlGame);
    if (validGame) {
      loadGame(urlGame);
    } else {
      const content = document.getElementById('content');
      content.innerHTML = `<h2>👋 ${CONFIG.LABEL_GAMES}</h2><p>Chọn một game từ sidebar.</p>`;
    }
    document.title = `${CONFIG.SITE_NAME} - ${CONFIG.LABEL_GAMES}`;
  } catch (error) {
    console.error('Error loading games:', error);
    nav.innerHTML = '<p class="error-msg">Failed to load games</p>';
  }
}

export function loadGame(gameId) {
  const content = document.getElementById('content');
  updateActiveNavButton('game-nav', 'gameId', gameId);
  setUrlGame(gameId);

  if (gameId === 'caro') {
    renderGameCaro(content);
  } else if (gameId === 'rps') {
    renderGameRPS(content);
  } else {
    content.innerHTML = '<p class="error-msg">Game chưa có.</p>';
  }
}

function getUrlGame() {
  return new URLSearchParams(window.location.search).get('game');
}

function setUrlGame(gameId) {
  const url = new URL(window.location);
  url.searchParams.set('game', gameId);
  url.searchParams.delete('cat');
  window.history.pushState({}, '', url);
}

function renderGameCaro(container) {
  const N = CONFIG.CARO_SIZE;
  const WIN = CONFIG.CARO_WIN_LENGTH;
  let board = Array(N * N).fill('');
  let currentPlayer = 'X';
  let gameOver = false;

  const getGame = () => ({ board, currentPlayer, gameOver });
  const setGame = (next) => {
    board = next.board;
    currentPlayer = next.currentPlayer;
    gameOver = next.gameOver;
  };

  function checkWin(r, c, mark) {
    const at = (rr, cc) => (rr >= 0 && rr < N && cc >= 0 && cc < N ? board[rr * N + cc] : null);
    const dirs = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];
    for (const [dr, dc] of dirs) {
      let count = 1;
      for (let t = 1; t < WIN; t++) if (at(r + dr * t, c + dc * t) === mark) count++;
      for (let t = 1; t < WIN; t++) if (at(r - dr * t, c - dc * t) === mark) count++;
      if (count >= WIN) return true;
    }
    return false;
  }

  const statusEl = document.createElement('p');
  statusEl.className = 'game-status';
  statusEl.textContent = `Lượt: ${currentPlayer}`;

  const boardEl = document.createElement('div');
  boardEl.className = 'game-caro-board';
  boardEl.style.gridTemplateColumns = `repeat(${N}, 32px)`;

  for (let i = 0; i < N * N; i++) {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'game-caro-cell';
    cell.dataset.index = String(i);
    cell.addEventListener('click', () => {
      const { gameOver: over } = getGame();
      if (over || board[i]) return;
      const r = Math.floor(i / N);
      const c = i % N;
      board[i] = currentPlayer;
      cell.textContent = currentPlayer;
      cell.disabled = true;

      if (checkWin(r, c, currentPlayer)) {
        setGame({ board, currentPlayer, gameOver: true });
        statusEl.textContent = `Thắng: ${currentPlayer}`;
        boardEl.querySelectorAll('.game-caro-cell').forEach((b) => (b.disabled = true));
        return;
      }
      if (board.every(Boolean)) {
        setGame({ board, currentPlayer, gameOver: true });
        statusEl.textContent = 'Hòa!';
        return;
      }
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      setGame({ board, currentPlayer, gameOver: false });
      statusEl.textContent = `Lượt: ${currentPlayer}`;
    });
    boardEl.appendChild(cell);
  }

  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'game-rps-btn';
  resetBtn.style.fontSize = '14px';
  resetBtn.textContent = 'Chơi lại';
  resetBtn.addEventListener('click', () => loadGame('caro'));

  container.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'game-container';
  wrap.innerHTML = '<h2>⭕ Caro</h2>';
  wrap.appendChild(statusEl);
  wrap.appendChild(boardEl);
  wrap.appendChild(resetBtn);
  container.appendChild(wrap);
}

function renderGameRPS(container) {
  const choices = [
    { id: 'rock', label: 'Búa', icon: '✊' },
    { id: 'paper', label: 'Bao', icon: '✋' },
    { id: 'scissors', label: 'Kéo', icon: '✌️' },
  ];
  const resultText = { win: 'Bạn thắng!', lose: 'Bạn thua!', draw: 'Hòa!' };
  let score = { win: 0, lose: 0, draw: 0 };

  const resultEl = document.createElement('div');
  resultEl.className = 'game-rps-result';
  resultEl.textContent = 'Chọn Búa, Kéo hoặc Bao.';

  const scoreEl = document.createElement('p');
  scoreEl.className = 'game-rps-score';
  scoreEl.textContent = 'Thắng: 0 — Thua: 0 — Hòa: 0';

  function play(playerId) {
    const comp = choices[Math.floor(Math.random() * 3)];
    const player = choices.find((c) => c.id === playerId);
    let outcome = 'draw';
    if (player.id !== comp.id) {
      const win =
        (player.id === 'rock' && comp.id === 'scissors') ||
        (player.id === 'scissors' && comp.id === 'paper') ||
        (player.id === 'paper' && comp.id === 'rock');
      outcome = win ? 'win' : 'lose';
    }
    score[outcome]++;
    scoreEl.textContent = `Thắng: ${score.win} — Thua: ${score.lose} — Hòa: ${score.draw}`;
    resultEl.textContent = `Bạn: ${player.icon} ${player.label} — Máy: ${comp.icon} ${comp.label}. ${resultText[outcome]}`;
  }

  container.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'game-container';
  wrap.innerHTML = '<h2>✊ Oẳn tù tì</h2>';
  const choicesEl = document.createElement('div');
  choicesEl.className = 'game-rps-choices';
  choices.forEach((c) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'game-rps-btn';
    btn.textContent = `${c.icon} ${c.label}`;
    btn.title = c.label;
    btn.addEventListener('click', () => play(c.id));
    choicesEl.appendChild(btn);
  });
  wrap.appendChild(choicesEl);
  wrap.appendChild(resultEl);
  wrap.appendChild(scoreEl);
}
