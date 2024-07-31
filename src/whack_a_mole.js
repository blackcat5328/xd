window.initGame = (React, assetsUrl) => {
  const { useState, useEffect } = React;

  const checkWin = (board, currentPlayer) => {
    // Implement the win condition check here
    // (same as the previous code snippet)
    // ...
  };

  const Gobang = ({ assetsUrl }) => {
    const [board, setBoard] = useState(Array(15).fill().map(() => Array(15).fill(0)));
    const [currentPlayer, setCurrentPlayer] = useState(1);
    const [winner, setWinner] = useState(null);

    const handleClick = (row, col) => {
      if (board[row][col] === 0 && !winner) {
        const newBoard = [...board];
        newBoard[row][col] = currentPlayer;
        setBoard(newBoard);

        if (checkWin(newBoard, currentPlayer)) {
          setWinner(currentPlayer);
          console.log(`Player ${currentPlayer} has won!`);
        } else {
          setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
        }
      }
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
        winner ? `Player ${winner} has won!` : `Current player: ${currentPlayer === 1 ? 'Player 1' : 'Player 2'}`
      )
    );
  };

  return () => React.createElement(Gobang, { assetsUrl: assetsUrl });
};

console.log('Gobang game script loaded');
