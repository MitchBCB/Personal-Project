const sentences = [
  "The quick brown fox jumps over the lazy dog.",
  "Coding every day builds confidence and muscle memory.",
  "A calm mind types faster than a stressed one.",
  "Typing accuracy matters just as much as raw speed.",
  "Small daily practice adds up to big improvements.",
  "Keep your wrists relaxed and your shoulders down.",
  "Learning to code is a marathon, not a sprint.",
  "Short breaks help your fingers reset and recover.",
  "A clean workspace can boost focus and flow.",
  "When in doubt, breathe and type at a steady pace.",
  "Focus on rhythm and the speed will naturally follow.",
  "Mistakes happen, but consistency is what counts.",
  "The best typists keep their eyes on the screen.",
  "Practice makes progress, even on slow days.",
  "Strong fundamentals lead to faster programming later.",
  "Take your time to hit each key with intention.",
  "Confidence grows with every line of code you write.",
  "Accuracy today creates speed tomorrow.",
  "Warm up your fingers before going full speed.",
  "Stay patient and celebrate small wins while learning."
];

const targetText = document.getElementById("targetText");
const typingInput = document.getElementById("typingInput");
const hint = document.getElementById("hint");
const wpmValue = document.getElementById("wpmValue");
const accuracyValue = document.getElementById("accuracyValue");
const timeValue = document.getElementById("timeValue");
const finalCard = document.getElementById("finalCard");
const finalTime = document.getElementById("finalTime");
const finalWpm = document.getElementById("finalWpm");
const finalAccuracy = document.getElementById("finalAccuracy");
const finalCorrect = document.getElementById("finalCorrect");
const finalMistakes = document.getElementById("finalMistakes");
const newTextButton = document.getElementById("newTextButton");
const restartButton = document.getElementById("restartButton");

let activeText = "";
let startTime = null;
let timerId = null;
let running = false;

const formatSeconds = (seconds) => `${Math.max(0, Math.round(seconds))}s`;

const pickRandomText = () => {
  const index = Math.floor(Math.random() * sentences.length);
  return sentences[index];
};

const renderTargetText = (typedText = "") => {
  targetText.textContent = "";
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < activeText.length; i += 1) {
    const span = document.createElement("span");
    const expectedChar = activeText[i];
    const typedChar = typedText[i];

    if (typedChar == null) {
      span.className = "pending";
    } else if (typedChar === expectedChar) {
      span.className = "correct";
    } else {
      span.className = "incorrect";
    }

    span.textContent = expectedChar;
    fragment.appendChild(span);
  }

  targetText.appendChild(fragment);
};

const calculateStats = (typedText) => {
  let correctChars = 0;

  for (let i = 0; i < Math.min(typedText.length, activeText.length); i += 1) {
    if (typedText[i] === activeText[i]) {
      correctChars += 1;
    }
  }

  const totalTyped = typedText.length;
  const mistakes = Math.max(totalTyped - correctChars, 0);
  const elapsedSeconds = startTime ? (Date.now() - startTime) / 1000 : 0;
  const words = totalTyped / 5;
  const wpm = elapsedSeconds > 0 ? (words / (elapsedSeconds / 60)) : 0;
  const accuracy = totalTyped > 0 ? (correctChars / totalTyped) * 100 : 100;

  return {
    correctChars,
    mistakes,
    elapsedSeconds,
    wpm,
    accuracy
  };
};

const updateDisplay = (typedText) => {
  const stats = calculateStats(typedText);

  wpmValue.textContent = Math.max(0, Math.round(stats.wpm));
  accuracyValue.textContent = `${stats.accuracy.toFixed(1)}%`;
  timeValue.textContent = formatSeconds(stats.elapsedSeconds);
};

const startTimer = () => {
  if (running) {
    return;
  }

  running = true;
  startTime = Date.now();
  hint.textContent = "Typing...";

  timerId = window.setInterval(() => {
    updateDisplay(typingInput.value);
  }, 250);
};

const stopTimer = () => {
  if (timerId) {
    window.clearInterval(timerId);
    timerId = null;
  }
  running = false;
};

const finishTest = (typedText) => {
  stopTimer();
  typingInput.disabled = true;
  hint.textContent = "Great work!";

  const stats = calculateStats(typedText);

  finalTime.textContent = formatSeconds(stats.elapsedSeconds);
  finalWpm.textContent = Math.max(0, Math.round(stats.wpm));
  finalAccuracy.textContent = `${stats.accuracy.toFixed(1)}%`;
  finalCorrect.textContent = stats.correctChars;
  finalMistakes.textContent = stats.mistakes;
  finalCard.hidden = false;
};

const resetTest = (keepText) => {
  stopTimer();
  startTime = null;
  typingInput.disabled = false;
  typingInput.value = "";
  hint.textContent = "Start typing to begin.";
  finalCard.hidden = true;

  if (!keepText) {
    activeText = pickRandomText();
  }

  renderTargetText("");
  updateDisplay("");
};

const handleInput = () => {
  const typedText = typingInput.value;

  if (!startTime && typedText.length > 0) {
    startTimer();
  }

  renderTargetText(typedText);
  updateDisplay(typedText);

  if (typedText.length >= activeText.length) {
    finishTest(typedText);
  }
};

newTextButton.addEventListener("click", () => {
  activeText = pickRandomText();
  resetTest(true);
});

restartButton.addEventListener("click", () => {
  resetTest(true);
});

typingInput.addEventListener("input", handleInput);

activeText = pickRandomText();
renderTargetText("");
updateDisplay("");
