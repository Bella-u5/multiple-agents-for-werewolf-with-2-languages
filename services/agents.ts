import { GoogleGenAI, Type } from "@google/genai";
import { Player, Role, WolfStrategy } from '../types';
import { Language } from '../contexts/LanguageContext';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

// --- UTILITY FUNCTIONS ---

const getLanguageName = (lang: Language) => lang === 'zh' ? 'Chinese' : 'English';

const generateJsonContent = async (prompt: string, schema: any, fallback: any) => {
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
        console.error("Error generating JSON from Gemini:", error, "Prompt:", prompt);
        return fallback;
    }
};

const generateTextContent = async (prompt: string, fallback: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating text from Gemini:", error, "Prompt:", prompt);
        return fallback;
    }
}

const getPlayerList = (players: Player[], excludeIds: number[] = []) => {
    return players
        .filter(p => p.isAlive && !excludeIds.includes(p.id))
        .map(p => `ID: ${p.id}, Name: ${p.name}`).join('\n') || 'No one';
};

const getGameLogSummary = (log: string[]) => log.slice(-15).join('\n');

// --- BASE AGENT CLASS ---

export abstract class AIAgent {
    player: Player;

    constructor(player: Player) {
        this.player = player;
    }

    abstract makeStatement(allPlayers: Player[], gameLog: string[], day: number, language: Language): Promise<string>;
    abstract castVote(allPlayers: Player[], gameLog: string[], language: Language): Promise<number | null>;
    abstract nightAction(allPlayers: Player[], gameLog: string[], language: Language): Promise<number | null>;
}

// --- WOLF AGENT ---

export class WolfAgent extends AIAgent {
    private strategy: WolfStrategy;

    constructor(player: Player, strategy: WolfStrategy) {
        super(player);
        this.strategy = strategy;
    }

    async makeStatement(allPlayers: Player[], gameLog: string[], day: number, language: Language): Promise<string> {
        // Day 1 is for strategic plays
        if (day === 1) {
            switch (this.strategy) {
                case 'jump-claim':
                    return this.makeJumpClaimStatement(allPlayers, gameLog, day, language);
                case 'charger':
                    return this.makeChargerStatement(allPlayers, gameLog, day, language);
                case 'back-hook':
                    return this.makeBackHookStatement(allPlayers, gameLog, day, language);
            }
        }
        // After Day 1, wolves play more standardly
        return this.makeStandardWolfStatement(allPlayers, gameLog, day, language);
    }

    private makeJumpClaimStatement(allPlayers: Player[], gameLog: string[], day: number, language: Language): Promise<string> {
        const fellowWolves = allPlayers.filter(p => p.isAlive && p.role === Role.WEREWOLF);
        const potentialTargets = allPlayers.filter(p => p.isAlive && p.role !== Role.WEREWOLF);

        const prompt = `
You are a player in a Werewolf game. It is Day ${day}.
Your name is ${this.player.name} and your role is Werewolf.
Your secret strategy is 'Jump-claim Seer' (悍跳). Your goal is to aggressively claim you are the real Seer to confuse everyone and win control.
Reference Document Insight: Use "rhetorical aggressiveness" and the "Negative Information Leverage Effect" (Part II, 2.1). A faked "Confirmed Kill" (查杀) is more powerful than a simple "good player" claim.

ACTION:
1.  Boldly declare you are the Seer.
2.  Invent a "Confirmed Kill" (查杀). Claim you checked a player last night and found they are a Werewolf.
3.  Choose one player from the list of potential targets to be your "Confirmed Kill". Do NOT choose a fellow werewolf.
4.  Craft a powerful, confident, and aggressive speech in ${getLanguageName(language)}. Your speech must create pressure and sound credible.

LIVING PLAYERS:
${getPlayerList(allPlayers)}

YOUR FELLOW WEREWOLVES (DO NOT TARGET):
${fellowWolves.map(p => p.name).join(', ')}

POTENTIAL "CONFIRMED KILL" TARGETS:
${getPlayerList(potentialTargets)}

RECENT GAME LOG:
${getGameLogSummary(gameLog)}

Your speech (2-4 sentences):`;
        return generateTextContent(prompt, "I am the Seer! I checked someone last night and they are a werewolf!");
    }

    private makeChargerStatement(allPlayers: Player[], gameLog: string[], day: number, language: Language): Promise<string> {
        const prompt = `
You are a player in a Werewolf game. It is Day ${day}.
Your name is ${this.player.name} and your role is Werewolf.
Your secret strategy is 'Charger' (冲锋). Your goal is to aggressively support your fellow werewolf who is 'Jump-claiming' the Seer role.
Reference Document Insight: Provide "immediate, public, and strong support" for your partner (Part II, 2.2.1).

ACTION:
1.  Read the game log to find your partner's speech where they claimed to be the Seer.
2.  If they made a "Confirmed Kill" (查杀) accusation, strongly agree with it and attack that accused player.
3.  Express total belief in your partner's Seer claim.
4.  Craft a powerful, supportive speech in ${getLanguageName(language)}.

LIVING PLAYERS:
${getPlayerList(allPlayers)}

RECENT GAME LOG:
${getGameLogSummary(gameLog)}

Your speech (2-3 sentences), supporting the player who claimed Seer:`;
        return generateTextContent(prompt, "I agree with the Seer, the person they accused is very suspicious.");
    }
    
    private makeBackHookStatement(allPlayers: Player[], gameLog: string[], day: number, language: Language): Promise<string> {
        const prompt = `
You are a player in a Werewolf game. It is Day ${day}.
Your name is ${this.player.name} and your role is Werewolf.
Your secret strategy is 'Back-hook' (倒钩). Your goal is to gain the trust of the good players by appearing rational and even siding with them initially.
Reference Document Insight: Your speech must be "highly rational and critical". You should show "goodwill support" to the good guys' side. Crucially, you **must not** support your jump-claiming werewolf partner on Day 1 (Part II, 2.2.2).

ACTION:
1.  Analyze the speeches so far.
2.  Pretend to be a confused but logical Villager.
3.  You can gently question the jump-claiming Seer or suggest waiting for more information. Do NOT attack your own team, but do NOT support them either.
4.  Craft a thoughtful, seemingly neutral, or pro-villager speech in ${getLanguageName(language)}.

LIVING PLAYERS:
${getPlayerList(allPlayers)}

RECENT GAME LOG:
${getGameLogSummary(gameLog)}

Your speech (2-3 sentences), appearing as a logical and trustworthy player:`;
        return generateTextContent(prompt, "This is confusing. I'm not sure who to believe yet. Let's hear more from everyone.");
    }
    
    private makeStandardWolfStatement(allPlayers: Player[], gameLog: string[], day: number, language: Language): Promise<string> {
         const prompt = `
You are a player in a game of Werewolf. It is Day ${day}.
Your name is ${this.player.name} and your role is ${this.player.role}. Your strategy is to pretend to be a Villager. Try to sound convincing. Accuse someone you think is suspicious (but not another werewolf!) to deflect attention. Do not reveal you are a werewolf. The language for your speech must be ${getLanguageName(language)}.

Here are the living players:
${getPlayerList(allPlayers)}

Here is a summary of recent game events:
${getGameLogSummary(gameLog)}

Now, give a short speech (2-3 sentences).`;
        return generateTextContent(prompt, "I'm not sure, but someone is acting suspicious.");
    }

    async castVote(allPlayers: Player[], gameLog: string[], language: Language): Promise<number | null> {
        return castVoteDefault(this.player, allPlayers, gameLog, language);
    }
    
    async nightAction(allPlayers: Player[], gameLog: string[], language: Language): Promise<number | null> {
        const werewolves = allPlayers.filter(p => p.isAlive && p.role === Role.WEREWOLF);
        const potentialTargets = allPlayers.filter(p => p.isAlive && p.role !== Role.WEREWOLF);
        if (potentialTargets.length === 0) return null;
        
        const prompt = `
You are a Werewolf. Your goal is to eliminate villagers.
Your fellow werewolves are: ${werewolves.map(w => w.name).join(', ')}.
The game language is ${getLanguageName(language)}.

TARGETS:
${getPlayerList(potentialTargets)}

GAME LOG:
${getGameLogSummary(gameLog)}

Choose the most strategic player to eliminate. Consider who might be the Seer or a leader. Provide only the ID of your target.`;

        const schema = { type: Type.OBJECT, properties: { targetId: { type: Type.NUMBER } }, required: ['targetId'] };
        const fallback = { targetId: potentialTargets[Math.floor(Math.random() * potentialTargets.length)].id };
        const result = await generateJsonContent(prompt, schema, fallback);
        return potentialTargets.some(p => p.id === result.targetId) ? result.targetId : fallback.targetId;
    }
}

// --- SEER AGENT ---

export class SeerAgent extends AIAgent {
    async makeStatement(allPlayers: Player[], gameLog: string[], day: number, language: Language): Promise<string> {
        const prompt = `
You are the Seer in a Werewolf game. It is Day ${day}.
Your name is ${this.player.name}. You must be careful. You can hint at your knowledge without revealing you are the Seer too early, which would make you a target. Or, you can reveal your findings if you think it's time, especially if another player is falsely claiming to be the Seer. The language for your speech must be ${getLanguageName(language)}.

LIVING PLAYERS:
${getPlayerList(allPlayers)}

GAME LOG:
${getGameLogSummary(gameLog)}

Give a short speech (2-3 sentences) based on what you know and the game state.`;
        return generateTextContent(prompt, "I have a strong feeling about someone, we need to be careful.");
    }
    async castVote(allPlayers: Player[], gameLog:string[], language: Language): Promise<number | null> {
        return castVoteDefault(this.player, allPlayers, gameLog, language);
    }
    async nightAction(allPlayers: Player[], gameLog: string[], language: Language): Promise<number | null> {
        const potentialTargets = allPlayers.filter(p => p.isAlive && p.id !== this.player.id);
        if (potentialTargets.length === 0) return null;

        const prompt = `
You are the Seer. Choose one player to check tonight. Based on discussions, who do you suspect is a werewolf?
The game language is ${getLanguageName(language)}.

PLAYERS TO CHECK:
${getPlayerList(potentialTargets)}

GAME LOG:
${getGameLogSummary(gameLog)}

Provide the ID of the player you will check.`;
        
        const schema = { type: Type.OBJECT, properties: { targetId: { type: Type.NUMBER } }, required: ['targetId'] };
        const fallback = { targetId: potentialTargets[Math.floor(Math.random() * potentialTargets.length)].id };
        const result = await generateJsonContent(prompt, schema, fallback);
        return potentialTargets.some(p => p.id === result.targetId) ? result.targetId : fallback.targetId;
    }
}

// --- VILLAGER AGENT ---

export class VillagerAgent extends AIAgent {
    async makeStatement(allPlayers: Player[], gameLog: string[], day: number, language: Language): Promise<string> {
        const prompt = `
You are a Villager in a Werewolf game. It is Day ${day}.
Your name is ${this.player.name}. You are trying to find the werewolves. Express your thoughts on who might be suspicious based on events and speeches. Be logical. The language for your speech must be ${getLanguageName(language)}.

LIVING PLAYERS:
${getPlayerList(allPlayers)}

GAME LOG:
${getGameLogSummary(gameLog)}

Give a short speech (2-3 sentences).`;
        return generateTextContent(prompt, "I'm listening to everyone, trying to figure out who is lying.");
    }
    async castVote(allPlayers: Player[], gameLog: string[], language: Language): Promise<number | null> {
        return castVoteDefault(this.player, allPlayers, gameLog, language);
    }
    async nightAction(): Promise<null> {
        return null; // Villagers do nothing at night
    }
}

// --- GENERIC VOTE LOGIC ---
async function castVoteDefault(voter: Player, allPlayers: Player[], gameLog: string[], language: Language): Promise<number | null> {
    const potentialTargets = allPlayers.filter(p => p.isAlive && p.id !== voter.id);
    if (potentialTargets.length === 0) return null;

    const prompt = `
You are a player (${voter.name}, a ${voter.role}) and it's time to vote.
Based on the day's discussion, vote to eliminate one player you believe is a werewolf.
The game language is ${getLanguageName(language)}.

PLAYERS TO VOTE FOR:
${getPlayerList(potentialTargets)}

GAME LOG & SPEECHES:
${getGameLogSummary(gameLog)}

Provide the ID of the player you are voting for.`;
    
    const schema = { type: Type.OBJECT, properties: { targetId: { type: Type.NUMBER } }, required: ['targetId'] };
    const fallback = { targetId: potentialTargets[Math.floor(Math.random() * potentialTargets.length)].id };
    const result = await generateJsonContent(prompt, schema, fallback);
    return potentialTargets.some(p => p.id === result.targetId) ? result.targetId : fallback.targetId;
}
