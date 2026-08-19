const assert = require('assert');
const fs = require('fs');

// Mock browser environment in global scope
const storage = {};
global.localStorage = {
    getItem: (key) => storage[key] || null,
    setItem: (key, val) => { storage[key] = String(val); },
    removeItem: (key) => { delete storage[key]; },
    clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};

global.window = { innerWidth: 1920 };
global.navigator = {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    maxTouchPoints: 0
};
global.document = {
    getElementById: (id) => ({ value: '', textContent: '', classList: { add: ()=>{}, remove: ()=>{} }, innerHTML: '' }),
    querySelector: () => ({ innerHTML: '', prepend: () => {} }),
    querySelectorAll: () => []
};

// Load config.js in global scope
eval(fs.readFileSync('./js/config.js', 'utf8'));

console.log('Testing Authorized Emails Logic...');

// Test 1: Default authorized emails
const initial = getAuthorizedEmails();
assert(Array.isArray(initial), 'Should return an array');
assert(initial.includes('kiosco.a220@gmail.com'), 'Should include default email');
assert(isEmailAuthorized('kiosco.a220@gmail.com'), 'Default email should be authorized');
assert(isEmailAuthorized('KIOSCO.A220@GMAIL.COM'), 'Case insensitivity check');
assert(!isEmailAuthorized('desconocido@gmail.com'), 'Unauthorized email check');

// Test 2: Add authorized email
const addRes1 = addAuthorizedEmail('nuevo.admin@gmail.com');
assert(addRes1.success === true, 'Adding valid email should succeed');
assert(isEmailAuthorized('nuevo.admin@gmail.com'), 'Newly added email should be authorized');

// Test 3: Duplicate rejection
const addRes2 = addAuthorizedEmail('nuevo.admin@gmail.com');
assert(addRes2.success === false, 'Duplicate email should be rejected');

// Test 4: Invalid email format
const addRes3 = addAuthorizedEmail('no-es-un-email');
assert(addRes3.success === false, 'Invalid email format should be rejected');

// Test 5: Remove authorized email
const removeRes1 = removeAuthorizedEmail('nuevo.admin@gmail.com', 'kiosco.a220@gmail.com');
assert(removeRes1.success === true, 'Removing authorized email should succeed');
assert(!isEmailAuthorized('nuevo.admin@gmail.com'), 'Removed email should no longer be authorized');

// Test 6: Prevent self deletion
const removeSelf = removeAuthorizedEmail('kiosco.a220@gmail.com', 'kiosco.a220@gmail.com');
assert(removeSelf.success === false, 'Should prevent logged in user from self deletion');

console.log('Testing Device & Engine Detection...');
eval(fs.readFileSync('./js/scanner.js', 'utf8'));

// PC user agent without BarcodeDetector
global.navigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
global.navigator.maxTouchPoints = 0;
global.window.innerWidth = 1920;
delete global.window.BarcodeDetector;
assert(isMobileDevice() === false, 'PC should not be detected as mobile');
assert(getPreferredEngine() === 'quagga', 'PC should prefer quagga engine');

// Mobile user agent with BarcodeDetector
global.navigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15';
global.navigator.maxTouchPoints = 5;
global.window.innerWidth = 390;
global.window.BarcodeDetector = class {};
assert(isMobileDevice() === true, 'Mobile device should be detected');
assert(getPreferredEngine() === 'native', 'Mobile device with BarcodeDetector should prefer native');

// Mobile device without BarcodeDetector (e.g. Firefox mobile)
delete global.window.BarcodeDetector;
assert(isMobileDevice() === true, 'Mobile device should be detected');
assert(getPreferredEngine() === 'quagga', 'Mobile device without BarcodeDetector should fallback to quagga');

console.log('Testing GitHub defaults and config...');
assert(DEFAULT_GITHUB.user === 'kioscoa220munro', 'GitHub default user should be kioscoa220munro');
assert(DEFAULT_GITHUB.repo === 'a220', 'GitHub default repo should be a220');

console.log('Testing github.js functions...');
eval(fs.readFileSync('./js/github.js', 'utf8'));
loadGitHubConfig();
assert(githubConfig.user === 'kioscoa220munro', 'Loaded config should match user');
assert(githubConfig.repo === 'a220', 'Loaded config should match repo');

console.log('✅ ALL TESTS PASSED SUCCESSFULLY!');
