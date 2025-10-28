
import React from 'react';
import { Player, GameState } from '../types';
import { PlayerCard } from './PlayerCard';

interface PlayerGridProps {
  players: Player[];
  gameState: GameState;
}

export const PlayerGrid: React.FC<PlayerGridProps> = ({ players, gameState }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {players.map(player => (
        <PlayerCard key={player.id} player={player} gameState={gameState} />
      ))}
    </div>
  );
};
