# Archerss - Chess with Archer Pieces

A modified chess game that introduces a new piece called the **ARCHER**.

## The ARCHER Piece

The ARCHER is a unique chess piece with the following characteristics:

- **Symbol**: `a` (lowercase for black, `A` for uppercase white)
- **Movement**: Moves like a KING - one square in any direction (horizontally, vertically, or diagonally)
- **Special Property**: **Cannot capture any pieces** - the archer can only move to empty squares
- **Attack**: Does not attack/threaten any squares, so enemy pieces (including kings) can safely stand adjacent to archers

### Starting Positions

- **White Archers**: C2 and F2
- **Black Archers**: C7 and F7

## Initial Board Setup

```
8 | r n b q k b n r
7 | p p a p p a p p
6 | . . . . . . . .
5 | . . . . . . . .
4 | . . . . . . . .
3 | . . . . . . . .
2 | P P A P P A P P
1 | R N B Q K B N R
  +----------------
    a b c d e f g h
```

FEN Notation: `rnbqkbnr/ppappapp/8/8/8/8/PPAPPAPP/RNBQKBNR w KQkq - 0 1`

## Implementation Details

### Changes Made to chess.js

1. **Added ARCHER constant** (after KING definition)
   ```javascript
   var ARCHER = 'a';
   ```

2. **Updated SYMBOLS string**
   ```javascript
   var SYMBOLS = 'pnbrqkaPNBRQKA';
   ```

3. **Modified DEFAULT_POSITION**
   - Changed from standard chess starting position
   - Archers replace pawns at c2, f2, c7, and f7

4. **Added ARCHER to PIECE_OFFSETS**
   ```javascript
   a: [-17, -16, -15, 1, 17, 16, 15, -1]
   ```
   (Same movement pattern as king)

5. **Added ARCHER to SHIFTS mapping**
   ```javascript
   { p: 0, n: 1, b: 2, r: 3, q: 4, k: 5, a: 6 }
   ```

6. **Updated FEN validation regex**
   - Changed from `/^[prnbqkPRNBQK]$/`
   - To `/^[prnbqkaPRNBRQKA]$/`

7. **Modified move generation logic**
   - Added condition to prevent ARCHER from capturing pieces
   - Added ARCHER to single-square movement pieces (like knight and king)

8. **Modified attack detection**
   - Added check to skip archers when determining attacked squares
   - This allows enemy kings to stand adjacent to archers

### Changes Made to chessboard-1.0.0.js

1. **Updated `validPieceCode()` function**
   - Modified regex from `/^[bw][KQRNBP]$/` to `/^[bw][KQRNBPA]$/`
   - Now accepts 'wA' (white archer) and 'bA' (black archer) as valid piece codes

2. **Updated `validFen()` function**
   - Modified regex from `/[^kqrnbpKQRNBP1]/` to `/[^kqrnbpaKQRNBPA1]/`
   - FEN strings can now include 'a' and 'A' characters for archer pieces

3. **Updated spare pieces**
   - Modified spare pieces array from `'KQRNBP'` to `'KQRNBPA'`
   - Archers now available in piece palette when using spare pieces mode

4. **Updated `buildSparePiecesHTML()` function**
   - Added 'wA' and 'bA' to the pieces arrays
   - Spare archers can be dragged onto the board

### Changes Made to index.html

1. **Legal Move Highlighting**
   - `highlightPossibleMoves()` function highlights all legal moves for a selected piece
   - `onMouseoverSquare()` shows legal moves when hovering over pieces
   - `onMouseoutSquare()` removes highlights when mouse leaves
   - Uses CSS class `highlight-possible-move` for visual feedback

2. **Move Validation**
   - Integrates chess.js move validation with chessboard.js visual interface
   - Prevents illegal moves with snapback animation
   - Updates game state only after legal moves

3. **Archer Support**
   - Custom piece theme function loads archer images (wA.png, bA.png)
   - Board initialized with FEN containing archer pieces
   - Full drag-and-drop support for archer pieces

## Project Structure

```
archerss/
├── docs/
│   ├── chess.js                    # Modified chess.js library with ARCHER piece
│   ├── chessboard-1.0.0.js         # Modified chessboard.js to accept ARCHER pieces
│   ├── index.html                  # Web interface with legal move highlighting
│   ├── server.js                   # Simple Node.js web server
│   ├── test_archer.js              # Test suite for ARCHER functionality
│   ├── css/
│   │   └── chessboard-1.0.0.css    # Chessboard styling
│   └── img/
│       └── chesspieces/
│           └── wikipedia/
│               ├── wA.png          # White archer image
│               ├── bA.png          # Black archer image
│               └── ...             # Other piece images
└── README.md
```

## Getting Started

### Prerequisites

- Node.js installed on your system

### Running the Game

1. Navigate to the docs directory:
   ```bash
   cd docs
   ```

2. Start the server:
   ```bash
   node server.js
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000/
   ```

### Running Tests

To verify the ARCHER piece implementation:

```bash
node docs/test_archer.js
```

Expected output:
```
Testing ARCHER piece...

Test 1 - Initial Position: PASS ✓
Test 2 - Archer Movement: PASS ✓
Test 3 - Archer Cannot Capture: PASS ✓
Test 4 - Archer Moves to Empty Squares: PASS ✓
Test 5 - Archer Does Not Attack: PASS ✓

All tests completed!
```

## Game Rules

All standard chess rules apply, with the addition of the ARCHER pieces:

- Archers move one square in any direction (like kings)
- Archers cannot capture enemy pieces
- Archers do not threaten or attack any squares
- Enemy pieces can safely occupy squares adjacent to archers
- Archers can be captured by enemy pieces
- The goal remains to checkmate the opponent's king

## Game Features

### Visual Enhancements

- **Legal Move Highlighting**: When you hover over or drag a piece, all legal moves for that piece are highlighted on the board
- **Interactive Drag and Drop**: Drag pieces to move them, with automatic validation
- **Real-time Status Updates**: Current game state, FEN notation, and PGN are displayed and updated after each move
- **Move Validation**: Illegal moves are automatically rejected with a "snapback" animation

### Archer-Specific Behavior

- Archers show king-like movement patterns when highlighted (8 adjacent squares)
- Archers cannot move to squares occupied by enemy pieces (no capture highlighting)
- Empty squares around the archer are highlighted as valid moves
- Enemy pieces adjacent to archers are not threatened and can move freely

## Technical Notes

- Based on chess.js library by Jeff Hlywa
- Uses modified chessboard.js for the visual board interface with archer support
- Piece images are from Wikipedia chess piece set
- Current archer images use knight placeholders (can be replaced with custom artwork)
- Legal move highlighting implemented using CSS and chess.js move generation
- Fully interactive drag-and-drop interface with move validation

## Future Enhancements

- [ ] Create custom archer piece artwork
- [ ] Add move history with archer notation
- [ ] Add AI opponent support
- [ ] Add game analysis features
- [ ] Add multiplayer support
- [ ] Add archer-specific tactical puzzles

## License

Based on chess.js which is released under the BSD license.

## Credits

- chess.js library by Jeff Hlywa
- chessboard.js by Chris Oakman
- Chess piece images from Wikimedia Commons
- ARCHER piece concept and implementation
