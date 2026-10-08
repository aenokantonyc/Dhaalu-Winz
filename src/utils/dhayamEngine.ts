import { DhayamDiceResult, PieceState, PlayerColor } from '../types/game';

// 7x7 Dhayam Board representation
// Outer loop: 24 squares
// Inner loop: 16 squares
// Center: (3,3) Pazham

export interface DhayamSquare {
  x: number; // 0..6
  y: number; // 0..6
  isSafe: boolean; // Malai (cross mark)
  isPazham: boolean; // Center fruit
  label?: string;
}

// 7x7 Board safe squares:
// Outer midpoints (entry squares): (3,0) Red, (6,3) Green, (3,6) Yellow, (0,3) Blue
// Outer corners: (0,0), (6,0), (6,6), (0,6)
// Inner midpoints: (3,1), (5,3), (3,5), (1,3)
// Center: (3,3)
export const DHAYAM_SAFE_COORDINATES = new Set([
  '3,0', '6,3', '3,6', '0,3', // Entry safe squares
  '0,0', '6,0', '6,6', '0,6', // Corner safe squares
  '3,1', '5,3', '3,5', '1,3', // Inner ring safe squares
  '3,3' // Center Pazham
]);

export function isDhayamSafe(x: number, y: number): boolean {
  return DHAYAM_SAFE_COORDINATES.has(`${x},${y}`);
}

// Generate the coordinate path for each player color.
// Players start at their home safe entry:
// Red: (3,0)
// Green: (6,3)
// Yellow: (3,6)
// Blue: (0,3)

const OUTER_TRACK_COORDS: { x: number; y: number }[] = [
  // Top edge going right
  { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 },
  // Right edge going down
  { x: 6, y: 1 }, { x: 6, y: 2 }, { x: 6, y: 3 }, { x: 6, y: 4 }, { x: 6, y: 5 }, { x: 6, y: 6 },
  // Bottom edge going left
  { x: 5, y: 6 }, { x: 4, y: 6 }, { x: 3, y: 6 }, { x: 2, y: 6 }, { x: 1, y: 6 }, { x: 0, y: 6 },
  // Left edge going up
  { x: 0, y: 5 }, { x: 0, y: 4 }, { x: 0, y: 3 }, { x: 0, y: 2 }, { x: 0, y: 1 }, { x: 0, y: 0 },
  // Top edge finishing loop
  { x: 1, y: 0 }, { x: 2, y: 0 },
];

const INNER_TRACK_COORDS: { x: number; y: number }[] = [
  // Inner ring starting near (3,1)
  { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 },
  { x: 5, y: 2 }, { x: 5, y: 3 }, { x: 5, y: 4 }, { x: 5, y: 5 },
  { x: 4, y: 5 }, { x: 3, y: 5 }, { x: 2, y: 5 }, { x: 1, y: 5 },
  { x: 1, y: 4 }, { x: 1, y: 3 }, { x: 1, y: 2 }, { x: 1, y: 1 },
  { x: 2, y: 1 },
];

const PAZHAM_COORD = { x: 3, y: 3 };

// Calculate player-relative path
export function getDhayamPathForColor(color: PlayerColor): { x: number; y: number }[] {
  let startIndex = 0;
  if (color === 'red') startIndex = 0; // (3,0)
  else if (color === 'green') startIndex = 6; // (6,3)
  else if (color === 'yellow') startIndex = 12; // (3,6)
  else if (color === 'blue') startIndex = 18; // (0,3)

  const outerRotated: { x: number; y: number }[] = [];
  for (let i = 0; i < 24; i++) {
    outerRotated.push(OUTER_TRACK_COORDS[(startIndex + i) % 24]);
  }

  // Inner track offset
  let innerStartIndex = 0;
  if (color === 'red') innerStartIndex = 0; // (3,1)
  else if (color === 'green') innerStartIndex = 4; // (5,3)
  else if (color === 'yellow') innerStartIndex = 8; // (3,5)
  else if (color === 'blue') innerStartIndex = 12; // (1,3)

  const innerRotated: { x: number; y: number }[] = [];
  for (let i = 0; i < 16; i++) {
    innerRotated.push(INNER_TRACK_COORDS[(innerStartIndex + i) % 16]);
  }

  // Full path: outer track (24) -> inner track (16) -> Pazham (1) = 41 total positions (index 0 to 40)
  return [...outerRotated, ...innerRotated, PAZHAM_COORD];
}

export function rollDhayamDice(): DhayamDiceResult {
  // Faces: 0, 1, 2, 3
  const die1 = Math.floor(Math.random() * 4);
  const die2 = Math.floor(Math.random() * 4);

  let total: number;
  let isDhayam = false;
  let extraTurn = false;

  // Traditional Tamil Dhayam rules:
  // 0 + 1 or 1 + 0 = 1 (Dhayam) -> extra roll
  // 0 + 0 = 12 (Dhayam 12) -> extra roll
  // Other sums:
  // 1+1=2, 1+2=3, 2+2=4, 2+3=5 (extra roll), 3+3=6 (extra roll)
  if ((die1 === 0 && die2 === 1) || (die1 === 1 && die2 === 0)) {
    total = 1;
    isDhayam = true;
    extraTurn = true;
  } else if (die1 === 0 && die2 === 0) {
    total = 12;
    extraTurn = true;
  } else {
    total = die1 + die2;
    // In traditional play, rolls of 1, 5, 6, 12 grant an extra roll
    if (total === 1 || total === 5 || total === 6 || total === 12) {
      extraTurn = true;
    }
  }

  return { die1, die2, total, isDhayam, extraTurn };
}

// Get valid pieces that can be moved with the given roll
export function getDhayamValidMoves(
  pieces: PieceState[],
  playerId: string,
  dice: DhayamDiceResult
): number[] {
  const validPieceIds: number[] = [];
  const playerPieces = pieces.filter(p => p.playerId === playerId);

  for (const piece of playerPieces) {
    if (piece.isFinished) continue;

    // Piece is at base
    if (piece.step === -1) {
      // Must roll Dhayam (1) to enter the board!
      if (dice.isDhayam) {
        validPieceIds.push(piece.id);
      }
    } else {
      // Piece is already on board
      const newStep = piece.step + dice.total;
      const MAX_STEP = 40; // index of Pazham
      if (newStep <= MAX_STEP) {
        validPieceIds.push(piece.id);
      }
    }
  }

  return validPieceIds;
}

// Coordinate of a piece
export function getDhayamPieceCoords(
  piece: PieceState
): { x: number; y: number } | null {
  if (piece.step === -1) return null; // In base
  const path = getDhayamPathForColor(piece.playerColor);
  if (piece.step >= path.length) return PAZHAM_COORD;
  return path[piece.step];
}
