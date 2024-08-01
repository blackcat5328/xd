window.initGame = (React, assetsUrl) => {
  const { useState, useEffect } = React;

  const Gobang = ({ assetsUrl }) => {
    const [board, setBoard] = useState(() => {
      const initialBoard = Array(15).fill().map(() => Array(15).fill(0));
      initialBoard[7][7] = 1;
      initialBoard[7][8] = 2;
      initialBoard[8][7] = 2;
      initialBoard[8][8] = 1;
      return initialBoard;
    });
    const [history, setHistory] = useState([board.map(row => row.slice())]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentPlayer, setCurrentPlayer] = useState(1);
    const [winner, setWinner] = useState(0);
    const [timer, setTimer] = useState(60);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [moveRecords, setMoveRecords] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [aiMode, setAiMode] = useState(0); // 0: Off, 1: On
    const [aiPlayer, setAiPlayer] = useState(1); // AI player (Black or White)

    useEffect(() => {
      let interval;
      if (winner === 0) {
        interval = setInterval(() => {
          setTimer(prevTimer => prevTimer - 1);
          setElapsedTime(prevTime => prevTime + 1);
        }, 1000);
      } else {
        clearInterval(interval);
      }
      return () => clearInterval(interval);
    }, [winner]);

    useEffect(() => {
      if (timer === 0) {
        setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
        setTimer(60);
      }
    }, [timer, currentPlayer]);

    const checkWin = (row, col, player) => {
      let count = 0;
      for (let i = 0; i < 15; i++) {
        if (board[row][i] === player) {
          count++;
          if (count === 4) return true;
        } else {
          count = 0;
        }
      }

      count = 0;
      for (let i = 0; i < 15; i++) {
        if (board[i][col] === player) {
          count++;
          if (count === 4) return true;
        } else {
          count = 0;
        }
      }

      count = 0;
      let r = row, c = col;
      while (r >= 0 && c >= 0) {
        if (board[r][c] === player) {
          count++;
          if (count === 4) return true;
        } else {
          count = 0;
        }
        r--;
        c--;
      }
      r = row + 1, c = col + 1;
      while (r < 15 && c < 15) {
        if (board[r][c] === player) {
          count++;
          if (count === 4) return true;
        } else {
          count = 0;
        }
        r++;
        c++;
      }

      count = 0;
      r = row, c = col;
      while (r < 15 && c >= 0) {
        if (board[r][c] === player) {
          count++;
          if (count === 4) return true;
        } else {
          count = 0;
        }
        r++;
        c--;
      }
      r = row - 1, c = col + 1;
      while (r >= 0 && c < 15) {
        if (board[r][c] === player) {
          count++;
          if (count === 4) return true;
        } else {
          count = 0;
        }
        r--;
        c++;
      }

      return false;
    };

    const handleClick = (row, col) => {
      if (board[row][col] === 0 && winner === 0) {
        if (
          (row > 0 && board[row - 1][col] !== 0) ||
          (row < 14 && board[row + 1][col] !== 0) ||
          (col > 0 && board[row][col - 1] !== 0) ||
          (col < 14 && board[row][col + 1] !== 0)
        ) {
          const newBoard = board.map(row => row.slice());
          newBoard[row][col] = currentPlayer;
          setBoard(newBoard);

          setHistory([...history.slice(0, currentIndex + 1), newBoard]);
          setCurrentIndex(currentIndex + 1);

          setMoveRecords([...moveRecords, `Player ${currentPlayer}: (${row}, ${col})`]);

          if (checkWin(row, col, currentPlayer)) {
            setWinner(currentPlayer);
          } else {
            // Handle AI turn if AI mode is enabled
            if (aiMode === 1 && currentPlayer === aiPlayer) {
              const bestMove = findBestMove();
              const [aiRow, aiCol] = bestMove;
              handleClick(aiRow, aiCol); // Make the AI's move
            } else {
              setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
              setTimer(60);
            }
          }
        }
      }
    };

    const findBestMove = () => {
      let bestMove = [-1, -1]; // Default move
      let bestScore = -Infinity;

      for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 15; col++) {
          if (board[row][col] === 0) {
            // Make the move
            const newBoard = board.map(r => r.slice());
            newBoard[row][col] = aiPlayer;

            // Recursively evaluate the move
            const score = minimax(newBoard, aiPlayer === 1 ? 2 : 1, 0, -Infinity, Infinity);

            // Choose the move with the highest score
            if (score > bestScore) {
              bestScore = score;
              bestMove = [row, col];
            }
          }
        }
      }

      return bestMove;
    };

    const minimax = (board, player, depth, alpha, beta) => {
      if (checkWin(board, player)) {
        return player === aiPlayer ? Infinity : -Infinity;
      } else if (depth === 5) { // Adjust depth for performance
        return evaluateBoard(board);
      }

      let bestScore = player === aiPlayer ? -Infinity : Infinity;
      for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 15; col++) {
          if (board[row][col] === 0) {
            const newBoard = board.map(r => r.slice());
            newBoard[row][col] = player;

            const score = minimax(newBoard, player === 1 ? 2 : 1, depth + 1, alpha, beta);

            if (player === aiPlayer) {
              bestScore = Math.max(bestScore, score);
              alpha = Math.max(alpha, bestScore);
            } else {
              bestScore = Math.min(bestScore, score);
              beta = Math.min(beta, bestScore);
            }

            if (beta <= alpha) {
              return bestScore; // Alpha-beta pruning
            }
          }
        }
      }

      return bestScore;
    };

    const evaluateBoard = (board) => {
      // Simple evaluation function:
      let score = 0;
      for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 15; col++) {
          if (board[row][col] === aiPlayer) {
            score += 1; // Basic score for each AI piece
            if (row === 7 && col === 7) {
              score += 2; // Bonus for center piece
            }
          } else if (board[row][col] !== 0) {
            score -= 1; // Penalty for opponent's piece
          }
        }
      }
      return score;
    };

    const handleUndo = () => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
        setBoard(history[currentIndex - 1]);
        setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
        setTimer(60);
        setMoveRecords(moveRecords.slice(0, -1));
      }
    };

    const handleRedo = () => {
      if (currentIndex < history.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setBoard(history[currentIndex + 1]);
        setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
        setTimer(60);
      }
    };

    const handleReset = () => {
      const newBoard = Array(15).fill().map(() => Array(15).fill(0));
      newBoard[7][7] = 1;
      newBoard[7][8] = 2;
      newBoard[8][7] = 2;
      newBoard[8][8] = 1;
      setBoard(newBoard);
      setHistory([newBoard]);
      setCurrentIndex(0);
      setCurrentPlayer(1);
      setWinner(0);
      setTimer(60);
      setElapsedTime(0);
      setMoveRecords([]);
    };

    const toggleHistory = () => {
      setShowHistory(prev => !prev);
    };

    const handleAiSwitch = () => {
      setAiMode(prevAiMode => (prevAiMode + 1) % 2); // Toggle AI mode
      if (aiMode === 1) {
        setAiPlayer(currentPlayer); // Set AI player to current player
      }
    };

    return React.createElement(
      'div',
      { className: "gobang" },
      React.createElement('h2', null, "Gobang"),
      React.createElement(
        'p',
        null,
        `Elapsed time: ${elapsedTime} seconds.`
      ),
      React.createElement(
        'div',
        { className: "game-board" },
        board.map((row, rowIndex) =>
          React.createElement(
            'div',
            { className: "row", key: rowIndex },
            row.map((cell, colIndex) =>
              React.createElement(
                'div',
                {
                  key: `${rowIndex}-${colIndex}`,
                  className: `cell ${cell === 1 ? 'player1' : cell === 2 ? 'player2' : ''}`,
                  style: {
                    backgroundImage: cell === 1
                      ? `url(${assetsUrl}/player1.png)`
                      : cell === 2
                        ? `url(${assetsUrl}/player2.png)`
                        : 'none'
                  },
                  onClick: () => handleClick(rowIndex, colIndex)
                }
              )
            )
          )
        )
      ),
      React.createElement(
        'p',
        null,
        winner === 0
          ? `Current player: ${currentPlayer === 1 ? 'Player 1 BLACK' : 'Player 2 WHITE'} (${timer} seconds remaining).`
          : `Player ${winner} wins!`
      ),
      React.createElement(
        'div',
        { className: "controls" },
        React.createElement(
          'button',
          { onClick: handleUndo },
          'Undo'
        ),
        React.createElement(
          'button',
          { onClick: handleRedo },
          'Redo'
        ),
        React.createElement(
          'button',
          { onClick: handleReset },
          'Reset'
        ),
        React.createElement(
          'button',
          { onClick: toggleHistory },
          showHistory ? 'Hide Steps' : 'Show All Steps'
        ),
        React.createElement(
          'button',
          { onClick: handleAiSwitch },
          `AI Mode: ${aiMode === 0 ? 'Off' : `On (Player ${aiPlayer})`}`
        )
      ),
      showHistory && React.createElement(
        'div',
        { className: "move-history" },
        React.createElement('h3', null, "Move History:"),
        React.createElement(
          'ul',
          null,
          moveRecords.map((record, index) => 
            React.createElement('li', { key: index }, record)
          )
        )
      ),
      React.createElement(
        'div',
        { className: "move-records" },
        React.createElement('h3', null, "Recent Moves:"),
        React.createElement(
          'ul',
          null,
          // Pad with empty spaces if fewer than 5 moves
          [...moveRecords.slice(-5), ...(moveRecords.length < 5 ? Array(5 - moveRecords.length).fill('') : [])]
            .map((record, index) =>
              React.createElement('li', { key: index }, record)
            )
        )
      )
    );
  };

  return () => React.createElement(Gobang, { assetsUrl: assetsUrl });
};

console.log('Gobang game script loaded');
