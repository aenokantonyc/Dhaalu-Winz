import { BoardType, UserProfile } from '../types/game';

const PROFILE_KEY = 'boardgame_platform_user_profile';
const GOOGLE_AUTH_KEY = 'boardgame_platform_google_auth';

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  imageUrl: string;
}

const DEFAULT_AVATARS = ['👑', '⭐', '🛡️', '💎', '🎯', '⚡', '🐉', '🦁'];

export class AuthManager {
  private googleUser: GoogleUser | null = null;
  private userProfile: UserProfile | null = null;
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;

    try {
      const storedAuth = localStorage.getItem(GOOGLE_AUTH_KEY);
      if (storedAuth) {
        this.googleUser = JSON.parse(storedAuth);
      }

      const storedProfile = localStorage.getItem(PROFILE_KEY);
      if (storedProfile) {
        this.userProfile = JSON.parse(storedProfile);
      }
    } catch {
      // Ignored
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  public isLoggedIn(): boolean {
    return this.googleUser !== null;
  }

  public getGoogleUser(): GoogleUser | null {
    return this.googleUser;
  }

  public getProfile(): UserProfile | null {
    return this.userProfile;
  }

  public getPlayerName(): string {
    if (this.userProfile?.displayName) {
      return this.userProfile.displayName;
    }
    return 'Player';
  }

  public loginWithGoogle(account: { email: string; name: string; id?: string; imageUrl?: string }): UserProfile {
    const googleUser: GoogleUser = {
      id: account.id || 'g_' + Math.random().toString(36).substring(2, 10),
      email: account.email,
      name: account.name,
      imageUrl: account.imageUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(account.email)}`,
    };

    this.googleUser = googleUser;
    localStorage.setItem(GOOGLE_AUTH_KEY, JSON.stringify(googleUser));

    // Check existing profile or initialize new one
    let profile = this.userProfile;
    if (!profile || profile.googleId !== googleUser.id) {
      // Prompt user for Player Name; set initial placeholder that is NOT their google name
      profile = {
        googleId: googleUser.id,
        displayName: '', // User will pick their custom Player Name
        email: googleUser.email,
        avatar: DEFAULT_AVATARS[0],
        gamesPlayed: 0,
        gamesWon: 0,
        favoriteBoard: 'classic_ludo',
        totalCaptures: 0,
        gameHistory: [],
      };
      this.userProfile = profile;
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    }

    this.notify();
    return profile;
  }

  public setPlayerName(name: string) {
    if (!this.userProfile) return;
    this.userProfile.displayName = name.trim();
    localStorage.setItem(PROFILE_KEY, JSON.stringify(this.userProfile));
    this.notify();
  }

  public setAvatar(avatar: string) {
    if (!this.userProfile) return;
    this.userProfile.avatar = avatar;
    localStorage.setItem(PROFILE_KEY, JSON.stringify(this.userProfile));
    this.notify();
  }

  public recordGameResult(result: {
    boardType: BoardType;
    won: boolean;
    captures: number;
    playersCount: number;
  }) {
    if (!this.userProfile) return;

    this.userProfile.gamesPlayed += 1;
    if (result.won) {
      this.userProfile.gamesWon += 1;
    }
    this.userProfile.totalCaptures += result.captures;

    this.userProfile.gameHistory.unshift({
      id: 'g_' + Date.now(),
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      boardType: result.boardType,
      playersCount: result.playersCount,
      won: result.won,
      captures: result.captures,
    });

    if (this.userProfile.gameHistory.length > 25) {
      this.userProfile.gameHistory = this.userProfile.gameHistory.slice(0, 25);
    }

    // Determine favorite board
    const counts: Record<BoardType, number> = { dhayam: 0, classic_ludo: 0, modern_ludo: 0 };
    this.userProfile.gameHistory.forEach(h => {
      counts[h.boardType] = (counts[h.boardType] || 0) + 1;
    });
    let maxCount = -1;
    let fav: BoardType = 'classic_ludo';
    (Object.keys(counts) as BoardType[]).forEach(b => {
      if (counts[b] > maxCount) {
        maxCount = counts[b];
        fav = b;
      }
    });
    this.userProfile.favoriteBoard = fav;

    localStorage.setItem(PROFILE_KEY, JSON.stringify(this.userProfile));
    this.notify();
  }

  public logout() {
    this.googleUser = null;
    localStorage.removeItem(GOOGLE_AUTH_KEY);
    this.notify();
  }
}

export const auth = new AuthManager();
