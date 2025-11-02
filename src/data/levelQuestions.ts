// src/data/levelQuestions.ts
export type Choice = { id: string; text: string };
export type Question = {
  id: string;
  type: "문법" | "어휘" | "독해" | "청해" | "일반";
  prompt: string;
  choices: Choice[];
  correctId?: string; // (옵션) 정답 체크에 쓸 수 있음
};

export const LEVEL_QUESTIONS: Question[] = [
  {
    id: "q1",
    type: "문법",
    prompt: "Which sentence is grammatically correct?",
    choices: [
      { id: "a", text: "He don't like coffee." },
      { id: "b", text: "He doesn't likes coffee." },
      { id: "c", text: "He doesn't like coffee." },
      { id: "d", text: "He not likes coffee." },
    ],
    correctId: "c",
  },
  {
    id: "q2",
    type: "어휘",
    prompt: "Choose the best synonym for “rapid”.",
    choices: [
      { id: "a", text: "slow" },
      { id: "b", text: "quick" },
      { id: "c", text: "late" },
      { id: "d", text: "tiny" },
    ],
    correctId: "b",
  },
  {
    id: "q3",
    type: "독해",
    prompt:
      "According to the article, why did the company delay the launch?",
    choices: [
      { id: "a", text: "Supply issues" },
      { id: "b", text: "Holiday season" },
      { id: "c", text: "Legal approval" },
      { id: "d", text: "No reason given" },
    ],
    correctId: "a",
  },
  {
    id: "q4",
    type: "문법",
    prompt: "Fill in the blank: She has lived here ____ 2019.",
    choices: [
      { id: "a", text: "for" },
      { id: "b", text: "since" },
      { id: "c", text: "from" },
      { id: "d", text: "during" },
    ],
    correctId: "b",
  },
  {
    id: "q5",
    type: "어휘",
    prompt: "What does “estimate” most closely mean?",
    choices: [
      { id: "a", text: "to guess the value" },
      { id: "b", text: "to ignore" },
      { id: "c", text: "to celebrate" },
      { id: "d", text: "to destroy" },
    ],
    correctId: "a",
  },
  {
    id: "q6",
    type: "독해",
    prompt:
      "The author’s main point is that remote work can improve what?",
    choices: [
      { id: "a", text: "commute time" },
      { id: "b", text: "work-life balance" },
      { id: "c", text: "office rent" },
      { id: "d", text: "traffic lights" },
    ],
    correctId: "b",
  },
];
