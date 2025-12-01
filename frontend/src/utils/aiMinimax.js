/**
 * AI Minimax cho trò chơi Caro (Gomoku)
 * Tìm nước đi tốt nhất cho máy
 */

// Điểm số cho các pattern
const SCORES = {
  FIVE: 10000,           // 5 hàng liên tiếp
  FOUR_OPEN: 4000,       // 4 hàng mở (hai đầu không bị chặn)
  FOUR_CLOSED: 400,      // 4 hàng (một đầu bị chặn)
  THREE_OPEN: 200,       // 3 hàng mở
  THREE_CLOSED: 50,      // 3 hàng (một đầu bị chặn)
  TWO_OPEN: 10,          // 2 hàng mở
  TWO_CLOSED: 5,         // 2 hàng (một đầu bị chặn)
  ONE: 1,                // 1 quân
  BLOCK_FIVE: 3000,      // Chặn 5 hàng của đối thủ
  BLOCK_FOUR: 200,       // Chặn 4 hàng của đối thủ
};

/**
 * Đánh giá giá trị của một vị trí trên bàn cờ
 * @param {Array} board - Bàn cờ 20x20
 * @param {number} row - Hàng
 * @param {number} col - Cột
 * @param {string} player - Người chơi ('X' hoặc 'O')
 * @returns {number} Điểm số
 */
export function evaluatePosition(board, row, col, player) {
  const size = board.length;
  let score = 0;
  const opponent = player === 'X' ? 'O' : 'X';

  const directions = [
    [0, 1],  // Ngang
    [1, 0],  // Dọc
    [1, 1],  // Chéo /
    [1, -1], // Chéo \
  ];

  for (const [dx, dy] of directions) {
    // Đếm hàng của người chơi
    let playerCount = 1;
    let playerOpenEnds = 0;
    let r = row + dx, c = col + dy;
    while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === player) {
      playerCount++;
      r += dx;
      c += dy;
    }
    if (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === null) {
      playerOpenEnds++;
    }

    r = row - dx;
    c = col - dy;
    while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === player) {
      playerCount++;
      r -= dx;
      c -= dy;
    }
    if (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === null) {
      playerOpenEnds++;
    }

    // Tính điểm cho người chơi
    if (playerCount >= 5) {
      score += SCORES.FIVE;
    } else if (playerCount === 4) {
      score += playerOpenEnds === 2 ? SCORES.FOUR_OPEN : SCORES.FOUR_CLOSED;
    } else if (playerCount === 3) {
      score += playerOpenEnds === 2 ? SCORES.THREE_OPEN : SCORES.THREE_CLOSED;
    } else if (playerCount === 2) {
      score += playerOpenEnds === 2 ? SCORES.TWO_OPEN : SCORES.TWO_CLOSED;
    } else if (playerCount === 1) {
      score += SCORES.ONE;
    }

    // Đếm hàng của đối thủ (để chặn)
    let opponentCount = 1;
    let opponentOpenEnds = 0;
    r = row + dx;
    c = col + dy;
    while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === opponent) {
      opponentCount++;
      r += dx;
      c += dy;
    }
    if (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === null) {
      opponentOpenEnds++;
    }

    r = row - dx;
    c = col - dy;
    while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === opponent) {
      opponentCount++;
      r -= dx;
      c -= dy;
    }
    if (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === null) {
      opponentOpenEnds++;
    }

    // Tính điểm cho chặn đối thủ
    if (opponentCount >= 5) {
      score += SCORES.BLOCK_FIVE;
    } else if (opponentCount === 4 && opponentOpenEnds === 2) {
      score += SCORES.BLOCK_FOUR;
    }
  }

  return score;
}

/**
 * Minimax algorithm với alpha-beta pruning
 * @param {Array} board - Bàn cờ
 * @param {number} depth - Độ sâu tìm kiếm
 * @param {boolean} isMaximizing - True nếu đang maximize (máy), False nếu minimize (người)
 * @param {number} alpha - Alpha value cho pruning
 * @param {number} beta - Beta value cho pruning
 * @param {string} aiPlayer - Người chơi AI ('X' hoặc 'O')
 * @returns {number} Giá trị tốt nhất
 */
function minimax(board, depth, isMaximizing, alpha, beta, aiPlayer, humanPlayer) {
  // Kiểm tra thắng/thua
  const winner = checkWinnerInBoard(board);
  if (winner === aiPlayer) return 10000 - depth;
  if (winner === humanPlayer) return depth - 10000;
  if (isGameOver(board)) return 0;

  // Giới hạn độ sâu để không quá chậm
  if (depth === 0) {
    return evaluateBoard(board, aiPlayer, humanPlayer);
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    const moves = getGoodMoves(board, 4); // Chỉ xét 16 nước đi tốt nhất
    for (const [row, col] of moves) {
      if (board[row][col] === null) {
        board[row][col] = aiPlayer;
        const val = minimax(board, depth - 1, false, alpha, beta, aiPlayer, humanPlayer);
        board[row][col] = null;
        maxEval = Math.max(maxEval, val);
        alpha = Math.max(alpha, val);
        if (beta <= alpha) break; // Beta cutoff
      }
    }
    return maxEval === -Infinity ? 0 : maxEval;
  } else {
    let minEval = Infinity;
    const moves = getGoodMoves(board, 4);
    for (const [row, col] of moves) {
      if (board[row][col] === null) {
        board[row][col] = humanPlayer;
        const val = minimax(board, depth - 1, true, alpha, beta, aiPlayer, humanPlayer);
        board[row][col] = null;
        minEval = Math.min(minEval, val);
        beta = Math.min(beta, val);
        if (beta <= alpha) break; // Alpha cutoff
      }
    }
    return minEval === Infinity ? 0 : minEval;
  }
}

/**
 * Lấy danh sách nước đi tốt nhất (dựa vào điểm số)
 */
function getGoodMoves(board, count) {
  const size = board.length;
  const moves = [];

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] === null) {
        // Chỉ xét các vị trí gần các quân cờ hiện tại
        if (isNearOccupied(board, row, col, 2)) {
          const score = evaluatePosition(board, row, col, 'O') + 
                       evaluatePosition(board, row, col, 'X');
          moves.push([row, col, score]);
        }
      }
    }
  }

  // Sắp xếp theo điểm số và lấy top N
  return moves.sort((a, b) => b[2] - a[2]).slice(0, count * count).map(m => [m[0], m[1]]);
}

/**
 * Kiểm tra xem vị trí có gần các quân cờ không
 */
function isNearOccupied(board, row, col, range) {
  const size = board.length;
  for (let r = Math.max(0, row - range); r <= Math.min(size - 1, row + range); r++) {
    for (let c = Math.max(0, col - range); c <= Math.min(size - 1, col + range); c++) {
      if (board[r][c] !== null) return true;
    }
  }
  return false;
}

/**
 * Đánh giá toàn bộ bàn cờ
 */
function evaluateBoard(board, aiPlayer, humanPlayer) {
  let score = 0;
  const size = board.length;

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] === null) {
        score += evaluatePosition(board, row, col, aiPlayer);
        score -= evaluatePosition(board, row, col, humanPlayer) * 0.8;
      }
    }
  }

  return score;
}

/**
 * Kiểm tra người chơi nào thắng
 */
function checkWinnerInBoard(board) {
  const size = board.length;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] !== null) {
        if (checkLine(board, row, col, board[row][col])) {
          return board[row][col];
        }
      }
    }
  }
  return null;
}

function checkLine(board, row, col, player) {
  const size = board.length;
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

  for (const [dx, dy] of directions) {
    let count = 1;
    let r = row + dx, c = col + dy;
    while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === player) {
      count++;
      r += dx;
      c += dy;
    }
    r = row - dx;
    c = col - dy;
    while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === player) {
      count++;
      r -= dx;
      c -= dy;
    }
    if (count >= 5) return true;
  }
  return false;
}

/**
 * Kiểm tra game kết thúc
 */
function isGameOver(board) {
  const size = board.length;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] === null) return false;
    }
  }
  return true;
}

/**
 * Tìm nước đi tốt nhất cho AI
 */
export function findBestMove(board, aiPlayer, depth = 3) {
  const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';
  let bestScore = -Infinity;
  let bestMove = null;
  const moves = getGoodMoves(board, 3);

  for (const [row, col] of moves) {
    if (board[row][col] === null) {
      board[row][col] = aiPlayer;
      const score = minimax(board, depth - 1, false, -Infinity, Infinity, aiPlayer, humanPlayer);
      board[row][col] = null;

      if (score > bestScore) {
        bestScore = score;
        bestMove = [row, col];
      }
    }
  }

  return bestMove || getRandomMove(board);
}

/**
 * Lấy nước đi ngẫu nhiên (fallback)
 */
function getRandomMove(board) {
  const size = board.length;
  const emptyMoves = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] === null && isNearOccupied(board, row, col, 3)) {
        emptyMoves.push([row, col]);
      }
    }
  }
  return emptyMoves.length > 0 ? emptyMoves[Math.floor(Math.random() * emptyMoves.length)] : null;
}
