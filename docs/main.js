// --- Begin Example JS --------------------------------------------------------
// NOTE: this example uses the chess.js library:
// https://github.com/jhlywa/chess.js

var board = null
var game = new Chess()
var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')

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
  updateStatus()
}

function onMouseoverSquare (square, piece) {
  console.log('=== onMouseoverSquare called ===')
  console.log('Square:', square)
  console.log('Piece parameter:', piece)
  
  // get list of possible moves for this square
  var moves = game.moves({
    square: square,
    verbose: true
  })

  console.log('Moves for hover:', moves)

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

  var moveColor = 'White'

  let prevColor = (game.turn() === 'w') ? "Black" : "White";

  if (game.turn() === 'b') {
    moveColor = 'Black'
  }

  // checkmate?
  if (game.in_checkmate()) {
    status = 'Game over, ' + moveColor + ' is in checkmate.'
  }
  else if (game.in_stalemate()) {
    status =  "Draw by stalemate."
  }
  else if (game.in_threefold_repetition()){
    status = "Draw by threefold repetition."
  }
  else if (game.insufficient_material()){
    status = "Draw by insufficient material."
  }
  // draw?
  else if (game.in_draw()) {
    status = 'Game over, drawn position'
  }
  // game still on
  else {
    status = moveColor + ' to move'

    // check?
    if (game.in_check()) {
      status += ', ' + moveColor + ' is in check'
    }
  }

  $status.html(status)
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

  $('#resetButton').on('click', function(){
    // Reset the game state
    game.reset()
    
    // Reset the board to starting position
    board.start(false) // false means instant (no animation)
    
    // Update the status display
    updateStatus()
  })
})
// --- End Example JS ----------------------------------------------------------
