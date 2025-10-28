import React, { useContext } from 'react';
import { Player, Role, GameState } from '../types';
import { LanguageContext } from '../contexts/LanguageContext';
import { useTranslations } from '../hooks/useTranslations';

interface PlayerCardProps {
  player: Player;
  gameState: GameState;
}

const RoleIcon: React.FC<{ role: Role }> = ({ role }) => {
    const iconMap: Record<Role, React.ReactNode> = {
        [Role.WEREWOLF]: (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a10 10 0 00-7.743 16.326L4 22l3.674-3.743A10 10 0 1012 2zm0 0a10 10 0 0110 10 10 10 0 01-10 10A10 10 0 012 12 10 10 0 0112 2zm0 0v1.5a8.5 8.5 0 00-6.182 14.773L4 20l2.227-2.182A8.5 8.5 0 0012 3.5v-1.5z M12 12a2 2 0 100-4 2 2 0 000 4z M8 16a4 4 0 118 0 4 4 0 01-8 0z" /></svg>
        ),
        [Role.VILLAGER]: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        ),
        [Role.SEER]: (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
        ),
    };
    return iconMap[role];
};

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, gameState }) => {
  const { language } = useContext(LanguageContext);
  const t = useTranslations(language);

  const showRole = !player.isAlive || gameState === GameState.GAME_OVER;

  const cardClasses = `
    p-4 rounded-lg shadow-lg border-2 
    transition-all duration-300 transform hover:scale-105
    ${player.isAlive ? 'bg-gray-800 border-gray-700' : 'bg-gray-900 border-red-800 opacity-60'}
  `;

  return (
    <div className={cardClasses}>
      <div className="flex flex-col items-center text-center">
        <h3 className={`font-bold text-lg ${player.isAlive ? 'text-white' : 'text-gray-500 line-through'}`}>
          {player.name}
        </h3>
        <div className="h-8 mt-2 flex items-center justify-center">
        {showRole ? (
            <div className="flex items-center space-x-2">
                <RoleIcon role={player.role} />
                <span className="text-sm font-medium text-gray-400">{t.roles[player.role]}</span>
            </div>
            ) : (
             <span className="text-sm text-gray-500 italic">{t.roleHidden}</span>
            )}
        </div>
      </div>
    </div>
  );
};
