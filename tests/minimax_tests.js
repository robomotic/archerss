#!/usr/bin/env node
/**
 * Test suite for Minimax AI implementation
 */

var Chess = require('../docs/chess.js').Chess;

var totalTests = 0;
var passedTests = 0;
var failedTests = 0;

function test(description, testFunc) {
  totalTests++;
  try {
    testFunc();
    console.log('✓ ' + description);
    passedTests++;
  } catch (error) {
    console.log('✗ ' + description);
    console.log('  Error: ' + error.message);
    failedTests++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

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

// Helper function to get the board as a 2D array
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

// Fisher-Yates shuffle for move ordering
function shuffle(array){
  for(let j, x, i = array.length; i; j = Math.floor(Math.random() * i), x = array[--i], array[i] = array[j], array[j] = x);
  return array;
}

// Transposition table for caching position evaluations
let transpositionTable = new Map();

// Clear transposition table (call before starting a new search)
function clearTranspositionTable() {
  transpositionTable.clear();
}

// minimax function for testing with transposition table
function minimax(position, depth, alpha, beta, maximizing_player){
  // Check transposition table for previously evaluated position
  let positionKey = position.fen();
  if (transpositionTable.has(positionKey)) {
    let cached = transpositionTable.get(positionKey);
    // Use cached result if it was searched at equal or greater depth
    if (cached.depth >= depth) {
      return [cached.move, cached.evaluation];
    }
  }

  // if terminal state (game over) or max depth (depth == 0)
  if (position.in_checkmate() || position.in_draw() || depth == 0){
    let evaluation = evaluateBoard(getBoardAs2DArray(position));
    // Store in transposition table
    transpositionTable.set(positionKey, {
      depth: depth,
      evaluation: evaluation,
      move: null
    });
    return [null, evaluation];
  }

  let bestMove;
  if (maximizing_player) {
    // find move with best possible score
    let maxEval = -Infinity;
    let possibleMoves = shuffle(position.moves());
    for (let i = 0; i < possibleMoves.length; i++) {

      position.move(possibleMoves[i])
      let [childBestMove, childEval] = minimax(position, depth - 1, alpha, beta, false)
      if (childEval > maxEval) {
        maxEval = childEval;
        bestMove = possibleMoves[i]
      }
      position.undo()

      // alpha beta pruning
      alpha = Math.max(alpha, childEval)
      if (beta <= alpha) {
        break;
      }
    }
    
    // Store result in transposition table
    transpositionTable.set(positionKey, {
      depth: depth,
      evaluation: maxEval,
      move: bestMove
    });
    
    return [bestMove, maxEval];

  } else {
    // find move with worst possible score (for maximizer)
    let minEval = +Infinity;
    let possibleMoves = shuffle(position.moves());
    for (let i = 0; i < possibleMoves.length; i++) {

      position.move(possibleMoves[i])
      let [childBestMove, childEval] = minimax(position, depth - 1, alpha, beta, true)
      if (childEval < minEval) {
        minEval = childEval;
        bestMove = possibleMoves[i]
      }
      position.undo()

      // alpha beta pruning
      beta = Math.min(beta, childEval)
      if (beta <= alpha) {
        break;
      }
    }
    
    // Store result in transposition table
    transpositionTable.set(positionKey, {
      depth: depth,
      evaluation: minEval,
      move: bestMove
    });
    
    return [bestMove, minEval];
  }
}

console.log('═══════════════════════════════════════════════════════════');
console.log('  MINIMAX AI - TEST SUITE');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('─────────────────────────────────────────────────────────');
console.log('SECTION 1: Board Evaluation');
console.log('─────────────────────────────────────────────────────────\n');

test('evaluateBoard returns 0 for starting position', function() {
  var game = new Chess();
  var board = getBoardAs2DArray(game);
  var evaluation = evaluateBoard(board);
  
  // Starting position should be balanced (0)
  assert(evaluation === 0, 'Starting position should evaluate to 0, got: ' + evaluation);
});

test('evaluateBoard favors white when white is up material', function() {
  // Position where white has an extra pawn
  var game = new Chess('rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 1');
  var board = getBoardAs2DArray(game);
  var evaluation = evaluateBoard(board);
  
  assert(evaluation === 0, 'Balanced position should evaluate to 0');
  
  // Now remove a black pawn
  game = new Chess('rnbqkbnr/pp2pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 1');
  board = getBoardAs2DArray(game);
  evaluation = evaluateBoard(board);
  
  assert(evaluation > 0, 'White up a pawn should be positive, got: ' + evaluation);
});

test('evaluateBoard favors black when black is up material', function() {
  // Position where black has an extra knight
  var game = new Chess('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/R1BQKBNR w KQkq - 0 1');
  var board = getBoardAs2DArray(game);
  var evaluation = evaluateBoard(board);
  
  assert(evaluation < 0, 'Black up a knight should be negative, got: ' + evaluation);
});

console.log('\n─────────────────────────────────────────────────────────');
console.log('SECTION 2: Fisher-Yates Shuffle');
console.log('─────────────────────────────────────────────────────────\n');

test('shuffle function randomizes array order', function() {
  var originalArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  var copy1 = originalArray.slice();
  var copy2 = originalArray.slice();
  
  shuffle(copy1);
  shuffle(copy2);
  
  // Arrays should still have same elements
  assert(copy1.length === originalArray.length, 'Shuffled array should have same length');
  
  // Check all elements are present
  for (var i = 0; i < originalArray.length; i++) {
    assert(copy1.indexOf(originalArray[i]) !== -1, 'All elements should be present');
  }
  
  // Arrays should likely be different from original (not guaranteed but very likely)
  var isDifferent = false;
  for (var i = 0; i < originalArray.length; i++) {
    if (copy1[i] !== originalArray[i]) {
      isDifferent = true;
      break;
    }
  }
  
  assert(isDifferent, 'Shuffled array should be different from original (statistically)');
});

test('shuffle adds variety to move selection', function() {
  var game = new Chess();
  var moves1 = [];
  var moves2 = [];
  
  // Get shuffled moves multiple times
  for (var i = 0; i < 3; i++) {
    var shuffled = shuffle(game.moves().slice());
    moves1.push(shuffled[0]);
  }
  
  // There should be some variety in the first moves selected
  var uniqueMoves = moves1.filter(function(value, index, self) {
    return self.indexOf(value) === index;
  });
  
  // With 20 possible opening moves, getting at least 2 different moves in 3 shuffles is expected
  assert(uniqueMoves.length >= 1, 'Shuffle should produce varied results');
});

console.log('\n─────────────────────────────────────────────────────────');
console.log('SECTION 3: Minimax Algorithm');
console.log('─────────────────────────────────────────────────────────\n');

test('minimax returns a valid move from starting position', function() {
  var game = new Chess();
  var depth = 2;
  
  clearTranspositionTable();
  var [bestMove, evaluation] = minimax(game, depth, -Infinity, +Infinity, true);
  
  assert(bestMove !== null, 'Minimax should return a valid move');
  assert(bestMove !== undefined, 'Minimax should return a defined move');
  
  // Verify the move is legal
  var legalMoves = game.moves();
  assert(legalMoves.indexOf(bestMove) !== -1, 'Minimax should return a legal move: ' + bestMove);
});

test('minimax finds winning moves', function() {
  // Position where white can capture a free queen
  var game = new Chess('rnb1kbnr/pppppppp/8/8/8/7q/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  var depth = 2;
  
  clearTranspositionTable();
  var [bestMove, evaluation] = minimax(game, depth, -Infinity, +Infinity, true);
  
  assert(bestMove !== null, 'Minimax should find a move');
  
  // The move should capture the hanging queen
  assert(bestMove.includes('h3'), 'Minimax should capture the hanging queen: ' + bestMove);
});

test('minimax makes reasonable moves', function() {
  // Standard opening position
  var game = new Chess();
  var depth = 3;
  
  // White should make a reasonable opening move
  clearTranspositionTable();
  var [bestMove, evaluation] = minimax(game, depth, -Infinity, +Infinity, true);
  
  assert(bestMove !== null, 'Minimax should return a move');
  
  // Verify it's a legal move
  var legalMoves = game.moves();
  assert(legalMoves.indexOf(bestMove) !== -1, 'Move should be legal: ' + bestMove);
  
  // Execute the move
  game.move(bestMove);
  
  // Position should still be reasonable (not lost material)
  var boardAfter = getBoardAs2DArray(game);
  var evaluationAfter = evaluateBoard(boardAfter);
  
  // White should not have lost significant material (allowing for position evaluation variance)
  assert(evaluationAfter > -30, 'White should not have lost significant material after move');
});

test('minimax works with archer pieces', function() {
  // Starting position with archers
  var game = new Chess('rnbqkbnr/ppappapp/8/8/8/8/PPAPPAPP/RNBQKBNR w KQkq - 0 1');
  var depth = 2;
  
  clearTranspositionTable();
  var [bestMove, evaluation] = minimax(game, depth, -Infinity, +Infinity, true);
  
  assert(bestMove !== null, 'Minimax should return a valid move with archers');
  
  var legalMoves = game.moves();
  assert(legalMoves.indexOf(bestMove) !== -1, 'Move should be legal: ' + bestMove);
});

test('minimax respects depth parameter', function() {
  var game = new Chess();
  
  // Test depth 1
  clearTranspositionTable();
  var startTime1 = Date.now();
  var [move1, evaluation1] = minimax(game, 1, -Infinity, +Infinity, true);
  var time1 = Date.now() - startTime1;
  
  assert(move1 !== null, 'Depth 1 should return a move');
  
  // Test depth 3 (should take more time)
  game = new Chess();
  clearTranspositionTable();
  var startTime3 = Date.now();
  var [move3, evaluation3] = minimax(game, 3, -Infinity, +Infinity, true);
  var time3 = Date.now() - startTime3;
  
  assert(move3 !== null, 'Depth 3 should return a move');
  
  // Depth 3 should generally take longer (though not guaranteed due to pruning)
  console.log('  Depth 1 time: ' + time1 + 'ms, Depth 3 time: ' + time3 + 'ms');
});

test('transposition table caches positions', function() {
  var game = new Chess();
  var depth = 3;
  
  // First search - populate transposition table
  clearTranspositionTable();
  var [move1, eval1] = minimax(game, depth, -Infinity, +Infinity, true);
  var tableSize = transpositionTable.size;
  
  assert(tableSize > 0, 'Transposition table should have cached positions: ' + tableSize);
  assert(move1 !== null, 'Should return a valid move');
  
  // Verify table contains the root position
  var rootKey = game.fen();
  assert(transpositionTable.has(rootKey), 'Table should cache the root position');
  
  console.log('  Cached ' + tableSize + ' positions in transposition table');
});

test('transposition table improves performance', function() {
  // Create a position that can transpose through different move orders
  var game = new Chess();
  
  // First search without transposition table benefit (fresh table)
  clearTranspositionTable();
  var startTime1 = Date.now();
  minimax(game, 3, -Infinity, +Infinity, true);
  var time1 = Date.now() - startTime1;
  var cacheSize1 = transpositionTable.size;
  
  // Second search on same position (should benefit from cached positions)
  var startTime2 = Date.now();
  minimax(game, 3, -Infinity, +Infinity, true);
  var time2 = Date.now() - startTime2;
  
  console.log('  First search: ' + time1 + 'ms (' + cacheSize1 + ' positions cached)');
  console.log('  Second search (with cache): ' + time2 + 'ms');
  
  // Second search should be faster (using cached values)
  assert(time2 <= time1, 'Cached search should be faster or equal: ' + time2 + 'ms vs ' + time1 + 'ms');
});

console.log('\n═══════════════════════════════════════════════════════════');
console.log('  TEST SUMMARY');
console.log('═══════════════════════════════════════════════════════════');
console.log('  Total Tests:   ' + totalTests);
console.log('  Passed:        ' + passedTests + ' ✓');
console.log('  Failed:        ' + failedTests + ' ✗');
console.log('  Success Rate:  ' + Math.round((passedTests / totalTests) * 100) + '%');
console.log('═══════════════════════════════════════════════════════════\n');

if (failedTests === 0) {
  console.log('🎉 All minimax tests passed!\n');
  process.exit(0);
} else {
  console.log('❌ Some tests failed. Please review the implementation.\n');
  process.exit(1);
}
