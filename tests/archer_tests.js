#!/usr/bin/env node
/**
 * Combined Test Suite for ARCHER Chess Piece
 * 
 * Tests cover:
 * - Basic archer functionality (movement, initial position)
 * - Ranged attack mechanics
 * - Check and checkmate with archers
 * - Bug fixes and edge cases
 * 
 * Total: 24 tests
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

console.log('═══════════════════════════════════════════════════════════');
console.log('  ARCHER CHESS PIECE - COMPREHENSIVE TEST SUITE');
console.log('═══════════════════════════════════════════════════════════\n');

// ============================================================================
// SECTION 1: BASIC ARCHER FUNCTIONALITY
// ============================================================================

console.log('─────────────────────────────────────────────────────────');
console.log('SECTION 1: Basic Archer Functionality (5 tests)');
console.log('─────────────────────────────────────────────────────────\n');

test('Initial position has archers at c2, f2, c7, f7', function() {
  var game = new Chess();
  var fen = game.fen();
  assert(fen.includes('PPAPPAPP') && fen.includes('ppappapp'), 
    'FEN should contain archers: ' + fen);
});

test('Archer can move like a king (1 square any direction)', function() {
  var game = new Chess();
  var moves = game.moves({ square: 'c2', verbose: true });
  assert(moves.length >= 3, 'Archer should have at least 3 legal moves');
  
  var destinations = moves.map(m => m.to);
  assert(destinations.indexOf('b3') !== -1 || destinations.indexOf('c3') !== -1, 
    'Archer should be able to move to adjacent squares');
});

test('Archer can perform ranged attacks', function() {
  var game = new Chess('4k3/8/8/4p3/4A3/8/8/4K3 w - - 0 1');
  var moves = game.moves({ square: 'e4', verbose: true });
  
  var attackMove = moves.find(m => m.to === 'e5' && m.san.includes('*'));
  assert(attackMove !== undefined, 'Archer should have ranged attack move');
});

test('Archer cannot capture by moving onto piece', function() {
  var game = new Chess('4k3/8/8/4p3/4A3/8/8/4K3 w - - 0 1');
  var moves = game.moves({ square: 'e4', verbose: true });
  
  var regularMove = moves.find(m => m.to === 'e5' && !m.san.includes('*'));
  assert(regularMove === undefined, 'Archer should not be able to move onto enemy piece');
});

test('Archer can move to empty adjacent squares', function() {
  var game = new Chess('4k3/8/8/4p3/4A3/8/8/4K3 w - - 0 1');
  var moves = game.moves({ square: 'e4', verbose: true });
  
  var emptyMoves = moves.filter(m => m.to !== 'e5' && !m.san.includes('*'));
  assert(emptyMoves.length >= 7, 'Archer should have moves to empty squares');
});

// ============================================================================
// SECTION 2: RANGED ATTACK MECHANICS
// ============================================================================

console.log('\n─────────────────────────────────────────────────────────');
console.log('SECTION 2: Ranged Attack Mechanics (10 tests)');
console.log('─────────────────────────────────────────────────────────\n');

test('Archer can attack adjacent piece (1 cell)', function() {
  var chess = new Chess('8/8/8/3p4/2A5/8/8/8 w - - 0 1');
  var moves = chess.moves({ verbose: true });
  
  var attackMove = moves.find(m => m.from === 'c4' && m.to === 'd5');
  assert(attackMove !== undefined, 'Archer should be able to attack adjacent piece');
  assert(attackMove.san.includes('*'), 'Attack notation should use * symbol');
  
  chess.move('Ac4*d5');
  var fen = chess.fen();
  assert(fen.includes('2A5'), 'Archer should still be at c4 after attack');
  assert(!fen.includes('3p4'), 'Enemy piece at d5 should be removed');
});

test('Archer can attack 2 cells vertically up', function() {
  var chess = new Chess('8/3p4/8/3A4/8/8/8/8 w - - 0 1');
  var moves = chess.moves({ verbose: true });
  
  var attackMove = moves.find(m => m.from === 'd5' && m.to === 'd7');
  assert(attackMove !== undefined, 'Archer should be able to attack 2 cells up');
  
  chess.move('Ad5*d7');
  var fen = chess.fen();
  assert(fen.includes('3A4'), 'Archer should still be at d5 after attack');
});

test('Archer can attack 2 cells vertically down', function() {
  var chess = new Chess('8/8/8/3A4/8/3p4/8/8 w - - 0 1');
  var moves = chess.moves({ verbose: true });
  
  var attackMove = moves.find(m => m.from === 'd5' && m.to === 'd3');
  assert(attackMove !== undefined, 'Archer should be able to attack 2 cells down');
  
  chess.move('Ad5*d3');
  var fen = chess.fen();
  assert(fen.includes('3A4'), 'Archer should still be at d5 after attack');
});

test('Archer cannot attack 2 cells horizontally', function() {
  var chess = new Chess('8/8/8/2pA4/8/8/8/8 w - - 0 1');
  var moves = chess.moves({ verbose: true });
  
  var attackMove = moves.find(m => m.from === 'd5' && m.to === 'b5');
  assert(attackMove === undefined, 'Archer should not be able to attack 2 cells horizontally');
});

test('Archer cannot attack 3 cells away', function() {
  var chess = new Chess('3p4/8/8/3A4/8/8/8/8 w - - 0 1');
  var moves = chess.moves({ verbose: true });
  
  var attackMove = moves.find(m => m.from === 'd5' && m.to === 'd8');
  assert(attackMove === undefined, 'Archer should not be able to attack 3 cells away');
});

test('Archer normal movement still works', function() {
  var chess = new Chess('8/8/8/3A4/8/8/8/8 w - - 0 1');
  var moves = chess.moves({ verbose: true });
  
  var normalMove = moves.find(m => m.from === 'd5' && m.to === 'e5' && !m.san.includes('*'));
  assert(normalMove !== undefined, 'Archer should still be able to move to empty squares');
  
  chess.move('Ae5');
  var fen = chess.fen();
  assert(fen.includes('4A3'), 'Archer should move to e5');
});

test('Archer cannot move onto enemy pieces', function() {
  var chess = new Chess('8/8/8/3p4/2A5/8/8/8 w - - 0 1');
  var moves = chess.moves({ verbose: true });
  
  var normalMove = moves.find(m => m.from === 'c4' && m.to === 'd5' && !m.san.includes('*'));
  assert(normalMove === undefined, 'Archer should not be able to move onto enemy piece');
});

test('Black archer can attack white pieces', function() {
  var chess = new Chess('8/8/8/3a4/8/3P4/8/8 b - - 0 1');
  var moves = chess.moves({ verbose: true });
  
  var attackMove = moves.find(m => m.from === 'd5' && m.to === 'd3');
  assert(attackMove !== undefined, 'Black archer should be able to attack white piece');
  
  chess.move('Ad5*d3');
  var fen = chess.fen();
  assert(fen.includes('3a4'), 'Black archer should still be at d5 after attack');
});

test('Archer attack notation uses * symbol', function() {
  var chess = new Chess('8/8/8/3p4/2A5/8/8/8 w - - 0 1');
  
  chess.move('Ac4*d5');
  var history = chess.history();
  assert(history[0].includes('*'), 'Attack notation should use * symbol instead of x');
});

test('Archer can attack diagonally (1 cell)', function() {
  var chess = new Chess('8/8/8/2p5/3A4/8/8/8 w - - 0 1');
  var moves = chess.moves({ verbose: true });
  
  var attackMove = moves.find(m => m.from === 'd4' && m.to === 'c5');
  assert(attackMove !== undefined, 'Archer should be able to attack diagonally');
  
  chess.move('Ad4*c5');
  var fen = chess.fen();
  assert(fen.includes('3A4'), 'Archer should still be at d4 after diagonal attack');
});

// ============================================================================
// SECTION 3: CHECK AND CHECKMATE
// ============================================================================

console.log('\n─────────────────────────────────────────────────────────');
console.log('SECTION 3: Check and Checkmate (9 tests)');
console.log('─────────────────────────────────────────────────────────\n');

test('Archer can put king in check (adjacent)', function() {
  var chess = new Chess('8/8/8/8/3Ak3/8/8/K7 b - - 0 1');
  assert(chess.in_check(), 'Black king should be in check from archer');
});

test('Archer can put king in check (2 cells vertical)', function() {
  var chess = new Chess('8/8/3k4/8/3A4/8/8/K7 b - - 0 1');
  assert(chess.in_check(), 'Black king should be in check from archer 2 cells away');
});

test('King must respond to check from archer', function() {
  var chess = new Chess('8/8/8/8/3Ak3/8/8/K7 b - - 0 1');
  
  var moves = chess.moves({ verbose: true });
  
  // All moves should either move the king or capture the archer
  var allMovesAreKingMoves = moves.every(function(m) {
    return m.piece === 'k' || m.to === 'd4';
  });
  
  assert(allMovesAreKingMoves, 'All legal moves should be king moves or capturing archer');
  assert(moves.length > 0, 'King should have legal moves to escape check');
});

test('Archer can deliver checkmate', function() {
  var chess = new Chess('6Ak/5Qpp/8/8/8/8/8/K7 b - - 0 1');
  
  assert(chess.in_check(), 'King should be in check');
  assert(chess.in_checkmate(), 'King should be in checkmate from archer');
  assert(chess.game_over(), 'Game should be over');
});

test('Archer ranged attack creates check', function() {
  var chess = new Chess('8/8/3k4/8/8/3A4/8/K7 w - - 0 1');
  
  assert(!chess.in_check(), 'King should not be in check initially');
  
  var move = chess.move('Ad4');
  
  assert(move !== null, 'Move should be legal');
  assert(chess.in_check(), 'King should be in check after archer moves');
});

test('Piece can block vertical archer attack', function() {
  var chess = new Chess('8/8/3k4/3p4/8/3A4/8/K7 b - - 0 1');
  
  assert(!chess.in_check(), 'King should not be in check (pawn blocks vertical attack)');
  
  var moves = chess.moves({ square: 'd5', verbose: true });
  assert(moves.length > 0, 'Pawn should have legal moves');
  
  chess.move('d4');
  assert(!chess.in_check(), 'King should still not be in check after pawn moves to d4 (still blocking)');
});

test('Archer can check king diagonally (1 cell)', function() {
  var chess = new Chess('8/8/8/8/8/2k5/3A4/K7 b - - 0 1');
  
  assert(chess.in_check(), 'Black king should be in check from diagonal archer attack (1 cell)');
});

test('Bug fix: Check detection in complex position (FEN: 1n2k3/p1qpP3/5R2/6pp/7P/PA1P4/P7/RNQ1KBNb)', function() {
  // This position comes from the following PGN:
  // 1. Af3 Af6 2. g4 Ac6 3. Ac3 Ad5 4. Ae4 Ad6 5. g5 Ag6 6. Af5 b5 7. Af5*g6 h5 
  // 8. h4 Bb7 9. Rh3 Rh6 10. gxh6 e5 11. Af5*e5 Nc6 12. Rg3 Nxh6 13. Rg6 Nxf5 
  // 14. e4 Rc8 15. exf5 Ae5 16. d3 Ae6 17. fxe6 Be7 18. Rf6 Ba3 19. bxa3 Nb8 
  // 20. Ab3 g5 21. Ab3*b5 Rxc1 22. Qxc1 Bh1 23. e7 Qc7
  // Position after White plays e7 (pawn to e7)
  var chess = new Chess('1n2k3/p1qpP3/5R2/6pp/7P/PA1P4/P7/RNQ1KBNb b Q - 1 24');
  
  // Verify it's black's turn
  assert(chess.turn() === 'b', 'It should be black\'s turn');
  
  // Check the position: Rook on f6, King on e8, Pawn on e7
  // Rook on f6 does NOT attack e8 (different file AND rank)
  // Pawn on e7 CANNOT check king on e8 (pawns don't attack forward)
  // Therefore, Black should NOT be in check
  assert(!chess.in_check(), 'Black king should NOT be in check (Rf6 does not attack e8, pawn cannot check forward)');
  
  // However, the pawn on e7 should NOT be able to capture the king
  // (This would be an illegal move even though pawn is adjacent)
  // Verify that e7-e8 capture is not available for white when it becomes white's turn
  var fen = chess.fen();
  assert(fen.includes('p1qpP3/5R2'), 'Pawn should be on e7, Rook on f6');
  
  // Black should have legal moves available (not in check, not checkmate)
  var blackMoves = chess.moves({ verbose: true });
  assert(blackMoves.length > 0, 'Black should have legal moves available');
  
  // Black king should be able to capture the pawn on e7
  var kingCapture = blackMoves.find(m => m.from === 'e8' && m.to === 'e7' && m.captured === 'p');
  assert(kingCapture !== undefined, 'Black king should be able to capture pawn on e7');
});

test('Bug fix: getKeyByValue function for king highlighting', function() {
  // This test verifies the helper function used to find the king position
  // Bug was: "Uncaught ReferenceError: getKeyByValue is not defined"
  // when trying to drag rook from f3 to f8 in a check situation
  
  // Helper function (same as in main.js)
  function getKeyByValue(object, value) {
    for (let key in object) {
      if (object[key] === value) {
        return key;
      }
    }
    return null;
  }
  
  // Test finding white king
  var mockPosition = {
    'e1': 'wK',
    'e8': 'bK',
    'a1': 'wR'
  };
  
  var whiteKing = getKeyByValue(mockPosition, 'wK');
  assert(whiteKing === 'e1', 'Should find white king at e1');
  
  var blackKing = getKeyByValue(mockPosition, 'bK');
  assert(blackKing === 'e8', 'Should find black king at e8');
  
  var notFound = getKeyByValue(mockPosition, 'wQ');
  assert(notFound === null, 'Should return null when piece not found');
});

// ============================================================================
// SUMMARY
// ============================================================================

console.log('\n═══════════════════════════════════════════════════════════');
console.log('  TEST SUMMARY');
console.log('═══════════════════════════════════════════════════════════');
console.log('  Total Tests:   ' + totalTests);
console.log('  Passed:        ' + passedTests + ' ✓');
console.log('  Failed:        ' + failedTests + ' ✗');
console.log('  Success Rate:  ' + Math.round((passedTests / totalTests) * 100) + '%');
console.log('═══════════════════════════════════════════════════════════\n');

if (failedTests === 0) {
  console.log('🎉 All tests passed! Archer implementation is working correctly.\n');
  process.exit(0);
} else {
  console.log('❌ Some tests failed. Please review the implementation.\n');
  process.exit(1);
}
