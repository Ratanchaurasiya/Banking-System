// ==================== DASHBOARD CONTENT SECTIONS HTML TEMPLATE ====================

const sectionsTemplate = `
    <!-- Customer Dashboard Section -->
    <div id="custDashboard" class="section">
        <h2><i class="fas fa-tachometer-alt"></i> My Account Summary</h2>
        
        <div class="dashboard-grid" style="display: grid; grid-template-columns: 1.2fr 2fr; gap: 30px; margin-top: 20px;">
            <!-- Card Column -->
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <!-- Virtual Card -->
                <div class="debit-card-visual" id="virtualCardVisual">
                    <div class="card-logo">
                        <i class="fas fa-university"></i> SECURE BANK
                    </div>
                    <div class="card-chip"></div>
                    <div class="card-number" id="cardNoDisplay">•••• •••• •••• ••••</div>
                    <div class="card-bottom">
                        <div class="card-holder">
                            <label>CARD HOLDER</label>
                            <div id="cardHolderDisplay">John Doe</div>
                        </div>
                        <div class="card-expiry">
                            <label>EXPIRES</label>
                            <div id="cardExpiryDisplay">12/30</div>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Stats -->
                <div style="background: var(--card-bg); padding: 20px; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: var(--shadow);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <p style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Available Balance</p>
                            <h2 style="font-size: 28px; font-weight: 700; margin-top: 5px; color: var(--secondary-color);" id="custBalanceDisplay">₹0.00</h2>
                        </div>
                        <i class="fas fa-coins" style="font-size: 32px; color: var(--warning-color); opacity: 0.8;"></i>
                    </div>
                </div>
            </div>
            
            <!-- Quick Details -->
            <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border: 1px solid var(--border-color); box-shadow: var(--shadow); display: flex; flex-direction: column; justify-content: space-between;">
                <h3 style="color: var(--secondary-color); border-bottom: 2px solid var(--secondary-color); padding-bottom: 8px; font-size: 18px;"><i class="fas fa-info-circle"></i> Account Profile</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px; font-size: 14px;">
                    <p><strong>Account No:</strong> <span id="profAccNo">N/A</span></p>
                    <p><strong>Account Type:</strong> <span id="profAccType">N/A</span></p>
                    <p><strong>Phone Number:</strong> <span id="profPhone">N/A</span></p>
                    <p><strong>Email Address:</strong> <span id="profEmail">N/A</span></p>
                    <p><strong>Aadhaar Number:</strong> <span id="profAadhaar">N/A</span></p>
                    <p><strong>Status:</strong> <span id="profStatus" style="font-weight: bold; color: var(--success-color);">Active</span></p>
                </div>
                <div style="margin-top: 15px; font-size: 14px;">
                    <p><strong>Registered Address:</strong></p>
                    <p id="profAddress" style="color: #64748b; margin-top: 5px;">N/A</p>
                </div>
            </div>
        </div>
        
        <!-- Recent Transactions for Customer -->
        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border: 1px solid var(--border-color); box-shadow: var(--shadow); margin-top: 30px;">
            <h3><i class="fas fa-history"></i> Recent Transactions</h3>
            <div class="table-container" style="margin-top: 15px; max-height: 250px; overflow-y: auto;">
                <table class="accounts-table" style="font-size: 14px; margin: 0;">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Description</th>
                            <th>Mode</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody id="custTransactionsBody">
                        <!-- Loaded via JavaScript -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Pay Utility Bills Section -->
    <div id="payBills" class="section">
        <h2><i class="fas fa-file-invoice-dollar"></i> Pay Utility Bills</h2>
        <div class="form-group" style="background: var(--card-bg); padding: 25px; border-radius: 16px; border: 1px solid var(--border-color); margin-top: 20px; box-shadow: var(--shadow); max-width: 600px;">
            <div class="form-group">
                <label>Select Utility Bill Type</label>
                <select id="billType" onchange="onBillTypeChange()">
                    <option value="Electricity">Electricity Bill</option>
                    <option value="Mobile">Mobile Recharge / Postpaid</option>
                    <option value="DTH">DTH TV Recharge</option>
                    <option value="Water">Water Bill</option>
                </select>
            </div>
            
            <div class="form-group">
                <label id="billProviderLabel">Provider</label>
                <select id="billProvider">
                    <!-- Dynamic selection -->
                </select>
            </div>
            
            <div class="form-group">
                <label id="billNumberLabel">Consumer Number *</label>
                <input type="text" id="billNumber" placeholder="Enter number">
            </div>
            
            <div class="form-group">
                <label>Bill Amount * (₹)</label>
                <input type="number" id="billAmount" placeholder="Enter amount">
            </div>
            
            <div class="form-group">
                <label>Confirm 4-digit PIN *</label>
                <input type="password" id="billPin" maxlength="4" placeholder="Enter PIN">
            </div>
            
            <button class="btn" onclick="payUtilityBill()">
                <i class="fas fa-receipt"></i> Process Bill Payment
            </button>
            
            <div id="billResult" style="margin-top: 15px;"></div>
        </div>
    </div>

    <!-- Cards Management Section -->
    <div id="cards" class="section">
        <h2><i class="fas fa-credit-card"></i> Card Settings</h2>
        <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 30px; margin-top: 20px;">
            <!-- Card Visual Display -->
            <div style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
                <div class="debit-card-visual" id="settingsCardVisual" style="background: linear-gradient(135deg, #0f172a, #2563eb);">
                    <div class="card-logo">
                        <i class="fas fa-university"></i> SECURE BANK
                    </div>
                    <div class="card-chip"></div>
                    <div class="card-number" id="settingsCardNo">•••• •••• •••• ••••</div>
                    <div class="card-bottom">
                        <div class="card-holder">
                            <label>CARD HOLDER</label>
                            <div id="settingsCardHolder">John Doe</div>
                        </div>
                        <div class="card-expiry">
                            <label>EXPIRES</label>
                            <div id="settingsCardExpiry">12/30</div>
                        </div>
                    </div>
                </div>
                <p style="color: #64748b; font-size: 13px;"><i class="fas fa-info-circle"></i> Standard virtual Debit Card issued for active accounts.</p>
            </div>
            
            <!-- Card Management Settings -->
            <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border: 1px solid var(--border-color); box-shadow: var(--shadow);">
                <h3 style="color: var(--secondary-color); border-bottom: 2px solid var(--secondary-color); padding-bottom: 10px; margin-bottom: 20px; font-size: 18px;">
                    <i class="fas fa-sliders-h"></i> Manage Card Settings
                </h3>
                
                <div class="form-group" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 15px; background: var(--bg-color);">
                    <div>
                        <h4 style="font-size: 14px; font-weight: 600;">Block/Freeze Card</h4>
                        <p style="font-size: 11px; color: #64748b;">Lock card online transactions</p>
                    </div>
                    <input type="checkbox" id="cardStatusToggle" onchange="toggleCardBlock()" style="width: 40px; height: 20px; cursor: pointer;">
                </div>
                
                <div class="form-group">
                    <label>Daily ATM Withdrawal Limit (₹)</label>
                    <input type="number" id="cardAtmLimit" value="20000">
                </div>
                
                <div class="form-group">
                    <label>Daily Online Transaction Limit (₹)</label>
                    <input type="number" id="cardOnlineLimit" value="50000">
                </div>
                
                <button class="btn" onclick="saveCardLimits()">
                    <i class="fas fa-save"></i> Save Card Preferences
                </button>
                
                <div id="cardSettingsResult" style="margin-top: 15px;"></div>
            </div>
        </div>
    </div>

    <!-- Customer Profile Settings Section -->
    <div id="custSettings" class="section">
        <h2><i class="fas fa-cog"></i> Profile Settings</h2>
        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border: 1px solid var(--border-color); margin-top: 20px; box-shadow: var(--shadow); max-width: 500px;">
            <h3 style="color: var(--secondary-color); border-bottom: 2px solid var(--secondary-color); padding-bottom: 10px; margin-bottom: 20px; font-size: 18px;">
                <i class="fas fa-key"></i> Change account PIN
            </h3>
            <div class="form-group">
                <label>Current 4-digit PIN *</label>
                <input type="password" id="settingsOldPin" maxlength="4" placeholder="Enter current PIN">
            </div>
            <div class="form-group">
                <label>Choose New 4-digit PIN *</label>
                <input type="password" id="settingsNewPin" maxlength="4" placeholder="Enter new PIN">
            </div>
            <div class="form-group">
                <label>Confirm New PIN *</label>
                <input type="password" id="settingsConfPin" maxlength="4" placeholder="Confirm new PIN">
            </div>
            <button class="btn" onclick="changeCustomerPin()">
                <i class="fas fa-save"></i> Update PIN
            </button>
            
            <div id="settingsResult" style="margin-top: 15px;"></div>
        </div>
    </div>

    <!-- Staff Loan Approvals Review Panel -->
    <div id="loanApprovals" class="section">
        <h2><i class="fas fa-tasks"></i> Loan Review Queue</h2>
        <div class="table-container" style="margin-top: 20px;">
            <table class="accounts-table">
                <thead>
                    <tr>
                        <th>App ID</th>
                        <th>Account No</th>
                        <th>Applicant Name</th>
                        <th>Loan Type</th>
                        <th>Amount</th>
                        <th>Monthly EMI</th>
                        <th>Income</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="loanReviewTableBody">
                    <!-- Loaded dynamically by Javascript -->
                </tbody>
            </table>
        </div>
        <div id="loanApprovalResult" style="margin-top: 15px;"></div>
    </div>

    <!-- Staff Dashboard Overview -->
    <div id="dashboard" class="section">
        <h2><i class="fas fa-tachometer-alt"></i> Dashboard Overview</h2>
        <div id="dashboardContent" style="margin-top: 20px;">
            
            <!-- Stats Grid -->
            <div class="dashboard-stats">
                <div class="stat-card">
                    <div class="stat-icon" style="background: rgba(52, 152, 219, 0.1); color: var(--secondary-color);">
                        <i class="fas fa-wallet"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Total Deposits</h3>
                        <p id="statTotalDeposits">₹0</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: rgba(39, 174, 96, 0.1); color: var(--success-color);">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Active Accounts</h3>
                        <p id="statActiveAccounts">0</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: rgba(231, 76, 60, 0.1); color: var(--accent-color);">
                        <i class="fas fa-user-slash"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Locked Accounts</h3>
                        <p id="statLockedAccounts">0</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: rgba(243, 156, 18, 0.1); color: var(--warning-color);">
                        <i class="fas fa-hand-holding-usd"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Active Loans</h3>
                        <p id="statActiveLoans">0</p>
                    </div>
                </div>
            </div>

            <!-- Main Content Grid: Quick Search & Transactions -->
            <div class="dashboard-grid" style="display: grid; grid-template-columns: 1fr 2fr; gap: 30px; margin-top: 30px;">
                <!-- Left: Quick Search -->
                <div style="background: var(--card-bg); padding: 20px; border-radius: 10px; border: 1px solid var(--border-color); height: fit-content;">
                    <h3><i class="fas fa-search"></i> Quick Account Search</h3>
                    <div class="form-group" style="margin-top: 15px; margin-bottom: 10px;">
                        <input type="number" id="quickSearch" placeholder="Enter account number">
                    </div>
                    <button class="btn" onclick="quickSearchAccount()" style="width: 100%;">
                        <i class="fas fa-search"></i> Search Account
                    </button>
                    <div id="quickSearchResult" style="margin-top: 15px;"></div>
                </div>
                
                <!-- Right: Recent Transactions -->
                <div style="background: var(--card-bg); padding: 20px; border-radius: 10px; border: 1px solid var(--border-color);">
                    <h3><i class="fas fa-history"></i> Recent System Transactions</h3>
                    <div class="table-container" style="margin-top: 15px; max-height: 250px; overflow-y: auto;">
                        <table class="accounts-table" style="font-size: 14px; margin: 0;">
                            <thead>
                                <tr>
                                    <th>Acc No.</th>
                                    <th>Type</th>
                                    <th>Amount</th>
                                    <th>Mode</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody id="recentTransactionsBody">
                                <!-- Loaded via JavaScript -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
        </div>
    </div>

    <!-- Create Account Section -->
    <div id="create" class="section">
        <h2><i class="fas fa-user-plus"></i> Create Account</h2>
        
        <!-- Photo Upload -->
        <div class="photo-upload">
            <h4>Upload Passport Size Photo (Optional)</h4>
            <img id="photoPreview" class="photo-preview" src="https://via.placeholder.com/150" alt="Photo Preview">
            <label for="photoInput" class="upload-btn">
                <i class="fas fa-camera"></i> Choose Photo
                <input type="file" id="photoInput" accept="image/*" style="display: none;" onchange="previewPhoto(event)">
            </label>
        </div>

        <!-- Account Form -->
        <div class="form-group">
            <label>Full Name *</label>
            <input type="text" id="createName" placeholder="Enter full name">
        </div>
        
        <div class="form-group">
            <label>Father's Name *</label>
            <input type="text" id="createFather" placeholder="Enter father's name">
        </div>
        
        <div class="form-group">
            <label>Phone Number *</label>
            <input type="tel" id="createPhone" placeholder="Enter phone number">
        </div>
        
        <div class="form-group">
            <label>Email Address *</label>
            <input type="email" id="createEmail" placeholder="Enter email">
        </div>
        
        <div class="form-group">
            <label>Aadhaar Number * (12 digits)</label>
            <input type="text" id="createAadhaar" maxlength="12" placeholder="Enter Aadhaar number">
        </div>
        
        <div class="form-group">
            <label>Set 4-digit PIN *</label>
            <input type="password" id="createPin" maxlength="4" placeholder="Enter 4-digit PIN">
        </div>
        
        <div class="form-group">
            <label>Account Type</label>
            <select id="createType">
                <option value="Savings">Savings Account</option>
                <option value="Current">Current Account</option>
            </select>
        </div>
        
        <div class="form-group">
            <label>Initial Deposit * (₹)</label>
            <input type="number" id="createDeposit" placeholder="Enter amount">
        </div>
        
        <div class="form-group">
            <label>Address</label>
            <textarea id="createAddress" rows="3" placeholder="Enter full address"></textarea>
        </div>
        
        <button class="btn" onclick="createAccount()">
            <i class="fas fa-check"></i> Create Account
        </button>
        
        <div id="createResult"></div>
        
        <!-- Account Summary Receipt -->
        <div id="accountSummary" class="account-summary">
            <div class="summary-header">
                <h3><i class="fas fa-id-card"></i> Account Created Successfully!</h3>
                <button class="print-btn" onclick="printAccountSummary()">
                    <i class="fas fa-print"></i> Print Details
                </button>
            </div>
            <div id="summaryContent"></div>
        </div>
    </div>

    <!-- Search Account Section -->
    <div id="search" class="section">
        <h2><i class="fas fa-search"></i> Search Account</h2>
        
        <div class="form-group">
            <label>Enter Account Number</label>
            <div style="display: flex; gap: 10px;">
                <input type="number" id="searchAccInput" placeholder="Enter account number" style="flex: 1;">
                <button class="btn" onclick="searchAccount()">
                    <i class="fas fa-search"></i> Search
                </button>
            </div>
        </div>
        
        <div id="searchResult"></div>
    </div>

    <!-- All Accounts Table Section -->
    <div id="accounts" class="section">
        <h2><i class="fas fa-users"></i> All Accounts</h2>
        
        <div class="form-group">
            <div style="display: flex; gap: 10px;">
                <input type="text" id="accountsSearch" placeholder="Search by name or account number..." style="flex: 1;">
                <button class="btn" onclick="filterAccounts()">
                    <i class="fas fa-search"></i> Filter
                </button>
                <button class="btn btn-success" onclick="exportAccounts()">
                    <i class="fas fa-download"></i> Export
                </button>
            </div>
        </div>
        
        <div class="table-container">
            <table class="accounts-table">
                <thead>
                    <tr>
                        <th>Account No.</th>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Type</th>
                        <th>Balance</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="accountsTableBody">
                    <!-- Accounts will be loaded here -->
                </tbody>
            </table>
        </div>
    </div>

    <!-- Deposit Section -->
    <div id="deposit" class="section">
        <h2><i class="fas fa-money-bill-wave"></i> Deposit Money</h2>
        
        <div class="form-group">
            <label>Account Number *</label>
            <input type="number" id="depositAcc" placeholder="Enter account number">
        </div>
        
        <div class="form-group">
            <label>Amount * (₹)</label>
            <input type="number" id="depositAmount" placeholder="Enter amount">
        </div>
        
        <div class="form-group">
            <label>Deposit Mode</label>
            <select id="depositMode">
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="Online">Online Transfer</option>
            </select>
        </div>
        
        <div class="form-group">
            <label>Remarks</label>
            <input type="text" id="depositRemarks" placeholder="Enter remarks (optional)">
        </div>
        
        <button class="btn" onclick="depositMoney()">
            <i class="fas fa-check"></i> Deposit Money
        </button>
        
        <div id="depositResult"></div>
    </div>

    <!-- Withdraw Section -->
    <div id="withdraw" class="section">
        <h2><i class="fas fa-wallet"></i> Withdraw Money</h2>
        
        <div class="form-group">
            <label>Account Number *</label>
            <input type="number" id="withdrawAcc" placeholder="Enter account number">
        </div>
        
        <div class="form-group">
            <label>Account Holder Name</label>
            <input type="text" id="withdrawName" placeholder="Will auto-fill" readonly>
        </div>
        
        <div class="form-group">
            <label>Current Balance</label>
            <input type="text" id="withdrawBalance" placeholder="Will auto-fill" readonly>
        </div>
        
        <div class="form-group">
            <label>Amount to Withdraw * (₹)</label>
            <input type="number" id="withdrawAmount" placeholder="Enter amount">
        </div>
        
        <div class="form-group">
            <label>Withdrawal Mode</label>
            <select id="withdrawMode">
                <option value="Cash">Cash</option>
                <option value="ATM">ATM</option>
                <option value="Cheque">Cheque</option>
                <option value="Online">Online</option>
            </select>
        </div>
        
        <div class="form-group">
            <label>4-digit PIN *</label>
            <input type="password" id="withdrawPin" maxlength="4" placeholder="Enter your PIN">
        </div>
        
        <div class="form-group">
            <label>Purpose (Optional)</label>
            <input type="text" id="withdrawPurpose" placeholder="Enter purpose of withdrawal">
        </div>
        
        <button class="btn" onclick="processWithdrawal()">
            <i class="fas fa-check-circle"></i> Process Withdrawal
        </button>
        <button class="btn btn-danger" onclick="clearWithdrawForm()">
            <i class="fas fa-times"></i> Clear
        </button>
        
        <div id="withdrawResult"></div>
    </div>

    <!-- Transfer Section -->
    <div id="transfer" class="section">
        <h2><i class="fas fa-exchange-alt"></i> Transfer Funds</h2>
        
        <div class="form-group">
            <label>From Account (Sender) *</label>
            <input type="number" id="transferFrom" placeholder="Your account number">
        </div>
        
        <div class="form-group">
            <label>Sender Name</label>
            <input type="text" id="senderName" placeholder="Will auto-fill" readonly>
        </div>
        
        <div class="form-group">
            <label>To Account (Receiver) *</label>
            <input type="number" id="transferTo" placeholder="Receiver account number">
        </div>
        
        <div class="form-group">
            <label>Receiver Name</label>
            <input type="text" id="receiverName" placeholder="Will auto-fill" readonly>
        </div>
        
        <div class="form-group">
            <label>Transfer Amount * (₹)</label>
            <input type="number" id="transferAmount" placeholder="Enter amount">
        </div>
        
        <div class="form-group">
            <label>Transfer Mode</label>
            <select id="transferMode">
                <option value="IMPS">IMPS (Instant)</option>
                <option value="NEFT">NEFT</option>
                <option value="RTGS">RTGS</option>
                <option value="UPI">UPI</option>
            </select>
        </div>
        
        <div class="form-group">
            <label>Remarks</label>
            <input type="text" id="transferRemarks" placeholder="Enter transfer comments">
        </div>
        
        <div class="form-group">
            <label>Sender's PIN *</label>
            <input type="password" id="transferPin" maxlength="4" placeholder="Enter your PIN">
        </div>
        
        <!-- OTP Section -->
        <div id="otpSection" class="otp-section" style="display: none;">
            <h4><i class="fas fa-shield-alt"></i> OTP Verification</h4>
            <p>Enter the 6-digit OTP sent to your registered mobile/email</p>
            <div class="otp-inputs">
                <input type="text" maxlength="1">
                <input type="text" maxlength="1">
                <input type="text" maxlength="1">
                <input type="text" maxlength="1">
                <input type="text" maxlength="1">
                <input type="text" maxlength="1">
            </div>
            <button class="btn btn-warning" onclick="generateTransferOTP()" style="margin-top: 10px;">
                <i class="fas fa-sync-alt"></i> Resend OTP
            </button>
        </div>
        
        <button class="btn" onclick="initiateTransfer()">
            <i class="fas fa-paper-plane"></i> Initiate Transfer
        </button>
        <button class="btn btn-success" onclick="completeTransfer()" id="completeTransferBtn" style="display: none;">
            <i class="fas fa-check-circle"></i> Complete Transfer
        </button>
        <button class="btn btn-danger" onclick="clearTransferForm()">
            <i class="fas fa-redo"></i> Reset
        </button>
        
        <div id="transferResult"></div>
    </div>

    <!-- Apply Loan Section -->
    <div id="loan" class="section">
        <h2><i class="fas fa-hand-holding-usd"></i> Apply for Loan</h2>
        
        <div class="form-group">
            <label>Account Number *</label>
            <input type="number" id="loanAcc" placeholder="Your account number">
        </div>
        
        <div class="form-group">
            <label>Applicant Name</label>
            <input type="text" id="loanName" placeholder="Will auto-fill" readonly>
        </div>
        
        <div class="form-group">
            <label>Loan Type</label>
            <select id="loanType">
                <option value="Personal">Personal Loan</option>
                <option value="Home">Home Loan</option>
                <option value="Car">Car Loan</option>
                <option value="Business">Business Loan</option>
                <option value="Education">Education Loan</option>
            </select>
        </div>
        
        <div class="form-group">
            <label>Loan Amount * (₹)</label>
            <input type="number" id="loanAmount" placeholder="Required loan amount">
        </div>
        
        <div class="form-group">
            <label>Loan Tenure (Months) *</label>
            <select id="loanTenure">
                <option value="12">12 Months</option>
                <option value="24">24 Months</option>
                <option value="36">36 Months</option>
                <option value="48">48 Months</option>
                <option value="60">60 Months</option>
            </select>
        </div>
        
        <div class="form-group">
            <label>Interest Rate (%)</label>
            <input type="number" id="loanRate" step="0.01" value="9.5" readonly>
        </div>
        
        <div class="form-group">
            <label>Monthly Income (₹)</label>
            <input type="number" id="loanIncome" placeholder="Your monthly income">
        </div>
        
        <div class="form-group">
            <label>Employment Type</label>
            <select id="loanEmployment">
                <option value="Salaried">Salaried</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Business">Business</option>
            </select>
        </div>
        
        <div class="form-group">
            <label>Purpose of Loan</label>
            <textarea id="loanPurpose" rows="3" placeholder="Describe purpose of loan"></textarea>
        </div>
        
        <button class="btn" onclick="calculateEMI()">
            <i class="fas fa-calculator"></i> Calculate EMI
        </button>
        
        <!-- EMI Calculator Results -->
        <div id="emiCalculator" class="emi-calculator" style="display: none;">
            <h4><i class="fas fa-calculator"></i> EMI Calculation Results</h4>
            <div class="emi-result">
                <p><strong>Loan Amount:</strong> ₹<span id="calcLoanAmount">0</span></p>
                <p><strong>Tenure:</strong> <span id="calcTenure">0</span> months</p>
                <p><strong>Interest Rate:</strong> <span id="calcRate">0</span>%</p>
                <p><strong>Monthly EMI:</strong> ₹<span id="calcEMI">0</span></p>
                <p><strong>Total Interest Payable:</strong> ₹<span id="calcTotalInterest">0</span></p>
                <p><strong>Total Payment:</strong> ₹<span id="calcTotalPayment">0</span></p>
            </div>
        </div>
        
        <div class="form-group">
            <label>Applicant's PIN *</label>
            <input type="password" id="loanPin" maxlength="4" placeholder="Enter your PIN">
        </div>
        
        <button class="btn btn-success" onclick="applyForLoan()">
            <i class="fas fa-check-circle"></i> Apply for Loan
        </button>
        
        <div id="loanResult"></div>
    </div>

    <!-- Reports Section -->
    <div id="reports" class="section">
        <h2><i class="fas fa-chart-bar"></i> Reports & Statements</h2>
        
        <div class="report-controls form-group" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: 20px; background: var(--card-bg); padding: 20px; border-radius: 10px; border: 1px solid var(--border-color);">
            <div>
                <label for="reportType">Report Type</label>
                <select id="reportType" onchange="onReportTypeChange()">
                    <option value="statement">Account Statement</option>
                    <option value="transactions">All Transactions Summary</option>
                    <option value="loans">Loan Status Report</option>
                </select>
            </div>
            <div id="reportAccountGroup">
                <label for="reportAccount">Account Number</label>
                <input type="number" id="reportAccount" placeholder="Enter account number">
            </div>
            <div style="display: flex; align-items: flex-end;">
                <button class="btn btn-success" onclick="generateReport()" style="width: 100%;">
                    <i class="fas fa-sync-alt"></i> Generate Report
                </button>
            </div>
        </div>
        
        <div id="reportResult" style="margin-top: 20px;"></div>

        <div id="reportContainer" style="display: none; margin-top: 30px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3>Report Details</h3>
                <button class="btn btn-warning" onclick="exportPDF()">
                    <i class="fas fa-file-pdf"></i> Download PDF Statement
                </button>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 30px; margin-bottom: 30px;">
                <div class="chart-container" style="background: var(--card-bg); padding: 20px; border-radius: 10px; border: 1px solid var(--border-color); min-height: 250px; display: flex; align-items: center; justify-content: center; position: relative;">
                    <canvas id="reportChart" style="max-height: 250px; width: 100%;"></canvas>
                </div>
                <div id="reportSummaryStats" style="background: var(--card-bg); padding: 20px; border-radius: 10px; border: 1px solid var(--border-color); display: flex; flex-direction: column; justify-content: center; gap: 15px;">
                    <!-- Summary stats go here -->
                </div>
            </div>
            
            <div class="table-container">
                <table class="accounts-table">
                    <thead id="reportTableHeader">
                        <!-- Dynamic headers -->
                    </thead>
                    <tbody id="reportTableBody">
                        <!-- Dynamic rows -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Support Section -->
    <div id="support" class="section">
        <h2><i class="fas fa-headset"></i> Customer Support</h2>
        <div class="search-results">
            <h3><i class="fas fa-user-tie"></i> Support Team</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                <div>
                    <h4>Ratan Chaurasiya</h4>
                    <p><strong>Position:</strong> Senior Support Manager</p>
                    <p><strong>Phone:</strong> +91 63900 35039</p>
                    <p><strong>Email:</strong> ratanchaurasiya61@gmail.com</p>
                    <p><strong>Availability:</strong> 9 AM - 6 PM (Mon-Sat)</p>
                </div>
                <div>
                    <h4>General Support</h4>
                    <p><strong>Toll-Free:</strong> 1800-XXX-XXXX</p>
                    <p><strong>Email:</strong> support@bank.com</p>
                    <p><strong>24/7 Support:</strong> Available</p>
                    <p><strong>Address:</strong> Bank Headquarters, Mumbai</p>
                </div>
            </div>
        </div>
    </div>
`;

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('contentArea');
    if (container) {
        container.innerHTML = sectionsTemplate;
    }
});
