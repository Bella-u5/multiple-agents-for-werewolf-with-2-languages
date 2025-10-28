export enum Role {
  WEREWOLF = 'Werewolf',
  VILLAGER = 'Villager',
  SEER = 'Seer',
}

export interface Player {
  id: number;
  name: string;
  role: Role;
  isAlive: boolean;
  isHost: boolean; // Not used in logic, for potential UI features
}

export enum GameState {
  SETUP = 'SETUP',
  NIGHT = 'NIGHT',
  DAY_DISCUSSION = 'DAY_DISCUSSION',
  DAY_VOTE = 'DAY_VOTE',
  GAME_OVER = 'GAME_OVER',
}

export interface GameConfig {
  numWerewolves: number;
  numVillagers: number;
}

// Used for i18n-compatible logging
export interface LogEntry {
    key: string;
    params?: Record<string, any>;
    rawSpeech?: string; // For untranslated AI speech
    speaker?: { name: string; role: Role }; // For speaker info
}

export type WolfStrategy = 'jump-claim' | 'charger' | 'back-hook';
