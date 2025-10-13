#!/usr/bin/env node
/**
 * Debug script to investigate the check detection bug
 */

var Chess = require('../docs/chess.js').Chess;

console.log('═══════════════════════════════════════════════════════════');
console.log('  DEBUG: Rook Check Detection Bug');
console.log('═══════════════════════════════════════════════════════════\n');

// The problematic position
var chess = new Chess('1n2k3/p1qpP3/5R2/6pp/7P/PA1P4/P7/RNQ1KBNb b Q - 1 24');

console.log('FEN:', chess.fen());
console.log('Turn:', chess.turn() === 'w' ? 'White' : 'Black');
console.log('In Check:', chess.in_check());
console.log('In Checkmate:', chess.in_checkmate());
console.log('In Stalemate:', chess.in_stalemate());
console.log('Game Over:', chess.game_over());
console.log('');

// Get all legal moves for black
var moves = chess.moves({ verbose: true });
console.log('Number of legal moves for Black:', moves.length);
console.log('');

if (moves.length > 0) {
  console.log('Available moves:');
  moves.forEach(function(move) {
    console.log('  -', move.san, 'from', move.from, 'to', move.to, '(piece:', move.piece + ')');
  });
} else {
  console.log('No legal moves available!');
}

console.log('\n─────────────────────────────────────────────────────────');
console.log('Analyzing the position:');
console.log('─────────────────────────────────────────────────────────');
console.log('White Rook on f6');
console.log('Black King on e8');
console.log('White Pawn on e7');
console.log('');
console.log('The Rook on f6 should be attacking e8 horizontally (along rank 6? No...)');
console.log('Wait - Rook is on f6, King is on e8...');
console.log('  - f6 to e8: Not same rank (6 vs 8), not same file (f vs e)');
console.log('  - This is NOT a valid rook attack!');
console.log('');
console.log('Let me check what pieces can actually attack e8:');

// Manually check which pieces might be giving check
var board = chess.board();
console.log('\nBoard:');
for (var i = 0; i < 8; i++) {
  var row = [];
  for (var j = 0; j < 8; j++) {
    var square = board[i][j];
    if (square === null) {
      row.push('.');
    } else {
      var piece = square.type.toUpperCase();
      if (square.color === 'b') piece = piece.toLowerCase();
      row.push(piece);
    }
  }
  console.log((8-i) + ' ' + row.join(' '));
}
console.log('  a b c d e f g h');

console.log('\n═══════════════════════════════════════════════════════════\n');
