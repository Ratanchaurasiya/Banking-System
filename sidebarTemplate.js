// ==================== SIDEBAR MENU HTML TEMPLATE ====================

const sidebarTemplate = `
    <div class="user-profile-badge" id="userProfileBadge" style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid var(--border-color); text-align: center;">
        <i class="fas fa-user-circle" style="font-size: 40px; color: var(--secondary-color); margin-bottom: 8px;"></i>
        <h4 id="sidebarUserName">Guest</h4>
        <span id="sidebarUserRole" style="font-size: 11px; background: rgba(37, 99, 235, 0.15); color: var(--secondary-color); padding: 2px 8px; border-radius: 10px; font-weight: bold;">Role</span>
    </div>

    <!-- Customer Side Menu -->
    <div id="customerMenu" style="display: none;">
        <div class="menu-item active" onclick="showSection('custDashboard')">
            <i class="fas fa-tachometer-alt"></i> Dashboard
        </div>
        <div class="menu-item" onclick="showSection('transfer')">
            <i class="fas fa-exchange-alt"></i> Send Money
        </div>
        <div class="menu-item" onclick="showSection('payBills')">
            <i class="fas fa-file-invoice-dollar"></i> Pay Utility Bills
        </div>
        <div class="menu-item" onclick="showSection('loan')">
            <i class="fas fa-hand-holding-usd"></i> Apply Loan
        </div>
        <div class="menu-item" onclick="showSection('customerLoans')">
            <i class="fas fa-credit-card"></i> My Loans / Pay EMI
        </div>
        <div class="menu-item" onclick="showSection('cards')">
            <i class="fas fa-credit-card"></i> Cards Settings
        </div>
        <div class="menu-item" onclick="showSection('reports')">
            <i class="fas fa-chart-line"></i> My Statements
        </div>
        <div class="menu-item" onclick="showSection('custSettings')">
            <i class="fas fa-cog"></i> Settings
        </div>
    </div>

    <!-- Staff Side Menu -->
    <div id="staffMenu" style="display: none;">
        <div class="menu-item active" onclick="showSection('dashboard')">
            <i class="fas fa-chart-pie"></i> Bank Dashboard
        </div>
        <div class="menu-item" onclick="showSection('create')">
            <i class="fas fa-user-plus"></i> Open Account
        </div>
        <div class="menu-item" onclick="showSection('accounts')">
            <i class="fas fa-users"></i> Accounts Directory
        </div>
        <div class="menu-item" onclick="showSection('search')">
            <i class="fas fa-search"></i> Search Account
        </div>
        <div class="menu-item" onclick="showSection('deposit')">
            <i class="fas fa-cash-register"></i> Cash Counter
        </div>
        <div class="menu-item" onclick="showSection('withdraw')">
            <i class="fas fa-wallet"></i> Cash Withdrawal
        </div>
        <div class="menu-item" onclick="showSection('transfer')">
            <i class="fas fa-exchange-alt"></i> Fund Transfer
        </div>
        <div class="menu-item" onclick="showSection('loanApprovals')">
            <i class="fas fa-tasks"></i> Loan Review Queue
        </div>
        <div class="menu-item" onclick="showSection('activeLoans')">
            <i class="fas fa-file-invoice-dollar"></i> Active Loans
        </div>
        <div class="menu-item" onclick="showSection('reports')">
            <i class="fas fa-chart-bar"></i> General Reports
        </div>
        <div class="menu-item" onclick="showSection('support')">
            <i class="fas fa-headset"></i> Support Desk
        </div>
    </div>

    <!-- Logout (shared) -->
    <div class="menu-item" onclick="logout()" style="margin-top: 30px; border-top: 1px solid var(--border-color); color: var(--accent-color);">
        <i class="fas fa-sign-out-alt"></i> Logout
    </div>
`;

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('sidebarContainer');
    if (container) {
        container.innerHTML = sidebarTemplate;
    }
});


