import { GameState, Role } from '../types';

const en = {
    title: 'AI Werewolf Game',
    subtitle: 'A fully automated Werewolf game simulator powered by AI agents.',
    players: 'Players',
    player: 'Player',
    day: 'DAY',
    resetGame: 'Reset Game',
    gameOver: 'Game Over!',
    playAgain: 'Play Again',
    winMessage: (winner: string) => `${winner} have won the game!`,

    // Game Setup
    gameSetupTitle: 'Game Setup',
    numWerewolves: 'Number of Werewolves',
    numVillagers: 'Number of Villagers',
    totalPlayers: 'Total Players',
    seerInfo: 'Including 1 Seer',
    startGame: 'Start Game',

    // Player Card
    roleHidden: 'Role Hidden',
    roles: {
        [Role.WEREWOLF]: 'Werewolf',
        [Role.VILLAGER]: 'Villager',
        [Role.SEER]: 'Seer',
    },

    // Game Log
    gameLogTitle: 'Game Log',

    // Game States
    gameStates: {
        [GameState.SETUP]: 'SETUP',
        [GameState.NIGHT]: 'NIGHT',
        [GameState.DAY_DISCUSSION]: 'DISCUSSION',
        [GameState.DAY_VOTE]: 'VOTING',
        [GameState.GAME_OVER]: 'GAME OVER',
    },
    
    // Winners
    winners: {
      'The Villagers': 'The Villagers',
      'The Werewolves': 'The Werewolves',
    },

    // Actions
    actions: {
        werewolvesChoosing: 'Werewolves are choosing their target...',
        seerSeeking: 'The Seer is seeking a vision...',
        playerThinking: (name: string) => `${name} is thinking...`,
        playerSpeaking: (name: string) => `${name} is speaking...`,
        playerVoting: (name: string) => `${name} is deciding who to vote for...`,
    },

    // Log Entries
    log: {
        newGame: () => '--- New Game Started ---',
        gameSetup: (p: any) => `Game setup with ${p.totalPlayers} players: ${p.numWerewolves} Werewolv${p.numWerewolves > 1 ? 'es' : 'f'}, 1 Seer, ${p.numVillagers} Villagers.`,
        werewolvesEliminated: () => 'All werewolves have been eliminated.',
        werewolvesOutnumber: () => 'Werewolves now equal or outnumber the villagers.',
        nightPhase: (p: any) => `--- Night ${p.day} ---`,
        werewolvesChooseTarget: () => 'The werewolves have chosen a target.',
        werewolvesNoTarget: () => 'The werewolves have no targets or are all eliminated.',
        seerChecks: (p: any) => `The Seer checks ${p.targetName} and discovers they are a ${p.targetRole}.`,
        dawnKill: (p: any) => `As dawn breaks, the village discovers that ${p.playerName} was eliminated during the night.`,
        dawnNoKill: () => 'Dawn breaks, and miraculously, everyone survived the night.',
        dayDiscussion: (p: any) => `--- Day ${p.day}: Discussion ---`,
        dayVote: (p: any) => `--- Day ${p.day}: Voting ---`,
        playerVotes: (p: any) => `${p.voterName} votes for ${p.targetName}.`,
        voteTie: () => 'The vote is a tie. No one is eliminated today.',
        voteResult: (p: any) => `With ${p.count} votes, ${p.playerName} has been voted out.`,
    }
};

const zh: typeof en = {
    title: 'AI 狼人杀',
    subtitle: '一个由 AI 代理驱动的全自动狼人杀模拟器。',
    players: '玩家',
    player: '玩家',
    day: '白天',
    resetGame: '重置游戏',
    gameOver: '游戏结束！',
    playAgain: '再玩一次',
    winMessage: (winner: string) => `${winner}赢得了游戏！`,

    // Game Setup
    gameSetupTitle: '游戏设置',
    numWerewolves: '狼人数量',
    numVillagers: '村民数量',
    totalPlayers: '总玩家数',
    seerInfo: '（包含 1 个预言家）',
    startGame: '开始游戏',

    // Player Card
    roleHidden: '身份隐藏',
    roles: {
        [Role.WEREWOLF]: '狼人',
        [Role.VILLAGER]: '村民',
        [Role.SEER]: '预言家',
    },

    // Game Log
    gameLogTitle: '游戏日志',

    // Game States
    gameStates: {
        [GameState.SETUP]: '设置',
        [GameState.NIGHT]: '夜晚',
        [GameState.DAY_DISCUSSION]: '讨论',
        [GameState.DAY_VOTE]: '投票',
        [GameState.GAME_OVER]: '游戏结束',
    },
    
    // Winners
    winners: {
      'The Villagers': '村民阵营',
      'The Werewolves': '狼人阵营',
    },

    // Actions
    actions: {
        werewolvesChoosing: '狼人正在选择目标...',
        seerSeeking: '预言家正在查看身份...',
        playerThinking: (name: string) => `${name} 正在思考...`,
        playerSpeaking: (name: string) => `${name} 正在发言...`,
        playerVoting: (name: string) => `${name} 正在决定投票给谁...`,
    },
    
    // Log Entries
    log: {
        newGame: () => '--- 新游戏开始 ---',
        gameSetup: (p: any) => `游戏设置: ${p.totalPlayers} 名玩家: ${p.numWerewolves} 个狼人, 1 个预言家, ${p.numVillagers} 个村民。`,
        werewolvesEliminated: () => '所有狼人都被淘汰了。',
        werewolvesOutnumber: () => '狼人的数量现在等于或超过了村民。',
        nightPhase: (p: any) => `--- 第 ${p.day} 天夜晚 ---`,
        werewolvesChooseTarget: () => '狼人选择了一个目标。',
        werewolvesNoTarget: () => '狼人没有目标或已全部被淘汰。',
        seerChecks: (p: any) => `预言家查验了 ${p.targetName}，发现其身份是 ${p.targetRole}。`,
        dawnKill: (p: any) => `黎明时分，村民们发现 ${p.playerName} 在夜里被淘汰了。`,
        dawnNoKill: () => '黎明时分，奇迹般地，所有人都活了下来。',
        dayDiscussion: (p: any) => `--- 第 ${p.day} 天: 讨论阶段 ---`,
        dayVote: (p: any) => `--- 第 ${p.day} 天: 投票阶段 ---`,
        playerVotes: (p: any) => `${p.voterName} 投票给 ${p.targetName}。`,
        voteTie: () => '投票平票，今天没有人被淘汰。',
        voteResult: (p: any) => `以 ${p.count} 票，${p.playerName} 被投票出局。`,
    }
};

export const translations = { en, zh };
