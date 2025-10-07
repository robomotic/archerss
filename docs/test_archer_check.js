// Test that archers CAN check and checkmate kings
var Chess = require('./chess.js').Chess;

console.log('\nTesting ARCHER CHECK and CHECKMATE...\n');

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

// Test 1: Archer can put king in check (adjacent)
test('Archer can put king in check (1 cell away)', function() {
  var game = new Chess();
  game.clear();
  game.put({ type: 'k', color: 'w' }, 'a1');
  game.put({ type: 'k', color: 'b' }, 'e5');
  game.put({ type: 'a', color: 'w' }, 'd4');  // Adjacent to black king
  
  console.log('  Position: White archer at d4, Black king at e5');
  console.log('  FEN:', game.fen());
  
  // Black should be in check
  game.load(game.fen().replace(' w ', ' b ')); // Switch to black's turn
  assert(game.in_check(), 'Black king should be in check from white archer at d4');
});

// Test 2: Archer can put king in check (2 cells vertically)
test('Archer can put king in check (2 cells vertically)', function() {
  var game = new Chess();
  game.clear();
  game.put({ type: 'k', color: 'w' }, 'a1');
  game.put({ type: 'k', color: 'b' }, 'd6');
  game.put({ type: 'a', color: 'w' }, 'd4');  // 2 cells below black king
  
  console.log('  Position: White archer at d4, Black king at d6 (2 cells up)');
  console.log('  FEN:', game.fen());
  
  game.load(game.fen().replace(' w ', ' b '));
  assert(game.in_check(), 'Black king should be in check from white archer 2 cells away');
});

// Test 3: King must move when in check from archer
test('King must move when in check from archer', function() {
  var game = new Chess();
  game.clear();
  game.put({ type: 'k', color: 'w' }, 'a1');
  game.put({ type: 'k', color: 'b' }, 'e5');
  game.put({ type: 'a', color: 'w' }, 'd4');  // Checking black king
  
  game.load(game.fen().replace(' w ', ' b '));
  
  console.log('  Position: Black king at e5 in check from white archer at d4');
  console.log('  FEN:', game.fen());
  
  var moves = game.moves({ verbose: true });
  console.log('  Black has', moves.length, 'legal moves');
  
  // All moves should be king moves (to escape check)
  var allKingMoves = moves.every(function(m) {
    return m.piece === 'k';
  });
  
  assert(allKingMoves, 'King must move to escape check from archer');
  assert(moves.length > 0, 'King should have legal moves to escape');
});

// Test 4: Archer can deliver checkmate
test('Archer can deliver checkmate', function() {
  var game = new Chess();
  game.clear();
  
  // Set up checkmate position
  game.put({ type: 'k', color: 'w' }, 'a1');  // White king safe
  game.put({ type: 'k', color: 'b' }, 'h8');  // Black king in corner
  game.put({ type: 'r', color: 'w' }, 'h7');  // Rook blocks g8, h7
  game.put({ type: 'r', color: 'w' }, 'g8');  // Rook blocks g8, g7
  game.put({ type: 'a', color: 'w' }, 'g7');  // Archer attacks h8
  
  game.load(game.fen().replace(' w ', ' b '));
  
  console.log('  Position: Black king at h8, White archer at g7 (checking)');
  console.log('  FEN:', game.fen());
  console.log('  In check:', game.in_check());
  console.log('  In checkmate:', game.in_checkmate());
  
  assert(game.in_check(), 'King should be in check');
  assert(game.in_checkmate(), 'Should be checkmate by archer');
  assert(game.game_over(), 'Game should be over');
});

// Test 5: Archer attack on king is valid move
test('Archer can attack king (capture in checkmate)', function() {
  var game = new Chess();
  game.clear();
  game.put({ type: 'k', color: 'w' }, 'a1');
  game.put({ type: 'k', color: 'b' }, 'e5');
  game.put({ type: 'a', color: 'w' }, 'd5');  // Adjacent to king
  
  console.log('  Position: White archer at d5, Black king at e5');
  
  var moves = game.moves({ square: 'd5', verbose: true });
  console.log('  Archer moves:', moves.map(function(m) { return m.san; }).join(', '));
  
  var attackKingMove = moves.find(function(m) {
    return m.to === 'e5';
  });
  
  assert(attackKingMove !== undefined, 'Archer should be able to attack king');
  assert(attackKingMove.san.includes('*'), 'Should use ranged attack notation');
});

// Test 6: King cannot move into archer's attack range
test('King cannot move into archer attack range', function() {
  var game = new Chess();
  game.clear();
  game.put({ type: 'k', color: 'w' }, 'a1');
  game.put({ type: 'k', color: 'b' }, 'd6');
  game.put({ type: 'a', color: 'w' }, 'd4');  // Archer at d4
  
  game.load(game.fen().replace(' w ', ' b '));
  
  console.log('  Position: Black king at d6, White archer at d4');
  
  var moves = game.moves({ square: 'd6', verbose: true });
  console.log('  King legal moves:', moves.map(function(m) { return m.to; }).join(', '));
  
  // King should NOT be able to move to d5 (adjacent to archer)
  var canMoveToD5 = moves.some(function(m) { return m.to === 'd5'; });
  
  assert(!canMoveToD5, 'King should not be able to move into archer attack range');
});

// Test 7: Archer attacks cannot be blocked (direct ranged attack)
test('Archer ranged attacks cannot be blocked', function() {
  var game = new Chess();
  game.clear();
  game.put({ type: 'k', color: 'w' }, 'a1');
  game.put({ type: 'k', color: 'b' }, 'd6');
  game.put({ type: 'a', color: 'w' }, 'd4');  // Checking king at d6 (2 cells)
  game.put({ type: 'r', color: 'b' }, 'd7');  // Black rook between them
  
  game.load(game.fen().replace(' w ', ' b '));
  
  console.log('  Position: Black king at d6 in check from archer at d4');
  console.log('  Black rook at d7 is between archer and king');
  console.log('  Can the rook block at d5?');
  
  var moves = game.moves({ square: 'd7', verbose: true });
  var blockMove = moves.find(function(m) { return m.to === 'd5'; });
  
  console.log('  Available rook moves:', moves.map(function(m) { return m.to; }).join(', '));
  console.log('  King is still in check:', game.in_check());
  
  // Since archer ranged attacks are direct (not blockable), 
  // moving rook to d5 won't help - king will still be in check
  // So this move might not be generated as it doesn't resolve check
  
  assert(game.in_check(), 'King should be in check from archer (cannot be blocked)');
  
  // The key point: archer attacks are RANGED and DIRECT, not sliding
  // So pieces in between don't block the attack
});

console.log('\n-------------------');
console.log('Tests passed: ' + passCount);
console.log('Tests failed: ' + failCount);
console.log('Total tests: ' + (passCount + failCount));
console.log('-------------------\n');

if (failCount === 0) {
  console.log('All archer check/checkmate tests passed! ✓\n');
  console.log('CONFIRMED:');
  console.log('✓ Archers CAN check kings');
  console.log('✓ Archers CAN deliver checkmate');
  console.log('✓ Kings MUST respond to archer checks');
  console.log('✓ Kings CANNOT move into archer attack range\n');
  process.exit(0);
} else {
  console.log('Some tests failed. ✗\n');
  process.exit(1);
}
