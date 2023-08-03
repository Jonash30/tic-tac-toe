const Gameboard = (() => {
  let gameboard = ["","","","","","","","",""]

  const renderBoard = () => {
    const gameboardContainer = document.querySelector('.gameboard');
    gameboardContainer.innerHTML = '';

    gameboard.forEach((board, index) => {
      const boardHtml = `<div class="board ${board ? (checkForWinningCombination(index) ? 'winning' : '') : ''}" id="board-${index}">${board}</div>`;
      gameboardContainer.innerHTML += boardHtml;
    });

    const boards = document.querySelectorAll('.board');
    boards.forEach((board) => {
      board.addEventListener('click', Game.handleClick);
    });
  };

  const update = (index, value) => {
      gameboard[index] = value;
      renderBoard();
  }

  const checkForWinningCombination = (index) => {
    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    return winningCombinations.some((combination) => combination.includes(index) && combination.every((i) => gameboard[i] === gameboard[index]));
  };

  const getGameboard = () => gameboard;

  return {renderBoard, update, getGameboard}
})();



const createPlayer = (name, mark) => {
  return {name, mark}
}



const Game = (() => {
  let players = [];
  let currentPlayerIndex;
  let roundWinnerIndex;
  let gameOver;
  let player1Wins = 0;
  let player2Wins = 0;

  const updatePlayerTurnLabel = () => {
    const playerTurnLabel = document.getElementById('player-turn-label');
    const currentTurnPlayer = players[currentPlayerIndex];

    if (currentTurnPlayer && currentTurnPlayer.name) {
      playerTurnLabel.textContent = currentTurnPlayer.name;
    } else {
      const placeholder = currentPlayerIndex === 0 ? "Player 1" : "Player 2";
      playerTurnLabel.textContent = placeholder;
    }
  }

  const start = () => {
    players = [
      createPlayer(document.querySelector("#player1").value || document.querySelector('#player1').placeholder, "X"),
      createPlayer(document.querySelector("#player2").value || document.querySelector('#player2').placeholder, "O"),
    ];

    currentPlayerIndex = 0;
    gameOver = false;
    roundWinnerIndex = -1;

    const player1Name = players[0].name || "Player 1";
    const player2Name = players[1].name || "Player 2";
    const player1NameSpan = document.querySelector('.player1-score-text');
    const player2NameSpan = document.querySelector('.player2-score-text');

    player1NameSpan.textContent = `${player1Name} Score:`;
    player2NameSpan.textContent = `${player2Name} Score:`;

    updatePlayerTurnLabel();
    Gameboard.renderBoard();

    const boards = document.querySelectorAll('.board');
    boards.forEach((board) => {
      board.addEventListener('click', handleClick);
    });
  };

  const restart = () => {
    for (let i = 0; i < 9; i++) {
      Gameboard.update(i, "");
    }
    currentPlayerIndex = roundWinnerIndex === -1 ? 0 : roundWinnerIndex;
    roundWinnerIndex = -1;
    Gameboard.renderBoard();
    gameOver = false;

  };

  const handleClick = (event) => {
    if (gameOver) return;
  
    let index = parseInt(event.target.id.split("-")[1]);
    if (Gameboard.getGameboard()[index] !== "") {
      return;
    }
  
    Gameboard.update(index, players[currentPlayerIndex].mark);
  
    if (checkForWin(Gameboard.getGameboard())) {
      gameOver = true;
      const winningPlayer = players[currentPlayerIndex];
      updatePlayerScore(winningPlayer);
      if (gameOver) return;
    } else if (checkForTie(Gameboard.getGameboard())) {
      gameOver = true;
      roundWinnerIndex = -1;
      setTimeout(Game.restart, 1000);
      return;
    }
    if (roundWinnerIndex !== -1) {
      currentPlayerIndex = roundWinnerIndex;
      roundWinnerIndex = -1
    } else {
      currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    }

    updatePlayerTurnLabel();
  };

  const winnerModal = (player) => {
    const modalPlayerWin = document.querySelector('.modal-player-win');
    modalPlayerWin.textContent = `${player.name} Wins !`
    document.body.classList.add('active-modal');
  }
  
  const updatePlayerScore = (player) => {
    const playerScoreSpan = document.getElementById(
      player.mark === "X" ? "player1-score" : "player2-score"
    );

    const playerWins = player.mark === "X" ? ++player1Wins : ++player2Wins;
    playerScoreSpan.textContent = player.mark === "X" ? player1Wins : player2Wins;

    if (playerWins === 5) {
      gameOver = true;
      setTimeout(() => {
        winnerModal(player);
      }, 1000)
      
      player1Wins = 0;
      player2Wins = 0;
    }

    roundWinnerIndex = players.indexOf(player);
    setTimeout(Game.restart, 1000)
  };

  return { start, handleClick, restart, winnerModal };
})();


function checkForWin(board){
  const winningCombinations = [
      [0,1,2],
      [3,4,5],
      [6,7,8],
      [0,3,6],
      [1,4,7],
      [2,5,8],
      [0,4,8],
      [2,4,6]
  ]

  for (let i = 0; i < winningCombinations.length; i++){
      const [a,b,c] = winningCombinations[i];
      if(board[a] && board[a] === board[b] && board[a] === board[c]){
          return true;
      }
  }

  return false;
}

function checkForTie(board){
  return board.every(cell => cell !== "");
}


const eventListeners = (() => {
  const gameStart = document.querySelector('.game-start');
  const gameMenu = document.querySelector('.game-menu');
  const gameSection = document.querySelector('.game-section');

   
  document.getElementById("playGame").addEventListener('click', () => {
    setTimeout(() => {
      gameMenu.classList.add('page-display1');
      gameStart.style.display = 'none';
    }, 500)
    
  })
  
  document.querySelector('.start-btn').addEventListener('click', () => {
    setTimeout(() => {
      gameSection.classList.add('page-display2');
      gameMenu.classList.remove('page-display1');
      Game.start();
    }, 500)
  })
  
  document.querySelector('.quit-btn').addEventListener('click',  () =>{
      document.body.classList.remove('active-modal');
      setTimeout(() => {
        gameSection.classList.remove('page-display2');
        gameMenu.classList.add('page-display1');
        Game.restart();
        document.querySelector(".player1-score").textContent = "0";
        document.querySelector(".player2-score").textContent = "0";
      }, 700)
  })
  
  document.querySelector('.restart-btn').addEventListener('click', () => {
      document.body.classList.remove('active-modal');
      Game.restart();
      document.querySelector(".player1-score").textContent = "0";
      document.querySelector(".player2-score").textContent = "0";
  })
  
})();
