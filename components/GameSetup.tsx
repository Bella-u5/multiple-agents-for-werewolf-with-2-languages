import React, { useState, useContext } from 'react';
import { GameConfig } from '../types';
import { LanguageContext } from '../contexts/LanguageContext';
import { useTranslations } from '../hooks/useTranslations';

interface GameSetupProps {
  onStartGame: (config: GameConfig) => void;
}

export const GameSetup: React.FC<GameSetupProps> = ({ onStartGame }) => {
  const [numWerewolves, setNumWerewolves] = useState(2);
  const [numVillagers, setNumVillagers] = useState(5);
  const { language } = useContext(LanguageContext);
  const t = useTranslations(language);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartGame({ numWerewolves, numVillagers });
  };

  const totalPlayers = numWerewolves + numVillagers + 1; // +1 for Seer

  return (
    <div className="w-full max-w-md m-auto bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
      <h2 className="text-3xl font-bold text-center text-white mb-6">{t.gameSetupTitle}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="werewolves" className="block text-sm font-medium text-gray-300 mb-2">
            {t.numWerewolves}
          </label>
          <input
            type="number"
            id="werewolves"
            value={numWerewolves}
            onChange={(e) => setNumWerewolves(Math.max(1, parseInt(e.target.value, 10)))}
            min="1"
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
        <div>
          <label htmlFor="villagers" className="block text-sm font-medium text-gray-300 mb-2">
            {t.numVillagers}
          </label>
          <input
            type="number"
            id="villagers"
            value={numVillagers}
            onChange={(e) => setNumVillagers(Math.max(1, parseInt(e.target.value, 10)))}
            min="1"
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div className="text-center text-gray-400 pt-2">
          <p>{t.totalPlayers}: <span className="font-bold text-white">{totalPlayers}</span></p>
          <p className="text-sm">({t.seerInfo})</p>
        </div>

        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 text-lg"
        >
          {t.startGame}
        </button>
      </form>
    </div>
  );
};
