// ==================== CORE BANKING SYSTEM DATA & LOGIC ====================

class BankingSystem {
    constructor() {
        this.memoryStore = {};
        this.accounts = this.readStoredData('bankAccounts', []);
        this.transactions = this.readStoredData('bankTransactions', []);
        this.loans = this.readStoredData('bankLoans', []);
        this.otp = null;
        this.currentTransferData = null;
        
        this.init();
    }

    readStoredData(key, fallback) {
        try {
            const storedValue = localStorage.getItem(key);
            return storedValue ? JSON.parse(storedValue) : fallback;
        } catch (error) {
            const storedValue = this.memoryStore[key];
            return storedValue ? JSON.parse(storedValue) : fallback;
        }
    }

    writeStoredData(key, value) {
        const serializedValue = JSON.stringify(value);
        this.memoryStore[key] = serializedValue;

        try {
            localStorage.setItem(key, serializedValue);
        } catch (error) {
            console.warn('Browser storage is unavailable. Data will reset after refresh.', error);
        }
    }

    init() {
        if (this.accounts.length === 0) {
            this.loadSampleData();
        }
        this.migrateLoanRecords();
        this.nextAccountNumber = this.accounts.length > 0 ? 
            Math.max(...this.accounts.map(a => a.account_number)) + 1 : 10001;
    }

    migrateLoanRecords() {
        let changed = false;
        this.loans.forEach(loan => {
            if ((loan.status === 'Approved' || loan.status === 'Active') && !loan.total_payable) {
                const payable = parseFloat(loan.emi || 0) * parseInt(loan.tenure || 0);
                loan.total_payable = Number.isFinite(payable) && payable > 0 ? payable : parseFloat(loan.amount || 0);
                loan.outstanding = loan.outstanding ?? loan.total_payable;
                loan.paid_amount = loan.paid_amount ?? 0;
                loan.remaining_tenure = loan.remaining_tenure ?? parseInt(loan.tenure || 0);
                loan.status = loan.outstanding > 0 ? 'Active' : 'Closed';
                changed = true;
            }
        });

        if (changed) this.saveData();
    }

    generateCardNumber() {
        let num = "4321"; // Standard HexChal Digital Bank Visa
        for (let i = 0; i < 3; i++) {
            num += " " + Math.floor(1000 + Math.random() * 9000);
        }
        return num;
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
                balance: 35000,
                address: "Delhi, India",
                photo: null,
                locked: false,
                failed_attempts: 0,
                card_number: "4321 1234 5678 9010",
                card_expiry: "08/31",
                card_blocked: false,
                card_limit_atm: 25000,
                card_limit_online: 50000,
                created_at: new Date(Date.now() - 86400000 * 5).toISOString()
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
                balance: 83000,
                address: "Mumbai, India",
                photo: null,
                locked: false,
                failed_attempts: 0,
                card_number: "4321 9876 5432 1020",
                card_expiry: "11/31",
                card_blocked: false,
                card_limit_atm: 40000,
                card_limit_online: 100000,
                created_at: new Date(Date.now() - 86400000 * 4).toISOString()
            }
        ];
        
        const now = Date.now();
        this.transactions = [
            {
                id: now - 86400000 * 5,
                account_number: 10001,
                type: 'Deposit',
                amount: 50000,
                description: 'Initial deposit',
                mode: 'Account Opening',
                date: new Date(now - 86400000 * 5).toISOString(),
                timestamp: now - 86400000 * 5
            },
            {
                id: now - 86400000 * 4,
                account_number: 10002,
                type: 'Deposit',
                amount: 75000,
                description: 'Initial deposit',
                mode: 'Account Opening',
                date: new Date(now - 86400000 * 4).toISOString(),
                timestamp: now - 86400000 * 4
            },
            {
                id: now - 86400000 * 3,
                account_number: 10001,
                type: 'Withdrawal',
                amount: 5000,
                description: 'ATM withdrawal',
                mode: 'ATM',
                date: new Date(now - 86400000 * 3).toISOString(),
                timestamp: now - 86400000 * 3
            },
            {
                id: now - 86400000 * 2,
                account_number: 10001,
                type: 'Transfer Out',
                amount: 10000,
                description: 'To: 10002 - Rent payment',
                mode: 'UPI',
                date: new Date(now - 86400000 * 2).toISOString(),
                timestamp: now - 86400000 * 2
            },
            {
                id: now - 86400000 * 2,
                account_number: 10002,
                type: 'Transfer In',
                amount: 10000,
                description: 'From: 10001 - Rent payment',
                mode: 'UPI',
                date: new Date(now - 86400000 * 2).toISOString(),
                timestamp: now - 86400000 * 2
            },
            {
                id: now - 86400000 * 1,
                account_number: 10002,
                type: 'Withdrawal',
                amount: 2000,
                description: 'Food expenses',
                mode: 'Cash',
                date: new Date(now - 86400000 * 1).toISOString(),
                timestamp: now - 86400000 * 1
            }
        ];
        
        this.loans = [];
        this.saveData();
    }

    hashPin(pin) {
        const pinStr = String(pin);
        let hash = 0;
        for (let i = 0; i < pinStr.length; i++) {
            const char = pinStr.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }

    saveData() {
        this.writeStoredData('bankAccounts', this.accounts);
        this.writeStoredData('bankTransactions', this.transactions);
        this.writeStoredData('bankLoans', this.loans);
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
            photo: data.photo || null,
            locked: false,
            failed_attempts: 0,
            card_number: this.generateCardNumber(),
            card_expiry: "09/31",
            card_blocked: false,
            card_limit_atm: 20000,
            card_limit_online: 50000,
            created_at: new Date().toISOString()
        };

        this.accounts.push(newAccount);
        
        this.addTransaction({
            account_number: newAccount.account_number,
            type: 'Deposit',
            amount: newAccount.balance,
            description: 'Initial deposit',
            mode: 'Account Opening'
        });

        this.saveData();
        if (typeof filterAccounts === 'function') filterAccounts();
        return newAccount;
    }

    getAccount(accountNumber) {
        return this.accounts.find(acc => acc.account_number == accountNumber);
    }

    verifyPin(account, pin) {
        return account.pin === this.hashPin(pin) || account.pin === pin;
    }

    verifyPinAndTrack(account, pin) {
        if (!account) return { success: false, message: "Account not found" };
        if (account.locked) return { success: false, message: "Account is locked" };
        
        if (this.verifyPin(account, pin)) {
            account.failed_attempts = 0;
            this.saveData();
            return { success: true };
        } else {
            account.failed_attempts = (account.failed_attempts || 0) + 1;
            if (account.failed_attempts >= 3) {
                account.locked = true;
                this.saveData();
                return { success: false, locked: true, message: "Account locked due to 3 failed PIN attempts." };
            }
            this.saveData();
            return { success: false, remaining: 3 - account.failed_attempts, message: `Invalid PIN! Attempts remaining: ${3 - account.failed_attempts}` };
        }
    }

    addTransaction(data) {
        const transaction = {
            id: Date.now(),
            account_number: parseInt(data.account_number),
            type: data.type,
            amount: parseFloat(data.amount),
            description: data.description,
            mode: data.mode || 'Cash',
            date: new Date().toISOString(),
            timestamp: Date.now()
        };

        this.transactions.push(transaction);
        this.saveData();
        if (typeof logAudit === 'function') {
            logAudit('Transaction', `${transaction.type} of Rs. ${transaction.amount.toLocaleString()} on account ${transaction.account_number}`, {
                transactionId: transaction.id,
                accountNumber: transaction.account_number,
                mode: transaction.mode
            });
        }
        return transaction;
    }

    deposit(accountNumber, amount, mode, remarks) {
        const account = this.getAccount(accountNumber);
        if (!account) return { success: false, message: "Account not found" };
        if (account.locked) return { success: false, message: "Account is locked" };
        
        account.balance += parseFloat(amount);
        
        const transaction = this.addTransaction({
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
            newBalance: account.balance,
            transaction
        };
    }

    withdraw(accountNumber, amount, pin, mode, purpose) {
        const account = this.getAccount(accountNumber);
        if (!account) return { success: false, message: "Account not found" };
        if (account.locked) return { success: false, message: "Account is locked" };
        
        const pinCheck = this.verifyPinAndTrack(account, pin);
        if (!pinCheck.success) {
            return pinCheck;
        }
        
        if (parseFloat(amount) > account.balance) {
            return { success: false, message: "Insufficient balance" };
        }
        
        if (parseFloat(amount) <= 0) {
            return { success: false, message: "Invalid amount" };
        }

        if (account.card_blocked && mode === 'ATM') {
            return { success: false, message: "Withdrawal blocked: card is frozen." };
        }

        if (mode === 'ATM' && parseFloat(amount) > account.card_limit_atm) {
            return { success: false, message: `Withdrawal exceeds card daily ATM limit (Rs. ${account.card_limit_atm})` };
        }
        
        account.balance -= parseFloat(amount);
        
        const transaction = this.addTransaction({
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
            newBalance: account.balance,
            transaction
        };
    }

    initiateTransfer(fromAcc, toAcc, amount, pin, mode, remarks) {
        const sender = this.getAccount(fromAcc);
        const receiver = this.getAccount(toAcc);
        
        if (!sender) return { success: false, message: "Sender account not found" };
        if (!receiver) return { success: false, message: "Receiver account not found" };
        if (sender.locked) return { success: false, message: "Sender account is locked" };
        if (receiver.locked) return { success: false, message: "Receiver account is locked" };
        
        const pinCheck = this.verifyPinAndTrack(sender, pin);
        if (!pinCheck.success) {
            return pinCheck;
        }
        
        if (parseFloat(amount) > sender.balance) {
            return { success: false, message: "Insufficient balance" };
        }
        
        if (parseFloat(amount) <= 0) {
            return { success: false, message: "Invalid amount" };
        }

        if (sender.card_blocked && (mode === 'UPI' || mode === 'Online')) {
            return { success: false, message: "Transactions blocked: card is frozen." };
        }

        if (parseFloat(amount) > sender.card_limit_online) {
            return { success: false, message: `Transfer exceeds online limit (Rs. ${sender.card_limit_online})` };
        }
        
        this.currentTransferData = {
            fromAcc,
            toAcc,
            amount: parseFloat(amount),
            mode,
            remarks,
            senderName: sender.candidate_name,
            receiverName: receiver.candidate_name
        };
        
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
        
        const debitTransaction = this.addTransaction({
            account_number: fromAcc,
            type: 'Transfer Out',
            amount: amount,
            description: `To: ${toAcc} - ${remarks}`,
            mode: mode
        });
        
        const creditTransaction = this.addTransaction({
            account_number: toAcc,
            type: 'Transfer In',
            amount: amount,
            description: `From: ${fromAcc} - ${remarks}`,
            mode: mode
        });
        
        this.saveData();
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
            },
            debitTransaction,
            creditTransaction
        };
    }

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
        if (account.locked) return { success: false, message: "Account is locked" };
        
        const pinCheck = this.verifyPinAndTrack(account, pin);
        if (!pinCheck.success) {
            return pinCheck;
        }
        
        const loan = {
            id: Date.now(),
            account_number: parseInt(accountNumber),
            applicant_name: account.candidate_name,
            loan_type: data.type,
            amount: parseFloat(data.amount),
            tenure: parseInt(data.tenure),
            interest_rate: parseFloat(data.rate),
            emi: data.emi,
            purpose: data.purpose,
            income: parseFloat(data.income) || 0,
            employment: data.employment,
            status: 'Pending',
            applied_date: new Date().toISOString(),
            approved_date: null
        };
        
        this.loans.push(loan);
        this.saveData();
        if (typeof logAudit === 'function') {
            logAudit('Loan Applied', `${loan.applicant_name} applied for ${loan.loan_type} loan of Rs. ${loan.amount.toLocaleString()}.`, {
                loanId: loan.id,
                accountNumber: loan.account_number
            });
        }
        
        return { 
            success: true, 
            message: "Loan application submitted successfully",
            loanId: loan.id
        };
    }

    approveLoan(loanId) {
        const loan = this.loans.find(l => l.id == loanId);
        if (!loan) return { success: false, message: "Loan application not found" };
        if (loan.status !== 'Pending') return { success: false, message: "Loan is already processed" };

        const account = this.getAccount(loan.account_number);
        if (!account) return { success: false, message: "Target account closed or missing" };

        const emi = parseFloat(loan.emi || 0);
        const tenure = parseInt(loan.tenure || 0);
        const totalPayable = emi > 0 && tenure > 0 ? emi * tenure : loan.amount;

        loan.status = 'Active';
        loan.approved_date = new Date().toISOString();
        loan.total_payable = parseFloat(totalPayable.toFixed(2));
        loan.outstanding = loan.total_payable;
        loan.paid_amount = 0;
        loan.remaining_tenure = tenure;
        loan.last_payment_date = null;

        account.balance += loan.amount;

        const transaction = this.addTransaction({
            account_number: loan.account_number,
            type: 'Deposit',
            amount: loan.amount,
            description: `Loan Credited (Ref ID: ${loan.id})`,
            mode: 'Bank Loan'
        });

        this.saveData();
        if (typeof logAudit === 'function') {
            logAudit('Loan Approved', `Loan ${loan.id} approved and credited to account ${loan.account_number}.`);
        }
        return { success: true, message: `Loan approved and credited Rs. ${loan.amount.toLocaleString()} to Acc ${loan.account_number}`, transaction };
    }

    payLoanEmi(loanId, amount, pin) {
        const loan = this.loans.find(l => l.id == loanId);
        if (!loan) return { success: false, message: "Loan not found" };
        if (loan.status !== 'Active' && loan.status !== 'Approved') {
            return { success: false, message: "This loan is not active" };
        }

        const account = this.getAccount(loan.account_number);
        if (!account) return { success: false, message: "Linked account not found" };
        if (account.locked) return { success: false, message: "Account is locked" };

        const pinCheck = this.verifyPinAndTrack(account, pin);
        if (!pinCheck.success) return pinCheck;

        const paymentAmount = parseFloat(amount);
        const outstanding = parseFloat(loan.outstanding || loan.total_payable || loan.amount || 0);
        if (!paymentAmount || paymentAmount <= 0) {
            return { success: false, message: "Invalid EMI amount" };
        }
        if (paymentAmount > outstanding) {
            return { success: false, message: `Payment exceeds outstanding loan balance (Rs. ${outstanding.toLocaleString()})` };
        }
        if (paymentAmount > account.balance) {
            return { success: false, message: "Insufficient balance to pay EMI" };
        }

        account.balance -= paymentAmount;
        loan.paid_amount = parseFloat(((loan.paid_amount || 0) + paymentAmount).toFixed(2));
        loan.outstanding = parseFloat((outstanding - paymentAmount).toFixed(2));
        loan.last_payment_date = new Date().toISOString();
        loan.status = loan.outstanding <= 0 ? 'Closed' : 'Active';

        const emi = parseFloat(loan.emi || 0);
        if (emi > 0) {
            loan.remaining_tenure = Math.max(0, Math.ceil(loan.outstanding / emi));
        }

        const transaction = this.addTransaction({
            account_number: loan.account_number,
            type: 'Loan EMI Payment',
            amount: paymentAmount,
            description: `EMI paid for loan ${loan.id}`,
            mode: 'Loan Repayment'
        });

        this.saveData();
        if (typeof logAudit === 'function') {
            logAudit('Loan EMI Paid', `Rs. ${paymentAmount.toLocaleString()} paid for loan ${loan.id}.`, {
                loanId: loan.id,
                accountNumber: loan.account_number
            });
        }

        return {
            success: true,
            message: loan.status === 'Closed' ? "Loan fully paid and closed" : "EMI payment successful",
            outstanding: loan.outstanding,
            newBalance: account.balance,
            transaction
        };
    }

    rejectLoan(loanId) {
        const loan = this.loans.find(l => l.id == loanId);
        if (!loan) return { success: false, message: "Loan application not found" };
        if (loan.status !== 'Pending') return { success: false, message: "Loan is already processed" };

        loan.status = 'Rejected';
        this.saveData();
        if (typeof logAudit === 'function') {
            logAudit('Loan Rejected', `Loan ${loan.id} for account ${loan.account_number} was rejected.`);
        }
        return { success: true, message: "Loan application rejected" };
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

        const searchInput = document.getElementById('accountsSearch');
        const searchTerm = searchInput ? searchInput.value.trim() : '';
        const statusFilter = document.getElementById('accountsStatusFilter');
        const selectedStatus = statusFilter ? statusFilter.value : 'all';
        let accounts = this.searchAccounts(searchTerm);

        if (selectedStatus === 'active') {
            accounts = accounts.filter(account => !account.locked);
        } else if (selectedStatus === 'locked') {
            accounts = accounts.filter(account => account.locked);
        }

        if (accounts.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; color: #64748b; padding: 20px;">
                        No accounts found
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = accounts.map(account => `
            <tr>
                <td>${account.account_number}</td>
                <td>${account.candidate_name}</td>
                <td>${account.phone}</td>
                <td>${account.account_type}</td>
                <td>Rs. ${(account.balance || 0).toLocaleString()}</td>
                <td>
                    <span style="font-weight: 700; color: ${account.locked ? '#ef4444' : '#10b981'};">
                        ${account.locked ? 'Locked' : 'Active'}
                    </span>
                </td>
                <td>
                    <button class="btn" onclick="editAccount(${account.account_number})" style="padding: 6px 10px; margin: 2px;">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${account.locked ? `
                    <button class="btn btn-success" onclick="unlockAccount(${account.account_number})" style="padding: 6px 10px; margin: 2px;" title="Unlock account">
                        <i class="fas fa-unlock"></i>
                    </button>` : ''}
                    <button class="btn btn-danger" onclick="confirmDeleteAccount(${account.account_number})" style="padding: 6px 10px; margin: 2px;">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updateAccount(accountNumber, data) {
        const account = this.getAccount(accountNumber);
        if (!account) return { success: false, message: "Account not found" };
        
        account.candidate_name = data.name;
        account.father_name = data.father;
        account.phone = data.phone;
        account.email = data.email;
        account.account_type = data.type;
        account.address = data.address;
        const wasLocked = account.locked;
        account.locked = data.status === 'locked';
        if (wasLocked && !account.locked) {
            account.failed_attempts = 0;
        }
        
        if (data.pin && data.pin.length === 4) {
            account.pin = this.hashPin(data.pin);
        }
        
        this.saveData();
        if (typeof filterAccounts === 'function') filterAccounts();
        if (typeof logAudit === 'function') {
            logAudit('Account Updated', `Account ${account.account_number} details were updated.`);
        }
        if (typeof updateDashboardUI === 'function') updateDashboardUI();
        return { success: true, message: "Account updated successfully" };
    }

    unlockAccount(accountNumber) {
        const account = this.getAccount(accountNumber);
        if (!account) return { success: false, message: "Account not found" };

        account.locked = false;
        account.failed_attempts = 0;
        this.saveData();

        if (typeof filterAccounts === 'function') filterAccounts();
        if (typeof updateDashboardUI === 'function') updateDashboardUI();
        if (typeof logAudit === 'function') {
            logAudit('Account Unlocked', `Account ${account.account_number} was unlocked by staff.`);
        }

        return { success: true, message: `Account ${account.account_number} unlocked successfully` };
    }

    deleteAccount(accountNumber) {
        const idx = this.accounts.findIndex(acc => acc.account_number == accountNumber);
        if (idx === -1) return { success: false, message: "Account not found" };
        
        const account = this.accounts[idx];
        if (account.balance > 0) {
            return { success: false, message: "Cannot close account with positive balance. Please withdraw all funds first." };
        }
        
        this.accounts.splice(idx, 1);
        
        this.saveData();
        if (typeof filterAccounts === 'function') filterAccounts();
        if (typeof logAudit === 'function') {
            logAudit('Account Closed', `Account ${account.account_number} was closed.`);
        }
        if (typeof updateDashboardUI === 'function') updateDashboardUI();
        return { success: true, message: "Account closed successfully" };
    }

    changePin(accountNumber, oldPin, newPin) {
        const account = this.getAccount(accountNumber);
        if (!account) return { success: false, message: "Account not found" };
        
        const pinCheck = this.verifyPinAndTrack(account, oldPin);
        if (!pinCheck.success) {
            return { success: false, message: pinCheck.message };
        }
        
        account.pin = this.hashPin(newPin);
        account.failed_attempts = 0;
        this.saveData();
        if (typeof logAudit === 'function') {
            logAudit('PIN Changed', `PIN changed for account ${account.account_number}.`);
        }
        return { success: true, message: "PIN updated successfully" };
    }
}

// Expose BankingSystem to the global scope
window.bank = new BankingSystem();


