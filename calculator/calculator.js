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
        
        // Prevent multiple decimal points
        if (num === '.' && currentInput.includes('.')) {
            return;  // Stop if there's already a decimal
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
        
        // Don't process if current input is just '0' and we already have an operation
        if (currentInput === '0' && operation !== null) {
            return;
        }
        
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
// Keyboard support
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    // Numbers and decimal point
    if ((key >= '0' && key <= '9') || key === '.') {
        // Prevent multiple decimal points
        if (key === '.' && currentInput.includes('.')) {
            return;
        }
        
        if (currentInput === '0' && key !== '.') {
            currentInput = key;
        } else {
            currentInput += key;
        }
        updateDisplay();
    }
    
    // Operators
if (key === '+' || key === '-' || key === '*' || key === '/') {
    // Don't process if current input is just '0' and we already have an operation
    if (currentInput === '0' && operation !== null) {
        return;  // Ignore the keypress
    }
    
    if (operation !== null) {
        calculate();
    }
    
    previousInput = currentInput;
    currentInput = '0';
    
    // Convert * to × and / to ÷ for display consistency
    if (key === '*') {
        operation = '×';
    } else if (key === '/') {
        operation = '÷';
    } else {
        operation = key;
    }
}
    // Enter key for equals
    if (key === 'Enter') {
        event.preventDefault(); // Prevent form submission if in a form
        calculate();
    }
    
    // Backspace
    if (key === 'Backspace') {
        event.preventDefault(); // Prevent browser back button
        if (currentInput.length > 1) {
            currentInput = currentInput.slice(0, -1);
        } else {
            currentInput = '0';
        }
        updateDisplay();
    }
    
    // Escape or 'c' for clear
    if (key === 'Escape' || key === 'c' || key === 'C') {
        currentInput = '0';
        previousInput = '';
        operation = null;
        updateDisplay();
    }
});