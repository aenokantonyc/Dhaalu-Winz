import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  BoardType,
  LudoCustomRules,
  PieceState,
  Player,
  PlayerColor,
  RoomState
} from './src/types/game.js';
import {
  rollDhayamDice,
  getDhayamValidMoves,
  getDhayamPathForColor,
  DHAYAM_SAFE_COORDINATES,
} from './src/utils/dhayamEngine.js';
import {
  rollLudoDice,
  getLudoValidMoves,
  getLudoTrackPosition,
  LUDO_SAFE_POSITIONS,
  TOTAL_STEPS_TO_FINISH,
} from './src/utils/ludoEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// In-memory room management
const rooms = new Map<string, RoomState>(); // Key: roomId
const roomCodeToId = new Map<string, string>(); // Key: roomCode -> roomId
const clientToRoom = new Map<WebSocket, { roomId: string; playerId: string }>();

const PLAYER_COLORS: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];

function generateRoomCode(boardType: BoardType): string {
  const prefix = boardType === 'dhayam' ? 'DHAY' : 'LUDO';
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const fullCode = `${prefix}-${code}`;
  if (roomCodeToId.has(fullCode)) {
    return generateRoomCode(boardType);
  }
  return fullCode;
}

function broadcastRoom(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  const payload = JSON.stringify({
    type: 'room_state',
    state: room,
  });

  for (const [ws, info] of clientToRoom.entries()) {
    if (info.roomId === roomId && ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}

function initializePieces(room: RoomState): PieceState[] {
  const pieces: PieceState[] = [];
  room.players.forEach(p => {
    for (let id = 0; id < 4; id++) {
      pieces.push({
        id,
        playerId: p.id,
        playerColor: p.color,
        step: -1, // in base
        isFinished: false,
      });
    }
  });
  return pieces;
}

// REST API for checking room before join if desired
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', activeRooms: rooms.size });
});

// WebSocket message handling
wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (data: string) => {
    try {
      const msg = JSON.parse(data.toString());
      handleMessage(ws, msg);
    } catch (err) {
      console.error('Error handling WS message:', err);
    }
  });

  ws.on('close', () => {
    const info = clientToRoom.get(ws);
    if (info) {
      const room = rooms.get(info.roomId);
      if (room) {
        const player = room.players.find(p => p.id === info.playerId);
        if (player) {
          player.isConnected = false;
        }
        broadcastRoom(info.roomId);
      }
      clientToRoom.delete(ws);
    }
  });
});

function handleMessage(ws: WebSocket, msg: any) {
  switch (msg.type) {
    case 'create_room': {
      const {
        playerId,
        playerName,
        boardType,
        maxPlayers,
        isPrivate,
        rules,
        pieceType,
        avatarType,
      } = msg;

      const roomId = 'room_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const roomCode = generateRoomCode(boardType);

      const hostPlayer: Player = {
        id: playerId,
        name: playerName || 'Host',
        color: PLAYER_COLORS[0],
        isHost: true,
        isReady: true,
        dhayamPiece: boardType === 'dhayam' ? pieceType || 'sticks' : undefined,
        ludoAvatar: boardType !== 'dhayam' ? avatarType || 'crown' : undefined,
        isConnected: true,
      };

      const defaultRules: LudoCustomRules = {
        oneRequiredToEnter: true,
        extraTurnOnOne: rules?.extraTurnOnOne ?? true,
        extraTurnOnCapture: rules?.extraTurnOnCapture ?? true,
        safeZones: rules?.safeZones ?? true,
        blockades: rules?.blockades ?? true,
      };

      const newRoom: RoomState = {
        roomId,
        roomCode,
        boardType,
        maxPlayers: maxPlayers || 4,
        isPrivate: Boolean(isPrivate),
        isLocked: false,
        isStarted: false,
        isFinished: false,
        winnerPlayerId: null,
        winnerName: null,
        hostId: playerId,
        players: [hostPlayer],
        rules: defaultRules,
        turnPlayerIndex: 0,
        diceRolled: false,
        dhayamDice: null,
        ludoDice: null,
        pieces: [],
        validMoves: [],
        statusMessage: `Room created with code ${roomCode}. Waiting for players to join...`,
      };

      rooms.set(roomId, newRoom);
      roomCodeToId.set(roomCode, roomId);
      clientToRoom.set(ws, { roomId, playerId });

      ws.send(JSON.stringify({ type: 'room_created', room: newRoom }));
      break;
    }

    case 'join_room': {
      const { roomCode, playerId, playerName, pieceType, avatarType } = msg;
      const formattedCode = (roomCode || '').toUpperCase().trim();
      const roomId = roomCodeToId.get(formattedCode);

      if (!roomId) {
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'Team not found. Please check the code.',
          })
        );
        return;
      }

      const room = rooms.get(roomId);
      if (!room) {
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'Team not found. Please check the code.',
          })
        );
        return;
      }

      if (room.isStarted) {
        // Check if existing player reconnecting
        const existing = room.players.find(p => p.id === playerId);
        if (existing) {
          existing.isConnected = true;
          clientToRoom.set(ws, { roomId, playerId });
          broadcastRoom(roomId);
          return;
        }
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'This game has already started.',
          })
        );
        return;
      }

      if (room.isLocked) {
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'This room is locked by the host.',
          })
        );
        return;
      }

      if (room.players.length >= room.maxPlayers) {
        // If not already in room
        if (!room.players.some(p => p.id === playerId)) {
          ws.send(
            JSON.stringify({
              type: 'error',
              message: 'This team is full.',
            })
          );
          return;
        }
      }

      // Add or reconnect player
      let player = room.players.find(p => p.id === playerId);
      if (!player) {
        const assignedColor = PLAYER_COLORS[room.players.length % 4];
        player = {
          id: playerId,
          name: playerName || `Player ${room.players.length + 1}`,
          color: assignedColor,
          isHost: false,
          isReady: false,
          dhayamPiece: room.boardType === 'dhayam' ? pieceType || 'pebbles' : undefined,
          ludoAvatar: room.boardType !== 'dhayam' ? avatarType || 'star' : undefined,
          isConnected: true,
        };
        room.players.push(player);
        room.statusMessage = `${player.name} joined the lobby.`;
      } else {
        player.isConnected = true;
        if (playerName) player.name = playerName;
      }

      clientToRoom.set(ws, { roomId, playerId });
      broadcastRoom(roomId);
      break;
    }

    case 'update_player': {
      const info = clientToRoom.get(ws);
      if (!info) return;
      const room = rooms.get(info.roomId);
      if (!room) return;

      const player = room.players.find(p => p.id === info.playerId);
      if (!player) return;

      if (msg.dhayamPiece) player.dhayamPiece = msg.dhayamPiece;
      if (msg.ludoAvatar) player.ludoAvatar = msg.ludoAvatar;
      if (typeof msg.isReady === 'boolean') player.isReady = msg.isReady;
      if (msg.name) player.name = msg.name;

      broadcastRoom(info.roomId);
      break;
    }

    case 'host_update_settings': {
      const info = clientToRoom.get(ws);
      if (!info) return;
      const room = rooms.get(info.roomId);
      if (!room || room.hostId !== info.playerId || room.isStarted) return;

      if (msg.boardType) room.boardType = msg.boardType;
      if (msg.maxPlayers) room.maxPlayers = Math.max(2, Math.min(4, msg.maxPlayers));
      if (msg.rules && room.boardType !== 'dhayam') {
        room.rules = {
          ...room.rules,
          ...msg.rules,
          oneRequiredToEnter: true, // Always locked ON
        };
      }

      broadcastRoom(info.roomId);
      break;
    }

    case 'host_lock_room': {
      const info = clientToRoom.get(ws);
      if (!info) return;
      const room = rooms.get(info.roomId);
      if (!room || room.hostId !== info.playerId) return;

      room.isLocked = !room.isLocked;
      room.statusMessage = room.isLocked ? 'Room locked by host.' : 'Room unlocked.';
      broadcastRoom(info.roomId);
      break;
    }

    case 'host_remove_player': {
      const info = clientToRoom.get(ws);
      if (!info) return;
      const room = rooms.get(info.roomId);
      if (!room || room.hostId !== info.playerId || room.isStarted) return;

      const targetId = msg.targetPlayerId;
      if (targetId === room.hostId) return;

      room.players = room.players.filter(p => p.id !== targetId);
      // Re-assign colors
      room.players.forEach((p, idx) => {
        p.color = PLAYER_COLORS[idx % 4];
      });

      broadcastRoom(info.roomId);
      break;
    }

    case 'start_game': {
      const info = clientToRoom.get(ws);
      if (!info) return;
      const room = rooms.get(info.roomId);
      if (!room || room.hostId !== info.playerId) return;

      // Verify ready count
      const allReady = room.players.every(p => p.isReady);
      if (!allReady) {
        ws.send(JSON.stringify({ type: 'error', message: 'All players must be ready to start!' }));
        return;
      }
      if (room.players.length < 2) {
        ws.send(JSON.stringify({ type: 'error', message: 'At least 2 players required to start.' }));
        return;
      }

      room.isStarted = true;
      room.isFinished = false;
      room.winnerPlayerId = null;
      room.winnerName = null;
      room.pieces = initializePieces(room);
      room.turnPlayerIndex = Math.floor(Math.random() * room.players.length); // First player decided
      room.diceRolled = false;
      room.dhayamDice = null;
      room.ludoDice = null;
      room.validMoves = [];
      const currentTurnPlayer = room.players[room.turnPlayerIndex];
      room.statusMessage = `Game started! ${currentTurnPlayer.name}'s turn (${currentTurnPlayer.color.toUpperCase()}). Roll the dice!`;

      broadcastRoom(info.roomId);
      break;
    }

    case 'roll_dice': {
      const info = clientToRoom.get(ws);
      if (!info) return;
      const room = rooms.get(info.roomId);
      if (!room || !room.isStarted || room.isFinished) return;

      const currentTurnPlayer = room.players[room.turnPlayerIndex];
      if (currentTurnPlayer.id !== info.playerId) {
        ws.send(JSON.stringify({ type: 'error', message: 'Not your turn!' }));
        return;
      }

      if (room.diceRolled) return;

      room.diceRolled = true;

      if (room.boardType === 'dhayam') {
        const diceRes = rollDhayamDice();
        room.dhayamDice = diceRes;
        const validMoves = getDhayamValidMoves(room.pieces, currentTurnPlayer.id, diceRes);
        room.validMoves = validMoves;

        if (validMoves.length === 0) {
          // No moves possible
          room.statusMessage = `${currentTurnPlayer.name} rolled ${diceRes.total}. No moves possible.`;
          // If roll gives extra turn (1, 5, 6, 12), player gets to roll again even if no piece moved!
          if (diceRes.extraTurn) {
            room.statusMessage += ` Extra turn granted! Roll again.`;
            room.diceRolled = false;
          } else {
            // Next turn
            room.turnPlayerIndex = (room.turnPlayerIndex + 1) % room.players.length;
            room.diceRolled = false;
            const nextPlayer = room.players[room.turnPlayerIndex];
            room.statusMessage += ` Next is ${nextPlayer.name}'s turn.`;
          }
        } else {
          room.statusMessage = `${currentTurnPlayer.name} rolled ${diceRes.total}${
            diceRes.isDhayam ? ' (DHAYAM!)' : ''
          }. Select a piece to move.`;
        }
      } else {
        // Classic or Modern Ludo
        const diceRes = rollLudoDice(room.rules);
        room.ludoDice = diceRes;
        const validMoves = getLudoValidMoves(
          room.pieces,
          currentTurnPlayer.id,
          currentTurnPlayer.color,
          diceRes.value,
          room.rules
        );
        room.validMoves = validMoves;

        if (validMoves.length === 0) {
          room.statusMessage = `${currentTurnPlayer.name} rolled a ${diceRes.value}. No valid moves.`;
          if (diceRes.extraTurn) {
            room.statusMessage += ` Rolled 1 -> Extra turn! Roll again.`;
            room.diceRolled = false;
          } else {
            room.turnPlayerIndex = (room.turnPlayerIndex + 1) % room.players.length;
            room.diceRolled = false;
            const nextPlayer = room.players[room.turnPlayerIndex];
            room.statusMessage += ` Next is ${nextPlayer.name}'s turn.`;
          }
        } else {
          room.statusMessage = `${currentTurnPlayer.name} rolled a ${diceRes.value}. Select a piece to move.`;
        }
      }

      broadcastRoom(info.roomId);
      break;
    }

    case 'move_piece': {
      const info = clientToRoom.get(ws);
      if (!info) return;
      const room = rooms.get(info.roomId);
      if (!room || !room.isStarted || room.isFinished) return;

      const currentTurnPlayer = room.players[room.turnPlayerIndex];
      if (currentTurnPlayer.id !== info.playerId) return;

      const { pieceId } = msg;
      if (!room.validMoves.includes(pieceId)) {
        ws.send(JSON.stringify({ type: 'error', message: 'Illegal move!' }));
        return;
      }

      const piece = room.pieces.find(
        p => p.playerId === currentTurnPlayer.id && p.id === pieceId
      );
      if (!piece) return;

      let captured = false;
      let extraTurn = false;

      if (room.boardType === 'dhayam') {
        const dice = room.dhayamDice!;
        extraTurn = dice.extraTurn;

        if (piece.step === -1) {
          // Enter board at starting position (step 0)
          piece.step = 0;
          room.statusMessage = `${currentTurnPlayer.name} entered piece ${piece.id + 1} into play!`;
        } else {
          piece.step += dice.total;
          if (piece.step >= 40) {
            piece.step = 40;
            piece.isFinished = true;
            room.statusMessage = `${currentTurnPlayer.name}'s piece reached the Pazham (Center Fruit)!`;
          } else {
            room.statusMessage = `${currentTurnPlayer.name} moved piece ${piece.id + 1}.`;
          }
        }

        // Check capture in Dhayam
        if (!piece.isFinished && piece.step >= 0) {
          const myPath = getDhayamPathForColor(piece.playerColor);
          const myCoord = myPath[piece.step];
          const isSafe = DHAYAM_SAFE_COORDINATES.has(`${myCoord.x},${myCoord.y}`);

          if (!isSafe) {
            // Find any opponent piece on this coordinate
            for (const opponentPiece of room.pieces) {
              if (
                opponentPiece.playerId !== currentTurnPlayer.id &&
                !opponentPiece.isFinished &&
                opponentPiece.step >= 0
              ) {
                const oppPath = getDhayamPathForColor(opponentPiece.playerColor);
                const oppCoord = oppPath[opponentPiece.step];
                if (oppCoord.x === myCoord.x && oppCoord.y === myCoord.y) {
                  // Capture!
                  opponentPiece.step = -1;
                  captured = true;
                  extraTurn = true; // Capturing in Dhayam awards extra turn!
                  const opponentPlayer = room.players.find(p => p.id === opponentPiece.playerId);
                  room.statusMessage = `${currentTurnPlayer.name} captured ${opponentPlayer?.name}'s piece! Extra roll awarded!`;
                  break;
                }
              }
            }
          }
        }

        // Check victory condition in Dhayam: all 4 pieces (or 1st to complete all 4 pieces) reach Pazham!
        const playerPieces = room.pieces.filter(p => p.playerId === currentTurnPlayer.id);
        const allFinished = playerPieces.every(p => p.isFinished);
        if (allFinished) {
          room.isFinished = true;
          room.winnerPlayerId = currentTurnPlayer.id;
          room.winnerName = currentTurnPlayer.name;
          room.statusMessage = `🏆 ${currentTurnPlayer.name} has completed all pieces and won the Dhayam match!`;
        }
      } else {
        // Classic or Modern Ludo
        const dice = room.ludoDice!;
        extraTurn = dice.extraTurn;

        if (piece.step === -1) {
          // Out of base to step 0
          piece.step = 0;
          room.statusMessage = `${currentTurnPlayer.name} brought piece ${piece.id + 1} out of base!`;
        } else {
          piece.step += dice.value;
          if (piece.step >= TOTAL_STEPS_TO_FINISH) {
            piece.step = TOTAL_STEPS_TO_FINISH;
            piece.isFinished = true;
            room.statusMessage = `${currentTurnPlayer.name}'s piece reached Home!`;
          } else {
            room.statusMessage = `${currentTurnPlayer.name} moved piece ${piece.id + 1} by ${dice.value}.`;
          }
        }

        // Check capture in Ludo
        if (!piece.isFinished && piece.step >= 0 && piece.step <= 50) {
          const myTrackPos = getLudoTrackPosition(piece.playerColor, piece.step);
          const isSafe = room.rules.safeZones && LUDO_SAFE_POSITIONS.has(myTrackPos.index);

          if (!isSafe) {
            // Find opponent pieces on this track square
            const opponentPiecesOnSquare = room.pieces.filter(
              p =>
                p.playerId !== currentTurnPlayer.id &&
                !p.isFinished &&
                p.step >= 0 &&
                p.step <= 50 &&
                getLudoTrackPosition(p.playerColor, p.step).index === myTrackPos.index
            );

            // If 1 piece, capture! (If 2+ pieces and blockades enabled, would have been blocked)
            if (opponentPiecesOnSquare.length === 1) {
              const victim = opponentPiecesOnSquare[0];
              victim.step = -1; // Send back to base!
              captured = true;
              if (room.rules.extraTurnOnCapture) {
                extraTurn = true;
              }
              const victimPlayer = room.players.find(p => p.id === victim.playerId);
              room.statusMessage = `💥 ${currentTurnPlayer.name} captured ${victimPlayer?.name}'s piece!`;
              if (extraTurn) {
                room.statusMessage += ` Extra turn granted!`;
              }
            }
          }
        }

        // Check victory in Ludo: All 4 pieces in Home!
        const playerPieces = room.pieces.filter(p => p.playerId === currentTurnPlayer.id);
        const allFinished = playerPieces.every(p => p.isFinished);
        if (allFinished) {
          room.isFinished = true;
          room.winnerPlayerId = currentTurnPlayer.id;
          room.winnerName = currentTurnPlayer.name;
          room.statusMessage = `🏆 ${currentTurnPlayer.name} has brought all 4 pieces Home and won!`;
        }
      }

      room.lastMoveInfo = {
        playerColor: currentTurnPlayer.color,
        captured,
        pieceId,
      };

      room.validMoves = [];

      if (!room.isFinished) {
        if (extraTurn) {
          room.diceRolled = false;
          room.statusMessage += ` Roll again!`;
        } else {
          room.turnPlayerIndex = (room.turnPlayerIndex + 1) % room.players.length;
          room.diceRolled = false;
          const nextPlayer = room.players[room.turnPlayerIndex];
          room.statusMessage += ` Next is ${nextPlayer.name}'s turn.`;
        }
      }

      broadcastRoom(info.roomId);
      break;
    }

    case 'rematch': {
      const info = clientToRoom.get(ws);
      if (!info) return;
      const room = rooms.get(info.roomId);
      if (!room) return;

      room.isFinished = false;
      room.winnerPlayerId = null;
      room.winnerName = null;
      room.pieces = initializePieces(room);
      room.turnPlayerIndex = Math.floor(Math.random() * room.players.length);
      room.diceRolled = false;
      room.dhayamDice = null;
      room.ludoDice = null;
      room.validMoves = [];
      const currentTurnPlayer = room.players[room.turnPlayerIndex];
      room.statusMessage = `Rematch started! ${currentTurnPlayer.name}'s turn. Roll the dice!`;

      broadcastRoom(info.roomId);
      break;
    }

    default:
      break;
  }
}

// In dev, mount Vite middlewares; in prod, serve static dist
if (!isProd) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true, port: PORT, host: '0.0.0.0' },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Board game platform server running on port ${PORT}`);
});
