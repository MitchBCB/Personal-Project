let currentInput = '0';
let previousInput = '';
let operation = null;

const display = document.getElementById('display');

// Get all buttons
const numberButtons = document.querySelectorAll('.number');
const operatorButtons = document.querySelectorAll('.operator');
const equalsButton = document.querySelector('.equals');
const clearButton = document.querySelector('.clear');

// Number buttons
numberButtons.forEach(button => {
    button.addEventListener('click', function() {
        const num = button.textContent;
        
        if (currentInput === '0') {
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
        
        if (operation !== null) {
            calculate();
        }
        
        previousInput = currentInput;
        currentInput = '0';
        operation = op;
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
}

function updateDisplay() {
    display.textContent = currentInput;
}