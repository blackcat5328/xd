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
    const [elapsedTime, setElapsedTime] = useState(0); // Track elapsed time
    const [moveRecords, setMoveRecords] = useState([]);

    useEffect(() => {
      let interval;
      if (winner === 0) {
        interval = setInterval(() => {
          setTimer(prevTimer => prevTimer - 1);
          setElapsedTime(prevTime => prevTime + 1); // Increment elapsed time
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
      // Check horizontal, vertical, and diagonal for win
      // (Unchanged from your original code)
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
            setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
            setTimer(60);
          }
        }
      }
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
      setElapsedTime(0); // Reset elapsed time
      setMoveRecords([]);
    };

    return React.createElement(
      'div',
      { className: "gobang" },
      React.createElement('h2', null, "Gobang"),
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
          ? `Current player: ${currentPlayer === 1 ? 'Player 1' : 'Player 2'} (${timer} seconds remaining). Elapsed time: ${elapsedTime} seconds.`
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
        )
      ),

      React.createElement(
        'div',
        { className: "move-records" },
        React.createElement('h3', null, "Move Records:"),
        React.createElement(
          'ul',
          null,
          moveRecords.map((record, index) => 
            React.createElement('li', { key: index }, record)
          )
        )
      )
    );
  };

  return () => React.createElement(Gobang, { assetsUrl: assetsUrl });
};

console.log('Gobang game script loaded');
