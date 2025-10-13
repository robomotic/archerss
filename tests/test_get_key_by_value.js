#!/usr/bin/env node
/**
 * Test for getKeyByValue helper function
 */

// Simulate the getKeyByValue function
function getKeyByValue(object, value) {
  for (let key in object) {
    if (object[key] === value) {
      return key;
    }
  }
  return null;
}

// Test cases
console.log('Testing getKeyByValue function...\n');

// Test 1: Find white king
let position1 = {
  'a1': 'wR',
  'e1': 'wK',
  'h1': 'wR',
  'e8': 'bK'
};

let whiteKingPos = getKeyByValue(position1, 'wK');
console.log('Test 1 - Find white king:');
console.log('  Expected: e1');
console.log('  Got:', whiteKingPos);
console.log('  Result:', whiteKingPos === 'e1' ? '✓ PASS' : '✗ FAIL');
console.log('');

// Test 2: Find black king
let blackKingPos = getKeyByValue(position1, 'bK');
console.log('Test 2 - Find black king:');
console.log('  Expected: e8');
console.log('  Got:', blackKingPos);
console.log('  Result:', blackKingPos === 'e8' ? '✓ PASS' : '✗ FAIL');
console.log('');

// Test 3: Piece not found
let notFound = getKeyByValue(position1, 'wQ');
console.log('Test 3 - Piece not found:');
console.log('  Expected: null');
console.log('  Got:', notFound);
console.log('  Result:', notFound === null ? '✓ PASS' : '✗ FAIL');
console.log('');

// Test 4: Complex board position with check scenario
let complexPosition = {
  'a8': 'bN',
  'e8': 'bK',
  'a7': 'bP',
  'c7': 'bQ',
  'd7': 'bP',
  'e7': 'wP',
  'f6': 'wR',
  'g5': 'bP',
  'h5': 'bP',
  'h4': 'wP',
  'a3': 'wP',
  'd3': 'wP',
  'a2': 'wP',
  'a1': 'wR',
  'b1': 'wN',
  'c1': 'wQ',
  'e1': 'wK',
  'f1': 'wB',
  'g1': 'wN',
  'h1': 'bB'
};

let blackKingInCheck = getKeyByValue(complexPosition, 'bK');
console.log('Test 4 - Find black king in complex position:');
console.log('  Expected: e8');
console.log('  Got:', blackKingInCheck);
console.log('  Result:', blackKingInCheck === 'e8' ? '✓ PASS' : '✗ FAIL');
console.log('');

console.log('All tests completed!');
