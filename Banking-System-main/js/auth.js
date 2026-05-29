// ==================== SESSION & AUTHENTICATION CONTROLLERS ====================

let activeSessionUser = null;  // Stores active account object (or string 'staff')
let activeRole = null;         // 'customer' or 'staff'
let currentAuthTab = 'customer';

function switchAuthTab(role) {
    currentAuthTab = role;
    document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.auth-form-content').forEach(form => form.classList.remove('active'));
    
    if (role === 'customer') {
        document.getElementById('authTabs').children[0].classList.add('active');
        document.getElementById('customerLoginForm').classList.add('active');
        document.getElementById('authFooter').style.display = 'block';
    } else {
        document.getElementById('authTabs').children[1].classList.add('active');
        document.getElementById('staffLoginForm').classList.add('active');
        document.getElementById('authFooter').style.display = 'none';
    }
    
    document.getElementById('authResult').innerHTML = '';
}

function loginCustomer() {
    const accNo = document.getElementById('custAccNo').value;
    const pin = document.getElementById('custPin').value;
    
    if (!accNo || !pin) {
        showMessage('Please enter both account number and PIN!', 'error', 'authResult');
        return;
    }
    
    const account = bank.getAccount(accNo);
    if (!account) {
        showMessage('Account not found!', 'error', 'authResult');
        return;
    }
    
    if (account.locked) {
        showMessage('Access Denied: This account is locked. Please contact branch staff.', 'error', 'authResult');
        return;
    }
    
    if (bank.verifyPin(account, pin)) {
        // Successful Customer Login - reset failed attempts
        account.failed_attempts = 0;
        bank.saveData();

        activeSessionUser = account;
        activeRole = 'customer';
        
        // Show App UI
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById('appContainer').style.display = 'block';
        
        // Setup Sidebar Profiler
        document.getElementById('sidebarUserName').textContent = account.candidate_name;
        document.getElementById('sidebarUserRole').textContent = `Acc No: ${account.account_number}`;
        
        document.getElementById('customerMenu').style.display = 'block';
        document.getElementById('staffMenu').style.display = 'none';
        
        // Load initial Customer portal dashboard
        showSection('custDashboard');
        
        // Clear login form
        document.getElementById('custAccNo').value = '';
        document.getElementById('custPin').value = '';
    } else {
        account.failed_attempts = (account.failed_attempts || 0) + 1;
        if (account.failed_attempts >= 3) {
            account.locked = true;
            bank.saveData();
            showMessage('Account LOCKED due to 3 failed login attempts.', 'error', 'authResult');
        } else {
            bank.saveData();
            showMessage('Incorrect PIN! Attempts remaining: ' + (3 - account.failed_attempts), 'error', 'authResult');
        }
    }
}

function loginStaff() {
    const user = document.getElementById('staffUsername').value.trim();
    const pass = document.getElementById('staffPassword').value;
    
    if (!user || !pass) {
        showMessage('Please enter Username and Password!', 'error', 'authResult');
        return;
    }
    
    if (user === 'admin' && pass === 'admin123') {
        // Successful Staff Login
        activeSessionUser = 'staff';
        activeRole = 'staff';
        
        // Show App UI
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById('appContainer').style.display = 'block';
        
        // Setup Sidebar Profiler
        document.getElementById('sidebarUserName').textContent = "Administrator Staff";
        document.getElementById('sidebarUserRole').textContent = "Branch Manager";
        
        document.getElementById('customerMenu').style.display = 'none';
        document.getElementById('staffMenu').style.display = 'block';
        
        // Load staff bank dashboard
        showSection('dashboard');
        
        // Clear inputs
        document.getElementById('staffUsername').value = '';
        document.getElementById('staffPassword').value = '';
    } else {
        showMessage('Invalid staff credentials!', 'error', 'authResult');
    }
}

function logout() {
    activeSessionUser = null;
    activeRole = null;
    
    // Toggle containers
    document.getElementById('appContainer').style.display = 'none';
    document.getElementById('authContainer').style.display = 'flex';
    switchAuthTab('customer');
}

function showRegistration() {
    document.getElementById('customerLoginForm').style.removeProperty('display');
    document.getElementById('customerLoginForm').classList.remove('active');
    document.getElementById('staffLoginForm').classList.remove('active');
    document.getElementById('authTabs').style.display = 'none';
    document.getElementById('authFooter').style.display = 'none';
    
    document.getElementById('authRegisterForm').classList.add('active');
    document.querySelector('.auth-header p').textContent = "Submit application for a new digital savings account";
}

function cancelRegistration() {
    document.getElementById('authRegisterForm').classList.remove('active');
    document.getElementById('authTabs').style.display = 'grid';
    document.getElementById('authFooter').style.display = 'block';
    
    document.getElementById('customerLoginForm').classList.add('active');
    document.querySelector('.auth-header p').textContent = "Welcome. Please authenticate to access your accounts.";
}

function registerCustomer() {
    const data = {
        name: document.getElementById('regName').value.trim(),
        father: document.getElementById('regFather').value.trim(),
        phone: document.getElementById('regPhone').value.trim(),
        email: document.getElementById('regEmail').value.trim(),
        aadhaar: document.getElementById('regAadhaar').value.trim(),
        pin: document.getElementById('regPin').value.trim(),
        type: document.getElementById('regType').value,
        deposit: document.getElementById('regDeposit').value,
        address: document.getElementById('regAddress').value.trim()
    };
    
    if (!data.name || !data.father || !data.phone || !data.email || 
        !data.aadhaar || data.aadhaar.length !== 12 || 
        !data.pin || data.pin.length !== 4 || !data.deposit || parseFloat(data.deposit) <= 0) {
        showMessage('Please fill all required fields correctly!', 'error', 'authResult');
        return;
    }
    
    if (!/^\d{10}$/.test(data.phone)) {
        showMessage('Please enter a valid 10-digit phone number!', 'error', 'authResult');
        return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        showMessage('Please enter a valid email address!', 'error', 'authResult');
        return;
    }
    
    const newAcc = bank.createAccount(data);
    
    showMessage(`Registration successful! Your Account No is: ${newAcc.account_number}. Please login now.`, 'success', 'authResult');
    
    // Reset forms
    document.getElementById('regName').value = '';
    document.getElementById('regFather').value = '';
    document.getElementById('regPhone').value = '';
    document.getElementById('regEmail').value = '';
    document.getElementById('regAadhaar').value = '';
    document.getElementById('regPin').value = '';
    document.getElementById('regDeposit').value = '';
    document.getElementById('regAddress').value = '';
    
    setTimeout(() => {
        cancelRegistration();
    }, 4000);
}
