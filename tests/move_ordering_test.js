/*
 * Move Ordering Test for Archerss
 * Tests the performance difference between minimax with and without move ordering
 */

const Chess = require('../docs/chess.js').Chess;

// Piece values for evaluation
let pieceValues = {
  p: 10,
  a: 20,
  n: 30,
  b: 30,
  r: 50,
  q: 90,
  k: 900
}

// Enhanced piece values for move ordering heuristics
const PIECE_VALUES_ORDERING = {
  'p': 100,
  'n': 320,
  'b': 330,
  'r': 500,
  'q': 900,
  'k': 20000,
  'a': 350
};

function getBoardAs2DArray(game) {
  let board2d = []
  let files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  
  for (let rank = 8; rank >= 1; rank--) {
    let row = []
    for (let file of files) {
      let square = file + rank
      let piece = game.get(square)
      row.push(piece)
    }
    board2d.push(row)
  }
  return board2d
}

function evaluateBoard(board){
  let evaluation = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      evaluation += getPieceValue(board[i][j])
    }
  }
  return evaluation;
}

function getPieceValue(piece){
  if (piece == null) {
    return 0;
  }
  if (piece.color == 'w') {
    return pieceValues[piece.type];
  } else {
    return -pieceValues[piece.type];
  }
}

function shuffle(array){
  for(let j, x, i = array.length; i; j = Math.floor(Math.random() * i), x = array[--i], array[i] = array[j], array[j] = x);
  return array;
}

function scoreMoveForOrdering(moveDetails) {
  let score = 0;
  
  if (!moveDetails || !moveDetails.san) return 0;
  
  // MVV-LVA
  if (moveDetails.captured) {
    const victimValue = PIECE_VALUES_ORDERING[moveDetails.captured] || 0;
    const attackerValue = PIECE_VALUES_ORDERING[moveDetails.piece] || 0;
    score += 10 * victimValue - attackerValue;
  }
  
  // Archer ranged attacks
  if (moveDetails.flags && moveDetails.flags.includes('a')) {
    score += 5000;
    if (moveDetails.captured === 'q') score += 3000;
  }
  
  // Promotions
  if (moveDetails.promotion) {
    score += PIECE_VALUES_ORDERING[moveDetails.promotion] || 0;
  }
  
  // Center control
  const centerSquares = ['d4', 'd5', 'e4', 'e5'];
  if (centerSquares.includes(moveDetails.to)) {
    score += 100;
  }
  
  // Castling
  if (moveDetails.flags && (moveDetails.flags.includes('k') || moveDetails.flags.includes('q'))) {
    score += 500;
  }
  
  // Check detection via SAN notation (avoids expensive trial moves)
  if (moveDetails.san.includes('+')) {
    score += 8000; // Check
  }
  if (moveDetails.san.includes('#')) {
    score += 100000; // Checkmate
  }
  
  return score;
}

function orderMoves(position, moves) {
  // Get verbose move information once for all moves
  const verboseMoves = position.moves({ verbose: true });
  
  // Create a map for quick lookup - use both SAN and algebraic notation
  const moveMap = new Map();
  verboseMoves.forEach(vm => {
    moveMap.set(vm.san, vm);
    moveMap.set(vm.from + vm.to, vm);
  });
  
  // Score each move
  const scoredMoves = moves.map(move => ({
    move: move,
    score: scoreMoveForOrdering(moveMap.get(move))
  }));
  
  // Sort descending by score
  scoredMoves.sort((a, b) => b.score - a.score);
  
  return scoredMoves.map(sm => sm.move);
}

function orderMoves(position, moves) {
  const scoredMoves = moves.map(move => ({
    move: move,
    score: scoreMoveForOrdering(position, move)
  }));
  
  scoredMoves.sort((a, b) => b.score - a.score);
  
  return scoredMoves.map(sm => sm.move);
}

let nodesSearched = 0;
let transpositionTable = new Map();

function clearTranspositionTable() {
  transpositionTable.clear();
}

function minimax(position, depth, alpha, beta, maximizing_player, move_ordering = false){
  nodesSearched++;
  
  let positionKey = position.fen();
  if (transpositionTable.has(positionKey)) {
    let cached = transpositionTable.get(positionKey);
    if (cached.depth >= depth) {
      return [cached.move, cached.evaluation];
    }
  }

  if (position.in_checkmate() || position.in_draw() || depth == 0){
    let evaluation = evaluateBoard(getBoardAs2DArray(position));
    transpositionTable.set(positionKey, {
      depth: depth,
      evaluation: evaluation,
      move: null
    });
    return [null, evaluation];
  }

  let bestMove;
  if (maximizing_player) {
    let maxEval = -Infinity;
    let possibleMoves = position.moves();
    
    if (move_ordering) {
      possibleMoves = orderMoves(position, possibleMoves);
    } else {
      possibleMoves = shuffle(possibleMoves);
    }
    
    for (let i = 0; i < possibleMoves.length; i++) {
      position.move(possibleMoves[i])
      let [childBestMove, childEval] = minimax(position, depth - 1, alpha, beta, false, move_ordering)
      if (childEval > maxEval) {
        maxEval = childEval;
        bestMove = possibleMoves[i]
      }
      position.undo()

      alpha = Math.max(alpha, childEval)
      if (beta <= alpha) {
        break;
      }
    }
    
    transpositionTable.set(positionKey, {
      depth: depth,
      evaluation: maxEval,
      move: bestMove
    });
    
    return [bestMove, maxEval];

  } else {
    let minEval = +Infinity;
    let possibleMoves = position.moves();
    
    if (move_ordering) {
      possibleMoves = orderMoves(position, possibleMoves);
    } else {
      possibleMoves = shuffle(possibleMoves);
    }
    
    for (let i = 0; i < possibleMoves.length; i++) {
      position.move(possibleMoves[i])
      let [childBestMove, childEval] = minimax(position, depth - 1, alpha, beta, true, move_ordering)
      if (childEval < minEval) {
        minEval = childEval;
        bestMove = possibleMoves[i]
      }
      position.undo()

      beta = Math.min(beta, childEval)
      if (beta <= alpha) {
        break;
      }
    }
    
    transpositionTable.set(positionKey, {
      depth: depth,
      evaluation: minEval,
      move: bestMove
    });
    
    return [bestMove, minEval];
  }
}

// Run performance comparison tests
console.log('='.repeat(70));
console.log('MOVE ORDERING PERFORMANCE TEST');
console.log('='.repeat(70));

const TEST_POSITIONS = [
  {
    name: 'Starting Position',
    fen: 'rnbqkbnr/ppappapp/8/8/8/8/PPAPPAPP/RNBQKBNR w KQkq - 0 1'
  },
  {
    name: 'Mid-game Position',
    fen: 'r1bqkb1r/ppap1ppp/2n2n2/4p3/2B1P3/5N2/PPAP1PPP/RNBQK2R w KQkq - 0 5'
  },
  {
    name: 'Tactical Position (Queen can be captured)',
    fen: 'r1bqkb1r/ppap1ppp/2n5/4p3/2BnP3/5N2/PPAPQPPP/RNB1K2R b KQkq - 0 6'
  }
];

const DEPTH = 4;

for (let testPos of TEST_POSITIONS) {
  console.log('\n' + '-'.repeat(70));
  console.log(`Position: ${testPos.name}`);
  console.log(`FEN: ${testPos.fen}`);
  console.log('-'.repeat(70));
  
  // Test WITHOUT move ordering
  let game1 = new Chess(testPos.fen);
  nodesSearched = 0;
  clearTranspositionTable();
  
  let start1 = Date.now();
  let [bestMove1, eval1] = minimax(game1, DEPTH, -Infinity, +Infinity, game1.turn() === 'w', false);
  let time1 = Date.now() - start1;
  let nodes1 = nodesSearched;
  
  console.log(`\n✗ WITHOUT Move Ordering:`);
  console.log(`  Best move: ${bestMove1}`);
  console.log(`  Evaluation: ${eval1}`);
  console.log(`  Time: ${time1}ms`);
  console.log(`  Nodes searched: ${nodes1.toLocaleString()}`);
  console.log(`  Nodes/sec: ${Math.round(nodes1 / (time1 / 1000)).toLocaleString()}`);
  
  // Test WITH move ordering
  let game2 = new Chess(testPos.fen);
  nodesSearched = 0;
  clearTranspositionTable();
  
  let start2 = Date.now();
  let [bestMove2, eval2] = minimax(game2, DEPTH, -Infinity, +Infinity, game2.turn() === 'w', true);
  let time2 = Date.now() - start2;
  let nodes2 = nodesSearched;
  
  console.log(`\n✓ WITH Move Ordering:`);
  console.log(`  Best move: ${bestMove2}`);
  console.log(`  Evaluation: ${eval2}`);
  console.log(`  Time: ${time2}ms`);
  console.log(`  Nodes searched: ${nodes2.toLocaleString()}`);
  console.log(`  Nodes/sec: ${Math.round(nodes2 / (time2 / 1000)).toLocaleString()}`);
  
  // Calculate improvement
  let timeImprovement = ((time1 - time2) / time1 * 100).toFixed(1);
  let nodeImprovement = ((nodes1 - nodes2) / nodes1 * 100).toFixed(1);
  
  console.log(`\n📊 IMPROVEMENT:`);
  console.log(`  Time saved: ${timeImprovement}% faster`);
  console.log(`  Nodes saved: ${nodeImprovement}% fewer nodes`);
  console.log(`  Speedup: ${(time1 / time2).toFixed(2)}x`);
}

console.log('\n' + '='.repeat(70));
console.log('TEST COMPLETE');
console.log('='.repeat(70));
console.log('\nTo enable move ordering in the game, set:');
console.log('  MINIMAX_CONFIG.moveOrdering = true');
console.log('\nThis will make the AI search faster and find better moves quicker!');
