import { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { Player, Role, GameState, GameConfig, LogEntry, WolfStrategy } from '../types';
import { AIAgent, VillagerAgent, SeerAgent, WolfAgent } from '../services/agents';
import { LanguageContext } from '../contexts/LanguageContext';
import { useTranslations } from './useTranslations';

const PLAYER_NAMES = [
  'Alex', 'Ben', 'Charlie', 'Dana', 'Eli', 'Finn', 'Gale', 'Harper',
  'Ira', 'Jean', 'Kai', 'Leo', 'Max', 'Nico', 'Owen', 'Pip', 'Quinn', 'Riley'
];

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

const pause = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useGameOrchestrator = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.SETUP);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameLog, setGameLog] = useState<LogEntry[]>([]);
  const [day, setDay] = useState(1);
  const [winner, setWinner] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  
  const isRunningPhase = useRef(false);
  const agentsRef = useRef<Record<number, AIAgent>>({});

  const { language } = useContext(LanguageContext);
  const t = useTranslations(language);

  const addLog = useCallback((entry: LogEntry) => {
    setGameLog(prevLog => [...prevLog, entry]);
  }, []);

  const getGameLogAsStringArray = useCallback((): string[] => {
    return gameLog.map(entry => {
        if (entry.key === 'playerSpeech' && entry.speaker && entry.rawSpeech) {
            return `${entry.speaker.name} said: "${entry.rawSpeech}"`;
        }
        // A simplified representation for the AI's context
        const template = t.log[entry.key];
        if (typeof template === 'function') {
            return template(entry.params);
        }
        return template || `${entry.key} ${entry.params ? JSON.stringify(entry.params) : ''}`;
    });
  }, [gameLog, t]);

  const setupGame = useCallback((config: GameConfig) => {
    const totalPlayers = config.numWerewolves + config.numVillagers + 1;
    const roles: Role[] = [
      ...Array(config.numWerewolves).fill(Role.WEREWOLF),
      ...Array(config.numVillagers).fill(Role.VILLAGER),
      Role.SEER
    ];
    const shuffledRoles = shuffleArray(roles);
    const shuffledNames = shuffleArray(PLAYER_NAMES).slice(0, totalPlayers);

    const newPlayers: Player[] = shuffledNames.map((name, index) => ({
      id: index,
      name,
      role: shuffledRoles[index],
      isAlive: true,
      isHost: false,
    }));
    
    // Assign strategies to werewolves
    const wolves = newPlayers.filter(p => p.role === Role.WEREWOLF);
    const shuffledWolves = shuffleArray(wolves);
    const strategies: WolfStrategy[] = [];
    if (shuffledWolves.length > 0) {
        strategies.push('jump-claim');
    }
    if (shuffledWolves.length > 1) {
        strategies.push('charger');
    }
    while (strategies.length < shuffledWolves.length) {
        strategies.push('back-hook');
    }

    const wolfStrategies = new Map<number, WolfStrategy>();
    shuffledWolves.forEach((wolf, index) => {
        wolfStrategies.set(wolf.id, strategies[index]);
    });

    // Create agent instances
    const newAgents: Record<number, AIAgent> = {};
    for (const player of newPlayers) {
        switch (player.role) {
            case Role.WEREWOLF:
                newAgents[player.id] = new WolfAgent(player, wolfStrategies.get(player.id)!);
                break;
            case Role.SEER:
                newAgents[player.id] = new SeerAgent(player);
                break;
            case Role.VILLAGER:
                newAgents[player.id] = new VillagerAgent(player);
                break;
        }
    }
    agentsRef.current = newAgents;

    setPlayers(newPlayers);
    setGameState(GameState.NIGHT);
    setDay(1);
    setWinner(null);
    setCurrentAction(null);
    setGameLog([
        { key: 'newGame' },
        { key: 'gameSetup', params: { totalPlayers, numWerewolves: config.numWerewolves, numVillagers: config.numVillagers } }
    ]);
  }, []);

  const resetGame = useCallback(() => {
    setGameState(GameState.SETUP);
    setPlayers([]);
    setGameLog([]);
    setDay(1);
    setWinner(null);
    setCurrentAction(null);
    agentsRef.current = {};
  }, []);
  
  const checkGameOverAndContinue = useCallback((currentPlayers: Player[]) => {
    const livingPlayers = currentPlayers.filter(p => p.isAlive);
    if (livingPlayers.length === 0) return false;

    const livingWerewolves = livingPlayers.filter(p => p.role === Role.WEREWOLF);
    const livingVillagers = livingPlayers.filter(p => p.role !== Role.WEREWOLF);

    if (livingWerewolves.length === 0) {
      setWinner('The Villagers');
      setGameState(GameState.GAME_OVER);
      addLog({ key: 'werewolvesEliminated' });
      return true;
    }

    if (livingWerewolves.length >= livingVillagers.length) {
      setWinner('The Werewolves');
      setGameState(GameState.GAME_OVER);
      addLog({ key: 'werewolvesOutnumber' });
      return true;
    }
    
    return false;
  }, [addLog]);

  useEffect(() => {
    if (gameState === GameState.SETUP || gameState === GameState.GAME_OVER || isRunningPhase.current) {
        return;
    }
    
    const gameLoop = async () => {
        isRunningPhase.current = true;
        
        if (checkGameOverAndContinue(players)) {
            isRunningPhase.current = false;
            return;
        }

        if (gameState === GameState.NIGHT) {
            await runNightPhase();
        } else if (gameState === GameState.DAY_DISCUSSION) {
            await runDayDiscussionPhase();
        } else if (gameState === GameState.DAY_VOTE) {
            await runDayVotePhase();
        }
        
        isRunningPhase.current = false;
    };

    const runNightPhase = async () => {
      addLog({ key: 'nightPhase', params: { day } });
      await pause(1000);

      const werewolves = players.filter(p => p.role === Role.WEREWOLF && p.isAlive);
      let eliminatedPlayerId: number | null = null;
      
      if (werewolves.length > 0) {
        setCurrentAction(t.actions.werewolvesChoosing);
        await pause(1500);
        // Use the first wolf's agent to decide for the pack
        const wolfAgent = agentsRef.current[werewolves[0].id] as WolfAgent;
        const targetId = await wolfAgent.nightAction(players, getGameLogAsStringArray(), language);
        eliminatedPlayerId = targetId;
        addLog({ key: 'werewolvesChooseTarget' });
      } else {
        addLog({ key: 'werewolvesNoTarget' });
      }

      await pause(1000);

      const seer = players.find(p => p.role === Role.SEER && p.isAlive);
      if (seer) {
        setCurrentAction(t.actions.seerSeeking);
        await pause(1500);
        const seerAgent = agentsRef.current[seer.id] as SeerAgent;
        const targetId = await seerAgent.nightAction(players, getGameLogAsStringArray(), language);
        const target = players.find(p => p.id === targetId);
        if (target) {
          addLog({ key: 'seerChecks', params: { targetName: target.name, targetRole: t.roles[target.role] } });
        }
      }
      
      await pause(1000);
      setCurrentAction(null);

      let newPlayers = players;
      if (eliminatedPlayerId !== null) {
          const eliminatedPlayer = players.find(p => p.id === eliminatedPlayerId);
          if (eliminatedPlayer) {
              addLog({ key: 'dawnKill', params: { playerName: eliminatedPlayer.name } });
              newPlayers = players.map(p => p.id === eliminatedPlayerId ? { ...p, isAlive: false } : p);
              setPlayers(newPlayers);
          }
      } else {
          addLog({ key: 'dawnNoKill' });
      }
      await pause(2000);
      if (!checkGameOverAndContinue(newPlayers)) {
        setGameState(GameState.DAY_DISCUSSION);
      }
    };

    const runDayDiscussionPhase = async () => {
      addLog({ key: 'dayDiscussion', params: { day } });
      await pause(1000);

      const livingPlayers = shuffleArray(players.filter(p => p.isAlive));

      for (const player of livingPlayers) {
          setCurrentAction(t.actions.playerThinking(player.name));
          await pause(2000);
          setCurrentAction(t.actions.playerSpeaking(player.name));
          const agent = agentsRef.current[player.id];
          const speech = await agent.makeStatement(players, getGameLogAsStringArray(), day, language);
          addLog({ key: 'playerSpeech', rawSpeech: speech, speaker: { name: player.name, role: player.role }});
          await pause(3000);
      }
      setCurrentAction(null);
      if (!checkGameOverAndContinue(players)) {
        setGameState(GameState.DAY_VOTE);
      }
    };

    const runDayVotePhase = async () => {
      addLog({ key: 'dayVote', params: { day } });
      await pause(1000);
      
      const votes: Record<number, number> = {};
      const livingPlayers = players.filter(p => p.isAlive);

      for (const voter of livingPlayers) {
          setCurrentAction(t.actions.playerVoting(voter.name));
          await pause(1500);
          const agent = agentsRef.current[voter.id];
          const targetId = await agent.castVote(players, getGameLogAsStringArray(), language);
          if (targetId !== null) {
              votes[targetId] = (votes[targetId] || 0) + 1;
              const target = players.find(p => p.id === targetId);
              if(target) {
                  addLog({ key: 'playerVotes', params: { voterName: voter.name, targetName: target.name } });
              }
          }
      }
      
      setCurrentAction(null);
      await pause(2000);
      
      let maxVotes = 0;
      let eliminatedPlayerId: number | null = null;
      let isTie = false;

      Object.entries(votes).forEach(([playerId, count]) => {
          if (count > maxVotes) {
              maxVotes = count;
              eliminatedPlayerId = parseInt(playerId, 10);
              isTie = false;
          } else if (count === maxVotes) {
              isTie = true;
          }
      });
      
      let newPlayers = players;
      if (isTie || eliminatedPlayerId === null) {
          addLog({ key: 'voteTie' });
      } else {
          const eliminatedPlayer = players.find(p => p.id === eliminatedPlayerId);
          if (eliminatedPlayer) {
              addLog({ key: 'voteResult', params: { playerName: eliminatedPlayer.name, count: maxVotes } });
              newPlayers = players.map(p => p.id === eliminatedPlayerId ? { ...p, isAlive: false } : p);
              setPlayers(newPlayers);
          }
      }
      await pause(3000);
      if (!checkGameOverAndContinue(newPlayers)) {
        setDay(d => d + 1);
        setGameState(GameState.NIGHT);
      }
    };

    gameLoop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, day, players, language]);

  return {
    gameState,
    players,
    gameLog,
    day,
    winner,
    setupGame,
    resetGame,
    currentAction,
    language
  };
};