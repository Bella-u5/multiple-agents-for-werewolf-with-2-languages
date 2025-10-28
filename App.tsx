import React from 'react';
import { GameSetup } from './components/GameSetup';
import { PlayerGrid } from './components/PlayerGrid';
import { GameLog } from './components/GameLog';
import { GameState } from './types';
import { useGameOrchestrator } from './hooks/useGameOrchestrator';
import { LanguageProvider } from './contexts/LanguageContext';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { useTranslations } from './hooks/useTranslations';

const AppContent: React.FC = () => {
  const {
    gameState,
    players,
    gameLog,
    day,
    winner,
    setupGame,
    resetGame,
    currentAction,
    language
  } = useGameOrchestrator();

  const t = useTranslations(language);

  const isGameRunning = gameState !== GameState.SETUP && gameState !== GameState.GAME_OVER;

  const translatedWinner = winner ? t.winners[winner] : '';

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans flex flex-col items-center p-4 md:p-8">
      <header className="w-full max-w-7xl text-center mb-8 relative">
        <h1 className="text-4xl md:text-5xl font-bold text-red-500 tracking-wider">
          {t.title}
        </h1>
        <p className="text-gray-400 mt-2">{t.subtitle}</p>
        <div className="absolute top-0 right-0">
          <LanguageSwitcher />
        </div>
      </header>

      <main className="w-full max-w-7xl flex-grow flex flex-col lg:flex-row gap-8">
        {gameState === GameState.SETUP && <GameSetup onStartGame={setupGame} />}
        
        {(gameState !== GameState.SETUP) && (
          <>
            <div className="lg:w-2/3 w-full">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-semibold text-gray-300">{t.players}</h2>
                 {isGameRunning && (
                    <div className="text-lg font-mono px-3 py-1 bg-gray-800 rounded-md">{t.day} {day} - {t.gameStates[gameState]}</div>
                 )}
              </div>
              <PlayerGrid players={players} gameState={gameState} />

              {currentAction && (
                <div className="mt-6 p-4 bg-gray-800 rounded-lg text-center">
                  <p className="text-lg text-yellow-400 animate-pulse">{currentAction}</p>
                </div>
              )}
            </div>

            <div className="lg:w-1/3 w-full flex flex-col">
              <GameLog log={gameLog} />
              <div className="mt-4">
                <button
                    onClick={resetGame}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300"
                >
                    {t.resetGame}
                </button>
              </div>
            </div>
          </>
        )}

        {gameState === GameState.GAME_OVER && winner && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-gray-800 p-8 rounded-xl shadow-2xl text-center border-2 border-yellow-500">
                    <h2 className="text-4xl font-bold mb-4 text-yellow-400">{t.gameOver}</h2>
                    <p className="text-2xl text-gray-200 mb-8">{t.winMessage(translatedWinner)}</p>
                    <button
                        onClick={resetGame}
                        className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-6 rounded-lg text-lg transition-colors duration-300"
                    >
                        {t.playAgain}
                    </button>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <LanguageProvider>
    <AppContent />
  </LanguageProvider>
);


export default App;
