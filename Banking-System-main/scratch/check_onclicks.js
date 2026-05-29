const fs = require('fs');
const path = require('path');

// Mock browser globals
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

// Evaluate all JS files to populate globalMock
function loadJsFile(filename) {
    const filePath = path.join(__dirname, '..', 'js', filename);
    const code = fs.readFileSync(filePath, 'utf8');
    const fn = new Function(...Object.keys(globalMock), code);
    fn(...Object.values(globalMock));
}

loadJsFile('bank.js');
loadJsFile('utils.js');
loadJsFile('auth.js');
loadJsFile('dashboard.js');
loadJsFile('transactions.js');
loadJsFile('loans.js');
loadJsFile('cards.js');
loadJsFile('reports.js');
loadJsFile('app.js');

// Parse index.html to find all onclick="..."
const htmlPath = path.join(__dirname, '..', 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

const onclickRegex = /onclick="([^"]+)"/g;
let match;
const foundOnclicks = new Set();
while ((match = onclickRegex.exec(htmlContent)) !== null) {
    foundOnclicks.add(match[1]);
}

console.log(`Found ${foundOnclicks.size} unique onclick handlers in index.html:\n`);

function parseActionCallName(actionCall) {
    const m = actionCall.trim().match(/^([A-Za-z_$][\w$]*)\((.*)\)$/);
    return m ? m[1] : null;
}

for (const handler of foundOnclicks) {
    const funcName = parseActionCallName(handler);
    if (!funcName) {
        console.log(`❌ Failed to parse handler format: "${handler}"`);
        continue;
    }
    
    const exists = typeof globalMock[funcName] === 'function' || typeof globalMock.window[funcName] === 'function';
    if (exists) {
        console.log(`✅ Found function for: "${handler}" -> ${funcName}()`);
    } else {
        console.log(`❌ MISSING function for: "${handler}" -> ${funcName}() is NOT defined!`);
    }
}
