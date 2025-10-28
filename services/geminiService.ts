import { Player, Role } from '../types';
import { Language } from '../contexts/LanguageContext';

/**
 * ===================================================================================
 * AI AGENT SERVICE (Mock Implementation)
 * -----------------------------------------------------------------------------------
 * This file simulates the behavior of AI agents for each role in the Werewolf game.
 * Each function represents a decision-making process for an AI agent.
 * 
 * IMPORTANT: The logic here is simplified for demonstration purposes. A real implementation
 * would involve calling a generative AI model like Google Gemini. The commented-out `prompt`
 * constants provide a clear example of what would be sent to the Gemini API.
 * The `generateContent` call would be used to get a response from the model.
 * ===================================================================================
 */

// Helper function to get a random element from an array
const getRandomElement = <T,>(arr: T[]): T | undefined => {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
};


/**
 * Determines the werewolves' target for elimination.
 * In a real scenario, all werewolves would "confer" via a shared context.
 */
export const getWerewolfTarget = async (
  werewolves: Player[],
  allPlayers: Player[],
  gameLog: string[],
  language: Language
): Promise<number> => {
    const livingPlayers = allPlayers.filter(p => p.isAlive);
    const potentialTargets = livingPlayers.filter(p => p.role !== Role.WEREWOLF);
    
    // In a real implementation, you would adjust the prompt based on the language.
    // For now, the mock logic remains the same, but the function signature supports it.
    
    // Mock logic: choose a random non-werewolf player.
    const target = getRandomElement(potentialTargets);
    return target ? target.id : livingPlayers[0].id;
};

/**
 * Determines which player the Seer will check.
 */
export const getSeerCheck = async (
  seer: Player,
  allPlayers: Player[],
  gameLog: string[],
  language: Language
): Promise<number> => {
  const potentialTargets = allPlayers.filter(p => p.isAlive && p.id !== seer.id);
  
  // Mock logic: choose a random player who isn't the seer.
  const target = getRandomElement(potentialTargets);
  return target ? target.id : 0;
};

/**
 * Generates a speech for a player during the day.
 */
export const getPlayerSpeech = async (
  player: Player,
  allPlayers: Player[],
  gameLog: string[],
  day: number,
  language: Language
): Promise<string> => {
  const livingPlayers = allPlayers.filter(p => p.isAlive);
  const suspiciousPlayer = getRandomElement(livingPlayers.filter(p => p.id !== player.id));
  const suspiciousName = suspiciousPlayer ? suspiciousPlayer.name : (language === 'zh' ? '某人' : 'someone');

  const speeches = {
    en: {
      [Role.WEREWOLF]: `I've been listening carefully, and I think ${suspiciousName} is acting very strangely. Their arguments don't add up. We should be cautious.`,
      [Role.SEER]: `I have a strong feeling about this. We need to focus our attention on ${suspiciousName}. I can't say more, but trust me on this.`,
      [Role.VILLAGER]: `This is tough. I'm not sure who to trust, but ${suspiciousName}'s speech made me a little suspicious. What does everyone else think?`,
    },
    zh: {
      [Role.WEREWOLF]: `我仔细听了大家的发言，我觉得 ${suspiciousName} 的行为非常奇怪。他的论点站不住脚，我们应该小心。`,
      [Role.SEER]: `我对此有强烈的预感。我们需要把注意力集中在 ${suspiciousName} 身上。我不能说得更多，但请相信我。`,
      [Role.VILLAGER]: `这太难了。我不确定该相信谁，但是 ${suspiciousName} 的发言让我有点怀疑。其他人怎么看？`,
    }
  };

  return speeches[language][player.role] || speeches['en'][player.role];
};

/**
 * Determines who a player votes for.
 */
export const getPlayerVote = async (
  voter: Player,
  allPlayers: Player[],
  gameLog: string[],
  language: Language
): Promise<number | null> => {
  const potentialTargets = allPlayers.filter(p => p.isAlive && p.id !== voter.id);

  if (potentialTargets.length === 0) return null;
  
  // Mock logic: choose a random player to vote for.
  const target = getRandomElement(potentialTargets);
  return target ? target.id : null;
};
