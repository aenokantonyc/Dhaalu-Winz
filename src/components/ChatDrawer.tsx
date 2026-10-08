import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, PlayerColor } from '../types/game';
import { MessageSquare, Send, X, Smile, Sparkles, ChevronDown } from 'lucide-react';
import { audio } from '../utils/audio';

interface ChatDrawerProps {
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage: (text: string, isQuickReaction?: boolean) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  unreadCount?: number;
}

const COLOR_TEXT_MAP: Record<PlayerColor, string> = {
  red: 'text-red-400',
  green: 'text-emerald-400',
  yellow: 'text-amber-400',
  blue: 'text-blue-400',
};

const COLOR_BG_MAP: Record<PlayerColor, string> = {
  red: 'bg-red-950/60 border-red-800/60',
  green: 'bg-emerald-950/60 border-emerald-800/60',
  yellow: 'bg-amber-950/60 border-amber-800/60',
  blue: 'bg-blue-950/60 border-blue-800/60',
};

const QUICK_TAUNTS = [
  'Good move! 👏',
  'Nice roll! 🎲',
  'Dhaayam! 🔥',
  'Watch out! ⚠️',
  'GG! 👑',
  'Rematch soon? 🔄',
];

const QUICK_EMOJIS = ['🎲', '👑', '🔥', '👏', '💥', '😂', '🎯', '🛡️'];

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  messages = [],
  currentUserId,
  onSendMessage,
  isOpen,
  onToggleOpen,
  unreadCount = 0,
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputText.trim();
    if (!clean) return;
    audio.playClick();
    onSendMessage(clean);
    setInputText('');
  };

  const handleQuickSend = (text: string) => {
    audio.playClick();
    onSendMessage(text, true);
  };

  return (
    <>
      {/* Floating Toggle Button when closed */}
      {!isOpen && (
        <button
          onClick={() => {
            audio.playClick();
            onToggleOpen();
          }}
          className="fixed bottom-6 right-6 z-40 p-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl shadow-2xl flex items-center gap-2 font-bold text-xs transition-transform hover:scale-105 cursor-pointer"
        >
          <MessageSquare className="w-5 h-5" />
          <span>Chat</span>
          {unreadCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center animate-bounce">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Slide-in Chat Drawer / Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-full max-w-sm sm:max-w-md h-[480px] bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-md flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="p-3.5 px-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-white">Match Chat</span>
              <span className="text-[10px] text-slate-500 font-mono">
                ({messages.length} msgs)
              </span>
            </div>

            <button
              onClick={() => {
                audio.playClick();
                onToggleOpen();
              }}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Taunts Bar */}
          <div className="p-2 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
            {QUICK_TAUNTS.map(taunt => (
              <button
                key={taunt}
                onClick={() => handleQuickSend(taunt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer shrink-0"
              >
                {taunt}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 text-xs">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-4">
                <Smile className="w-8 h-8 mb-2 opacity-50" />
                <p>No messages yet. Send a greeting or cheer to your opponents!</p>
              </div>
            ) : (
              messages.map(msg => {
                const isMe = msg.senderId === currentUserId;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5 px-1">
                      <span
                        className={`text-[10px] font-bold ${
                          COLOR_TEXT_MAP[msg.senderColor]
                        }`}
                      >
                        {msg.senderName} {isMe && '(You)'}
                      </span>
                      <span className="text-[9px] text-slate-500">{msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-1.5 text-slate-100 ${
                        isMe
                          ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 rounded-tr-none'
                          : `${COLOR_BG_MAP[msg.senderColor]} border rounded-tl-none`
                      } ${msg.isQuickReaction ? 'text-sm font-semibold' : ''}`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Emojis strip */}
          <div className="px-3 py-1.5 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between gap-1 overflow-x-auto">
            {QUICK_EMOJIS.map(em => (
              <button
                key={em}
                onClick={() => handleQuickSend(em)}
                className="text-base p-1 hover:scale-125 transition-transform cursor-pointer"
              >
                {em}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Send message..."
              maxLength={140}
              className="flex-1 bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none placeholder:text-slate-500"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-600 rounded-xl transition-all cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
