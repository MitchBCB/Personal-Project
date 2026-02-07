import { sb } from "./supabaseClient.js";

const elements = {
  authStatus: document.getElementById("authStatus"),
  authMessage: document.getElementById("authMessage"),
  emailInput: document.getElementById("emailInput"),
  passwordInput: document.getElementById("passwordInput"),
  signUpButton: document.getElementById("signUpButton"),
  signInButton: document.getElementById("signInButton"),
  signOutButton: document.getElementById("signOutButton"),
  editUsernameButton: document.getElementById("editUsernameButton"),
  usernameCard: document.getElementById("usernameCard"),
  usernameInput: document.getElementById("usernameInput"),
  saveUsernameButton: document.getElementById("saveUsernameButton"),
  usernameMessage: document.getElementById("usernameMessage"),
  modeSelect: document.getElementById("modeSelect"),
  durationButtons: document.getElementById("durationButtons"),
  startButton: document.getElementById("startButton"),
  targetDisplay: document.getElementById("targetDisplay"),
  typingInput: document.getElementById("typingInput"),
  timerValue: document.getElementById("timerValue"),
  liveWpm: document.getElementById("liveWpm"),
  liveAccuracy: document.getElementById("liveAccuracy"),
  resultsCard: document.getElementById("resultsCard"),
  resultWpm: document.getElementById("resultWpm"),
  resultAccuracy: document.getElementById("resultAccuracy"),
  resultCorrect: document.getElementById("resultCorrect"),
  resultTotal: document.getElementById("resultTotal"),
  resultDuration: document.getElementById("resultDuration"),
  resultMode: document.getElementById("resultMode"),
  submitScoreButton: document.getElementById("submitScoreButton"),
  submitMessage: document.getElementById("submitMessage"),
  leaderboardMode: document.getElementById("leaderboardMode"),
  leaderboardDuration: document.getElementById("leaderboardDuration"),
  leaderboardBody: document.getElementById("leaderboardBody"),
  leaderboardMessage: document.getElementById("leaderboardMessage"),
  refreshLeaderboard: document.getElementById("refreshLeaderboard")
};

const wordList = [
  "time", "year", "people", "way", "day", "man", "thing", "woman", "life", "child",
  "world", "school", "state", "family", "student", "group", "country", "problem", "hand", "part",
  "place", "case", "week", "company", "system", "program", "question", "work", "government", "number",
  "night", "point", "home", "water", "room", "mother", "area", "money", "story", "issue",
  "side", "kind", "head", "house", "service", "friend", "power", "hour", "game", "line",
  "end", "member", "law", "car", "city", "community", "name", "president", "team", "minute",
  "idea", "kid", "body", "information", "back", "parent", "face", "others", "level", "office",
  "door", "health", "person", "art", "war", "history", "party", "result", "change", "morning",
  "reason", "research", "girl", "guy", "moment", "air", "teacher", "force", "education", "foot",
  "boy", "age", "policy", "process", "music", "market", "sense", "nation", "plan", "college",
  "interest", "death", "experience", "effect", "use", "class", "control", "care", "field", "development",
  "role", "effort", "rate", "heart", "drug", "show", "leader", "light", "voice", "wife"
];

const quotes = [
  "Typing is a skill you build one keystroke at a time.",
  "The best way to improve is to practice with focus and consistency.",
  "Accuracy first, speed will follow with steady practice.",
  "Small gains every day add up to big results over time.",
  "Stay calm, breathe, and let your fingers remember the rhythm."
];

const state = {
  session: null,
  user: null,
  profile: null,
  isEditingUsername: false,
  test: {
    mode: "words",
    duration: 30,
    text: "",
    wordRanges: [],
    started: false,
    startTime: null,
    timerId: null,
    totalTypedChars: 0,
    correctChars: 0
  }
};

const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

const setMessage = (element, message, isError = false) => {
  element.textContent = message;
  element.style.color = isError ? "var(--danger)" : "var(--text-secondary)";
};

const updateAuthUI = () => {
  if (state.user) {
    const name = state.profile?.username ? `@${state.profile.username}` : state.user.email;
    elements.authStatus.textContent = `Signed in as ${name}`;
    elements.signOutButton.disabled = false;
    elements.editUsernameButton.hidden = false;
  } else {
    elements.authStatus.textContent = "Signed out";
    elements.signOutButton.disabled = true;
    elements.editUsernameButton.hidden = true;
  }

  const showUsernameCard = state.user && (!state.profile?.username || state.isEditingUsername);
  elements.usernameCard.hidden = !showUsernameCard;
  elements.submitScoreButton.disabled = !(state.user && state.profile?.username);
};

const loadProfile = async () => {
  if (!state.user) {
    state.profile = null;
    updateAuthUI();
    return;
  }

  const { data, error } = await sb
    .from("profiles")
    .select("id, username")
    .eq("id", state.user.id)
    .maybeSingle();

  if (error) {
    setMessage(elements.authMessage, "Could not load profile. Try again.", true);
    state.profile = null;
  } else {
    state.profile = data || null;
  }

  updateAuthUI();
};

const setSession = async () => {
  const { data } = await sb.auth.getSession();
  state.session = data.session;
  state.user = data.session?.user ?? null;
  await loadProfile();
};

const signUp = async () => {
  setMessage(elements.authMessage, "");
  const email = elements.emailInput.value.trim();
  const password = elements.passwordInput.value.trim();
  if (!email || !password) {
    setMessage(elements.authMessage, "Email and password are required.", true);
    return;
  }
  const { error } = await sb.auth.signUp({ email, password });
  if (error) {
    setMessage(elements.authMessage, error.message, true);
  } else {
    setMessage(elements.authMessage, "Check your email to confirm, then sign in.");
  }
};

const signIn = async () => {
  setMessage(elements.authMessage, "");
  const email = elements.emailInput.value.trim();
  const password = elements.passwordInput.value.trim();
  if (!email || !password) {
    setMessage(elements.authMessage, "Email and password are required.", true);
    return;
  }
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) {
    setMessage(elements.authMessage, error.message, true);
  }
};

const signOut = async () => {
  setMessage(elements.authMessage, "");
  const { error } = await sb.auth.signOut();
  if (error) {
    setMessage(elements.authMessage, error.message, true);
  }
};

const saveUsername = async () => {
  setMessage(elements.usernameMessage, "");
  if (!state.user) {
    setMessage(elements.usernameMessage, "Sign in to save a username.", true);
    return;
  }
  const username = elements.usernameInput.value.trim();
  if (!usernameRegex.test(username)) {
    setMessage(elements.usernameMessage, "Use 3-20 letters, numbers, or underscores.", true);
    return;
  }

  let response;
  if (state.profile?.username) {
    response = await sb.from("profiles").update({ username }).eq("id", state.user.id);
  } else {
    response = await sb.from("profiles").insert({ id: state.user.id, username });
  }

  if (response.error) {
    if (response.error.code === "23505") {
      setMessage(elements.usernameMessage, "That username is already taken.", true);
    } else {
      setMessage(elements.usernameMessage, response.error.message, true);
    }
    return;
  }

  state.profile = { id: state.user.id, username };
  state.isEditingUsername = false;
  elements.usernameInput.value = username;
  updateAuthUI();
  setMessage(elements.usernameMessage, "Username saved.");
};

const pickWords = (count) => {
  const words = [];
  for (let i = 0; i < count; i += 1) {
    const word = wordList[Math.floor(Math.random() * wordList.length)];
    words.push(word);
  }
  return words.join(" ");
};

const buildWordRanges = (text) => {
  const words = text.split(" ");
  let index = 0;
  return words.map((word, wordIndex) => {
    const start = index;
    const end = index + word.length;
    index = end + 1;
    return {
      word,
      start,
      end: wordIndex === words.length - 1 ? end : end + 1
    };
  });
};

const renderTargetText = (typedValue) => {
  const typed = typedValue || "";
  const chars = state.test.text.split("");
  const wordRanges = state.test.wordRanges;
  const currentIndex = typed.length;

  let html = "";
  let charIndex = 0;

  wordRanges.forEach((range) => {
    const wordText = state.test.text.slice(range.start, range.end);
    const isCurrent = currentIndex >= range.start && currentIndex <= range.end;
    let wordHtml = "";

    for (let i = 0; i < wordText.length; i += 1) {
      const targetChar = chars[charIndex];
      const typedChar = typed[charIndex];
      let className = "pending";
      if (typedChar !== undefined) {
        className = typedChar === targetChar ? "correct" : "incorrect";
      }
      wordHtml += `<span class="${className}">${targetChar}</span>`;
      charIndex += 1;
    }

    html += `<span class="word${isCurrent ? " current" : ""}">${wordHtml}</span>`;
  });

  elements.targetDisplay.innerHTML = html;
};

const resetStats = () => {
  state.test.totalTypedChars = 0;
  state.test.correctChars = 0;
  elements.liveWpm.textContent = "0";
  elements.liveAccuracy.textContent = "100%";
};

const updateLiveStats = (typedValue) => {
  const totalTyped = typedValue.length;
  const target = state.test.text;
  let correct = 0;
  for (let i = 0; i < Math.min(totalTyped, target.length); i += 1) {
    if (typedValue[i] === target[i]) {
      correct += 1;
    }
  }

  state.test.totalTypedChars = totalTyped;
  state.test.correctChars = correct;

  const elapsed = state.test.started
    ? Math.max(1, (Date.now() - state.test.startTime) / 1000)
    : 1;
  const wpm = Math.floor((correct / 5) / (elapsed / 60));
  const accuracy = ((correct / Math.max(totalTyped, 1)) * 100).toFixed(1);

  elements.liveWpm.textContent = Number.isFinite(wpm) ? wpm : 0;
  elements.liveAccuracy.textContent = `${accuracy}%`;
};

const updateTimer = () => {
  if (!state.test.started) {
    return;
  }
  const elapsed = (Date.now() - state.test.startTime) / 1000;
  const remaining = Math.max(0, state.test.duration - elapsed);
  elements.timerValue.textContent = `${Math.ceil(remaining)}s`;
  if (remaining <= 0) {
    finishTest();
  }
};

const startTimer = () => {
  if (state.test.started) {
    return;
  }
  state.test.started = true;
  state.test.startTime = Date.now();
  state.test.timerId = window.setInterval(updateTimer, 200);
};

const finishTest = () => {
  if (!state.test.started) {
    return;
  }
  clearInterval(state.test.timerId);
  state.test.timerId = null;
  state.test.started = false;

  elements.typingInput.disabled = true;
  elements.timerValue.textContent = "0s";

  const wpm = Math.floor((state.test.correctChars / 5) / (state.test.duration / 60));
  const accuracy = ((state.test.correctChars / Math.max(state.test.totalTypedChars, 1)) * 100).toFixed(1);

  elements.resultWpm.textContent = wpm;
  elements.resultAccuracy.textContent = `${accuracy}%`;
  elements.resultCorrect.textContent = state.test.correctChars;
  elements.resultTotal.textContent = state.test.totalTypedChars;
  elements.resultDuration.textContent = `${state.test.duration}s`;
  elements.resultMode.textContent = state.test.mode;
  elements.resultsCard.hidden = false;
  elements.submitScoreButton.disabled = !(state.user && state.profile?.username);

  if (state.user && state.profile?.username) {
    setMessage(elements.submitMessage, "Ready to submit your score.");
  } else {
    setMessage(elements.submitMessage, "Sign in and set a username to submit your score.");
  }
};

const startTest = () => {
  clearInterval(state.test.timerId);
  state.test.started = false;
  state.test.timerId = null;
  state.test.mode = elements.modeSelect.value;
  state.test.duration = Number(
    elements.durationButtons.querySelector("button.active")?.dataset.duration || 30
  );
  state.test.text =
    state.test.mode === "quotes"
      ? quotes[Math.floor(Math.random() * quotes.length)]
      : pickWords(200);
  state.test.wordRanges = buildWordRanges(state.test.text);

  elements.typingInput.value = "";
  elements.typingInput.disabled = false;
  elements.typingInput.focus();
  elements.timerValue.textContent = `${state.test.duration}s`;
  elements.resultsCard.hidden = true;
  setMessage(elements.submitMessage, "");
  resetStats();
  renderTargetText("");
};

const handleTyping = (event) => {
  if (!state.test.text) {
    startTest();
  }
  if (!state.test.started) {
    startTimer();
  }

  const typedValue = event.target.value;
  renderTargetText(typedValue);
  updateLiveStats(typedValue);

  if (typedValue.length >= state.test.text.length) {
    finishTest();
  }
};

const submitScore = async () => {
  setMessage(elements.submitMessage, "");
  if (!state.user || !state.profile?.username) {
    setMessage(elements.submitMessage, "Sign in and set a username first.", true);
    return;
  }

  const payload = {
    user_id: state.user.id,
    wpm: Number(elements.resultWpm.textContent),
    accuracy: Number(elements.resultAccuracy.textContent.replace("%", "")),
    test_seconds: state.test.duration,
    mode: state.test.mode
  };

  elements.submitScoreButton.disabled = true;
  const { error } = await sb.from("scores").insert(payload);
  if (error) {
    setMessage(elements.submitMessage, error.message, true);
    elements.submitScoreButton.disabled = false;
    return;
  }

  setMessage(elements.submitMessage, "Score submitted!", false);
  await loadLeaderboard();
};

const loadLeaderboard = async () => {
  elements.leaderboardMessage.textContent = "";
  elements.leaderboardBody.innerHTML = `
    <tr>
      <td colspan="7" class="muted">Loading leaderboard...</td>
    </tr>
  `;

  const mode = elements.leaderboardMode.value;
  const duration = Number(elements.leaderboardDuration.value);

  const { data, error } = await sb
    .from("leaderboard")
    .select("username,wpm,accuracy,test_seconds,mode,created_at")
    .eq("mode", mode)
    .eq("test_seconds", duration)
    .order("wpm", { ascending: false })
    .order("accuracy", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    elements.leaderboardBody.innerHTML = `
      <tr>
        <td colspan="7" class="muted">Unable to load leaderboard.</td>
      </tr>
    `;
    setMessage(elements.leaderboardMessage, error.message, true);
    return;
  }

  if (!data || data.length === 0) {
    elements.leaderboardBody.innerHTML = `
      <tr>
        <td colspan="7" class="muted">No scores yet for this filter.</td>
      </tr>
    `;
    return;
  }

  elements.leaderboardBody.innerHTML = data
    .map((row, index) => {
      const date = new Date(row.created_at).toLocaleDateString();
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${row.username}</td>
          <td>${row.wpm}</td>
          <td>${Number(row.accuracy).toFixed(1)}%</td>
          <td>${row.test_seconds}s</td>
          <td>${row.mode}</td>
          <td>${date}</td>
        </tr>
      `;
    })
    .join("");
};

const handleDurationClick = (event) => {
  const button = event.target.closest("button[data-duration]");
  if (!button) {
    return;
  }
  elements.durationButtons.querySelectorAll("button").forEach((btn) => {
    btn.classList.toggle("active", btn === button);
  });
  state.test.duration = Number(button.dataset.duration);
  elements.timerValue.textContent = `${state.test.duration}s`;
};

const setupEventListeners = () => {
  elements.signUpButton.addEventListener("click", signUp);
  elements.signInButton.addEventListener("click", signIn);
  elements.signOutButton.addEventListener("click", signOut);
  elements.editUsernameButton.addEventListener("click", () => {
    state.isEditingUsername = true;
    elements.usernameInput.value = state.profile?.username || "";
    updateAuthUI();
  });
  elements.saveUsernameButton.addEventListener("click", saveUsername);
  elements.startButton.addEventListener("click", startTest);
  elements.durationButtons.addEventListener("click", handleDurationClick);
  elements.typingInput.addEventListener("input", handleTyping);
  elements.submitScoreButton.addEventListener("click", submitScore);
  elements.leaderboardMode.addEventListener("change", loadLeaderboard);
  elements.leaderboardDuration.addEventListener("change", loadLeaderboard);
  elements.refreshLeaderboard.addEventListener("click", loadLeaderboard);
};

const init = async () => {
  setupEventListeners();
  await setSession();
  sb.auth.onAuthStateChange(async (_event, session) => {
    state.session = session;
    state.user = session?.user ?? null;
    state.isEditingUsername = false;
    await loadProfile();
    updateAuthUI();
  });
  startTest();
  await loadLeaderboard();
};

init();
