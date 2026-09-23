# AI Werewolf · 多智能体社会推理模拟

> 一个由多个 LLM Agent 互相博弈的双语狼人杀游戏 —— 也是我对「多 Agent 社会动力学」研究的第一个实验场。

English summary: A bilingual (中文/EN) social-deduction game where every player is an autonomous LLM agent. Role-specialized agents (Villager / Werewolf / Seer / ...) make statements, vote, and take night actions based on partial information; werewolves follow explicit deception strategies. Built with React + TypeScript + Gemini structured outputs. This project was my first hands-on exploration of multi-agent social dynamics — deception, alliance, herding, and trust under information asymmetry — and the starting point of my later work on larger-scale AI social-world simulation.

## 为什么做这个项目

狼人杀是一个**最小化的社会推理环境**：

- **信息不对称**：每个 agent 只看到部分真相
- **欺骗与伪装**：狼人需要在发言中隐藏身份（悍跳、倒钩等策略）
- **联盟与信任**：好人阵营要通过发言建立/瓦解信任
- **群体动力学**：投票是 emergent 的社会行为，而不是单轮问答

我想观察的不只是「LLM 会不会玩狼人杀」，而是：

> 当多个 LLM Agent 处在一个有利益冲突的社会结构里，它们会涌现出什么样的社会行为？

这个项目后来成为我设计更复杂的 AI 社交世界模拟（多 agent、持久记忆、社会关系图谱）的思维起点。

## 架构

```text
React 19 + TypeScript + Vite (前端 / 游戏状态机)
    └── services/agents.ts        角色化 Agent 基类 + 各角色实现
    │     ├── WolfAgent           狼人：策略化行动（悍跳 jump-claim 等）
    │     ├── SeerAgent           预言家：查验与信息释放
    │     └── ...                 其他角色 Agent
    └── services/geminiService.ts Gemini 2.5 Flash 调用层
          ├── 结构化 JSON Schema 输出（投票 / 夜间行动）
          ├── 自由文本生成（白天发言）
          └── fallback 兜底（生成失败时保证游戏可继续）
```

关键设计：

- **每个玩家一个 Agent 实例**：agent 只拿到自己角色可见的信息，不共享上帝视角
- **策略与生成分离**：狼人的策略（悍跳/深水等）是显式决策，发言文本交给 LLM 生成
- **结构化输出 + 兜底**：关键动作（投票、夜间行动）用 JSON Schema 约束，生成失败走 fallback，保证对局不中断
- **中英双语**：UI 与 agent 发言均支持中英文切换，可观察同一局面下不同语言的表现差异

## 观察到的有趣现象

在调试和多轮对局中观察到的一些模式（定性观察，非严格实验结论）：

- **羊群效应（herding）**：信息不足时，agent 倾向于跟随先发言者的立场，而不是独立推理
- **立场漂移**：同一 agent 在多轮发言中可能无意识地改变怀疑对象
- **辩解模式趋同**：被怀疑时，不同 agent 的辩解话术结构高度相似

这些观察直接影响了我在后续项目中对抗「多角色趋同」的设计思路（差异化记忆、差异化信息曝光、独立关系状态）。

## 本地运行

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app: `npm run dev`

## 相关项目

这个项目是我「多 Agent 社会模拟」系列探索的起点，后续的 AI 社交世界模拟项目（archetype-to-world：持久社交图谱 + agent 自主性 + 可追溯因果链）在此基础上展开，欢迎交流。
