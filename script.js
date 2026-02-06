const questions = [
  { id: "real", text: "Is the character a real person?" },
  { id: "alive", text: "Is the character alive today?" },
  { id: "hero", text: "Are they known as a hero or protagonist?" },
  { id: "magic", text: "Do they have magical or supernatural powers?" },
  { id: "tech", text: "Are they strongly associated with technology or science?" },
  { id: "leader", text: "Are they a leader or ruler?" },
  { id: "space", text: "Are they linked to space or sci-fi adventures?" },
  { id: "detective", text: "Are they famous for solving mysteries?" },
  { id: "villain", text: "Are they primarily known as a villain?" },
  { id: "music", text: "Are they known for music or performing arts?" },
  { id: "sports", text: "Are they famous in sports?" },
  { id: "animated", text: "Are they animated or from a cartoon?" },
  { id: "fantasy", text: "Are they from a fantasy world?" },
  { id: "sidekick", text: "Are they often seen as a sidekick or partner?" },
];

const characters = [
  {
    name: "Sherlock Holmes",
    traits: { real: 0, detective: 1, hero: 1, magic: -1, tech: 0, leader: 0, villain: -1, space: -1, fantasy: -1, animated: 0 },
  },
  {
    name: "Wonder Woman",
    traits: { real: -1, hero: 1, magic: 0.6, leader: 0.6, villain: -1, fantasy: 0.2, animated: 0 },
  },
  {
    name: "Darth Vader",
    traits: { real: -1, villain: 1, hero: -0.6, space: 1, tech: 0.5, fantasy: 0.2, animated: 0 },
  },
  {
    name: "Harry Potter",
    traits: { real: -1, hero: 1, magic: 1, fantasy: 1, animated: 0 },
  },
  {
    name: "Hermione Granger",
    traits: { real: -1, hero: 0.8, magic: 1, fantasy: 1, sidekick: 0.6 },
  },
  {
    name: "Tony Stark",
    traits: { real: -1, hero: 1, tech: 1, leader: 0.5, space: 0.2 },
  },
  {
    name: "Elon Musk",
    traits: { real: 1, tech: 1, leader: 0.6, space: 0.8, hero: 0.2 },
  },
  {
    name: "Taylor Swift",
    traits: { real: 1, music: 1, hero: 0.2 },
  },
  {
    name: "Lionel Messi",
    traits: { real: 1, sports: 1, hero: 0.4 },
  },
  {
    name: "Elsa",
    traits: { real: -1, hero: 0.5, magic: 1, fantasy: 1, animated: 1, leader: 0.4 },
  },
  {
    name: "Gandalf",
    traits: { real: -1, hero: 1, magic: 1, fantasy: 1, leader: 0.8 },
  },
  {
    name: "Batman",
    traits: { real: -1, hero: 1, detective: 0.6, tech: 0.6, villain: -1 },
  },
  {
    name: "Captain Jack Sparrow",
    traits: { real: -1, hero: 0.2, leader: 0.3, fantasy: 0.3, villain: 0.2 },
  },
  {
    name: "Shrek",
    traits: { real: -1, hero: 0.6, fantasy: 1, animated: 1 },
  },
];

const questionEl = document.getElementById("question");
const confidenceEl = document.getElementById("confidence");
const progressBar = document.getElementById("progress-bar");
const choices = document.querySelectorAll(".choice");
const resultSection = document.getElementById("result");
const resultBody = document.getElementById("result-body");
const resultTitle = document.getElementById("result-title");
const historyList = document.getElementById("history-list");
const resetButton = document.getElementById("reset");
const correctButton = document.getElementById("correct");
const incorrectButton = document.getElementById("incorrect");

const answerWeights = {
  yes: 1,
  no: -1,
  maybe: 0.4,
  unknown: 0,
};

let asked = [];
let history = [];
let scores = characters.map(() => 0);
let currentQuestion = null;

function scoreCharacters(traitId, weight) {
  scores = scores.map((score, index) => {
    const traitValue = characters[index].traits[traitId] ?? 0;
    return score + traitValue * weight;
  });
}

function pickNextQuestion() {
  const remaining = questions.filter((q) => !asked.includes(q.id));
  if (remaining.length === 0) {
    return null;
  }

  const scored = remaining.map((question) => {
    const values = characters.map((character) => character.traits[question.id] ?? 0);
    const variance = values.reduce((sum, value) => sum + Math.abs(value), 0) / values.length;
    const separation = Math.max(...values) - Math.min(...values);
    return { question, weight: variance + separation };
  });

  scored.sort((a, b) => b.weight - a.weight);
  return scored[0].question;
}

function getTopGuess() {
  const maxScore = Math.max(...scores);
  const maxIndex = scores.indexOf(maxScore);
  return { character: characters[maxIndex], score: maxScore };
}

function calculateConfidence() {
  const sorted = [...scores].sort((a, b) => b - a);
  const [top, second] = sorted;
  if (top === 0 && second === 0) {
    return 0;
  }
  const delta = top - (second ?? 0);
  return Math.min(100, Math.max(0, 50 + delta * 18));
}

function updateUI() {
  if (!currentQuestion) {
    questionEl.textContent = "I need more knowledge. Please start over.";
    return;
  }
  questionEl.textContent = currentQuestion.text;
  const confidence = calculateConfidence();
  confidenceEl.textContent = `Confidence: ${Math.round(confidence)}%`;
  progressBar.style.width = `${Math.min(100, asked.length * 8 + confidence * 0.4)}%`;
}

function updateHistory() {
  historyList.innerHTML = "";
  history.slice(-6).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.question} → ${item.answer}`;
    historyList.appendChild(li);
  });
}

function showResult() {
  const { character, score } = getTopGuess();
  resultSection.hidden = false;
  resultTitle.textContent = "I have a guess!";
  resultBody.textContent = `You are thinking of ${character.name}. (Match score: ${score.toFixed(1)})`;
}

function maybeGuess() {
  const confidence = calculateConfidence();
  if (confidence > 75 || asked.length >= 10) {
    showResult();
  }
}

function handleAnswer(answerKey) {
  if (!currentQuestion) return;
  const weight = answerWeights[answerKey];
  scoreCharacters(currentQuestion.id, weight);
  asked.push(currentQuestion.id);
  history.push({ question: currentQuestion.text, answer: answerKey });
  updateHistory();
  currentQuestion = pickNextQuestion();
  updateUI();
  maybeGuess();
}

function resetGame() {
  asked = [];
  history = [];
  scores = characters.map(() => 0);
  currentQuestion = pickNextQuestion();
  resultSection.hidden = true;
  updateUI();
  updateHistory();
}

choices.forEach((button) => {
  button.addEventListener("click", () => handleAnswer(button.dataset.answer));
});

resetButton.addEventListener("click", resetGame);
correctButton.addEventListener("click", () => {
  resultTitle.textContent = "Nice!";
  resultBody.textContent = "I knew I could do it. Want to play again?";
});

incorrectButton.addEventListener("click", () => {
  resultTitle.textContent = "Let's refine.";
  resultBody.textContent = "Keep answering questions and I'll try again.";
  resultSection.hidden = true;
});

resetGame();
