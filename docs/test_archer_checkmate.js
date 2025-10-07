// Test that archer CAN check and checkmate the king
var Chess = require('./chess.js').Chess;

console.log('\nTesting ARCHER can CHECK and CHECKMATE KING...\n');

var passCount = 0;
var failCount = 0;

function test(description, testFunc) {
  try {
    testFunc();
    console.log('Test - ' + description + ': PASS ✓');
    passCount++;
  } catch (error) {
    console.log('Test - ' + description + ': FAIL ✗');
    console.log('  Error: ' + error.message);
    failCount++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Test 1: Archer CAN attack king (check)
test('Archer can put king in check (adjacent)', function() {
  var chess = new Chess('8/8/8/8/3Ak3/8/8/K7 b - - 0 1');
  console.log('  Position: White archer at d4, Black king at e4');
  console.log('  FEN:', chess.fen());
  
  assert(chess.in_check(), 'Black king should be in check from archer');
});

// Test 2: Archer attack at 2 cells vertically puts king in check
test('Archer can put king in check (2 cells vertical)', function() {
  var chess = new Chess('8/8/3k4/8/3A4/8/8/K7 b - - 0 1');
  console.log('  Position: White archer at d4, Black king at d6 (2 cells up)');
  console.log('  FEN:', chess.fen());
  
  assert(chess.in_check(), 'Black king should be in check from archer 2 cells away');
});

// Test 3: King must move when in check from archer
test('King must respond to check from archer', function() {
  var chess = new Chess('8/8/8/8/3Ak3/8/8/K7 b - - 0 1');
  console.log('  Position: Black king at e4 in check from archer at d4');
  
  var moves = chess.moves({ verbose: true });
  console.log('  Legal moves for black:', moves.map(m => m.san).join(', '));
  
  // All moves should either move the king or capture the archer
  var allMovesAreKingMoves = moves.every(function(m) {
    return m.piece === 'k' || m.to === 'd4'; // king moves or captures archer
  });
  
  assert(allMovesAreKingMoves, 'All legal moves should be king moves or capturing archer');
  assert(moves.length > 0, 'King should have legal moves to escape check');
});

// Test 4: Archer CAN deliver checkmate
test('Archer can deliver checkmate', function() {
  // Set up a checkmate position: King in corner, archer attacks adjacent, protected by queen
  var chess = new Chess('6Ak/5Qpp/8/8/8/8/8/K7 b - - 0 1');
  console.log('  Position: Black king at h8, archer at g8 (protected by queen at f7), pawns block escape');
  console.log('  FEN:', chess.fen());
  
  assert(chess.in_check(), 'King should be in check');
  assert(chess.in_checkmate(), 'King should be in checkmate from archer');
  assert(chess.game_over(), 'Game should be over');
});

// Test 5: Archer ranged attack move puts king in check
test('Archer ranged attack creates check', function() {
  var chess = new Chess('8/8/3k4/8/8/3A4/8/K7 w - - 0 1');
  console.log('  Position: White archer at d3, Black king at d6');
  
  assert(!chess.in_check(), 'King should not be in check initially');
  
  // Move archer up one square to d4, now attacks king at d6 (2 cells)
  var move = chess.move('Ad4');
  console.log('  After Ad4, FEN:', chess.fen());
  
  assert(move !== null, 'Move should be legal');
  assert(chess.in_check(), 'King should be in check after archer moves');
});

// Test 6: Blocking works for vertical ranged attacks
test('Piece can block vertical archer attack', function() {
  var chess = new Chess('8/8/3k4/3p4/8/3A4/8/K7 b - - 0 1');
  console.log('  Position: Black king at d6, pawn at d5, archer at d3 (2 squares away)');
  
  // King is not in check (pawn blocks the 2-cell vertical attack)
  assert(!chess.in_check(), 'King should not be in check (pawn blocks vertical attack)');
  
  // Pawn can move to d4 and still block
  var moves = chess.moves({ square: 'd5', verbose: true });
  console.log('  Legal pawn moves:', moves.map(m => m.san).join(', '));
  
  assert(moves.length > 0, 'Pawn should have legal moves');
  
  // After moving pawn to d4, king should still not be in check (pawn still blocks)
  chess.move('d4');
  assert(!chess.in_check(), 'King should still not be in check after pawn moves to d4 (still blocking)');
});

// Test 7: Archer diagonal check (1 cell)
test('Archer can check king diagonally (1 cell)', function() {
  var chess = new Chess('8/8/8/8/8/2k5/3A4/K7 b - - 0 1');
  console.log('  Position: White archer at d2, Black king at c3 (1 cell diagonal)');
  console.log('  FEN:', chess.fen());
  
  assert(chess.in_check(), 'Black king should be in check from diagonal archer attack (1 cell)');
});

console.log('\n-------------------');
console.log('Tests passed: ' + passCount);
console.log('Tests failed: ' + failCount);
console.log('Total tests: ' + (passCount + failCount));
console.log('-------------------\n');

if (failCount === 0) {
  console.log('All archer check/checkmate tests passed! ✓\n');
  process.exit(0);
} else {
  console.log('Some tests failed. ✗\n');
  process.exit(1);
}
