// Test suite for ARCHER ranged attacks
var Chess = require('./chess.js').Chess;

console.log('\nTesting ARCHER ranged attacks...\n');

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

// Test 1: Archer can attack adjacent enemy piece
test('Archer adjacent attack (1 cell)', function() {
  var chess = new Chess('8/8/8/3p4/2A5/8/8/8 w - - 0 1');
  var moves = chess.moves({ verbose: true });
  
  // Find the attack move from c4 to d5
  var attackMove = moves.find(m => m.from === 'c4' && m.to === 'd5');
  assert(attackMove !== undefined, 'Archer should be able to attack adjacent piece');
  assert(attackMove.san.includes('*'), 'Attack notation should use * symbol');
  
  // Execute the attack
  chess.move('Ac4*d5');
  
  // Verify archer is still at c4 and piece at d5 is gone
  var fen = chess.fen();
  assert(fen.includes('2A5'), 'Archer should still be at c4 after attack');
  assert(!fen.includes('3p4'), 'Enemy piece at d5 should be removed');
});

// Test 2: Archer can attack 2 cells vertically up
test('Archer vertical attack (2 cells up)', function() {
  var chess = new Chess('8/3p4/8/3A4/8/8/8/8 w - - 0 1');
  var moves = chess.moves({ verbose: true });
  
  // Find the attack move from d5 to d7
  var attackMove = moves.find(m => m.from === 'd5' && m.to === 'd7');
  assert(attackMove !== undefined, 'Archer should be able to attack 2 cells up');
  
  // Execute the attack
  chess.move('Ad5*d7');
  
  // Verify archer is still at d5
  var fen = chess.fen();
  assert(fen.includes('3A4'), 'Archer should still be at d5 after attack');
});

// Test 3: Archer can attack 2 cells vertically down
test('Archer vertical attack (2 cells down)', function() {
  var chess = new Chess('8/8/8/3A4/8/3p4/8/8 w - - 0 1');
  var moves = chess.moves({ verbose: true });
  
  // Find the attack move from d5 to d3
  var attackMove = moves.find(m => m.from === 'd5' && m.to === 'd3');
  assert(attackMove !== undefined, 'Archer should be able to attack 2 cells down');
  
  // Execute the attack
  chess.move('Ad5*d3');
  
  // Verify archer is still at d5
  var fen = chess.fen();
  assert(fen.includes('3A4'), 'Archer should still be at d5 after attack');
});

// Test 4: Archer cannot attack 2 cells horizontally
test('Archer cannot attack 2 cells horizontally', function() {
  var chess = new Chess('8/8/8/2pA4/8/8/8/8 w - - 0 1');
  var moves = chess.moves({ verbose: true });
  
  // Try to find an attack move from d5 to b5 (should not exist)
  var attackMove = moves.find(m => m.from === 'd5' && m.to === 'b5');
  assert(attackMove === undefined, 'Archer should not be able to attack 2 cells horizontally');
});

// Test 5: Archer cannot attack 3 cells away
test('Archer cannot attack 3 cells away', function() {
  var chess = new Chess('3p4/8/8/3A4/8/8/8/8 w - - 0 1');
  var moves = chess.moves({ verbose: true });
  
  // Try to find an attack move from d5 to d8 (should not exist)
  var attackMove = moves.find(m => m.from === 'd5' && m.to === 'd8');
  assert(attackMove === undefined, 'Archer should not be able to attack 3 cells away');
});

// Test 6: Archer can still move normally to empty squares
test('Archer normal movement still works', function() {
  var chess = new Chess('8/8/8/3A4/8/8/8/8 w - - 0 1');
  var moves = chess.moves({ verbose: true });
  
  // Find movement to adjacent empty square
  var normalMove = moves.find(m => m.from === 'd5' && m.to === 'e5' && !m.san.includes('*'));
  assert(normalMove !== undefined, 'Archer should still be able to move to empty squares');
  
  chess.move('Ae5');  // Use standard notation without dash
  var fen = chess.fen();
  assert(fen.includes('4A3'), 'Archer should move to e5');
});

// Test 7: Archer cannot move onto enemy pieces
test('Archer cannot capture by moving', function() {
  var chess = new Chess('8/8/8/3p4/2A5/8/8/8 w - - 0 1');
  var moves = chess.moves({ verbose: true });
  
  // Check that there's no normal move to d5 (only attack)
  var normalMove = moves.find(m => m.from === 'c4' && m.to === 'd5' && !m.san.includes('*'));
  assert(normalMove === undefined, 'Archer should not be able to move onto enemy piece');
});

// Test 8: Black archer can attack white pieces
test('Black archer can attack white pieces', function() {
  var chess = new Chess('8/8/8/3a4/8/3P4/8/8 b - - 0 1');
  var moves = chess.moves({ verbose: true });
  
  // Find the attack move from d5 to d3
  var attackMove = moves.find(m => m.from === 'd5' && m.to === 'd3');
  assert(attackMove !== undefined, 'Black archer should be able to attack white piece');
  
  chess.move('Ad5*d3');
  var fen = chess.fen();
  assert(fen.includes('3a4'), 'Black archer should still be at d5 after attack');
});

// Test 9: Archer attack notation uses * symbol
test('Archer attack notation', function() {
  var chess = new Chess('8/8/8/3p4/2A5/8/8/8 w - - 0 1');
  
  chess.move('Ac4*d5');
  var history = chess.history();
  assert(history[0].includes('*'), 'Attack notation should use * symbol instead of x');
});

// Test 10: Archer can attack diagonally (1 cell)
test('Archer diagonal attack (1 cell)', function() {
  var chess = new Chess('8/8/8/2p5/3A4/8/8/8 w - - 0 1');
  var moves = chess.moves({ verbose: true });
  
  // Find the attack move from d4 to c5
  var attackMove = moves.find(m => m.from === 'd4' && m.to === 'c5');
  assert(attackMove !== undefined, 'Archer should be able to attack diagonally');
  
  chess.move('Ad4*c5');
  var fen = chess.fen();
  assert(fen.includes('3A4'), 'Archer should still be at d4 after diagonal attack');
});

console.log('\n-------------------');
console.log('Tests passed: ' + passCount);
console.log('Tests failed: ' + failCount);
console.log('Total tests: ' + (passCount + failCount));
console.log('-------------------\n');

if (failCount === 0) {
  console.log('All ranged attack tests passed! ✓\n');
  process.exit(0);
} else {
  console.log('Some tests failed. ✗\n');
  process.exit(1);
}
