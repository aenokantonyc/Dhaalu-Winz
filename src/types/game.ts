export type BoardType = 'dhayam' | 'classic_ludo' | 'modern_ludo';

export type DhayamPieceType = 'sticks' | 'pebbles' | 'shells' | 'tamarind_seeds';

export type LudoAvatarType = 'crown' | 'star' | 'shield' | 'gem';

export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export interface LudoCustomRules {
  oneRequiredToEnter: true; // Always ON as required
  extraTurnOnOne: boolean;
  extraTurnOnCapture: boolean;
  safeZones: boolean;
  blockades: boolean;
}

export interface Player {
  id: string; // User ID
  name: string; // Player display name
  color: PlayerColor;
  isHost: boolean;
  isReady: boolean;
  dhayamPiece?: DhayamPieceType;
  ludoAvatar?: LudoAvatarType;
  isConnected: boolean;
}

export interface PieceState {
  id: number; // 0..3
  playerId: string;
  playerColor: PlayerColor;
  step: number; // -1 = at base / home yard, >= 0 = on path, 999 = goal / finished
  isFinished: boolean;
}

export interface DhayamDiceResult {
  die1: number; // 0, 1, 2, 3
  die2: number; // 0, 1, 2, 3
  total: number; // 1 (dhayam), 2, 3, 4, 5, 6, 12
  isDhayam: boolean; // rolled 1
  extraTurn: boolean; // rolled 1, 5, 6, 12
}

export interface LudoDiceResult {
  value: number; // 1..6
  extraTurn: boolean;
}

export interface RoomState {
  roomId: string;
  roomCode: string; // e.g. LUDO-7X92 or DHAY-4M18
  boardType: BoardType;
  maxPlayers: number; // 2, 3, 4
  isPrivate: boolean;
  isLocked: boolean;
  isStarted: boolean;
  isFinished: boolean;
  winnerPlayerId: string | null;
  winnerName: string | null;
  hostId: string;
  players: Player[];
  rules: LudoCustomRules; // For classic & modern ludo; Dhayam uses fixed rules
  turnPlayerIndex: number;
  diceRolled: boolean;
  dhayamDice: DhayamDiceResult | null;
  ludoDice: LudoDiceResult | null;
  pieces: PieceState[];
  validMoves: number[]; // Piece IDs that can move
  statusMessage: string;
  lastMoveInfo?: {
    playerColor: PlayerColor;
    captured?: boolean;
    pieceId: number;
  } | null;
}

export interface UserProfile {
  googleId: string;
  displayName: string;
  email: string;
  avatar: string;
  gamesPlayed: number;
  gamesWon: number;
  favoriteBoard: BoardType;
  totalCaptures: number;
  gameHistory: {
    id: string;
    date: string;
    boardType: BoardType;
    playersCount: number;
    won: boolean;
    captures: number;
  }[];
}
