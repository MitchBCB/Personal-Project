let currentInput = '0';
let previousInput = '';
let operation = null;

// Get all buttons
const numberButtons = document.querySelectorAll('.number');
const operatorButtons = document.querySelectorAll('.operator');
const equalsButton = document.querySelector('.equals');
const clearButton = document.querySelector('.clear');

// Number buttons
numberButtons.forEach(button => {
    button.addEventListener('click', function() {
        const num = button.textContent;
        
        // Prevent multiple decimal points
        if (num === '.' && currentInput.includes('.')) {
            return;
        }
        
        if (currentInput === '0' && num !== '.') {
            currentInput = num;
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
        
        if (currentInput === '0' && operation !== null) {
            return;
        }
        
        if (operation !== null) {
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
const backspaceButton = document.querySelector('.backspace');
backspaceButton.addEventListener('click', function() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
});

// Percentage button
const percentButton = document.querySelector('.percent');
percentButton.addEventListener('click', function() {
    if (previousInput && operation) {
        const percent = (parseFloat(previousInput) * parseFloat(currentInput)) / 100;
        currentInput = percent.toString();
    } else {
        currentInput = (parseFloat(currentInput) / 100).toString();
    }
    updateDisplay();
});

function calculate() {
    if (operation === null || previousInput === '') {
        return;
    }
    
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    let result;
    
    switch(operation) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '×':
            result = prev * current;
            break;
        case '÷':
            result = prev / current;
            break;
    }
    
    currentInput = result.toString();
    operation = null;
    previousInput = '';
    updateDisplay();
    updateEquation();
}

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

// Keyboard support
document.addE