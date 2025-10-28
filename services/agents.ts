// Fix: Import GoogleGenAI and Type from @google/genai
import { GoogleGenAI, Type } from "@google/genai";
import { Player, Role } from '../types';
import { Language } from '../contexts/LanguageContext';

// Fix: Initialize the GoogleGenAI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

const getLanguageName = (lang: Language) => lang === 'zh' ? 'Chinese' : 'English';

const generateJsonContent = async (prompt: string, schema: any) => {
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error generating content from Gemini:", error);
        return null;
    }
};

const generateTextContent = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating text content from Gemini:", error);
        return "I am unable to speak right now.";
    }
}

const getPlayerList = (players: Player[], excludeIds: number[] = []) => {
    return players
        .filter(p => p.isAlive && !excludeIds.includes(p.id))
        .map(p => `ID: ${p.id}, Name: ${p.name}`).join('\n');
};

const getGameLogSummary = (log: string[]) => log.slice(-10).join('\n');

export const getWerewolfTarget = async (
  werewolves: Player[],
  allPlayers: Player[],
  gameLog: string[],
  language: Language
): Promise<number> => {
    const livingPlayers = allPlayers.filter(p => p.isAlive);
    const potentialTargets = livingPlayers.filter(p => p.role !== Role.WEREWOLF);
    
    if (potentialTargets.length === 0) {
        return livingPlayers[0]?.id || 0;
    }

    const prompt = `
You are a Werewolf in a game of Werewolf. Your goal is to eliminate villagers.
Your fellow werewolves are: ${werewolves.map(w => w.name).join(', ')}.
The language of the game is ${getLanguageName(language)}.

Here are the living players you can target:
${getPlayerList(potentialTargets)}

Here is a summary of recent game events:
${getGameLogSummary(gameLog)}

Based on the game so far, choose the most strategic player to eliminate tonight. Consider who might be the Seer or who seems to be a leader among the villagers.
Provide the ID of the player you want to eliminate.
`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            targetId: { type: Type.NUMBER, description: "The ID of the player to eliminate." },
        },
        required: ['targetId']
    };

    const result = await generateJsonContent(prompt, schema);

    if (result && typeof result.targetId === 'number' && potentialTargets.some(p => p.id === result.targetId)) {
        return result.targetId;
    }
    
    const randomTarget = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
    return randomTarget.id;
};

export const getSeerCheck = async (
  seer: Player,
  allPlayers: Player[],
  gameLog: string[],
  language: Language
): Promise<number> => {
    const potentialTargets = allPlayers.filter(p => p.isAlive && p.id !== seer.id);
    if (potentialTargets.length === 0) return 0;

    const prompt = `
You are the Seer in a game of Werewolf. Your goal is to identify the werewolves.
Each night, you can check the role of one player.
The language of the game is ${getLanguageName(language)}.

Here are the players you can check:
${getPlayerList(potentialTargets)}

Here is a summary of recent game events:
${getGameLogSummary(gameLog)}

Based on the discussions and votes, who do you suspect is a werewolf? Choose one player to check tonight.
Provide the ID of the player you want to check.
`;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            targetId: { type: Type.NUMBER, description: "The ID of the player to check." },
        },
        required: ['targetId']
    };

    const result = await generateJsonContent(prompt, schema);

    if (result && typeof result.targetId === 'number' && potentialTargets.some(p => p.id === result.targetId)) {
        return result.targetId;
    }

    const randomTarget = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
    return randomTarget.id;
};

export const getPlayerSpeech = async (
  player: Player,
  allPlayers: Player[],
  gameLog: string[],
  day: number,
  language: Language
): Promise<string> => {
    const livingPlayers = allPlayers.filter(p => p.isAlive);

    const roleInstructions = {
        [Role.WEREWOLF]: "You are a Werewolf pretending to be a Villager. Try to sound convincing. You can accuse someone you think is suspicious (but not another werewolf!) to deflect attention, or you can try to act like a helpful villager. Do not reveal you are a werewolf.",
        [Role.VILLAGER]: "You are a Villager. You are trying to find the werewolves. Express your thoughts on who might be suspicious based on the events and previous speeches. Be logical.",
        [Role.SEER]: "You are the Seer. You know the roles of players you have checked. You must be careful. You can hint at your knowledge without revealing you are the Seer too early, as that would make you a target for the werewolves. Or you can choose to reveal your findings if you think it's the right time."
    };

    const prompt = `
You are a player in a game of Werewolf. It is Day ${day}.
Your name is ${player.name} and your role is ${player.role}.
The language for your speech must be ${getLanguageName(language)}.

${roleInstructions[player.role]}

Here are the living players:
${getPlayerList(livingPlayers)}

Here is a summary of recent game events:
${getGameLogSummary(gameLog)}

Now, give a short speech (2-3 sentences) for the day's discussion. What are your thoughts? Who do you suspect?
`;

    return await generateTextContent(prompt);
};

export const getPlayerVote = async (
  voter: Player,
  allPlayers: Player[],
  gameLog: string[],
  language: Language
): Promise<number | null> => {
    const potentialTargets = allPlayers.filter(p => p.isAlive && p.id !== voter.id);
    if (potentialTargets.length === 0) return null;

    const prompt = `
You are a player in a game of Werewolf, and it's time to vote.
Your name is ${voter.name} and your role is ${voter.role}.
The language of the game is ${getLanguageName(language)}.

Based on the day's discussion and past events, you must vote to eliminate one player you believe is a werewolf.

Here are the players you can vote for:
${getPlayerList(potentialTargets)}

Here is a summary of recent game events and speeches:
${getGameLogSummary(gameLog)}

Who will you vote for? Provide the ID of the player you are voting for.
`;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            targetId: { type: Type.NUMBER, description: "The ID of the player to vote for." },
        },
        required: ['targetId']
    };

    const result = await generateJsonContent(prompt, schema);

    if (result && typeof result.targetId === 'number' && potentialTargets.some(p => p.id === result.targetId)) {
        return result.targetId;
    }

    const randomTarget = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
    return randomTarget.id;
};
