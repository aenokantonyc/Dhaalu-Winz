import { LudoCustomRules, LudoDiceResult, PieceState, PlayerColor } from '../types/game';

// 52 Outer track positions
// Red starts at 0, turns into home stretch at 50
// Green starts at 13, turns into home stretch at 11 (after loop)
// Yellow starts at 26, turns into home stretch at 24
// Blue starts at 39, turns into home stretch at 37

export const LUDO_SAFE_POSITIONS = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

export const COLOR_START_POSITIONS: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

export const TOTAL_STEPS_TO_FINISH = 56; // 0..50 main loop (51 steps), 51..55 home column (5 steps), 56 = Home!

export function rollLudoDice(rules: LudoCustomRules): LudoDiceResult {
  const value = Math.floor(Math.random() * 6) + 1; // 1..6
  const extraTurn = value === 1 && rules.extraTurnOnOne;
  return { value, extraTurn };
}

// Convert relative step (0..56) to absolute board square index or home column
// step = -1 : at base
// step = 0..50 : on outer 52-square track
// step = 51..55 : on player's colored home column
// step = 56 : finished at center home
export function getLudoTrackPosition(color: PlayerColor, step: number): {
  type: 'base' | 'track' | 'home_column' | 'goal';
  index: number;
} {
  if (step === -1) return { type: 'base', index: -1 };
  if (step >= TOTAL_STEPS_TO_FINISH) return { type: 'goal', index: 0 };
  if (step <= 50) {
    const startPos = COLOR_START_POSITIONS[color];
    const trackIndex = (startPos + step) % 52;
    return { type: 'track', index: trackIndex };
  }
  // 51..55 -> home column (0..4)
  return { type: 'home_column', index: step - 51 };
}

// Check if a move would be blocked by an opponent blockade
function isBlockedByOpponent(
  color: PlayerColor,
  currentStep: number,
  targetStep: number,
  pieces: PieceState[],
  rules: LudoCustomRules
): boolean {
  if (!rules.blockades) return false;

  // Check all intermediate and target track squares for 2+ opponent pieces
  for (let s = currentStep + 1; s <= targetStep; s++) {
    if (s > 50) break; // Home stretch is private to player
    const targetPos = getLudoTrackPosition(color, s);
    if (targetPos.type !== 'track') continue;

    // Count opponent pieces on this track square
    const piecesOnSquare = pieces.filter(
      p =>
        p.playerColor !== color &&
        !p.isFinished &&
        p.step >= 0 &&
        p.step <= 50 &&
        getLudoTrackPosition(p.playerColor, p.step).index === targetPos.index
    );

    if (piecesOnSquare.length >= 2) {
      // Formed blockade!
      return true;
    }
  }

  return false;
}

// Calculate valid moves for current player
export function getLudoValidMoves(
  pieces: PieceState[],
  playerId: string,
  color: PlayerColor,
  diceValue: number,
  rules: LudoCustomRules
): number[] {
  const playerPieces = pieces.filter(p => p.playerId === playerId);
  const validPieceIds: number[] = [];

  for (const piece of playerPieces) {
    if (piece.isFinished) continue;

    if (piece.step === -1) {
      // Must roll 1 to enter
      if (diceValue === 1) {
        // Can enter if start position is not blocked by opponent blockade
        const startTrackIndex = COLOR_START_POSITIONS[color];
        const opponentPiecesAtStart = pieces.filter(
          p =>
            p.playerColor !== color &&
            !p.isFinished &&
            p.step >= 0 &&
            p.step <= 50 &&
            getLudoTrackPosition(p.playerColor, p.step).index === startTrackIndex
        );
        if (!(rules.blockades && opponentPiecesAtStart.length >= 2)) {
          validPieceIds.push(piece.id);
        }
      }
    } else {
      const targetStep = piece.step + diceValue;
      if (targetStep <= TOTAL_STEPS_TO_FINISH) {
        // Check blockade
        if (!isBlockedByOpponent(color, piece.step, targetStep, pieces, rules)) {
          validPieceIds.push(piece.id);
        }
      }
    }
  }

  return validPieceIds;
}

// 15x15 standard Ludo coordinate mapping
// Coordinates: [col, row] from 0..14
// Outer 52 track squares:
export const LUDO_GRID_COORDINATES: { col: number; row: number }[] = [
  // 0..4 (Red arm going right)
  { col: 1, row: 6 }, { col: 2, row: 6 }, { col: 3, row: 6 }, { col: 4, row: 6 }, { col: 5, row: 6 },
  // 5..10 (Green arm going up and down)
  { col: 6, row: 5 }, { col: 6, row: 4 }, { col: 6, row: 3 }, { col: 6, row: 2 }, { col: 6, row: 1 }, { col: 6, row: 0 },
  { col: 7, row: 0 },
  { col: 8, row: 0 }, { col: 8, row: 1 }, { col: 8, row: 2 }, { col: 8, row: 3 }, { col: 8, row: 4 }, { col: 8, row: 5 },
  // 17..23 (Yellow arm going right and down)
  { col: 9, row: 6 }, { col: 10, row: 6 }, { col: 11, row: 6 }, { col: 12, row: 6 }, { col: 13, row: 6 }, { col: 14, row: 6 },
  { col: 14, row: 7 },
  { col: 14, row: 8 }, { col: 13, row: 8 }, { col: 12, row: 8 }, { col: 11, row: 8 }, { col: 10, row: 8 }, { col: 9, row: 8 },
  // 30..36 (Blue arm going down and left)
  { col: 8, row: 9 }, { col: 8, row: 10 }, { col: 8, row: 11 }, { col: 8, row: 12 }, { col: 8, row: 13 }, { col: 8, row: 14 },
  { col: 7, row: 14 },
  { col: 6, row: 14 }, { col: 6, row: 13 }, { col: 6, row: 12 }, { col: 6, row: 11 }, { col: 6, row: 10 }, { col: 6, row: 9 },
  // 43..48 (Red arm going left and up)
  { col: 5, row: 8 }, { col: 4, row: 8 }, { col: 3, row: 8 }, { col: 2, row: 8 }, { col: 1, row: 8 }, { col: 0, row: 8 },
  { col: 0, row: 7 },
  { col: 0, row: 6 },
];

// Colored home columns (5 squares each leading to center [7,7])
export const LUDO_HOME_COLUMNS: Record<PlayerColor, { col: number; row: number }[]> = {
  red: [
    { col: 1, row: 7 }, { col: 2, row: 7 }, { col: 3, row: 7 }, { col: 4, row: 7 }, { col: 5, row: 7 }
  ],
  green: [
    { col: 7, row: 1 }, { col: 7, row: 2 }, { col: 7, row: 3 }, { col: 7, row: 4 }, { col: 7, row: 5 }
  ],
  yellow: [
    { col: 13, row: 7 }, { col: 12, row: 7 }, { col: 11, row: 7 }, { col: 10, row: 7 }, { col: 9, row: 7 }
  ],
  blue: [
    { col: 7, row: 13 }, { col: 7, row: 12 }, { col: 7, row: 11 }, { col: 7, row: 10 }, { col: 7, row: 9 }
  ],
};

// Base piece slots (4 slots in each corner yard)
export const LUDO_BASE_SLOTS: Record<PlayerColor, { col: number; row: number }[]> = {
  red: [
    { col: 1.5, row: 1.5 }, { col: 3.5, row: 1.5 }, { col: 1.5, row: 3.5 }, { col: 3.5, row: 3.5 }
  ],
  green: [
    { col: 10.5, row: 1.5 }, { col: 12.5, row: 1.5 }, { col: 10.5, row: 3.5 }, { col: 12.5, row: 3.5 }
  ],
  yellow: [
    { col: 10.5, row: 10.5 }, { col: 12.5, row: 10.5 }, { col: 10.5, row: 12.5 }, { col: 12.5, row: 12.5 }
  ],
  blue: [
    { col: 1.5, row: 10.5 }, { col: 3.5, row: 10.5 }, { col: 1.5, row: 12.5 }, { col: 3.5, row: 12.5 }
  ],
};
