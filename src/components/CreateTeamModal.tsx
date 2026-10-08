import React, { useState, useEffect } from 'react';
import {
  BoardType,
  DhayamPieceType,
  LudoAvatarType,
  LudoCustomRules,
  MODERN_LUDO_STANDARD_RULES,
  CLASSIC_LUDO_DEFAULT_RULES,
} from '../types/game';
import { X, Lock, Globe } from 'lucide-react';
import { audio } from '../utils/audio';
import { RuleCustomizer } from './RuleCustomizer';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlayerName: string;
  boardType: BoardType;
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
  boardType,
  onCreateRoom,
}) => {
  const [playerName, setPlayerName] = useState(defaultPlayerName || 'Player');
  const [maxPlayers, setMaxPlayers] = useState<number>(4);
  const [isPrivate, setIsPrivate] = useState<boolean>(true);

  // Custom rules for Ludo
  const [rules, setRules] = useState<LudoCustomRules>(
    boardType === 'modern_ludo' ? MODERN_LUDO_STANDARD_RULES : CLASSIC_LUDO_DEFAULT_RULES
  );

  useEffect(() => {
    if (boardType === 'modern_ludo') {
      setRules(MODERN_LUDO_STANDARD_RULES);
    } else if (boardType === 'classic_ludo') {
      setRules(CLASSIC_LUDO_DEFAULT_RULES);
    }
  }, [boardType]);

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
      rules: boardType === 'modern_ludo' ? MODERN_LUDO_STANDARD_RULES : rules,
      pieceType: boardType === 'dhayam' ? dhayamPiece : undefined,
      avatarType: boardType !== 'dhayam' ? ludoAvatar : undefined,
    });
  };

  const getTitle = () => {
    if (boardType === 'dhayam') return 'Create Team - Dhayam';
    if (boardType === 'modern_ludo') return 'Create Team - Modern Ludo';
    return 'Create Team - Classic Ludo';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative text-slate-100 my-8">
        <button
          type="button"
          onClick={() => {
            audio.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">
              {boardType === 'dhayam' ? '🎲' : boardType === 'classic_ludo' ? '♟️' : '✨'}
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white uppercase">
              {getTitle()}
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PLAYER NAME */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              maxLength={15}
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-colors"
            />
          </div>

          {/* NUMBER OF PLAYERS */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Number of Players
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
              Room Visibility
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
                Private (Code)
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
              Rules
            </label>

            {boardType === 'modern_ludo' ? (
              /* Modern Ludo: All selected, no toggle button */
              <div className="p-3.5 bg-slate-950 border border-emerald-900/40 rounded-xl text-xs space-y-1.5">
                <div className="font-bold text-emerald-400 flex items-center justify-between">
                  <span>Standard Modern Rules</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                    ALL SELECTED
                  </span>
                </div>
                <div className="text-slate-300 grid grid-cols-2 gap-1 text-[11px] pt-1 border-t border-slate-800/80">
                  <div>✓ Entry on 6</div>
                  <div>✓ Extra roll on 6 & capture</div>
                  <div>✓ Star safe zones active</div>
                  <div>✓ 4 pieces to win</div>
                </div>
              </div>
            ) : boardType === 'dhayam' ? (
              /* Dhayam */
              <div className="p-3.5 bg-amber-950/40 border border-amber-800/40 rounded-xl text-xs text-amber-200/90 space-y-1">
                <div className="font-bold text-amber-300">Authentic Dhayam Rules</div>
                <div>• Roll 1 (Dhayam) to enter board</div>
                <div>• Extra roll on 1, 5, 6, 12, or capture</div>
                <div>• Cross (Malai) safe squares</div>
              </div>
            ) : (
              /* Classic Ludo: players can define rules */
              <RuleCustomizer rules={rules} onChange={setRules} />
            )}
          </div>

          {/* PIECE / AVATAR SELECTION */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Select Piece Type
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
