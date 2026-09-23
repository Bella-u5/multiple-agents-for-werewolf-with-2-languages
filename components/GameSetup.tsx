import React, { useState, useContext, useEffect } from 'react';
import { GameConfig } from '../types';
import { LanguageContext } from '../contexts/LanguageContext';
import { useTranslations } from '../hooks/useTranslations';
import { hasApiKey } from '../services/agents';

interface GameSetupProps {
  onStartGame: (config: GameConfig) => void;
}

export const GameSetup: React.FC<GameSetupProps> = ({ onStartGame }) => {
  const [numWerewolves, setNumWerewolves] = useState(2);
  const [numVillagers, setNumVillagers] = useState(5);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [keyConfigured, setKeyConfigured] = useState(false);
  const [keyNotice, setKeyNotice] = useState<string | null>(null);
  const { language } = useContext(LanguageContext);
  const t = useTranslations(language);

  useEffect(() => {
    setKeyConfigured(hasApiKey());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartGame({ numWerewolves, numVillagers });
  };

  const handleSaveKey = () => {
    const trimmed = apiKeyInput.trim();
    if (trimmed) {
      try { localStorage.setItem('gemini_api_key', trimmed); } catch { /* ignore */ }
      setKeyConfigured(true);
      setKeyNotice(t.keySaved);
    }
    setApiKeyInput('');
  };

  const handleClearKey = () => {
    try { localStorage.removeItem('gemini_api_key'); } catch { /* ignore */ }
    setKeyConfigured(false);
    setKeyNotice(t.keyCleared);
    setApiKeyInput('');
  };

  const totalPlayers = numWerewolves + numVillagers + 1; // +1 for Seer

  return (
    <div className="w-full max-w-md m-auto bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
      <h2 className="text-3xl font-bold text-center text-white mb-6">{t.gameSetupTitle}</h2>

      {/* LLM Engine / API Key panel */}
      <div className="mb-6 p-4 rounded-lg bg-gray-900/60 border border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-300">{t.llmEngine}</span>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${keyConfigured ? 'bg-green-900/60 text-green-300 border border-green-700' : 'bg-yellow-900/40 text-yellow-300 border border-yellow-700'}`}>
            {keyConfigured ? '● ' + t.llmConfigured : '○ ' + t.llmOffline}
          </span>
        </div>
        <div className="flex gap-2">
          <input
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder={t.apiKeyPlaceholder}
            className="flex-1 min-w-0 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
          <button
            type="button"
            onClick={handleSaveKey}
            className="shrink-0 bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-3 rounded-md transition-colors"
          >
            {t.saveKey}
          </button>
          {keyConfigured && (
            <button
              type="button"
              onClick={handleClearKey}
              className="shrink-0 bg-gray-600 hover:bg-gray-500 text-white text-sm py-2 px-3 rounded-md transition-colors"
            >
              {t.clearKey}
            </button>
          )}
        </div>
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-2 text-xs text-blue-400 hover:text-blue-300 underline"
        >
          {t.getApiKey} ↗
        </a>
        {keyNotice && <p className="mt-2 text-xs text-green-400">{keyNotice}</p>}
        {!keyConfigured && (
          <p className="mt-3 text-xs leading-relaxed text-gray-400 border-t border-gray-700 pt-2">
            {t.offlineNotice}
          </p>
        )}
      </div>

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
