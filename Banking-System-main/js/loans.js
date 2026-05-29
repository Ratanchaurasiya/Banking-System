// ==================== LOANS & EMI CONTROLLERS ====================

function autoFillLoanDetails() {
    let accountNumber;
    if (activeRole === 'customer' && activeSessionUser) {
        accountNumber = activeSessionUser.account_number;
        document.getElementById('loanAcc').value = accountNumber;
    } else {
        accountNumber = document.getElementById('loanAcc').value;
    }
    
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
    
    document.getElementById('emiCalculator').style.display = 'block';
    
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

    const emiBox = document.getElementById('calcEMI');
    const emi = emiBox ? emiBox.textContent : "0";

    const data = {
        type: document.getElementById('loanType').value,
        amount: amount,
        tenure: tenure,
        rate: rate,
        emi: emi,
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
                <p><strong>Monthly EMI:</strong> ₹${data.emi}</p>
                <p><strong>Status:</strong> Pending Admin Review</p>
            </div>
        `;
        
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

function updateLoanReviewQueueUI() {
    const tbody = document.getElementById('loanReviewTableBody');
    if (!tbody) return;
    
    const pendingLoans = bank.loans.filter(l => l.status === 'Pending').sort((a,b) => b.id - a.id);
    
    if (pendingLoans.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #64748b; padding: 15px;">No pending loan applications for review</td></tr>`;
    } else {
        tbody.innerHTML = pendingLoans.map(l => `
            <tr>
                <td>${l.id}</td>
                <td>${l.account_number}</td>
                <td>${l.applicant_name}</td>
                <td>${l.loan_type}</td>
                <td style="font-weight: 600;">₹${(l.amount || 0).toLocaleString()}</td>
                <td>₹${l.emi ? parseFloat(l.emi).toLocaleString() : '0'}</td>
                <td>₹${l.income ? parseFloat(l.income).toLocaleString() : '0'}</td>
                <td>
                    <button class="btn btn-success" onclick="approveLoan(${l.id})" style="padding: 4px 8px; font-size:12px; margin: 2px;">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn btn-danger" onclick="rejectLoan(${l.id})" style="padding: 4px 8px; font-size:12px; margin: 2px;">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

function approveLoan(loanId) {
    const result = bank.approveLoan(loanId);
    if (result.success) {
        showMessage(result.message, 'success', 'loanApprovalResult');
        updateLoanReviewQueueUI();
    } else {
        showMessage(result.message, 'error', 'loanApprovalResult');
    }
}

function rejectLoan(loanId) {
    const result = bank.rejectLoan(loanId);
    if (result.success) {
        showMessage(result.message, 'warning', 'loanApprovalResult');
        updateLoanReviewQueueUI();
    } else {
        showMessage(result.message, 'error', 'loanApprovalResult');
    }
}
