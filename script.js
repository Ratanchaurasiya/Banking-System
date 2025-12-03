
        // ==================== BANKING SYSTEM ====================
        class BankingSystem {
            constructor() {
                this.accounts = JSON.parse(localStorage.getItem('bankAccounts')) || [];
                this.transactions = JSON.parse(localStorage.getItem('bankTransactions')) || [];
                this.loans = JSON.parse(localStorage.getItem('bankLoans')) || [];
                this.nextAccountNumber = this.accounts.length > 0 ? 
                    Math.max(...this.accounts.map(a => a.account_number)) + 1 : 10001;
                this.otp = null;
                this.currentTransferData = null;
                
                this.init();
            }

            init() {
                if (this.accounts.length === 0) {
                    this.loadSampleData();
                }
                this.updateAllAccountsTable();
            }

            loadSampleData() {
                this.accounts = [
                    {
                        account_number: 10001,
                        candidate_name: "Rajesh Kumar",
                        father_name: "Suresh Kumar",
                        phone: "9876543210",
                        email: "rajesh@example.com",
                        aadhaar_number: "123456789012",
                        pin: this.hashPin("1234"),
                        account_type: "Savings",
                        balance: 50000,
                        address: "Delhi, India",
                        photo: null,
                        locked: false,
                        failed_attempts: 0,
                        created_at: new Date().toISOString()
                    },
                    {
                        account_number: 10002,
                        candidate_name: "Priya Sharma",
                        father_name: "Vikram Sharma",
                        phone: "9876543211",
                        email: "priya@example.com",
                        aadhaar_number: "987654321098",
                        pin: this.hashPin("5678"),
                        account_type: "Current",
                        balance: 75000,
                        address: "Mumbai, India",
                        photo: null,
                        locked: false,
                        failed_attempts: 0,
                        created_at: new Date().toISOString()
                    }
                ];
                this.saveData();
            }

            hashPin(pin) {
                let hash = 0;
                for (let i = 0; i < pin.length; i++) {
                    const char = pin.charCodeAt(i);
                    hash = ((hash << 5) - hash) + char;
                    hash = hash & hash;
                }
                return hash.toString();
            }

            saveData() {
                localStorage.setItem('bankAccounts', JSON.stringify(this.accounts));
                localStorage.setItem('bankTransactions', JSON.stringify(this.transactions));
                localStorage.setItem('bankLoans', JSON.stringify(this.loans));
            }

            createAccount(data) {
                const newAccount = {
                    account_number: this.nextAccountNumber++,
                    candidate_name: data.name,
                    father_name: data.father,
                    phone: data.phone,
                    email: data.email,
                    aadhaar_number: data.aadhaar,
                    pin: this.hashPin(data.pin),
                    account_type: data.type,
                    balance: parseFloat(data.deposit) || 0,
                    address: data.address,
                    photo: data.photo,
                    locked: false,
                    failed_attempts: 0,
                    created_at: new Date().toISOString()
                };

                this.accounts.push(newAccount);
                
                // Add initial deposit transaction
                this.addTransaction({
                    account_number: newAccount.account_number,
                    type: 'Deposit',
                    amount: newAccount.balance,
                    description: 'Initial deposit',
                    mode: 'Account Opening'
                });

                this.saveData();
                this.updateAllAccountsTable();
                return newAccount;
            }

            getAccount(accountNumber) {
                return this.accounts.find(acc => acc.account_number == accountNumber);
            }

            verifyPin(account, pin) {
                return account.pin === this.hashPin(pin);
            }

            addTransaction(data) {
                const transaction = {
                    id: Date.now(),
                    account_number: data.account_number,
                    type: data.type,
                    amount: data.amount,
                    description: data.description,
                    mode: data.mode || 'Cash',
                    date: new Date().toISOString(),
                    timestamp: Date.now()
                };

                this.transactions.push(transaction);
                this.saveData();
                return transaction;
            }

            deposit(accountNumber, amount, mode, remarks) {
                const account = this.getAccount(accountNumber);
                if (!account) return { success: false, message: "Account not found" };
                
                if (account.locked) return { success: false, message: "Account is locked" };
                
                account.balance += parseFloat(amount);
                
                this.addTransaction({
                    account_number: accountNumber,
                    type: 'Deposit',
                    amount: amount,
                    description: remarks || 'Cash deposit',
                    mode: mode
                });

                this.saveData();
                return { 
                    success: true, 
                    message: "Deposit successful",
                    newBalance: account.balance 
                };
            }

            // ==================== WITHDRAW FUNCTION ====================
            withdraw(accountNumber, amount, pin, mode, purpose) {
                const account = this.getAccount(accountNumber);
                if (!account) return { success: false, message: "Account not found" };
                
                if (account.locked) return { success: false, message: "Account is locked" };
                
                if (!this.verifyPin(account, pin)) {
                    account.failed_attempts = (account.failed_attempts || 0) + 1;
                    if (account.failed_attempts >= 3) {
                        account.locked = true;
                        this.saveData();
                        return { success: false, message: "Account locked due to too many failed attempts" };
                    }
                    this.saveData();
                    return { success: false, message: "Invalid PIN" };
                }
                
                if (parseFloat(amount) > account.balance) {
                    return { success: false, message: "Insufficient balance" };
                }
                
                if (parseFloat(amount) <= 0) {
                    return { success: false, message: "Invalid amount" };
                }
                
                account.balance -= parseFloat(amount);
                account.failed_attempts = 0;
                
                this.addTransaction({
                    account_number: accountNumber,
                    type: 'Withdrawal',
                    amount: amount,
                    description: purpose || 'Cash withdrawal',
                    mode: mode
                });

                this.saveData();
                return { 
                    success: true, 
                    message: "Withdrawal successful",
                    newBalance: account.balance 
                };
            }

            // ==================== TRANSFER FUNCTION ====================
            initiateTransfer(fromAcc, toAcc, amount, pin, mode, remarks) {
                const sender = this.getAccount(fromAcc);
                const receiver = this.getAccount(toAcc);
                
                if (!sender) return { success: false, message: "Sender account not found" };
                if (!receiver) return { success: false, message: "Receiver account not found" };
                
                if (sender.locked) return { success: false, message: "Sender account is locked" };
                
                if (!this.verifyPin(sender, pin)) {
                    return { success: false, message: "Invalid PIN" };
                }
                
                if (parseFloat(amount) > sender.balance) {
                    return { success: false, message: "Insufficient balance" };
                }
                
                if (parseFloat(amount) <= 0) {
                    return { success: false, message: "Invalid amount" };
                }
                
                // Store transfer data for OTP verification
                this.currentTransferData = {
                    fromAcc,
                    toAcc,
                    amount: parseFloat(amount),
                    mode,
                    remarks,
                    senderName: sender.candidate_name,
                    receiverName: receiver.candidate_name
                };
                
                // Generate OTP
                this.otp = Math.floor(100000 + Math.random() * 900000);
                
                return { 
                    success: true, 
                    message: "OTP generated. Please verify to complete transfer.",
                    otp: this.otp
                };
            }

            completeTransfer(enteredOTP) {
                if (!this.currentTransferData) {
                    return { success: false, message: "No transfer initiated" };
                }
                
                if (parseInt(enteredOTP) !== this.otp) {
                    return { success: false, message: "Invalid OTP" };
                }
                
                const { fromAcc, toAcc, amount, mode, remarks } = this.currentTransferData;
                const sender = this.getAccount(fromAcc);
                const receiver = this.getAccount(toAcc);
                
                sender.balance -= amount;
                receiver.balance += amount;
                
                // Add transactions for both accounts
                this.addTransaction({
                    account_number: fromAcc,
                    type: 'Transfer Out',
                    amount: amount,
                    description: `To: ${toAcc} - ${remarks}`,
                    mode: mode
                });
                
                this.addTransaction({
                    account_number: toAcc,
                    type: 'Transfer In',
                    amount: amount,
                    description: `From: ${fromAcc} - ${remarks}`,
                    mode: mode
                });
                
                this.saveData();
                
                // Clear transfer data
                this.currentTransferData = null;
                this.otp = null;
                
                return { 
                    success: true, 
                    message: "Transfer completed successfully",
                    details: {
                        from: fromAcc,
                        to: toAcc,
                        amount: amount,
                        senderBalance: sender.balance
                    }
                };
            }

            // ==================== LOAN FUNCTION ====================
            calculateEMI(principal, rate, months) {
                const monthlyRate = rate / 12 / 100;
                const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / 
                           (Math.pow(1 + monthlyRate, months) - 1);
                const totalPayment = emi * months;
                const totalInterest = totalPayment - principal;
                
                return {
                    emi: emi.toFixed(2),
                    totalPayment: totalPayment.toFixed(2),
                    totalInterest: totalInterest.toFixed(2)
                };
            }

            applyLoan(accountNumber, data, pin) {
                const account = this.getAccount(accountNumber);
                if (!account) return { success: false, message: "Account not found" };
                
                if (!this.verifyPin(account, pin)) {
                    return { success: false, message: "Invalid PIN" };
                }
                
                const loan = {
                    id: Date.now(),
                    account_number: accountNumber,
                    applicant_name: account.candidate_name,
                    loan_type: data.type,
                    amount: parseFloat(data.amount),
                    tenure: parseInt(data.tenure),
                    interest_rate: parseFloat(data.rate),
                    emi: data.emi,
                    purpose: data.purpose,
                    income: data.income,
                    employment: data.employment,
                    status: 'Pending',
                    applied_date: new Date().toISOString(),
                    approved_date: null
                };
                
                this.loans.push(loan);
                this.saveData();
                
                return { 
                    success: true, 
                    message: "Loan application submitted successfully",
                    loanId: loan.id
                };
            }

            searchAccounts(searchTerm) {
                if (!searchTerm) return this.accounts;
                
                return this.accounts.filter(account => 
                    account.account_number.toString().includes(searchTerm) ||
                    account.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    account.phone.includes(searchTerm) ||
                    account.email.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            updateAllAccountsTable() {
                const tbody = document.getElementById('accountsTableBody');
                if (!tbody) return;

                const searchTerm = document.getElementById('accountsSearch')?.value || '';
                const filteredAccounts = this.searchAccounts(searchTerm);

                tbody.innerHTML = filteredAccounts.map(account => `
                    <tr>
                        <td>${account.account_number}</td>
                        <td>${account.candidate_name}</td>
                        <td>${account.phone}</td>
                        <td>${account.account_type}</td>
                        <td>₹${account.balance.toLocaleString()}</td>
                        <td>
                            <span style="
                                padding: 5px 10px;
                                border-radius: 15px;
                                font-size: 12px;
                                font-weight: bold;
                                background: ${account.locked ? '#f8d7da' : '#d4edda'};
                                color: ${account.locked ? '#721c24' : '#155724'};
                            ">
                                ${account.locked ? '🔒 Locked' : '✅ Active'}
                            </span>
                        </td>
                        <td>
                            <button onclick="viewAccountDetails(${account.account_number})" 
                                style="background: #3498db; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin: 2px;">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button onclick="editAccount(${account.account_number})"
                                style="background: #f39c12; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin: 2px;">
                                <i class="fas fa-edit"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
        }

        // ==================== GLOBAL INSTANCE ====================
        const bank = new BankingSystem();

        // ==================== UI FUNCTIONS ====================
        function showSection(sectionId) {
            // Update active menu
            document.querySelectorAll('.menu-item').forEach(item => {
                item.classList.remove('active');
            });
            event.currentTarget.classList.add('active');
            
            // Show section
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(sectionId).classList.add('active');
            
            // Update specific sections
            if (sectionId === 'accounts') {
                bank.updateAllAccountsTable();
            }
        }

        function toggleTheme() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            
            // Update button text
            const themeBtn = document.querySelector('.theme-toggle');
            const icon = themeBtn.querySelector('i');
            icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            themeBtn.innerHTML = `<i class="${icon.className}"></i> ${newTheme === 'dark' ? 'Light' : 'Dark'} Mode`;
        }

        // ==================== CREATE ACCOUNT ====================
        function previewPhoto(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('photoPreview').src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        }

        function createAccount() {
            // Get form values
            const data = {
                name: document.getElementById('createName').value.trim(),
                father: document.getElementById('createFather').value.trim(),
                phone: document.getElementById('createPhone').value.trim(),
                email: document.getElementById('createEmail').value.trim(),
                aadhaar: document.getElementById('createAadhaar').value.trim(),
                pin: document.getElementById('createPin').value.trim(),
                type: document.getElementById('createType').value,
                deposit: document.getElementById('createDeposit').value,
                address: document.getElementById('createAddress').value.trim(),
                photo: document.getElementById('photoPreview').src
            };

            // Validation
            if (!data.name || !data.father || !data.phone || !data.email || 
                !data.aadhaar || data.aadhaar.length !== 12 || 
                !data.pin || data.pin.length !== 4 || !data.deposit) {
                showMessage('Please fill all required fields correctly!', 'error', 'createResult');
                return;
            }

            if (!/^\d{10}$/.test(data.phone)) {
                showMessage('Please enter a valid 10-digit phone number!', 'error', 'createResult');
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
                showMessage('Please enter a valid email address!', 'error', 'createResult');
                return;
            }

            // Create account
            const newAccount = bank.createAccount(data);

            // Show success message
            showMessage(
                `Account created successfully! Account Number: ${newAccount.account_number}`, 
                'success', 
                'createResult'
            );

            // Show account summary
            showAccountSummary(newAccount);

            // Clear form
            clearCreateForm();
        }

        function showAccountSummary(account) {
            const summaryHTML = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                    <div>
                        <h4>Personal Details</h4>
                        <p><strong>Account Number:</strong> ${account.account_number}</p>
                        <p><strong>Full Name:</strong> ${account.candidate_name}</p>
                        <p><strong>Father's Name:</strong> ${account.father_name}</p>
                        <p><strong>Phone:</strong> ${account.phone}</p>
                        <p><strong>Email:</strong> ${account.email}</p>
                        <p><strong>Aadhaar:</strong> ${account.aadhaar_number}</p>
                    </div>
                    <div>
                        <h4>Account Details</h4>
                        <p><strong>Account Type:</strong> ${account.account_type}</p>
                        <p><strong>Initial Balance:</strong> ₹${account.balance.toLocaleString()}</p>
                        <p><strong>Account Created:</strong> ${new Date(account.created_at).toLocaleString()}</p>
                        <p><strong>Address:</strong> ${account.address}</p>
                        <p><strong>Account Status:</strong> ${account.locked ? 'Locked' : 'Active'}</p>
                    </div>
                </div>
                ${account.photo && account.photo !== 'https://via.placeholder.com/150' ? `
                    <div style="text-align: center; margin-top: 20px;">
                        <h4>Passport Photo</h4>
                        <img src="${account.photo}" style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 3px solid #3498db;">
                    </div>
                ` : ''}
            `;

            document.getElementById('summaryContent').innerHTML = summaryHTML;
            document.getElementById('accountSummary').style.display = 'block';
            
            // Scroll to summary
            document.getElementById('accountSummary').scrollIntoView({ behavior: 'smooth' });
        }

        function printAccountSummary() {
            const printContent = document.getElementById('accountSummary').innerHTML;
            const originalContent = document.body.innerHTML;
            
            document.body.innerHTML = `
                <div style="padding: 20px; font-family: Arial, sans-serif;">
                    <h1 style="color: #3498db; text-align: center;">Banking System - Account Details</h1>
                    <hr>
                    ${printContent}
                    <hr>
                    <p style="text-align: center; color: #666; margin-top: 30px;">
                        Printed on: ${new Date().toLocaleString()}<br>
                        This is a computer generated document.
                    </p>
                </div>
            `;
            
            window.print();
            document.body.innerHTML = originalContent;
            showSection('create');
        }

        function clearCreateForm() {
            document.getElementById('createName').value = '';
            document.getElementById('createFather').value = '';
            document.getElementById('createPhone').value = '';
            document.getElementById('createEmail').value = '';
            document.getElementById('createAadhaar').value = '';
            document.getElementById('createPin').value = '';
            document.getElementById('createDeposit').value = '';
            document.getElementById('createAddress').value = '';
            document.getElementById('photoPreview').src = 'https://via.placeholder.com/150';
        }

        // ==================== DEPOSIT MONEY ====================
        function depositMoney() {
            const accountNumber = document.getElementById('depositAcc').value;
            const amount = parseFloat(document.getElementById('depositAmount').value);
            const mode = document.getElementById('depositMode').value;
            const remarks = document.getElementById('depositRemarks').value;

            if (!accountNumber || !amount || amount <= 0) {
                showMessage('Please enter valid account number and amount!', 'error', 'depositResult');
                return;
            }

            const result = bank.deposit(accountNumber, amount, mode, remarks);
            
            if (result.success) {
                document.getElementById('depositResult').innerHTML = `
                    <div class="message message-success">
                        <h4><i class="fas fa-check-circle"></i> Deposit Successful!</h4>
                        <p><strong>Account Number:</strong> ${accountNumber}</p>
                        <p><strong>Amount Deposited:</strong> ₹${amount.toLocaleString()}</p>
                        <p><strong>Mode:</strong> ${mode}</p>
                        <p><strong>New Balance:</strong> ₹${result.newBalance.toLocaleString()}</p>
                        <p><strong>Transaction Time:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                `;
                
                // Clear form
                document.getElementById('depositAcc').value = '';
                document.getElementById('depositAmount').value = '';
                document.getElementById('depositRemarks').value = '';
            } else {
                showMessage(result.message, 'error', 'depositResult');
            }
        }

        // ==================== WITHDRAW MONEY ====================
        function autoFillWithdrawDetails() {
            const accountNumber = document.getElementById('withdrawAcc').value;
            if (!accountNumber) return;
            
            const account = bank.getAccount(accountNumber);
            if (account) {
                document.getElementById('withdrawName').value = account.candidate_name;
                document.getElementById('withdrawBalance').value = `₹${account.balance.toLocaleString()}`;
            } else {
                document.getElementById('withdrawName').value = '';
                document.getElementById('withdrawBalance').value = '';
            }
        }

        function processWithdrawal() {
            const accountNumber = document.getElementById('withdrawAcc').value;
            const amount = parseFloat(document.getElementById('withdrawAmount').value);
            const pin = document.getElementById('withdrawPin').value;
            const mode = document.getElementById('withdrawMode').value;
            const purpose = document.getElementById('withdrawPurpose').value;

            if (!accountNumber || !amount || !pin) {
                showMessage('Please fill all required fields!', 'error', 'withdrawResult');
                return;
            }

            if (amount <= 0) {
                showMessage('Please enter a valid amount!', 'error', 'withdrawResult');
                return;
            }

            const result = bank.withdraw(accountNumber, amount, pin, mode, purpose);
            
            if (result.success) {
                document.getElementById('withdrawResult').innerHTML = `
                    <div class="message message-success">
                        <h4><i class="fas fa-check-circle"></i> Withdrawal Successful!</h4>
                        <p><strong>Transaction ID:</strong> ${Date.now()}</p>
                        <p><strong>Account Number:</strong> ${accountNumber}</p>
                        <p><strong>Account Holder:</strong> ${document.getElementById('withdrawName').value}</p>
                        <p><strong>Amount Withdrawn:</strong> ₹${amount.toLocaleString()}</p>
                        <p><strong>Withdrawal Mode:</strong> ${mode}</p>
                        <p><strong>New Balance:</strong> ₹${result.newBalance.toLocaleString()}</p>
                        <p><strong>Transaction Time:</strong> ${new Date().toLocaleString()}</p>
                        ${purpose ? `<p><strong>Purpose:</strong> ${purpose}</p>` : ''}
                    </div>
                `;
                
                // Clear form
                clearWithdrawForm();
            } else {
                document.getElementById('withdrawResult').innerHTML = `
                    <div class="message message-error">
                        <h4><i class="fas fa-exclamation-circle"></i> Withdrawal Failed</h4>
                        <p>${result.message}</p>
                    </div>
                `;
            }
        }

        function clearWithdrawForm() {
            document.getElementById('withdrawAcc').value = '';
            document.getElementById('withdrawName').value = '';
            document.getElementById('withdrawBalance').value = '';
            document.getElementById('withdrawAmount').value = '';
            document.getElementById('withdrawPin').value = '';
            document.getElementById('withdrawPurpose').value = '';
        }

        // ==================== TRANSFER FUNDS ====================
        function autoFillTransferDetails() {
            const fromAcc = document.getElementById('transferFrom').value;
            const toAcc = document.getElementById('transferTo').value;
            
            if (fromAcc) {
                const sender = bank.getAccount(fromAcc);
                if (sender) {
                    document.getElementById('senderName').value = sender.candidate_name;
                } else {
                    document.getElementById('senderName').value = '';
                }
            }
            
            if (toAcc) {
                const receiver = bank.getAccount(toAcc);
                if (receiver) {
                    document.getElementById('receiverName').value = receiver.candidate_name;
                } else {
                    document.getElementById('receiverName').value = '';
                }
            }
        }

        function initiateTransfer() {
            const fromAcc = document.getElementById('transferFrom').value;
            const toAcc = document.getElementById('transferTo').value;
            const amount = parseFloat(document.getElementById('transferAmount').value);
            const pin = document.getElementById('transferPin').value;
            const mode = document.getElementById('transferMode').value;
            const remarks = document.getElementById('transferRemarks').value;

            if (!fromAcc || !toAcc || !amount || !pin) {
                showMessage('Please fill all required fields!', 'error', 'transferResult');
                return;
            }

            if (fromAcc === toAcc) {
                showMessage('Cannot transfer to same account!', 'error', 'transferResult');
                return;
            }

            if (amount <= 0) {
                showMessage('Please enter a valid amount!', 'error', 'transferResult');
                return;
            }

            const result = bank.initiateTransfer(fromAcc, toAcc, amount, pin, mode, remarks);
            
            if (result.success) {
                // Show OTP section
                document.getElementById('otpSection').style.display = 'block';
                document.getElementById('completeTransferBtn').style.display = 'inline-block';
                
                // Clear OTP inputs
                document.querySelectorAll('.otp-inputs input').forEach(input => input.value = '');
                
                document.getElementById('transferResult').innerHTML = `
                    <div class="message message-info">
                        <h4><i class="fas fa-shield-alt"></i> OTP Verification Required</h4>
                        <p>${result.message}</p>
                        <p><strong>Test OTP (for demo):</strong> ${result.otp}</p>
                        <p>Please enter the OTP to complete the transfer.</p>
                    </div>
                `;
            } else {
                document.getElementById('transferResult').innerHTML = `
                    <div class="message message-error">
                        <h4><i class="fas fa-exclamation-circle"></i> Transfer Failed</h4>
                        <p>${result.message}</p>
                    </div>
                `;
            }
        }

        function generateTransferOTP() {
            if (bank.currentTransferData) {
                bank.otp = Math.floor(100000 + Math.random() * 900000);
                document.getElementById('transferResult').innerHTML = `
                    <div class="message message-info">
                        <p><strong>New OTP generated:</strong> ${bank.otp}</p>
                    </div>
                `;
            }
        }

        function completeTransfer() {
            const otpInputs = document.querySelectorAll('.otp-inputs input');
            let enteredOTP = '';
            otpInputs.forEach(input => enteredOTP += input.value);
            
            if (enteredOTP.length !== 6) {
                showMessage('Please enter complete 6-digit OTP!', 'error', 'transferResult');
                return;
            }

            const result = bank.completeTransfer(enteredOTP);
            
            if (result.success) {
                document.getElementById('transferResult').innerHTML = `
                    <div class="message message-success">
                        <h4><i class="fas fa-check-circle"></i> Transfer Successful!</h4>
                        <p><strong>Transaction ID:</strong> ${Date.now()}</p>
                        <p><strong>From Account:</strong> ${result.details.from}</p>
                        <p><strong>To Account:</strong> ${result.details.to}</p>
                        <p><strong>Amount Transferred:</strong> ₹${result.details.amount.toLocaleString()}</p>
                        <p><strong>Sender's New Balance:</strong> ₹${result.details.senderBalance.toLocaleString()}</p>
                        <p><strong>Transaction Time:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                `;
                
                // Hide OTP section
                document.getElementById('otpSection').style.display = 'none';
                document.getElementById('completeTransferBtn').style.display = 'none';
                
                // Clear form
                clearTransferForm();
            } else {
                document.getElementById('transferResult').innerHTML = `
                    <div class="message message-error">
                        <h4><i class="fas fa-exclamation-circle"></i> Transfer Failed</h4>
                        <p>${result.message}</p>
                    </div>
                `;
            }
        }

        function moveToNext(current, next) {
            if (current.value.length === 1) {
                if (next <= 6) {
                    document.querySelector(`.otp-inputs input:nth-child(${next})`).focus();
                }
            }
        }

        function clearTransferForm() {
            document.getElementById('transferFrom').value = '';
            document.getElementById('senderName').value = '';
            document.getElementById('transferTo').value = '';
            document.getElementById('receiverName').value = '';
            document.getElementById('transferAmount').value = '';
            document.getElementById('transferPin').value = '';
            document.getElementById('transferRemarks').value = '';
            document.getElementById('otpSection').style.display = 'none';
            document.getElementById('completeTransferBtn').style.display = 'none';
            document.getElementById('transferResult').innerHTML = '';
            
            // Clear OTP inputs
            document.querySelectorAll('.otp-inputs input').forEach(input => input.value = '');
        }

        // ==================== APPLY LOAN ====================
        function autoFillLoanDetails() {
            const accountNumber = document.getElementById('loanAcc').value;
            if (!accountNumber) return;
            
            const account = bank.getAccount(accountNumber);
            if (account) {
                document.getElementById('loanName').value = account.candidate_name;
            } else {
                document.getElementById('loanName').value = '';
            }
        }

        function calculateEMI() {
            const amount = parseFloat(document.getElementById('loanAmount').value);
            const tenure = parseInt(document.getElementById('loanTenure').value);
            const rate = parseFloat(document.getElementById('loanRate').value);

            if (!amount || amount <= 0) {
                showMessage('Please enter loan amount!', 'error', 'loanResult');
                return;
            }

            const result = bank.calculateEMI(amount, rate, tenure);
            
            // Show EMI calculator
            document.getElementById('emiCalculator').style.display = 'block';
            
            // Update results
            document.getElementById('calcLoanAmount').textContent = amount.toLocaleString();
            document.getElementById('calcTenure').textContent = tenure;
            document.getElementById('calcRate').textContent = rate;
            document.getElementById('calcEMI').textContent = result.emi;
            document.getElementById('calcTotalInterest').textContent = result.totalInterest;
            document.getElementById('calcTotalPayment').textContent = result.totalPayment;
        }

        function applyForLoan() {
            const accountNumber = document.getElementById('loanAcc').value;
            const pin = document.getElementById('loanPin').value;
            const amount = parseFloat(document.getElementById('loanAmount').value);
            const tenure = parseInt(document.getElementById('loanTenure').value);
            const rate = parseFloat(document.getElementById('loanRate').value);

            if (!accountNumber || !pin || !amount || !tenure) {
                showMessage('Please fill all required fields!', 'error', 'loanResult');
                return;
            }

            const data = {
                type: document.getElementById('loanType').value,
                amount: amount,
                tenure: tenure,
                rate: rate,
                emi: document.getElementById('calcEMI').textContent,
                purpose: document.getElementById('loanPurpose').value,
                income: document.getElementById('loanIncome').value,
                employment: document.getElementById('loanEmployment').value
            };

            const result = bank.applyLoan(accountNumber, data, pin);
            
            if (result.success) {
                document.getElementById('loanResult').innerHTML = `
                    <div class="message message-success">
                        <h4><i class="fas fa-check-circle"></i> Loan Application Submitted!</h4>
                        <p><strong>Application ID:</strong> ${result.loanId}</p>
                        <p><strong>Applicant:</strong> ${document.getElementById('loanName').value}</p>
                        <p><strong>Loan Type:</strong> ${data.type}</p>
                        <p><strong>Loan Amount:</strong> ₹${amount.toLocaleString()}</p>
                        <p><strong>Tenure:</strong> ${tenure} months</p>
                        <p><strong>Monthly EMI:</strong> ₹${data.emi}</p>
                        <p><strong>Status:</strong> Pending Approval</p>
                        <p><strong>Applied Date:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                `;
                
                // Clear form
                clearLoanForm();
            } else {
                document.getElementById('loanResult').innerHTML = `
                    <div class="message message-error">
                        <h4><i class="fas fa-exclamation-circle"></i> Loan Application Failed</h4>
                        <p>${result.message}</p>
                    </div>
                `;
            }
        }

        function clearLoanForm() {
            document.getElementById('loanAcc').value = '';
            document.getElementById('loanName').value = '';
            document.getElementById('loanAmount').value = '';
            document.getElementById('loanIncome').value = '';
            document.getElementById('loanPurpose').value = '';
            document.getElementById('loanPin').value = '';
            document.getElementById('emiCalculator').style.display = 'none';
        }

        // ==================== SEARCH & OTHER FUNCTIONS ====================
        function searchAccount() {
            const accountNumber = document.getElementById('searchAccInput').value;
            if (!accountNumber) {
                showMessage('Please enter an account number!', 'error', 'searchResult');
                return;
            }

            const account = bank.getAccount(accountNumber);
            if (!account) {
                showMessage('Account not found!', 'error', 'searchResult');
                return;
            }

            const resultHTML = `
                <div class="search-results">
                    <h3><i class="fas fa-user-circle"></i> Account Details</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                        <div>
                            <p><strong>Account Number:</strong> ${account.account_number}</p>
                            <p><strong>Full Name:</strong> ${account.candidate_name}</p>
                            <p><strong>Father's Name:</strong> ${account.father_name}</p>
                            <p><strong>Phone:</strong> ${account.phone}</p>
                            <p><strong>Email:</strong> ${account.email}</p>
                        </div>
                        <div>
                            <p><strong>Account Type:</strong> ${account.account_type}</p>
                            <p><strong>Current Balance:</strong> ₹${account.balance.toLocaleString()}</p>
                            <p><strong>Account Created:</strong> ${new Date(account.created_at).toLocaleDateString()}</p>
                            <p><strong>Aadhaar:</strong> ${account.aadhaar_number}</p>
                            <p><strong>Status:</strong> ${account.locked ? '🔒 Locked' : '✅ Active'}</p>
                        </div>
                    </div>
                    
                    <div style="margin-top: 20px;">
                        <h4>Quick Actions</h4>
                        <button class="btn" onclick="quickDeposit(${account.account_number})" style="margin-right: 10px;">
                            <i class="fas fa-money-bill-wave"></i> Deposit
                        </button>
                        <button class="btn" onclick="quickWithdraw(${account.account_number})" style="margin-right: 10px;">
                            <i class="fas fa-wallet"></i> Withdraw
                        </button>
                        <button class="btn" onclick="quickTransfer(${account.account_number})">
                            <i class="fas fa-exchange-alt"></i> Transfer
                        </button>
                    </div>
                </div>
            `;

            document.getElementById('searchResult').innerHTML = resultHTML;
        }

        function quickSearchAccount() {
            const accountNumber = document.getElementById('quickSearch').value;
            if (!accountNumber) return;

            const account = bank.getAccount(accountNumber);
            if (!account) {
                document.getElementById('quickSearchResult').innerHTML = `
                    <div class="message message-error">
                        <i class="fas fa-exclamation-circle"></i> Account not found!
                    </div>
                `;
                return;
            }

            document.getElementById('quickSearchResult').innerHTML = `
                <div class="search-results">
                    <h4>Account Found</h4>
                    <p><strong>Account Number:</strong> ${account.account_number}</p>
                    <p><strong>Name:</strong> ${account.candidate_name}</p>
                    <p><strong>Balance:</strong> ₹${account.balance.toLocaleString()}</p>
                    <p><strong>Type:</strong> ${account.account_type}</p>
                    <button class="btn" onclick="showFullAccount(${account.account_number})" style="margin-top: 10px;">
                        <i class="fas fa-eye"></i> View Full Details
                    </button>
                </div>
            `;
        }

        function showFullAccount(accountNumber) {
            showSection('search');
            document.getElementById('searchAccInput').value = accountNumber;
            searchAccount();
        }

        function filterAccounts() {
            bank.updateAllAccountsTable();
        }

        function viewAccountDetails(accountNumber) {
            showSection('search');
            document.getElementById('searchAccInput').value = accountNumber;
            searchAccount();
        }

        function editAccount(accountNumber) {
            showMessage('Edit feature coming soon!', 'info', 'accounts');
        }

        function exportAccounts() {
            const accounts = bank.accounts;
            let csv = 'Account No,Name,Father Name,Phone,Email,Type,Balance,Status\n';
            
            accounts.forEach(account => {
                csv += `${account.account_number},"${account.candidate_name}","${account.father_name}",${account.phone},${account.email},${account.account_type},${account.balance},${account.locked ? 'Locked' : 'Active'}\n`;
            });
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bank-accounts-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            
            showMessage('Accounts exported successfully!', 'success', 'accounts');
        }

        function showMessage(message, type, elementId) {
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = `
                    <div class="message message-${type}">
                        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                        ${message}
                    </div>
                `;
                
                // Auto clear after 5 seconds
                setTimeout(() => {
                    element.innerHTML = '';
                }, 5000);
            }
        }

        // Quick action functions
        function quickDeposit(accountNumber) {
            showSection('deposit');
            document.getElementById('depositAcc').value = accountNumber;
            document.getElementById('depositAcc').focus();
        }

        function quickWithdraw(accountNumber) {
            showSection('withdraw');
            document.getElementById('withdrawAcc').value = accountNumber;
            autoFillWithdrawDetails();
            document.getElementById('withdrawAmount').focus();
        }

        function quickTransfer(accountNumber) {
            showSection('transfer');
            document.getElementById('transferFrom').value = accountNumber;
            autoFillTransferDetails();
            document.getElementById('transferTo').focus();
        }

        // Initialize event listeners
        document.addEventListener('DOMContentLoaded', function() {
            // Auto-fill events
            document.getElementById('withdrawAcc')?.addEventListener('blur', autoFillWithdrawDetails);
            document.getElementById('transferFrom')?.addEventListener('blur', autoFillTransferDetails);
            document.getElementById('transferTo')?.addEventListener('blur', autoFillTransferDetails);
            document.getElementById('loanAcc')?.addEventListener('blur', autoFillLoanDetails);
            
            // Enter key support
            document.getElementById('searchAccInput')?.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') searchAccount();
            });
            
            document.getElementById('quickSearch')?.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') quickSearchAccount();
            });
        });
