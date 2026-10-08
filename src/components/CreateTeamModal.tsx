import React, { useState } from 'react';
import { BoardType, DhayamPieceType, LudoAvatarType, LudoCustomRules } from '../types/game';
import { X, Shield, Lock, Globe } from 'lucide-react';
import { audio } from '../utils/audio';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlayerName: string;
  onCreateRoom: (params: {
    playerName: string;
    boardType: BoardType;
    maxPlayers: number;
    isPrivate: boolean;
    rules: LudoCustomRules;
    pieceType?: DhayamPieceType;
    avatarType?: LudoAvatarType;
  }) => void;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  isOpen,
  onClose,
  defaultPlayerName,
  onCreateRoom,
}) => {
  const [playerName, setPlayerName] = useState(defaultPlayerName || 'Player');
  const [boardType, setBoardType] = useState<BoardType>('classic_ludo');
  const [maxPlayers, setMaxPlayers] = useState<number>(4);
  const [isPrivate, setIsPrivate] = useState<boolean>(true);

  // Custom rules for Ludo
  const [rules, setRules] = useState<LudoCustomRules>({
    oneRequiredToEnter: true, // Always locked ON
    extraTurnOnOne: true,
    extraTurnOnCapture: true,
    safeZones: true,
    blockades: true,
  });

  // Piece selections
  const [dhayamPiece, setDhayamPiece] = useState<DhayamPieceType>('sticks');
  const [ludoAvatar, setLudoAvatar] = useState<LudoAvatarType>('crown');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    audio.playClick();
    onCreateRoom({
      playerName: playerName.trim() || 'Player',
      boardType,
      maxPlayers,
      isPrivate,
      rules,
      pieceType: boardType === 'dhayam' ? dhayamPiece : undefined,
      avatarType: boardType !== 'dhayam' ? ludoAvatar : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative text-slate-100 my-8">
        <button
          onClick={() => {
            audio.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold tracking-tight text-white mb-6">
          CREATE GAME
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PLAYER NAME */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              PLAYER NAME
            </label>
            <input
              type="text"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              maxLength={15}
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-colors"
            />
          </div>

          {/* BOARD SELECTION */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              BOARD
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  setBoardType('dhayam');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  boardType === 'dhayam'
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                Dhayam
              </button>

              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  setBoardType('classic_ludo');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  boardType === 'classic_ludo'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                Classic Ludo
              </button>

              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  setBoardType('modern_ludo');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  boardType === 'modern_ludo'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                Modern Ludo
              </button>
            </div>
          </div>

          {/* NUMBER OF PLAYERS */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              NUMBER OF PLAYERS
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[2, 3, 4].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    audio.playClick();
                    setMaxPlayers(num);
                  }}
                  className={`py-2 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                    maxPlayers === num
                      ? 'bg-slate-100 text-slate-900 border-white'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {num} Players
                </button>
              ))}
            </div>
          </div>

          {/* ROOM TYPE */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              ROOM TYPE
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  setIsPrivate(true);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  isPrivate
                    ? 'bg-slate-800 text-white border-slate-600'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                Private
              </button>

              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  setIsPrivate(false);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  !isPrivate
                    ? 'bg-slate-800 text-white border-slate-600'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                Public
              </button>
            </div>
          </div>

          {/* RULES CONFIGURATION */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              RULES
            </label>

            {boardType === 'dhayam' ? (
              <div className="p-3 bg-amber-950/40 border border-amber-800/40 rounded-xl text-xs text-amber-200/90 space-y-1">
                <div className="font-semibold text-amber-300">Fixed Dhayam Rules</div>
                <div>· 1 (Dhayam) required to enter the board</div>
                <div>· Extra turn on 1, 5, 6, 12, or opponent capture</div>
                <div>· Cross (Malai) squares are safe zones</div>
                <div>· Concentric outer & inner track leading to Pazham</div>
              </div>
            ) : (
              <div className="space-y-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
                {/* 1 required to enter — ON (locked) */}
                <div className="flex items-center justify-between text-slate-300 py-1 border-b border-slate-800/60">
                  <span className="font-medium">1 required to enter</span>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                    LOCKED ON
                  </span>
                </div>

                {/* Extra turn on 1 */}
                <label className="flex items-center justify-between text-slate-300 py-1 cursor-pointer">
                  <span>Extra turn on 1</span>
                  <input
                    type="checkbox"
                    checked={rules.extraTurnOnOne}
                    onChange={e => setRules({ ...rules, extraTurnOnOne: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                </label>

                {/* Extra turn on capture */}
                <label className="flex items-center justify-between text-slate-300 py-1 cursor-pointer">
                  <span>Extra turn on capture</span>
                  <input
                    type="checkbox"
                    checked={rules.extraTurnOnCapture}
                    onChange={e => setRules({ ...rules, extraTurnOnCapture: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                </label>

                {/* Safe zones */}
                <label className="flex items-center justify-between text-slate-300 py-1 cursor-pointer">
                  <span>Safe zones</span>
                  <input
                    type="checkbox"
                    checked={rules.safeZones}
                    onChange={e => setRules({ ...rules, safeZones: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                </label>

                {/* Blockades */}
                <label className="flex items-center justify-between text-slate-300 py-1 cursor-pointer">
                  <span>Blockades (2 pieces block path)</span>
                  <input
                    type="checkbox"
                    checked={rules.blockades}
                    onChange={e => setRules({ ...rules, blockades: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                </label>
              </div>
            )}
          </div>

          {/* PIECE / AVATAR SELECTION */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              SELECT PIECE TYPE
            </label>

            {boardType === 'dhayam' ? (
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'sticks' as DhayamPieceType, name: 'Sticks', icon: '🥢' },
                  { id: 'pebbles' as DhayamPieceType, name: 'Pebbles', icon: '🪨' },
                  { id: 'shells' as DhayamPieceType, name: 'Shells', icon: '🐚' },
                  { id: 'tamarind_seeds' as DhayamPieceType, name: 'Seeds', icon: '🌰' },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      audio.playClick();
                      setDhayamPiece(item.id);
                    }}
                    className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                      dhayamPiece === item.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-[11px]">{item.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'crown' as LudoAvatarType, name: 'Crown', icon: '👑' },
                  { id: 'star' as LudoAvatarType, name: 'Star', icon: '⭐' },
                  { id: 'shield' as LudoAvatarType, name: 'Shield', icon: '🛡️' },
                  { id: 'gem' as LudoAvatarType, name: 'Gem', icon: '💎' },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      audio.playClick();
                      setLudoAvatar(item.id);
                    }}
                    className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                      ludoAvatar === item.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-[11px]">{item.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm tracking-wide rounded-xl transition-all shadow-lg cursor-pointer"
          >
            CREATE TEAM
          </button>
        </form>
      </div>
    </div>
  );
};
