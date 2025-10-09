/*
 * Archerss - Chess with Archer Pieces
 * Copyright (c) 2025 Paolo Di Prodi
 * 
 * "Archerss" is a trademark of Paolo Di Prodi
 * Non-commercial use: MIT License
 * Commercial use: Permission required - paolo.diprodi@gmail.com
 * 
 * Based on chess.js by Jeff Hlywa (BSD License)
 * and chessboard.js by Chris Oakman (MIT License)
 */

// --- Begin Example JS --------------------------------------------------------
// NOTE: this example uses the chess.js library:
// https://github.com/jhlywa/chess.js

var board = null
var game = new Chess()
var $status = $('#status')
var $turn = $('#turn')
var $fen = $('#fen')
var $pgn = $('#pgn')

// Archer starting position FEN (matches the DEFAULT_POSITION in chess.js)
const ARCHER_START_FEN = 'rnbqkbnr/ppappapp/8/8/8/8/PPAPPAPP/RNBQKBNR w KQkq - 0 1'

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
function getBoardAs2DArray() {
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

function getBestMove(){
  let possibleMoves = game.moves()

  if (possibleMoves.length === 0) return

  // initialize best eval and move for current player
  let bestMoves = [];
  let worstPossibleEval;
  if (game.turn() == 'w') {
    worstPossibleEval = -9999
  } else {
    worstPossibleEval = 9999
  }
  let bestEval = worstPossibleEval;

  // find move with best evalation for current player
  for (let i = 0; i < possibleMoves.length; i++) {
    let newMove = possibleMoves[i];
    let newMoveEval;

    // get evaluation of game after making move
    game.move(newMove);
    if (game.in_checkmate()) {
      newMoveEval = -worstPossibleEval //maximize score
    } else if (game.in_draw()){
      newMoveEval = 0;
    } else {
      newMoveEval = evaluateBoard(getBoardAs2DArray());
    }
    game.undo()

    // if same score, add to list of options
    if (newMoveEval == bestEval) {
      bestMoves.push(newMove)
    }

    // if greater (or less) than bestEval, replace bestMoves
    if (game.turn() == 'w' && newMoveEval > bestEval) {
      bestMoves = [newMove]
      bestEval = newMoveEval
    } else if (game.turn() == 'b' && newMoveEval < bestEval) {
      bestMoves = [newMove]
      bestEval = newMoveEval
    }
  }

  // finally, return random choice from among bestMoves
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

function makeBestMove(){
  console.log('=== makeBestMove called ===')
  
  // Get all possible moves with their evaluations for debugging
  let possibleMoves = game.moves()
  let moveEvaluations = []
  
  let worstPossibleEval = game.turn() == 'w' ? -9999 : 9999
  
  for (let i = 0; i < possibleMoves.length; i++) {
    let move = possibleMoves[i]
    let moveEval
    
    game.move(move)
    if (game.in_checkmate()) {
      moveEval = -worstPossibleEval
    } else if (game.in_draw()) {
      moveEval = 0
    } else {
      moveEval = evaluateBoard(getBoardAs2DArray())
    }
    game.undo()
    
    moveEvaluations.push({ move: move, eval: moveEval })
  }
  
  // Sort moves by evaluation (best first)
  moveEvaluations.sort((a, b) => {
    if (game.turn() == 'w') {
      return b.eval - a.eval // White wants higher eval
    } else {
      return a.eval - b.eval // Black wants lower eval
    }
  })
  
  // Log top 5 best moves
  console.log('Top 5 best moves:')
  for (let i = 0; i < Math.min(5, moveEvaluations.length); i++) {
    console.log(`${i + 1}. ${moveEvaluations[i].move} (eval: ${moveEvaluations[i].eval})`)
  }
  
  let bestMove = getBestMove()

  if (bestMove == null) {
    console.log('No best move found (game over)')
    return
  }

  // Get detailed move information
  let moveDetails = game.moves({ verbose: true }).find(m => m.san === bestMove || m.from + m.to === bestMove)
  
  if (moveDetails) {
    let pieceNames = {
      'p': 'Pawn',
      'n': 'Knight',
      'b': 'Bishop',
      'r': 'Rook',
      'q': 'Queen',
      'k': 'King',
      'a': 'Archer'
    }
    let pieceName = pieceNames[moveDetails.piece] || moveDetails.piece
    let color = moveDetails.color === 'w' ? 'White' : 'Black'
    
    console.log(`Selected move: ${bestMove}`)
    console.log(`Piece selected: ${color} ${pieceName} from ${moveDetails.from} to ${moveDetails.to}`)
    console.log(`Move evaluation: ${moveEvaluations.find(m => m.move === bestMove)?.eval}`)
  } else {
    console.log(`Selected move: ${bestMove}`)
    console.log(`Move evaluation: ${moveEvaluations.find(m => m.move === bestMove)?.eval}`)
  }

  game.move(bestMove);
  board.position(game.fen())
  removeRedSquares();
  updateStatus();
}


function redSquare(square){
  let $square = $('#board .square-' + square)

  $square.addClass('highlight-red-check')
}

function removeRedSquares(){
  $('#board .square-55d63').removeClass('highlight-red-check')
}

function removeHighlights () {
  $('#myBoard .square-55d63').removeClass('highlight-possible-move')
}

function highlightPossibleMoves (square) {
  console.log('=== highlightPossibleMoves called ===')
  console.log('Square:', square)
  
  // Check what piece is actually on this square
  var pieceOnSquare = game.get(square)
  console.log('Piece on square from game.get():', pieceOnSquare)
  
  // get list of possible moves for this square
  var moves = game.moves({
    square: square,
    verbose: true
  })

  console.log('Number of legal moves:', moves.length)
  console.log('Legal moves:', moves)

  // exit if there are no moves available for this square
  if (moves.length === 0) return

  // highlight the possible squares for this piece
  for (var i = 0; i < moves.length; i++) {
    console.log('Highlighting square:', moves[i].to)
    $('#myBoard .square-' + moves[i].to).addClass('highlight-possible-move')
  }
}

function onDragStart (source, piece, position, orientation) {
  console.log('=== onDragStart called ===')
  console.log('Source square:', source)
  console.log('Piece parameter:', piece)
  console.log('Current turn:', game.turn())
  console.log('Current FEN:', game.fen())
  
  // do not pick up pieces if the game is over
  if (game.game_over()) return false

  // only pick up pieces for the side to move
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false
  }

  // highlight possible moves
  highlightPossibleMoves(source)
}

function makeRandomMove(){
  let possibleMoves = game.moves();

  // game over
  if (possibleMoves.length === 0) return

  let randomIdx = Math.floor(Math.random() * possibleMoves.length);
  game.move(possibleMoves[randomIdx]);
  board.position(game.fen());
  removeRedSquares();
  updateStatus();
}

function onDrop (source, target) {
  console.log('=== onDrop called ===')
  console.log('Source:', source)
  console.log('Target:', target)
  
  // remove highlights
  removeHighlights()

  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  console.log('Move result:', move)

  // illegal move
  if (move === null) {
    console.log('Move was ILLEGAL - snapback')
    return 'snapback'
  }

  console.log('Move was LEGAL')
  removeRedSquares()
  updateStatus()

  // make random legal move for black only if Random CPU mode is enabled
  if ($('#randomCpuMode').is(':checked')) {
    window.setTimeout(makeRandomMove, 250);
  }
  // if user has selected greedy CPU mode
    if ($('#greedyCpuMode').is(':checked')) {
    window.setTimeout(makeBestMove, 250);
  }
}

function onMouseoverSquare (square, piece) {
  //console.log('=== onMouseoverSquare called ===')
  //console.log('Square:', square)
  //console.log('Piece parameter:', piece)
  
  // get list of possible moves for this square
  var moves = game.moves({
    square: square,
    verbose: true
  })

  //console.log('Moves for hover:', moves)

  // exit if there are no moves available for this square
  if (moves.length === 0) return

  // highlight the square they moused over
  $('#myBoard .square-' + square).addClass('highlight-possible-move')

  // highlight the possible squares for this piece
  for (var i = 0; i < moves.length; i++) {
    $('#myBoard .square-' + moves[i].to).addClass('highlight-possible-move')
  }
}

function onMouseoutSquare (square, piece) {
  removeHighlights()
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  board.position(game.fen())
}

function updateStatus () {
  var status = ''
  var turn = ''

  var moveColor = 'White'

  let prevColor = (game.turn() === 'w') ? "Black" : "White";

  if (game.turn() === 'b') {
    moveColor = 'Black'
  }

  // Set the turn display
  turn = moveColor

  // checkmate?
  if (game.in_checkmate()) {
    status = 'Game over, ' + moveColor + ' is in checkmate.'
    turn = 'Game Over'
  }
  else if (game.in_stalemate()) {
    status =  "Draw by stalemate."
    turn = 'Game Over'
  }
  else if (game.in_threefold_repetition()){
    status = "Draw by threefold repetition."
    turn = 'Game Over'
  }
  else if (game.insufficient_material()){
    status = "Draw by insufficient material."
    turn = 'Game Over'
  }
  // draw?
  else if (game.in_draw()) {
    status = 'Game over, drawn position'
    turn = 'Game Over'
  }
  // game still on
  else {
    status = 'Game in progress'

    // check?
    if (game.in_check()) {
      status = moveColor + ' is in check'
        let kingPosition = getKeyByValue(board.position(), game.turn() + 'K')
        redSquare(kingPosition);
    }
  }

  $status.html(status)
  $turn.html(turn)
  $fen.html(game.fen())
  $pgn.html(game.pgn())
}

function pieceTheme (piece) {
  // Custom path for all pieces including archers
  return 'img/chesspieces/wikipedia/' + piece + '.png'
}

// Initialize the board
function initBoard() {
  var config = {
    draggable: true,
    position: game.fen(), // Use the FEN from our modified Chess game with archers
    pieceTheme: pieceTheme,
    onDragStart: onDragStart,
    onDrop: onDrop,
    onMouseoutSquare: onMouseoutSquare,
    onMouseoverSquare: onMouseoverSquare,
    onSnapEnd: onSnapEnd
  }

  board = Chessboard('myBoard', config)
  updateStatus()
}

// Initialize when DOM is ready
$(document).ready(function() {
  initBoard()

  // Make Random CPU and Greedy CPU modes mutually exclusive
  $('#randomCpuMode').on('change', function() {
    if ($(this).is(':checked')) {
      $('#greedyCpuMode').prop('checked', false)
    }
  })

  $('#greedyCpuMode').on('change', function() {
    if ($(this).is(':checked')) {
      $('#randomCpuMode').prop('checked', false)
    }
  })

  $('#resetButton').on('click', function(){
    // Reset the game state to the archer starting position
    game.load(ARCHER_START_FEN)
    
    // Reset the board to starting position with archers
    board.position(ARCHER_START_FEN)
    
    // Clear any red square highlights
    removeRedSquares()
    
    // Update the status display
    updateStatus()
  })
})
// --- End Example JS ----------------------------------------------------------
