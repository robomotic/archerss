# Archerss - Quick Reference Guide

## 🏹 The ARCHER Piece

### Movement
- Moves **1 square** in any direction (like a king)
- Can only move to **empty squares**
- Cannot capture by moving

### Ranged Attacks
- **1 cell**: All 8 adjacent squares (↑ ↗ → ↘ ↓ ↙ ← ↖)
  - Cannot be blocked
- **2 cells**: Vertical only (↑↑ or ↓↓)
  - Can be blocked by piece in between

### Special Properties
- Archer **stays in position** after attacking
- Uses `*` notation for attacks (e.g., `Ac2*e5`)
- **CAN put king in check**
- **CAN deliver checkmate**

### Starting Position
```
8 | r n b q k b n r
7 | p p a p p a p p    ← Black archers at c7, f7
6 | . . . . . . . .
5 | . . . . . . . .
4 | . . . . . . . .
3 | . . . . . . . .
2 | P P A P P A P P    ← White archers at c2, f2
1 | R N B Q K B N R
  +----------------
    a b c d e f g h
```

## 🎮 Quick Start

### Run the Game
```bash
npm start
# or
node docs/server.js
```
Open: http://localhost:3000/

### Run Tests
```bash
npm test
# or
node tests/archer_tests.js
```

## 📋 Attack Range Examples

### Example 1: Adjacent Attacks (1 cell)
```
Archer at d4 can attack:
c5 c4 c3
d5  A d3
e5 e4 e3
```

### Example 2: Vertical Attacks (2 cells)
```
Archer at d4 can attack:
. . d6 . .  ← 2 cells up
. . d5 . .
. . d4 . .  ← Archer position
. . d3 . .
. . d2 . .  ← 2 cells down
```

### Example 3: Combined Range
```
Full attack range for archer at d4:

6 . . X . .  ← 2 cells up
5 . X X X .  ← 1 cell diagonal/horizontal
4 . X A X .  ← Archer position
3 . X X X .  ← 1 cell diagonal/horizontal
2 . . X . .  ← 2 cells down

Total: 10 possible attack squares
```

## ♔ Check & Checkmate

### Check Example
```
Position:          Archer checks king
. . . . .          . . . . .
. . k . .    →     . . k . . ← King in check!
. . . . .          . . . . .
. A . . .          . A . . . ← Archer at d4
. . . . .          . . . . .

King must move, block, or capture archer
```

### Checkmate Example
```
Position:              Result:
6 . . . A k          King is checkmated!
5 . . . Q p p        - Archer checks from g6
4 . . . . . .        - Queen protects archer
3 . . . . . .        - Pawns block escape
2 . . . . . .        - No legal moves
1 K . . . . .        

White wins!
```

### Blocking Example
```
Position:              Result:
. . . k . .          King NOT in check
. . . p . .   →      Pawn blocks 2-cell
. . . . . .          vertical attack
. . . A . .          

If pawn moves: King is in check!
```

## 🎯 Strategy Tips

### Offensive
- Position archers **2 ranks** behind enemy lines
- Attack **pawns** to open king position
- Combine with other pieces for checkmate
- Use **1-cell attacks** (can't be blocked)

### Defensive
- Keep **distance** from enemy archers
- Use pieces as **shields** for 2-cell attacks
- Remember: **1-cell attacks can't be blocked**
- Protect your king at all times

### Tactical Patterns
1. **Back Rank Sniper**: Archer 2 cells from back rank
2. **King Hunt**: Archer + pieces chase king
3. **Pawn Breaker**: Remove defending pawns
4. **Defensive Anchor**: Archer protects king area

## 📊 Test Coverage

### 22 Tests Total
- ✓ 5 Basic functionality tests
- ✓ 10 Ranged attack tests
- ✓ 7 Check/checkmate tests

### Run Tests
```bash
npm test
```

Expected: **22/22 passing (100%)**

## 📝 Notation

### Movement
```
Ac2-c3  → Archer moves from c2 to c3
Ae5     → Archer moves to e5 (short form)
```

### Ranged Attack
```
Ac2*e2  → Archer at c2 attacks piece at e2
Af7*f5+ → Archer attacks with check
Ag3*h3# → Archer attacks with checkmate
```

## 🗂️ Project Files

```
archerss/
├── docs/
│   ├── chess.js        ← Core engine
│   ├── index.html      ← Main game
│   ├── demo.html       ← Demo scenarios
│   └── server.js       ← Web server
├── tests/
│   └── archer_tests.js ← Test suite
└── package.json        ← npm config
```

## 🔗 Quick Links

- **Play**: `npm start` → http://localhost:3000/
- **Test**: `npm test`
- **Docs**: See README.md
- **Implementation**: See FINAL_IMPLEMENTATION.md

---

**Version**: 1.2.0  
**Status**: Complete & Tested ✓  
**Tests**: 22/22 passing (100%)
