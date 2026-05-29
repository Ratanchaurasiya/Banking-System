const fs = require('fs');
const path = require('path');

// Mock a minimal DOM/Browser environment
const globalMock = {
    window: {},
    document: {
        querySelectorAll: () => [],
        getElementById: () => null,
        querySelector: () => null,
        addEventListener: () => {}
    },
    localStorage: {
        getItem: () => null,
        setItem: () => {}
    },
    console: console,
    Math: Math,
    Date: Date,
    JSON: JSON,
    parseFloat: parseFloat,
    parseInt: parseInt,
    Number: Number,
    isNaN: isNaN
};

globalMock.window = globalMock;
globalMock.document.documentElement = {
    getAttribute: () => 'light',
    setAttribute: () => {}
};

// Evaluate a file in our mocked global context
function evalFile(filename) {
    const filePath = path.join(__dirname, '..', 'js', filename);
    console.log(`Evaluating ${filename}...`);
    const code = fs.readFileSync(filePath, 'utf8');
    
    // Run script with mock globals
    const fn = new Function(...Object.keys(globalMock), code);
    fn(...Object.values(globalMock));
}

try {
    evalFile('bank.js');
    evalFile('utils.js');
    evalFile('auth.js');
    evalFile('dashboard.js');
    evalFile('transactions.js');
    evalFile('loans.js');
    evalFile('cards.js');
    evalFile('reports.js');
    evalFile('app.js');
    console.log('All files evaluated successfully!');
} catch (err) {
    console.error('Error during evaluation:', err);
}
