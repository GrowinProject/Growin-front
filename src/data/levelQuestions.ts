// src/data/levelQuestions.ts
export type Choice = { id: string; text: string };

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type Question = {
  id: string;
  type: "문법" | "어휘" | "독해" | "청해" | "일반";
  prompt: string;
  choices: Choice[];
  correctId?: string; // (옵션) 정답 체크에 쓸 수 있음
  difficulty: Difficulty; // ✅ 난이도 추가
};

export const LEVEL_QUESTIONS: Question[] = [
  // --- 초급(beginner) ---
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
    difficulty: "beginner",
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
    difficulty: "beginner",
  },

  // --- 중급(intermediate) ---
  {
    id: "q3",
    type: "독해",
    prompt:
      "Read: “Due to unexpected supply issues, the company postponed the launch to ensure product quality.”\nWhy did the company delay the launch?",
    choices: [
      { id: "a", text: "Supply issues" },
      { id: "b", text: "Holiday season" },
      { id: "c", text: "Legal approval" },
      { id: "d", text: "No reason given" },
    ],
    correctId: "a",
    difficulty: "intermediate",
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
    difficulty: "intermediate",
  },

  // --- 고급(advanced) ---
  {
    id: "q5",
    type: "어휘",
    prompt:
      "In the sentence, “The new policy aims to mitigate the risks,” what does “mitigate” most closely mean?",
    choices: [
      { id: "a", text: "to increase" },
      { id: "b", text: "to eliminate completely" },
      { id: "c", text: "to reduce the severity" },
      { id: "d", text: "to ignore" },
    ],
    correctId: "c",
    difficulty: "advanced",
  },
  {
    id: "q6",
    type: "독해",
    prompt:
      "Read: “The author argues that while remote work reduces commute time, its real benefit is a better work-life balance that improves employee well-being.”\nWhat is the author’s main point?",
    choices: [
      { id: "a", text: "Remote work mainly cuts commute time." },
      { id: "b", text: "Remote work improves work-life balance." },
      { id: "c", text: "Remote work lowers office rent." },
      { id: "d", text: "Traffic lights need improvement." },
    ],
    correctId: "b",
    difficulty: "advanced",
  },
];
