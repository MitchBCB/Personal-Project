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
        equationDisplay.textContent = previousInput + ' ' + operation;
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
        case '+':
            result = prev + curr;
            break;
        case '-':
            result = prev - curr;
            break;
        case '×':
            result = prev * curr;
            break;
        case '÷':
            result = curr === 0 ? 'Error' : prev / curr;
            break;
    }

    if (result === 'Error') {
        currentInput = 'Error';
    } else {
        currentInput = result.toString();
    }
    operation = null;
    previousInput = '';
    updateDisplay();
    updateEquation();
}

// Number buttons
numberButtons.forEach(button => {
    button.addEventListener('click', function() {
        const num = button.textContent;
        
        if (num === '.' && currentInput.includes('.')) return;
        
        if (currentInput === '0' && num !== '.') {
            currentInput = num;
        } else if (currentInput === 'Error') {
            currentInput = num === '.' ? '0.' : num;
        } else {
            currentInput += num;
        }
        updateDisplay();
    });
});

// Operator buttons
operatorButtons.forEach(button => {
    button.addEventListener('click', function() {
        const op = button.textContent;
        
        if (currentInput === 'Error') return;
        
        if (operation !== null && previousInput !== '') {
            calculate();
        }
        
        previousInput = currentInput;
        currentInput = '0';
        operation = op;
        updateEquation();
    });
});

// Equals button
equalsButton.addEventListener('click', calculate);

// Clear button
clearButton.addEventListener('click', function() {
    currentInput = '0';
    previousInput = '';
    operation = null;
    updateDisplay();
    updateEquation();
});

// Backspace button
backspaceButton.addEventListener('click', function() {
    if (currentInput === 'Error') {
        currentInput = '0';
    } else if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
});

// Percent button
percentButton.addEventListener('click', function() {
    if (previousInput && operation) {
        const percent = (parseFloat(previousInput) * parseFloat(currentInput)) / 100;
        currentInput = percent.toString();
    } else {
        currentInput = (parseFloat(currentInput) / 100).toString();
    }
    updateDisplay();
});

// Keyboard support
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    // Numbers and decimal
    if ((key >= '0' && key <= '9') || key === '.') {
        if (key === '.' && currentInput.includes('.')) return;
        
        if (currentInput === '0' && key !== '.') {
            currentInput = key;
        } else if (currentInput === 'Error') {
            currentInput = key === '.' ? '0.' : key;
        } else {
            currentInput += key;
        }
        updateDisplay();
    }
    
    // Operators
    if (key === '+' || key === '-' || key === '*' || key === '/') {
        if (currentInput === 'Error') return;
        
        if (operation !== null && previousInput !== '') {
            calculate();
        }
        
        previousInput = currentInput;
        currentInput = '0';
        operation = key === '*' ? '×' : key === '/' ? '÷' : key;
        updateEquation();
    }
    
    // Enter or equals
    if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculate();
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
    }
    
    // Escape to clear
    if (key === 'Escape') {
        currentInput = '0';
        previousInput = '';
        operation = null;
        updateDisplay();
        updateEquation();
    }
    
    // Percent
    if (key === '%') {
        if (previousInput && operation) {
            const percent = (parseFloat(previousInput) * parseFloat(currentInput)) / 100;
            currentInput = percent.toString();
        } else {
            currentInput = (parseFloat(currentInput) / 100).toString();
        }
        updateDisplay();
    }
});