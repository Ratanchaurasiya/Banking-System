// ==================== TRANSACTION FLOW CONTROLLERS ====================

const billProviders = {
    Electricity: ["Tata Power DDL", "BSES Yamuna", "Adani Electricity Mumbai", "PSPCL Punjab", "MSEDCL Maharashtra"],
    Mobile: ["Reliance Jio prepaid", "Airtel postpaid", "Vodafone Idea prepaid", "BSNL Recharge"],
    DTH: ["Tata Play", "Dish TV", "Airtel Digital TV", "Videocon d2h"],
    Water: ["Delhi Jal Board", "BMC Water Department", "BWSSB Water Bangalore", "Haryana Urban Development"]
};

// --- Deposit ---
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
        const account = bank.getAccount(accountNumber);
        const receipt = createReceiptRecord({
            id: `TXN-${result.transaction.id}`,
            title: 'Deposit Receipt',
            rows: [
                { label: 'Transaction ID', value: `TXN-${result.transaction.id}` },
                { label: 'Account Number', value: accountNumber },
                { label: 'Account Holder', value: account?.candidate_name || 'N/A' },
                { label: 'Amount Deposited', value: `Rs. ${amount.toLocaleString()}` },
                { label: 'Mode', value: mode },
                { label: 'New Balance', value: `Rs. ${result.newBalance.toLocaleString()}` },
                { label: 'Remarks', value: remarks || 'Cash deposit' }
            ]
        });
        notifyUser('Deposit successful', `Rs. ${amount.toLocaleString()} deposited to account ${accountNumber}.`, 'success');
        document.getElementById('depositResult').innerHTML = `
            <div class="message message-success">
                <h4><i class="fas fa-check-circle"></i> Deposit Successful!</h4>
                <p><strong>Account Number:</strong> ${accountNumber}</p>
                <p><strong>Amount Deposited:</strong> Rs. ${amount.toLocaleString()}</p>
                <p><strong>Mode:</strong> ${mode}</p>
                <p><strong>New Balance:</strong> Rs. ${result.newBalance.toLocaleString()}</p>
                <p><strong>Transaction Time:</strong> ${new Date().toLocaleString()}</p>
                ${renderReceiptDownloadButton(receipt)}
            </div>
        `;
        
        document.getElementById('depositAcc').value = '';
        document.getElementById('depositAmount').value = '';
        document.getElementById('depositRemarks').value = '';
    } else {
        showMessage(result.message, 'error', 'depositResult');
    }
}

// --- Withdrawal ---
function autoFillWithdrawDetails() {
    const accountNumber = document.getElementById('withdrawAcc').value;
    if (!accountNumber) return;
    
    const account = bank.getAccount(accountNumber);
    if (account) {
        document.getElementById('withdrawName').value = account.candidate_name;
        document.getElementById('withdrawBalance').value = `Rs. ${account.balance.toLocaleString()}`;
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
        const receipt = createReceiptRecord({
            id: `TXN-${result.transaction.id}`,
            title: 'Withdrawal Receipt',
            rows: [
                { label: 'Transaction ID', value: `TXN-${result.transaction.id}` },
                { label: 'Account Number', value: accountNumber },
                { label: 'Account Holder', value: document.getElementById('withdrawName').value || 'N/A' },
                { label: 'Amount Withdrawn', value: `Rs. ${amount.toLocaleString()}` },
                { label: 'Mode', value: mode },
                { label: 'New Balance', value: `Rs. ${result.newBalance.toLocaleString()}` },
                { label: 'Purpose', value: purpose || 'Cash withdrawal' }
            ]
        });
        notifyUser('Withdrawal successful', `Rs. ${amount.toLocaleString()} withdrawn from account ${accountNumber}.`, 'success');
        document.getElementById('withdrawResult').innerHTML = `
            <div class="message message-success">
                <h4><i class="fas fa-check-circle"></i> Withdrawal Successful!</h4>
                <p><strong>Transaction ID:</strong> ${Date.now()}</p>
                <p><strong>Account Number:</strong> ${accountNumber}</p>
                <p><strong>Account Holder:</strong> ${document.getElementById('withdrawName').value}</p>
                <p><strong>Amount Withdrawn:</strong> Rs. ${amount.toLocaleString()}</p>
                <p><strong>Withdrawal Mode:</strong> ${mode}</p>
                <p><strong>New Balance:</strong> Rs. ${result.newBalance.toLocaleString()}</p>
                <p><strong>Transaction Time:</strong> ${new Date().toLocaleString()}</p>
                ${purpose ? `<p><strong>Purpose:</strong> ${purpose}</p>` : ''}
                ${renderReceiptDownloadButton(receipt)}
            </div>
        `;
        
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

// --- Fund Transfer ---
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
    let fromAcc;
    
    if (activeRole === 'customer' && activeSessionUser) {
        fromAcc = activeSessionUser.account_number;
        document.getElementById('transferFrom').value = fromAcc;
    } else {
        fromAcc = document.getElementById('transferFrom').value;
    }
    
    const toAcc = document.getElementById('transferTo').value;
    const amount = parseFloat(document.getElementById('transferAmount').value);
    const pin = document.getElementById('transferPin').value;
    const mode = document.getElementById('transferMode').value;
    const remarks = document.getElementById('transferRemarks').value;

    if (!fromAcc || !toAcc || !amount || !pin) {
        showMessage('Please fill all required fields!', 'error', 'transferResult');
        return;
    }

    if (fromAcc == toAcc) {
        showMessage('Cannot transfer to same account!', 'error', 'transferResult');
        return;
    }

    if (amount <= 0) {
        showMessage('Please enter a valid amount!', 'error', 'transferResult');
        return;
    }

    const result = bank.initiateTransfer(fromAcc, toAcc, amount, pin, mode, remarks);
    
    if (result.success) {
        document.getElementById('otpSection').style.display = 'block';
        document.getElementById('completeTransferBtn').style.display = 'inline-block';
        
        document.querySelectorAll('.otp-inputs input').forEach(input => input.value = '');
        
        document.getElementById('transferResult').innerHTML = `
            <div class="message message-info">
                <h4><i class="fas fa-shield-alt"></i> OTP Verification Required</h4>
                <p>${result.message}</p>
                <p><strong>Demo OTP Code:</strong> ${result.otp}</p>
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
                <p><strong>New Demo OTP generated:</strong> ${bank.otp}</p>
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
        const receipt = createReceiptRecord({
            id: `TXN-${result.debitTransaction.id}`,
            title: 'Fund Transfer Receipt',
            rows: [
                { label: 'Transaction ID', value: `TXN-${result.debitTransaction.id}` },
                { label: 'From Account', value: result.details.from },
                { label: 'To Account', value: result.details.to },
                { label: 'Amount Transferred', value: `Rs. ${result.details.amount.toLocaleString()}` },
                { label: 'Mode', value: result.debitTransaction.mode || 'Online' },
                { label: 'Sender Balance', value: `Rs. ${result.details.senderBalance.toLocaleString()}` },
                { label: 'Remarks', value: result.debitTransaction.description || 'Fund transfer' }
            ]
        });
        notifyUser('Transfer successful', `Rs. ${result.details.amount.toLocaleString()} sent from ${result.details.from} to ${result.details.to}.`, 'success');
        clearTransferForm(true);
        document.getElementById('transferResult').innerHTML = `
            <div class="message message-success">
                <h4><i class="fas fa-check-circle"></i> Transfer Successful!</h4>
                <p><strong>Transaction ID:</strong> TXN-${Date.now().toString().slice(-6)}</p>
                <p><strong>From Account:</strong> ${result.details.from}</p>
                <p><strong>To Account:</strong> ${result.details.to}</p>
                <p><strong>Amount Transferred:</strong> Rs. ${result.details.amount.toLocaleString()}</p>
                <p><strong>Transaction Time:</strong> ${new Date().toLocaleString()}</p>
                ${renderReceiptDownloadButton(receipt)}
            </div>
        `;
        
        document.getElementById('otpSection').style.display = 'none';
        document.getElementById('completeTransferBtn').style.display = 'none';
        
        if (activeRole === 'customer') {
            setTimeout(() => {
                showSection('custDashboard');
            }, 3000);
        }
    } else {
        document.getElementById('transferResult').innerHTML = `
            <div class="message message-error">
                <h4><i class="fas fa-exclamation-circle"></i> Transfer Failed</h4>
                <p>${result.message}</p>
            </div>
        `;
    }
}

function clearTransferForm(preserveResult = false) {
    document.getElementById('transferFrom').value = '';
    document.getElementById('senderName').value = '';
    document.getElementById('transferTo').value = '';
    document.getElementById('receiverName').value = '';
    document.getElementById('transferAmount').value = '';
    document.getElementById('transferPin').value = '';
    document.getElementById('transferRemarks').value = '';
    document.getElementById('otpSection').style.display = 'none';
    document.getElementById('completeTransferBtn').style.display = 'none';
    if (!preserveResult) document.getElementById('transferResult').innerHTML = '';
    
    document.querySelectorAll('.otp-inputs input').forEach(input => input.value = '');
}

// --- Utility Bills ---
function onBillTypeChange() {
    const type = document.getElementById('billType').value;
    const providerSelect = document.getElementById('billProvider');
    const providers = billProviders[type] || [];
    
    providerSelect.innerHTML = providers.map(p => `<option value="${p}">${p}</option>`).join('');
    
    const numberLabel = document.getElementById('billNumberLabel');
    const numberInput = document.getElementById('billNumber');
    if (type === 'Mobile') {
        numberLabel.textContent = "Mobile Phone Number *";
        numberInput.placeholder = "Enter 10-digit phone number";
    } else if (type === 'DTH') {
        numberLabel.textContent = "Subscriber Card ID *";
        numberInput.placeholder = "Enter DTH Customer ID";
    } else {
        numberLabel.textContent = "Consumer Billing Connection Number *";
        numberInput.placeholder = "Enter account connection number";
    }
}

function payUtilityBill() {
    if (activeRole !== 'customer' || !activeSessionUser) return;
    
    const account = bank.getAccount(activeSessionUser.account_number);
    const type = document.getElementById('billType').value;
    const provider = document.getElementById('billProvider').value;
    const number = document.getElementById('billNumber').value.trim();
    const amount = parseFloat(document.getElementById('billAmount').value);
    const pin = document.getElementById('billPin').value;
    
    const resultDiv = document.getElementById('billResult');
    
    if (!number || !amount || amount <= 0 || !pin) {
        showMessage('Please fill all bill forms correctly!', 'error', 'billResult');
        return;
    }
    
    const pinCheck = bank.verifyPinAndTrack(account, pin);
    if (!pinCheck.success) {
        showMessage(pinCheck.message, 'error', 'billResult');
        return;
    }
    
    if (amount > account.balance) {
        showMessage('Insufficient available balance to clear this bill!', 'error', 'billResult');
        return;
    }

    if (account.card_blocked) {
        showMessage('Card frozen: Bill transactions are blocked.', 'error', 'billResult');
        return;
    }

    if (amount > account.card_limit_online) {
        showMessage(`Transaction blocked: Exceeds online daily limit (Rs. ${account.card_limit_online})`, 'error', 'billResult');
        return;
    }
    
    account.balance -= amount;
    
    const transaction = bank.addTransaction({
        account_number: account.account_number,
        type: 'Bill Payment',
        amount: amount,
        description: `Utility: ${type} - ${provider} (${number})`,
        mode: 'Online'
    });
    
    bank.saveData();
    const receipt = createReceiptRecord({
        id: `TXN-${transaction.id}`,
        title: 'Utility Bill Payment Receipt',
        rows: [
            { label: 'Transaction ID', value: `TXN-${transaction.id}` },
            { label: 'Account Number', value: account.account_number },
            { label: 'Account Holder', value: account.candidate_name || 'N/A' },
            { label: 'Utility', value: `${type} - ${provider}` },
            { label: 'Consumer Ref', value: number },
            { label: 'Amount Debited', value: `Rs. ${amount.toLocaleString()}` },
            { label: 'New Balance', value: `Rs. ${account.balance.toLocaleString()}` }
        ]
    });
    
    resultDiv.innerHTML = `
        <div class="message message-success">
            <h4><i class="fas fa-check-circle"></i> Utility Bill Paid Successfully!</h4>
            <p><strong>Receipt ID:</strong> RCP-${Date.now().toString().slice(-6)}</p>
            <p><strong>Utility Billed:</strong> ${type} - ${provider}</p>
            <p><strong>Consumer Ref:</strong> ${number}</p>
            <p><strong>Amount Debited:</strong> Rs. ${amount.toLocaleString()}</p>
            <p><strong>New Balance:</strong> Rs. ${account.balance.toLocaleString()}</p>
            ${renderReceiptDownloadButton(receipt)}
        </div>
    `;
    notifyUser('Bill payment successful', `${type} bill paid to ${provider} for Rs. ${amount.toLocaleString()}.`, 'success');
    
    document.getElementById('billNumber').value = '';
    document.getElementById('billAmount').value = '';
    document.getElementById('billPin').value = '';
}


