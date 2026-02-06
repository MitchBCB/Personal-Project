// Cleaned, concise calculator logic. Behavior preserved: numbers, operators, percent,
// backspace, clear, equals, keyboard support. Uses same class and id names as before.

let currentInput = '0';
let previousInput = '';
let operation = null;

const numberButtons = document.querySelectorAll('.number');
const operatorButtons = document.querySelectorAll('.operator');
const equalsButton = document.querySelector('.equals');
const clearButton = document.querySelector('.clear');
const backspaceButton = document.querySelector('.backspace');
const percentButton = document.querySelector('.percent');

function updateDisplay() {
  document.getElementById('current').textContent = currentInput;
}

function updateEquation() {
  const equationDisplay = document.getElementById('equation');
  if (previousInput && operation) {
    equationDisplay.textContent = `${previousInput} ${operation}`;
  } else {
    equationDisplay.textContent = '';
  }
}

function calculate() {
  if (operation === null || previousInput === '') return;

  const prev = parseFloat(previousInput);
  const curr = parseFloat(currentInput);
  let result;

  switch (operation) {
    case '+': result = prev + curr; break;
    case '-': result = prev - curr; break;
    case '×': result = prev * curr; break;
    case '÷': result = curr === 0 ? NaN : prev / curr; break;
    default: return;
  }

  // normalize result to avoid long floating-point artifacts
  if (!isFinite(result)) {
    currentInput = 'Error';
  } else {
    // trim unnecessary decimals
    currentInput = Number(result.toPrecision(12)).toString();
  }
  operation = null;
  previousInput = '';
  updateDisplay();
  updateEquation();
}

/* Number input handling */
numberButtons.forEach(button => {
  button.addEventListener('click', () => {
    const num = button.textContent;
    if (num === '.' && currentInput.includes('.')) return;

    if (currentInput === '0' && num !== '.') {
      currentInput = num;
    } else if (currentInput === 'Error') {
      currentInput = (num === '.' ? '0.' : num);
    } else {
      currentInput += num;
    }
    updateDisplay();
  });
});

/* Operator handling */
operatorButtons.forEach(button => {
  button.addEventListener('click', () => {
    const op = button.textContent;
    if (currentInput === 'Error') return;

    if (operation !== null && previousInput !== '') {
      calculate();
    }

    previousInput = currentInput;
    currentInput = '0';
    operation = op;
    updateEquation();
    updateDisplay();
  });
});

/* Equals */
equalsButton.addEventListener('click', calculate);

/* Clear */
clearButton.addEventListener('click', () => {
  currentInput = '0';
  previousInput = '';
  operation = null;
  updateDisplay();
  updateEquation();
});

/* Backspace */
backspaceButton.addEventListener('click', () => {
  if (currentInput === 'Error') {
    currentInput = '0';
  } else if (currentInput.length > 1) {
    currentInput = currentInput.slice(0, -1);
  } else {
    currentInput = '0';
  }
  updateDisplay();
});

/* Percent */
percentButton.addEventListener('click', () => {
  if (previousInput && operation) {
    const percent = (parseFloat(previousInput) * parseFloat(currentInput)) / 100;
    currentInput = Number(percent.toPrecision(12)).toString();
  } else {
    currentInput = (parseFloat(currentInput) / 100).toString();
  }
  updateDisplay();
});

/* Keyboard support */
document.addEventListener('keydown', (event) => {
  const key = event.key;

  // Numbers and decimal
  if ((key >= '0' && key <= '9') || key === '.') {
    event.preventDefault();
    if (key === '.' && currentInput.includes('.')) return;
    if (currentInput === '0' && key !== '.') {
      currentInput = key;
    } else if (currentInput === 'Error') {
      currentInput = (key === '.' ? '0.' : key);
    } else {
      currentInput += key;
    }
    updateDisplay();
    return;
  }

  // Operators (+ - * /)
  if (['+', '-', '*', '/'].includes(key)) {
    event.preventDefault();
    if (currentInput === 'Error') return;
    if (operation !== null && previousInput !== '') {
      calculate();
    }
    previousInput = currentInput;
    currentInput = '0';
    operation = (key === '*') ? '×' : (key === '/') ? '÷' : key;
    updateEquation();
    updateDisplay();
    return;
  }

  // Enter or =
  if (key === 'Enter' || key === '=') {
    event.preventDefault();
    calculate();
    return;
  }

  // Backspace
  if (key === 'Backspace') {
    event.preventDefault();
    if (currentInput === 'Error') {
      currentInput = '0';
    } else if (currentInput.length > 1) {
      currentInput = currentInput.slice(0, -1);
    } else {
      currentInput = '0';
    }
    updateDisplay();
    return;
  }

  // Escape -> clear
  if (key === 'Escape') {
    event.preventDefault();
    currentInput = '0';
    previousInput = '';
    operation = null;
    updateDisplay();
    updateEquation();
  }
});