import React, { useEffect, useRef, useContext } from 'react';
import { LogEntry } from '../types';
import { LanguageContext } from '../contexts/LanguageContext';
import { useTranslations } from '../hooks/useTranslations';

interface GameLogProps {
  log: LogEntry[];
}

export const GameLog: React.FC<GameLogProps> = ({ log }) => {
  const logEndRef = useRef<HTMLDivElement>(null);
  const { language } = useContext(LanguageContext);
  const t = useTranslations(language);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  const formatLogEntry = (entry: LogEntry): string => {
    if (entry.key === 'playerSpeech' && entry.speaker) {
        return `[${entry.speaker.name} (${t.roles[entry.speaker.role]})]: "${entry.rawSpeech}"`;
    }
    const template = t.log[entry.key];
    if (typeof template === 'function') {
        return template(entry.params);
    }
    return template || entry.key;
  };

  return (
    <div className="flex-grow bg-gray-950 p-4 rounded-lg border border-gray-700 h-96 lg:h-auto overflow-y-auto">
      <h3 className="text-xl font-semibold mb-3 text-gray-300 sticky top-0 bg-gray-950 pb-2">{t.gameLogTitle}</h3>
      <div className="space-y-2 text-sm">
        {log.map((entry, index) => (
          <p key={index} className={`font-mono ${entry.key.startsWith('night') || entry.key.startsWith('day') || entry.key.startsWith('new') ? 'text-yellow-400 mt-3 pt-2 border-t border-gray-800' : 'text-gray-400'}`}>
            {formatLogEntry(entry)}
          </p>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};
