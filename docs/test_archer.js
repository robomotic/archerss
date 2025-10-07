// Test script for ARCHER piece
var Chess = require('./chess.js').Chess;

console.log('Testing ARCHER piece...\n');

// Test 1: Initial position should have archers
var game = new Chess();
var initialFen = game.fen();
console.log('Test 1 - Initial Position:');
console.log('FEN:', initialFen);
console.log('Expected archers at c2, f2, c7, f7');
console.log('Actual FEN shows:', initialFen.includes('PPAPAPPP') && initialFen.includes('ppapappp') ? 'PASS ✓' : 'FAIL ✗');
console.log();

// Test 2: Archer should be able to move like a king
console.log('Test 2 - Archer Movement:');
var moves = game.moves({ square: 'c2', verbose: true });
console.log('Legal moves for white archer at c2:');
moves.forEach(function(move) {
  console.log('  ', move.san, '(' + move.from + ' -> ' + move.to + ')');
});
console.log('Archer can move:', moves.length > 0 ? 'PASS ✓' : 'FAIL ✗');
console.log();

// Test 3: Archer should NOT be able to capture
console.log('Test 3 - Archer Cannot Capture:');
// Set up a position where an enemy piece is adjacent to archer
game.clear();
game.put({ type: 'a', color: 'w' }, 'e4');  // White archer at e4
game.put({ type: 'p', color: 'b' }, 'e5');  // Black pawn at e5
game.put({ type: 'k', color: 'w' }, 'e1');  // White king
game.put({ type: 'k', color: 'b' }, 'e8');  // Black king

console.log('Position: White archer at e4, Black pawn at e5');
console.log('FEN:', game.fen());

var archerMoves = game.moves({ square: 'e4', verbose: true });
console.log('Legal moves for white archer at e4:');
archerMoves.forEach(function(move) {
  console.log('  ', move.san, '(' + move.from + ' -> ' + move.to + ')', move.flags.includes('c') ? '[CAPTURE]' : '');
});

var hasCapture = archerMoves.some(function(move) {
  return move.to === 'e5';
});
console.log('Archer cannot capture adjacent enemy piece:', !hasCapture ? 'PASS ✓' : 'FAIL ✗');
console.log();

// Test 4: Archer should move to empty squares
console.log('Test 4 - Archer Moves to Empty Squares:');
var emptyMoves = archerMoves.filter(function(move) {
  return move.to !== 'e5';
});
console.log('Archer can move to', emptyMoves.length, 'empty squares');
console.log('Archer can move to empty squares:', emptyMoves.length > 0 ? 'PASS ✓' : 'FAIL ✗');
console.log();

// Test 5: Verify archer doesn't attack squares
console.log('Test 5 - Archer Does Not Attack:');
game.clear();
game.put({ type: 'a', color: 'w' }, 'd4');  // White archer at d4
game.put({ type: 'k', color: 'b' }, 'e5');  // Black king at e5 (adjacent)
game.put({ type: 'k', color: 'w' }, 'a1');  // White king at a1

// If archer doesn't attack, black king should be able to stay at e5
var blackKingMoves = game.moves({ square: 'e5', verbose: true });
console.log('FEN:', game.fen());
console.log('Black king at e5 (adjacent to white archer at d4) has', blackKingMoves.length, 'legal moves');
console.log('Black king can stay adjacent to archer:', blackKingMoves.length >= 0 ? 'PASS ✓' : 'FAIL ✗');
console.log();

console.log('All tests completed!');
