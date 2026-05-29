// ==================== AUTH PORTAL HTML TEMPLATE ====================

const authTemplate = `
    <div class="auth-card">
        <div class="auth-header">
            <h2><i class="fas fa-university"></i> SECURE BANKING SYSTEM</h2>
            <p>Welcome. Please authenticate to access your accounts.</p>
        </div>
        
        <div class="auth-tabs" id="authTabs">
            <div class="auth-tab active" onclick="switchAuthTab('customer')">Customer Login</div>
            <div class="auth-tab" onclick="switchAuthTab('staff')">Staff Login</div>
        </div>
        
        <!-- Customer Login Form -->
        <div id="customerLoginForm" class="auth-form-content active">
            <div class="form-group">
                <label>Account Number</label>
                <input type="number" id="custAccNo" placeholder="Enter account number">
            </div>
            <div class="form-group">
                <label>4-digit PIN</label>
                <input type="password" id="custPin" maxlength="4" placeholder="Enter PIN">
            </div>
            <button class="btn" onclick="loginCustomer()" style="width: 100%; justify-content: center; margin-top: 10px;">
                <i class="fas fa-sign-in-alt"></i> Login securely
            </button>
        </div>
        
        <!-- Staff Login Form -->
        <div id="staffLoginForm" class="auth-form-content">
            <div class="form-group">
                <label>Username</label>
                <input type="text" id="staffUsername" placeholder="Enter staff username">
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" id="staffPassword" placeholder="Enter password">
            </div>
            <button class="btn" onclick="loginStaff()" style="width: 100%; justify-content: center; margin-top: 10px;">
                <i class="fas fa-sign-in-alt"></i> Staff Secure Login
            </button>
        </div>

        <!-- Customer Registration Form -->
        <div id="authRegisterForm" class="auth-form-content">
            <div class="form-group">
                <label>Full Name *</label>
                <input type="text" id="regName" placeholder="Enter full name">
            </div>
            <div class="form-group">
                <label>Father's Name *</label>
                <input type="text" id="regFather" placeholder="Enter father's name">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div class="form-group">
                    <label>Phone *</label>
                    <input type="tel" id="regPhone" placeholder="Enter phone">
                </div>
                <div class="form-group">
                    <label>Email *</label>
                    <input type="email" id="regEmail" placeholder="Enter email">
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div class="form-group">
                    <label>Aadhaar (12 digits) *</label>
                    <input type="text" id="regAadhaar" maxlength="12" placeholder="Enter Aadhaar">
                </div>
                <div class="form-group">
                    <label>4-digit PIN *</label>
                    <input type="password" id="regPin" maxlength="4" placeholder="Choose PIN">
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div class="form-group">
                    <label>Account Type</label>
                    <select id="regType">
                        <option value="Savings">Savings Account</option>
                        <option value="Current">Current Account</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Initial Deposit (₹) *</label>
                    <input type="number" id="regDeposit" placeholder="Initial deposit">
                </div>
            </div>
            <div class="form-group">
                <label>Address</label>
                <textarea id="regAddress" rows="2" placeholder="Enter address"></textarea>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 10px;">
                <button class="btn btn-danger" onclick="cancelRegistration()" style="flex: 1; justify-content: center;">
                    Cancel
                </button>
                <button class="btn btn-success" onclick="registerCustomer()" style="flex: 1; justify-content: center;">
                    Submit Account
                </button>
            </div>
        </div>
        
        <div id="authResult" style="margin-top: 15px;"></div>
        
        <div class="auth-footer" id="authFooter">
            <p>New customer? Click below to request a new account:</p>
            <button class="btn btn-warning" onclick="showRegistration()" style="width: 100%; justify-content: center; margin-top: 10px;">
                <i class="fas fa-user-plus"></i> Open New Account
            </button>
        </div>
    </div>
`;

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('authContainer');
    if (container) {
        container.innerHTML = authTemplate;
    }
});
